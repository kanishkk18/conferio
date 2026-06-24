// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { UserNameSchema } from 'lib/validation'
// import { withErrorHandling, withValidation } from 'lib/middleware'
// import { HTTPSTATUS } from 'lib/http-status'
// import { NotFoundException } from '@/lib/errors'

// const handler = withValidation(
//   UserNameSchema,
//   async (req: NextRequest, data: any) => {
//     const user = await prisma.user.findUnique({
//       where: { username: data.username },
//       select: {
//         id: true,
//         name: true,
//         image: true,
//         events: {
//           where: { isPrivate: false },
//           select: {
//             id: true,
//             title: true,
//             description: true,
//             slug: true,
//             duration: true,
//             locationType: true,
//           },
//           orderBy: { createdAt: 'desc' },
//         },
//       },
//     })

//     if (!user) {
//       throw new NotFoundException("User not found")
//     }

//     return NextResponse.json(
//       {
//         message: "Public events fetched successfully",
//         user: {
//           name: user.name,
//           username: data.username,
//           imageUrl: user.image,
//         },
//         events: user.events,
//       },
//       { status: HTTPSTATUS.OK }
//     )
//   }
// )

// export const GET = withErrorHandling((req: NextRequest, { params }: { params: { username: string } }) => 
//   handler(req, { username: params.username })
// )

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { UserNameSchema } from 'lib/validation'
import { HTTPSTATUS } from 'lib/http-status'
import { NotFoundException } from '@/lib/errors'
import { ZodError } from 'zod'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
        message: 'Method not allowed'
      })
    }

    // Extract username from query parameters
    const { username } = req.query

    // Validate input
    const validation = UserNameSchema.safeParse({ username })
    if (!validation.success) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    const validatedUsername = validation.data.username

    // Fetch user with public events
    const user = await prisma.user.findUnique({
      where: { username: validatedUsername },
      select: {
        id: true,
        name: true,
        image: true,
        // Added bio field
        events: {
          where: { isPrivate: false },
          select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            duration: true,
            locationType: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Public events fetched successfully",
      user: {
        id: user.id,
        name: user.name,
        username: validatedUsername,
        imageUrl: user.image,
       // Include bio in response
      },
      events: user.events,
    })
  } catch (error: any) {
    console.error('Error fetching public events:', error)
    
    // Handle custom exceptions
    if (error instanceof NotFoundException) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: error.message
      })
    }
    
    // Handle Zod errors
    if (error instanceof ZodError) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error'
    })
  }
}