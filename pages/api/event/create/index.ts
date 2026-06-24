// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { CreateEventSchema } from 'lib/validation'
// import { withAuth, withErrorHandling, withValidation } from 'lib/middleware'
// import { HTTPSTATUS } from 'lib/http-status'
// import { slugify } from 'lib/utils'
// import { EventLocationType } from '@prisma/client'
// import { BadRequestException } from '@/lib/errors'

// const handler = withAuth(
//   withValidation(
//     CreateEventSchema,
//     async (req: NextRequest, data: any, userId: string) => {
//       if (!Object.values(EventLocationType).includes(data.locationType)) {
//         throw new BadRequestException("Invalid location type")
//       }

//       const slug = slugify(data.title)

//       const event = await prisma.event.create({
//         data: {
//           title: data.title,
//           description: data.description,
//           duration: data.duration,
//           locationType: data.locationType,
//           slug,
//           userId,
//         },
//       })

//       return NextResponse.json(
//         {
//           message: "Event created successfully",
//           event,
//         },
//         { status: HTTPSTATUS.CREATED }
//       )
//     }
//   )
// )

// export const POST = withErrorHandling(handler)

// import { NextApiRequest, NextApiResponse } from 'next'
// import { prisma } from '@/lib/prisma'
// import { CreateEventSchema } from 'lib/validation'
// import { HTTPSTATUS } from 'lib/http-status'
// import { slugify } from 'lib/utils'
// import { EventLocationType } from '@prisma/client'
// import { BadRequestException } from '@/lib/errors'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { ZodError } from 'zod'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     // Only handle POST requests
//     if (req.method !== 'POST') {
//       return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
//         message: 'Method not allowed'
//       })
//     }

//     // Get session
//     const session = await getServerSession(req, res, authOptions)
    
//     // Authentication check
//     if (!session?.user) {
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
//         message: 'Unauthorized - Please sign in' 
//       })
//     }
    
//     const userId = session.user.id
//     console.log('Authenticated user ID:', userId) // For debugging

//     // Parse and validate request body
//     let data: any
//     try {
//       data = CreateEventSchema.parse(req.body)
//     } catch (error: any) {
//       if (error instanceof ZodError) {
//         return res.status(HTTPSTATUS.BAD_REQUEST).json({
//           message: 'Validation failed',
//           errors: error.errors.map(err => ({
//             field: err.path.join('.'),
//             message: err.message
//           }))
//         })
//       }
//       throw error
//     }

//     // Validate location type
//     if (!Object.values(EventLocationType).includes(data.locationType)) {
//       throw new BadRequestException("Invalid location type")
//     }

//     // Create slug from title
//     const slug = slugify(data.title)

//     // Create event
//     const event = await prisma.event.create({
//       data: {
//         title: data.title,
//         description: data.description,
//         duration: data.duration,
//         locationType: data.locationType,
//         slug,
//         userId,
//       },
//     })

//     return res.status(HTTPSTATUS.CREATED).json({
//       message: "Event created successfully",
//       event,
//     })
//   } catch (error: any) {
//     console.error('API Error:', error) // Detailed error logging
    
//     // Handle custom exceptions
//     const status = error.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR
//     const message = error.message || 'Internal server error'
    
//     return res.status(status).json({
//       message,
//       ...(error.errors && { errors: error.errors })
//     })
//   }
// }

// // pages/api/event/create.ts
// import { getToken } from 'next-auth/jwt'
// import { prisma } from '@/lib/prisma'
// import { CreateEventSchema } from 'lib/validation'
// import { HTTPSTATUS } from 'lib/http-status'
// import { slugify } from 'lib/utils'
// import { EventLocationType } from '@prisma/client'
// import { BadRequestException } from '@/lib/errors'
// import { ZodError } from 'zod'
// import type { NextApiRequest, NextApiResponse } from 'next'
// import { string } from 'yup'

// const secret = process.env.NEXTAUTH_SECRET

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     if (req.method !== 'POST') {
//       return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
//         message: 'Method not allowed'
//       })
//     }

//     // Get token using next-auth/jwt
//     const token = await getToken({ req, secret })
    
//     if (!token) {
//       console.log('No token found')
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
//         message: 'Unauthorized - Please sign in' 
//       })
//     }
    
//     // Get user ID from token - use different properties
//     const userId = token.id || token.sub || token.userId
    
//     if (!userId) {
//       console.log('User ID not found in token:', JSON.stringify(token, null, 2))
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
//         message: 'User ID not found in session' 
//       })
//     }

//     console.log('Authenticated user ID:', userId)

//     // Parse and validate request body
//     let data: any
//     try {
//       data = CreateEventSchema.parse(req.body)
//     } catch (error: any) {
//       if (error instanceof ZodError) {
//         return res.status(HTTPSTATUS.BAD_REQUEST).json({
//           message: 'Validation failed',
//           errors: error.errors.map(err => ({
//             field: err.path.join('.'),
//             message: err.message
//           }))
//         })
//       }
//       throw error
//     }

//     // Validate location type
//     if (!Object.values(EventLocationType).includes(data.locationType)) {
//       throw new BadRequestException("Invalid location type")
//     }

//     // Create slug from title
//     const slug = slugify(data.title)

//     // Create event
//     const event = await prisma.event.create({
//       data: {
//         title: data.title,
//         description: data.description,
//         duration: data.duration,
//         locationType: data.locationType,
//         slug,
//         userId,
//       },
//     })

//     return res.status(HTTPSTATUS.CREATED).json({
//       message: "Event created successfully",
//       event,
//     })
//   } catch (error: any) {
//     console.error('API Error:', error)
    
//     const status = error.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR
//     const message = error.message || 'Internal server error'
    
//     return res.status(status).json({
//       message,
//       ...(error.errors && { errors: error.errors })
//     })
//   }
// }


import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateEventSchema } from 'lib/validation';
import { HTTPSTATUS } from 'lib/http-status';
import { slugify } from 'lib/utils';
import { EventLocationType } from '@prisma/client';
import { BadRequestException } from '@/lib/errors';
import { ZodError } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' });
    }

    // ✅ Use getServerSession — works with BOTH JWT and database strategy
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized - Please sign in' });
    }

    const userId = session.user.id as string;
    console.log('Authenticated user ID:', userId);

    let data: any;
    try {
      data = CreateEventSchema.parse(req.body);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: 'Validation failed',
          errors: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      throw error;
    }

    if (!Object.values(EventLocationType).includes(data.locationType)) {
      throw new BadRequestException('Invalid location type');
    }

    const slug = slugify(data.title);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        locationType: data.locationType,
        slug,
        userId,
      },
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    const status = error.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal server error';
    return res.status(status).json({ message, ...(error.errors && { errors: error.errors }) });
  }
}