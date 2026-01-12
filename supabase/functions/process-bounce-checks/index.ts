import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken(): Promise<string> {
  const tenantId = Deno.env.get("AZURE_EMAIL_TENANT_ID") || Deno.env.get("AZURE_TENANT_ID");
  const clientId = Deno.env.get("AZURE_EMAIL_CLIENT_ID") || Deno.env.get("AZURE_CLIENT_ID");
  const clientSecret = Deno.env.get("AZURE_EMAIL_CLIENT_SECRET") || Deno.env.get("AZURE_CLIENT_SECRET");

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Azure credentials not configured");
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

function parseNDRContent(subject: string, body: string): { recipientEmail: string | null; reason: string | null; originalSubject: string | null } {
  let recipientEmail: string | null = null;
  let reason: string | null = null;
  let originalSubject: string | null = null;

  // Extract original subject from NDR subject line
  const subjectMatch = subject.match(/Undeliverable:\s*(.+)/i);
  if (subjectMatch) {
    originalSubject = subjectMatch[1].trim();
  }

  // Extract recipient email from body
  const emailPatterns = [
    /(?:To|Recipient|Address):\s*<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i,
    /couldn't be delivered to\s+<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i,
    /delivery.*failed.*<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i,
    /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/,
  ];

  for (const pattern of emailPatterns) {
    const match = body.match(pattern);
    if (match) {
      recipientEmail = match[1].toLowerCase();
      break;
    }
  }

  // Extract bounce reason
  const reasonPatterns = [
    /(?:Remote Server returned|Diagnostic information).*?['"]?(\d{3}\s+\d\.\d\.\d+[^'"]*?)['"]?(?:\s|$)/i,
    /(550\s+\d\.\d\.\d+[^\n]*)/i,
    /(mailbox.*(?:not found|unavailable|full|disabled))/i,
    /(user.*(?:unknown|doesn't exist|not found))/i,
    /(address rejected)/i,
    /(permanent failure)/i,
  ];

  for (const pattern of reasonPatterns) {
    const match = body.match(pattern);
    if (match) {
      reason = match[1].trim().substring(0, 500);
      break;
    }
  }

  if (!reason && (subject.toLowerCase().includes('undeliverable') || subject.toLowerCase().includes('failure'))) {
    reason = 'Email could not be delivered';
  }

  return { recipientEmail, reason, originalSubject };
}

async function checkBounceForEmail(
  supabase: any,
  accessToken: string,
  senderEmail: string,
  recipientEmail: string,
  emailHistoryId: string,
  sentAt: string
): Promise<boolean> {
  try {
    // Search for NDR messages in the sender's mailbox for this specific recipient
    const searchDate = new Date(new Date(sentAt).getTime() - 60000).toISOString(); // 1 min before send
    const searchUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/messages?$filter=receivedDateTime ge ${searchDate} and (contains(subject,'Undeliverable') or contains(subject,'Delivery Status') or from/emailAddress/address eq 'postmaster@outlook.com')&$select=id,subject,body,receivedDateTime&$top=20`;

    const messagesResponse = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!messagesResponse.ok) {
      console.log(`Could not fetch messages for ${senderEmail}: ${messagesResponse.status}`);
      return false;
    }

    const messagesData = await messagesResponse.json();
    const ndrMessages = messagesData.value || [];

    for (const ndr of ndrMessages) {
      const { recipientEmail: ndrRecipient, reason } = parseNDRContent(
        ndr.subject || '',
        ndr.body?.content || ''
      );

      // Check if this NDR is for our target recipient
      if (ndrRecipient && ndrRecipient.toLowerCase() === recipientEmail.toLowerCase()) {
        console.log(`Found bounce for ${recipientEmail}: ${reason}`);
        
        // Update the email history record
        const { error } = await supabase
          .from('email_history')
          .update({
            status: 'bounced',
            bounce_type: 'hard',
            bounce_reason: reason || 'Email delivery failed',
            bounced_at: ndr.receivedDateTime || new Date().toISOString(),
            open_count: 0,
            unique_opens: 0,
            opened_at: null,
            is_valid_open: false,
          })
          .eq('id', emailHistoryId);

        if (error) {
          console.error(`Failed to update email ${emailHistoryId}:`, error);
        }
        
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`Error checking bounce for ${recipientEmail}:`, error);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("Starting bounce check process...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let accessToken: string;
    try {
      accessToken = await getAccessToken();
    } catch (tokenError) {
      console.error("Failed to get access token:", tokenError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Azure authentication failed",
        details: tokenError instanceof Error ? tokenError.message : "Unknown error"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Process pending bounce checks (queued after email sends)
    const { data: pendingChecks, error: pendingError } = await supabase
      .from('pending_bounce_checks')
      .select(`
        id,
        email_history_id,
        sender_email,
        recipient_email,
        check_after,
        email_history:email_history_id (
          id,
          sent_at,
          status
        )
      `)
      .eq('checked', false)
      .lte('check_after', new Date().toISOString())
      .limit(50);

    if (pendingError) {
      console.error("Error fetching pending checks:", pendingError);
    }

    let pendingBouncesFound = 0;
    const processedIds: string[] = [];

    if (pendingChecks && pendingChecks.length > 0) {
      console.log(`Processing ${pendingChecks.length} pending bounce checks...`);

      for (const check of pendingChecks) {
        // Skip if email is already bounced
        const emailHistory = check.email_history as any;
        if (!emailHistory || emailHistory.status === 'bounced') {
          processedIds.push(check.id);
          continue;
        }

        const bounced = await checkBounceForEmail(
          supabase,
          accessToken,
          check.sender_email,
          check.recipient_email,
          check.email_history_id,
          emailHistory.sent_at
        );

        if (bounced) {
          pendingBouncesFound++;
        }

        processedIds.push(check.id);
      }

      // Mark all processed checks as complete
      if (processedIds.length > 0) {
        await supabase
          .from('pending_bounce_checks')
          .update({ 
            checked: true,
            check_result: 'processed'
          })
          .in('id', processedIds);
      }
    }

    // 2. Also run general sync for recent emails (last 6 hours)
    console.log("Running general bounce sync for recent emails...");
    
    const sinceHours = 6;
    const sinceDate = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
    
    // Get unique sender emails from recent, non-bounced emails
    const { data: recentEmails } = await supabase
      .from('email_history')
      .select('sender_email, recipient_email, id, sent_at')
      .gte('sent_at', sinceDate)
      .not('status', 'eq', 'bounced')
      .limit(100);

    let generalBouncesFound = 0;

    if (recentEmails && recentEmails.length > 0) {
      const senderEmails = [...new Set(recentEmails.map(e => e.sender_email))];
      
      for (const senderEmail of senderEmails) {
        const senderRecentEmails = recentEmails.filter(e => e.sender_email === senderEmail);
        
        for (const email of senderRecentEmails) {
          const bounced = await checkBounceForEmail(
            supabase,
            accessToken,
            senderEmail,
            email.recipient_email,
            email.id,
            email.sent_at
          );

          if (bounced) {
            generalBouncesFound++;
          }
        }
      }
    }

    // 3. Clean up old pending checks (older than 7 days)
    await supabase
      .from('pending_bounce_checks')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const totalBouncesFound = pendingBouncesFound + generalBouncesFound;
    const processingTime = Date.now() - startTime;

    console.log(`Bounce check complete in ${processingTime}ms. Found ${totalBouncesFound} bounce(s).`);

    return new Response(JSON.stringify({
      success: true,
      pendingChecksProcessed: processedIds.length,
      pendingBouncesFound,
      generalBouncesFound,
      totalBouncesFound,
      processingTimeMs: processingTime,
      message: totalBouncesFound > 0 
        ? `Found and marked ${totalBouncesFound} bounced email(s)` 
        : 'No new bounces detected',
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error processing bounces:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
