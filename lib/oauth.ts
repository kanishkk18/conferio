

// lib/oauth.ts
import { OAuth2Client } from 'google-auth-library';
import { config } from './config';

export const googleCalendarClient = new OAuth2Client({
  clientId: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  redirectUri: config.GOOGLE_CALENDAR_REDIRECT_URI,
});

// Add better error handling
googleCalendarClient.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    console.log('Refresh token received:', tokens.refresh_token);
  }
});
