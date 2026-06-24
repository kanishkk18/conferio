// // pages/api/integration/callback/google-calendar.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { OAuth2Client } from 'google-auth-library';
// import { prisma } from '@/lib/prisma';
// import { IntegrationProvider, IntegrationCategory, IntegrationAppType } from '@prisma/client';
// import { jwtVerify } from 'jose';
// import { config } from '@/lib/config';

// // Create Google OAuth client
// const googleCalendarClient = new OAuth2Client(
//   config.GOOGLE_CLIENT_ID,
//   config.GOOGLE_CLIENT_SECRET,
//   config.GOOGLE_CALENDAR_REDIRECT_URI
// );

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     // Extract query parameters
//     const { code, state, error } = req.query;
    
//     // Use your specific frontend URL
//     const CLIENT_URL = `${config.FRONTEND_INTEGRATION_URL}?app_type=google`;
    
//     // Handle OAuth errors
//     if (error) {
//       console.error('Google OAuth error:', error);
//       return res.redirect(`${CLIENT_URL}&error=${encodeURIComponent(error as string)}`);
//     }

//     // Validate required parameters
//     if (!code || !state) {
//       console.error('Missing parameters:', { code, state });
//       return res.redirect(`${CLIENT_URL}&error=missing_parameters`);
//     }

//     // Decode JWT state
//     const secret = new TextEncoder().encode(config.JWT_SECRET);
//     const { payload } = await jwtVerify(state as string, secret);
//     const { userId, appType } = payload as { userId: string; appType: IntegrationAppType };

//     console.log('Decoded state:', { userId, appType });

//     if (appType !== IntegrationAppType.GOOGLE_MEET_AND_CALENDAR) {
//       console.error('Unsupported app type:', appType);
//       return res.redirect(`${CLIENT_URL}&error=unsupported_app`);
//     }

//     // Exchange code for tokens
//     const { tokens } = await googleCalendarClient.getToken({
//       code: code as string,
//       redirect_uri: config.GOOGLE_CALENDAR_REDIRECT_URI
//     });
    
//     if (!tokens.access_token) {
//       console.error('No access token received');
//       return res.redirect(`${CLIENT_URL}&error=no_access_token`);
//     }

//     // Save tokens to database
//     const integration = await prisma.integration.upsert({
//       where: { 
//         userId_appType: { 
//           userId, 
//           appType 
//         } 
//       },
//       update: {
//         accessToken: tokens.access_token,
//         refreshToken: tokens.refresh_token || undefined,
//         expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
//       },
//       create: {
//         userId,
//         appType,
//         provider: IntegrationProvider.GOOGLE,
//         category: IntegrationCategory.CALENDAR,
//         title: 'Google Calendar & Meet',
//         accessToken: tokens.access_token,
//         refreshToken: tokens.refresh_token || undefined,
//         expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
//       },
//     });

//     console.log('Integration saved:', integration);

//     // Redirect to YOUR SPECIFIC FRONTEND PAGE
//     return res.redirect(`${CLIENT_URL}&success=true`);
//   } catch (error) {
//     console.error('Google Calendar callback error:', error);
//     return res.redirect(`${config.FRONTEND_INTEGRATION_URL}?app_type=google&error=internal_error`);
//   }
// }

// pages/api/integration/callback/google-calendar.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { IntegrationProvider, IntegrationCategory, IntegrationAppType } from '@prisma/client';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';

// Create Google OAuth client
const googleCalendarClient = new OAuth2Client(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.GOOGLE_CALENDAR_REDIRECT_URI
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Extract query parameters
    const { code, state, error } = req.query;
    
    // Use your specific frontend URL
    const CLIENT_URL = `${config.FRONTEND_INTEGRATION_URL}?app_type=google`;
    
    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect(`${CLIENT_URL}&error=${encodeURIComponent(error as string)}`);
    }

    // Validate required parameters
    if (!code || !state) {
      console.error('Missing parameters:', { code, state });
      return res.redirect(`${CLIENT_URL}&error=missing_parameters`);
    }

    // Decode JWT state
    const secret = new TextEncoder().encode(config.JWT_SECRET);
    const { payload } = await jwtVerify(state as string, secret);
    const { userId, appType } = payload as { userId: string; appType: IntegrationAppType };

    console.log('Decoded state:', { userId, appType });

    if (appType !== IntegrationAppType.GOOGLE_MEET_AND_CALENDAR) {
      console.error('Unsupported app type:', appType);
      return res.redirect(`${CLIENT_URL}&error=unsupported_app`);
    }

    // Exchange code for tokens
    const { tokens } = await googleCalendarClient.getToken({
      code: code as string,
      redirect_uri: config.GOOGLE_CALENDAR_REDIRECT_URI
    });
    
    if (!tokens.access_token) {
      console.error('No access token received');
      return res.redirect(`${CLIENT_URL}&error=no_access_token`);
    }

    // Prepare metadata
    const metadata = {
      scope: tokens.scope,
      token_type: tokens.token_type,
      id_token: tokens.id_token
    };

    // Save tokens to database
    const integration = await prisma.integration.upsert({
      where: { 
        userId_appType: { 
          userId, 
          appType 
        } 
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        metadata: metadata
      },
      create: {
        userId,
        appType,
        provider: IntegrationProvider.GOOGLE,
        category: IntegrationCategory.CALENDAR,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        metadata: metadata
      },
    });

    console.log('Integration saved:', integration);

    // Redirect to your specific frontend page
    return res.redirect(`${CLIENT_URL}&success=true`);
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return res.redirect(`${config.FRONTEND_INTEGRATION_URL}?app_type=google&error=internal_error`);
  }
}