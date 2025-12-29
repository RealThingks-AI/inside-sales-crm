import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get('id');
    const redirectUrl = url.searchParams.get('url');

    if (!emailId) {
      return new Response(
        JSON.stringify({ error: 'Email ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update email click tracking
    const { data: emailRecord, error: fetchError } = await supabase
      .from('email_history')
      .select('click_count, status, contact_id, lead_id, account_id')
      .eq('id', emailId)
      .single();

    if (fetchError) {
      console.error('Error fetching email record:', fetchError);
      // Still redirect even if tracking fails
      if (redirectUrl) {
        return Response.redirect(redirectUrl, 302);
      }
      return new Response(
        JSON.stringify({ error: 'Email not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentClickCount = emailRecord.click_count || 0;
    const isFirstClick = currentClickCount === 0;

    // Update email_history with click data
    const { error: updateError } = await supabase
      .from('email_history')
      .update({
        click_count: currentClickCount + 1,
        clicked_at: isFirstClick ? new Date().toISOString() : undefined,
        status: 'clicked',
      })
      .eq('id', emailId);

    if (updateError) {
      console.error('Error updating email click:', updateError);
    }

    // Update contact/lead/account email_clicks if this is the first click for this email
    if (isFirstClick) {
      if (emailRecord.contact_id) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('email_clicks')
          .eq('id', emailRecord.contact_id)
          .single();

        if (contact) {
          await supabase
            .from('contacts')
            .update({
              email_clicks: (contact.email_clicks || 0) + 1,
            })
            .eq('id', emailRecord.contact_id);
        }
      }
    }

    console.log(`Click tracked for email ${emailId}, total clicks: ${currentClickCount + 1}`);

    // Redirect to the original URL
    if (redirectUrl) {
      return Response.redirect(redirectUrl, 302);
    }

    // Return success response if no redirect URL
    return new Response(
      JSON.stringify({ success: true, clicks: currentClickCount + 1 }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error tracking click:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
