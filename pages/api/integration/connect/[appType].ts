// // import { NextRequest, NextResponse } from 'next/server'
// // import { AppTypeSchema } from 'lib/validation'
// // import { withAuth, withErrorHandling, withValidation } from 'lib/middleware'
// // import { HTTPSTATUS } from 'lib/http-status'
// // import { googleOAuth2Client } from 'lib/oauth'
// // import { encodeState } from '@/lib/utils'
// // import { BadRequestException } from '@/lib/errors'
// // import { IntegrationAppType } from '@prisma/client'

// // const handler = withAuth(
// //   withValidation(
// //     AppTypeSchema,
// //     async (req: NextRequest, data: any, userId: string) => {
// //       const state = encodeState({ userId, appType: data.appType })

// //       let authUrl: string

// //       switch (data.appType) {
// //         case IntegrationAppType.GOOGLE_MEET_AND_CALENDAR:
// //           authUrl = googleOAuth2Client.generateAuthUrl({
// //             access_type: "offline",
// //             scope: ["https://www.googleapis.com/auth/calendar.events"],
// //             prompt: "consent",
// //             state,
// //           })
// //           break
// //         default:
// //           throw new BadRequestException("Unsupported app type")
// //       }

// //       return NextResponse.json(
// //         { url: authUrl },
// //         { status: HTTPSTATUS.OK }
// //       )
// //     }
// //   )
// // )

// // export const GET = withErrorHandling((req: NextRequest, { params }: { params: { appType: string } }) => 
// //   handler(req, { appType: params.appType })
// // )

// import { NextApiRequest, NextApiResponse } from 'next'
// import { AppTypeSchema } from 'lib/validation'
// import { HTTPSTATUS } from 'lib/http-status'
// import { googleOAuth2Client } from 'lib/oauth'
// import { encodeState } from '@/lib/utils'
// import { BadRequestException } from '@/lib/errors'
// import { IntegrationAppType } from '@prisma/client'
// import { getSession } from 'next-auth/react'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     // Authentication
//     const session = await getSession({ req })
//     if (!session?.user) {
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' })
//     }
//     const userId = session.user.id

//     // Extract appType from query parameters
//     const { appType } = req.query

//     // Validation
//     const validation = AppTypeSchema.safeParse({ appType })
//     if (!validation.success) {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({
//         message: 'Invalid app type',
//         errors: validation.error.errors
//       })
//     }

//     const state = encodeState({ userId, appType: validation.data.appType })
//     let authUrl: string

//     switch (validation.data.appType) {
//       case IntegrationAppType.GOOGLE_MEET_AND_CALENDAR:
//         authUrl = googleOAuth2Client.generateAuthUrl({
//           access_type: "offline",
//           scope: ["https://www.googleapis.com/auth/calendar.events"],
//           prompt: "consent",
//           state,
//         })
//         break
//       default:
//         throw new BadRequestException("Unsupported app type")
//     }

//     return res.status(HTTPSTATUS.OK).json({ url: authUrl })
//   } catch (error: any) {
//     // Error handling
//     const status = error.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR
//     const message = error.message || 'Internal server error'
    
//     return res.status(status).json({
//       message,
//       ...(error.errors && { errors: error.errors })
//     })
//   }
// }


// pages/api/integration/connect/[appType].ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { AppTypeSchema } from 'lib/validation';
// import { HTTPSTATUS } from 'lib/http-status';
// import { googleOAuth2Client } from 'lib/oauth';
// import { encodeState } from '@/lib/utils';
// import { IntegrationAppType } from '@prisma/client';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../../auth/[...nextauth]';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     // Authentication
//     const session = await getServerSession(req, res, authOptions);
//     if (!session?.user) {
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
//         message: 'Unauthorized' 
//       });
//     }
//     const userId = session.user.id;

//     // Only handle GET requests
//     if (req.method !== 'GET') {
//       return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
//         message: 'Method not allowed'
//       });
//     }

//     // Extract appType from query parameters
//     const { appType } = req.query;

//     // Validation
//     const validation = AppTypeSchema.safeParse({ appType });
//     if (!validation.success) {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({
//         message: 'Invalid app type',
//         errors: validation.error.errors
//       });
//     }

//     const state = encodeState({ 
//       userId, 
//       appType: validation.data.appType 
//     });
    
