import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Attendee {
  email: string;
  name: string;
}

interface MeetingRequest {
  subject: string;
  attendees: Attendee[];
  startTime: string;
  endTime: string;
}

async function getAccessToken(): Promise<string> {
  const tenantId = Deno.env.get('AZURE_TENANT_ID');
  const clientId = Deno.env.get('AZURE_CLIENT_ID');
  const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET');

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Missing Azure credentials. Please configure AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET.');
  }

  console.log('Fetching access token from Azure AD...');
  
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('grant_type', 'client_credentials');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Azure AD token error:', data);
    throw new Error(data.error_description || 'Failed to get access token from Azure AD');
  }

  console.log('Successfully obtained access token');
  return data.access_token;
}

async function createOnlineMeeting(accessToken: string, meetingRequest: MeetingRequest, organizerEmail: string): Promise<any> {
  console.log('Creating Teams meeting via Microsoft Graph API...');
  
  // First, get the user by email to get their ID
  const userResponse = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(organizerEmail)}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!userResponse.ok) {
    const errorData = await userResponse.json();
    console.error('Failed to fetch user by email:', errorData);
    
    // If we can't get the user, the app might not have User.Read.All permission
    // In this case, we need the user to be specified in the Azure AD app
    throw new Error(
      `Cannot find user in Azure AD: ${organizerEmail}. ` +
      `Please ensure the Azure App has User.Read.All permission with admin consent, ` +
      `or the user exists in your Azure AD tenant.`
    );
  }

  const userData = await userResponse.json();
  const organizerUserId = userData.id;
  console.log('Found organizer user ID:', organizerUserId);

  // Create meeting body for online meeting
  const meetingBody = {
    startDateTime: meetingRequest.startTime,
    endDateTime: meetingRequest.endTime,
    subject: meetingRequest.subject,
    lobbyBypassSettings: {
      scope: 'everyone',
      isDialInBypassEnabled: true
    },
    allowedPresenters: 'everyone'
  };

  console.log('Meeting request body:', JSON.stringify(meetingBody, null, 2));

  // Create the online meeting
  const meetingResponse = await fetch(
    `https://graph.microsoft.com/v1.0/users/${organizerUserId}/onlineMeetings`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingBody),
    }
  );

  const meetingData = await meetingResponse.json();

  if (!meetingResponse.ok) {
    console.error('Graph API error creating meeting:', meetingData);
    
    // Provide helpful error messages based on common issues
    if (meetingData.error?.code === 'AuthenticationError') {
      throw new Error(
        'Authentication error with Microsoft Graph. ' +
        'Please ensure the Azure App has OnlineMeetings.ReadWrite.All permission with admin consent.'
      );
    }
    
    if (meetingData.error?.code === 'ResourceNotFound') {
      throw new Error(
        `User ${organizerEmail} does not have a Teams license or is not enabled for online meetings.`
      );
    }
    
    throw new Error(meetingData.error?.message || 'Failed to create Teams meeting');
  }

  console.log('Teams meeting created successfully:', meetingData.id);
  
  return {
    id: meetingData.id,
    joinUrl: meetingData.joinWebUrl,
    joinInformation: meetingData.joinInformation,
    subject: meetingData.subject,
    startDateTime: meetingData.startDateTime,
    endDateTime: meetingData.endDateTime,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.email);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { subject, attendees, startTime, endTime }: MeetingRequest = await req.json();

    if (!subject || !attendees || !startTime || !endTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: subject, attendees, startTime, endTime' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating Teams meeting:', { subject, attendeesCount: attendees.length, startTime, endTime });

    // Get Azure AD access token
    const accessToken = await getAccessToken();

    // Use the authenticated user's email as the organizer
    // The user must exist in the Azure AD tenant
    const organizerEmail = user.email!;

    // Create the Teams meeting
    const meeting = await createOnlineMeeting(accessToken, { subject, attendees, startTime, endTime }, organizerEmail);

    // Log the meeting creation for security audit
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
      await adminClient.rpc('log_security_event', {
        p_action: 'TEAMS_MEETING_CREATED',
        p_resource_type: 'meeting',
        p_details: {
          meeting_id: meeting.id,
          subject,
          attendee_count: attendees.length,
          created_by: user.id,
          join_url: meeting.joinUrl,
          created_at: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.warn('Failed to log security event:', logError);
    }

    console.log('Teams meeting created successfully:', meeting.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        meeting,
        message: 'Teams meeting created successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error creating Teams meeting:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
