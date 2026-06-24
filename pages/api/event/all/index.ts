// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { withAuth, withErrorHandling } from 'lib/middleware'
// import { HTTPSTATUS } from 'lib/http-status'
// import { NotFoundException } from '@/lib/errors'

// const handler = withAuth(async (req: NextRequest, userId: string) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     include: {
//       events: {
//         include: {
//           _count: {
//             select: { meetings: true },
//           },
//         },
//         orderBy: { createdAt: 'desc' },
//       },
//     },
//   })

//   if (!user) {
//     throw new NotFoundException("User not found")
//   }

//   return NextResponse.json(
//     {
//       message: "User events fetched successfully",
//       data: {
//         events: user.events,
//         username: user.username,
//       },
//     },
//     { status: HTTPSTATUS.OK }
//   )
// })

// export const GET = withErrorHandling(handler)

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { HTTPSTATUS } from 'lib/http-status'
import { NotFoundException } from '@/lib/errors'
import { getSession } from 'next-auth/react' // Adjust to your auth library

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
        message: 'Method not allowed'
      })
    }

    // Authentication
    const session = await getSession({ req })
    if (!session?.user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' })
    }
    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        events: {
          include: {
            _count: {
              select: { meetings: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "User events fetched successfully",
      data: {
        events: user.events,
        username: user.username,
      },
    })
  } catch (error: any) {
    // Handle custom exceptions
    const status = error.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR
    const message = error.message || 'Internal server error'
    
    return res.status(status).json({
      message,
      ...(error.errorCode && { errorCode: error.errorCode })
    })
  }
}