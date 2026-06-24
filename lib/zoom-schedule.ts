// lib/zoom.ts

const ZOOM_BASE_URL = 'https://api.zoom.us/v2';
const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/token';

export interface ZoomMeeting {
  id: string;
  joinUrl: string;
  hostUrl: string;
  password: string | null;
  startUrl: string;
}

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Get Server-to-Server OAuth access token
 */
async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(
    `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zoom auth failed: ${error}`);
  }

  const data: ZoomTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Create a Zoom meeting
 */
export async function createZoomMeeting(options: {
  topic: string;
  startTime: Date;
  duration: number; // minutes
  timezone?: string;
  password?: string;
  waitingRoom?: boolean;
  hostEmail?: string;
}): Promise<ZoomMeeting> {
  const accessToken = await getZoomAccessToken();
  
  // Use host email if provided, otherwise fall back to account default
  const userId = options.hostEmail || 'me';

  const response = await fetch(`${ZOOM_BASE_URL}/users/${userId}/meetings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: options.topic,
      type: 2, // Scheduled meeting
      start_time: options.startTime.toISOString(),
      duration: options.duration,
      timezone: options.timezone || 'UTC',
      password: options.password,
      settings: {
        waiting_room: options.waitingRoom ?? false,
        join_before_host: true,
        mute_upon_entry: false,
        auto_recording: 'none',
        enforce_login: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Zoom API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    id: data.id.toString(),
    joinUrl: data.join_url,
    hostUrl: data.start_url,
    password: data.password || null,
    startUrl: data.start_url,
  };
}

/**
 * Delete a Zoom meeting
 */
export async function deleteZoomMeeting(meetingId: string): Promise<void> {
  const accessToken = await getZoomAccessToken();

  const response = await fetch(`${ZOOM_BASE_URL}/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete Zoom meeting: ${response.status}`);
  }
}