//     let authUrl: string;

//     switch (validation.data.appType) {
//       case IntegrationAppType.GOOGLE_MEET_AND_CALENDAR:
//         authUrl = googleOAuth2Client.generateAuthUrl({
//           access_type: "offline",
//           scope: [
//             "https://www.googleapis.com/auth/calendar.events",
//             "https://www.googleapis.com/auth/calendar.readonly",
//             "https://www.googleapis.com/auth/userinfo.profile",
//             "https://www.googleapis.com/auth/userinfo.email"
//           ],
//           prompt: "consent",
//           state,
//           redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
//         });
//         break;
      
//       default:
//         return res.status(HTTPSTATUS.BAD_REQUEST).json({
//           message: "Unsupported app type"
//         });
//     }

//     return res.status(HTTPSTATUS.OK).json({ url: authUrl });
//   } catch (error: any) {
//     console.error('Integration connect error:', error);
    
//     return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//       message: 'Internal server error',
//     });
//   }
// }


// // pages/api/integration/connect/[appType].ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { AppTypeSchema } from 'lib/validation';
// import { HTTPSTATUS } from 'lib/http-status';
// import { googleCalendarClient } from '@/lib/oauth';
// import { encodeState } from '@/lib/utils';
// import { IntegrationAppType } from '@prisma/client';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../../auth/[...nextauth]';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     // Authentication
//     const session = await getServerSession(req, res, authOptions);
//     if (!session?.user) {
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
//         message: 'Unauthorized' 
//       });
//     }
//     const userId = session.user.id;

//     // Only handle GET requests
//     if (req.method !== 'GET') {
//       return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
//         message: 'Method not allowed'
//       });
//     }

//     // Extract appType from query parameters
//     const { appType } = req.query;

//     // Validation
//     const validation = AppTypeSchema.safeParse({ appType });
//     if (!validation.success) {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({
//         message: 'Invalid app type',
//         errors: validation.error.errors
//       });
//     }

//     const state = encodeState({ 
//       userId, 
//       appType: validation.data.appType 
//     });
    
//     let authUrl: string;

//     if (validation.data.appType === IntegrationAppType.GOOGLE_MEET_AND_CALENDAR) {
//       authUrl = googleCalendarClient.generateAuthUrl({
//         access_type: "offline",
//         scope: [
//           "https://www.googleapis.com/auth/calendar.events",
//           "https://www.googleapis.com/auth/calendar.readonly",
//           "https://www.googleapis.com/auth/userinfo.profile",
//           "https://www.googleapis.com/auth/userinfo.email"
//         ],
//         prompt: "consent",
//         state,
//         // Use the configured redirect URI
//       });
//     } else {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({
//         message: "Unsupported app type"
//       });
//     }

//     return res.status(HTTPSTATUS.OK).json({ url: authUrl });
//   } catch (error: any) {
//     console.error('Integration connect error:', error);
    
//     return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//       message: 'Internal server error',
//     });
//   }
// }


// pages/api/integration/connect/[appType].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { AppTypeSchema } from 'lib/validation';
import { HTTPSTATUS } from 'lib/http-status';
import { IntegrationAppType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { encodeState } from '@/lib/utils';
import { config } from '@/lib/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
        message: 'Unauthorized' 
      });
    }
    const userId = session.user.id;

    // Only handle GET requests
    if (req.method !== 'GET') {
      return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
        message: 'Method not allowed'
      });
    }

    // Extract appType from query parameters
    const { appType } = req.query;

    // Validation
    const validation = AppTypeSchema.safeParse({ appType });
    if (!validation.success) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: 'Invalid app type',
        errors: validation.error.errors
      });
    }

    const state = await encodeState({ 
      userId, 
      appType: validation.data.appType 
    });
    
    let authUrl: string;

    if (validation.data.appType === IntegrationAppType.GOOGLE_MEET_AND_CALENDAR) {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: config.GOOGLE_CALENDAR_REDIRECT_URI,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        scope: [
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/calendar.readonly',
          'openid'
        ].join(' '),
        state
      })}`;
    } else {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Unsupported app type"
      });
    }

    return res.status(HTTPSTATUS.OK).json({ url: authUrl });
  } catch (error: any) {
    console.error('Integration connect error:', error);
    
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }
}