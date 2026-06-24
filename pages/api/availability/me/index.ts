// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from 'lib/prisma'
// import { withAuth, withErrorHandling } from 'lib/middleware'
// import { HTTPSTATUS } from 'lib/http-status'
// import { NotFoundException } from '@/lib/errors'

// const handler = withAuth(async (req: NextRequest, userId: string) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     include: {
//       availability: {
//         include: {
//           days: true,
//         },
//       },
//     },
//   })

//   if (!user || !user.availability) {
//     throw new NotFoundException("User not found or availability")
//   }

//   const availabilityData = {
//     timeGap: user.availability.timeGap,
//     days: user.availability.days.map((dayAvailability) => ({
//       day: dayAvailability.day,
//       startTime: dayAvailability.startTime.toISOString().slice(11, 16),
//       endTime: dayAvailability.endTime.toISOString().slice(11, 16),
//       isAvailable: dayAvailability.isAvailable,
//     })),
//   }

//   return NextResponse.json(
//     {
//       message: "Fetched availability successfully",
//       availability: availabilityData,
//     },
//     { status: HTTPSTATUS.OK }
//   )
// })

// export const GET = withErrorHandling(handler)


// import { NextApiRequest, NextApiResponse } from 'next'
// import { prisma } from 'lib/prisma'
// import { HTTPSTATUS } from 'lib/http-status'
// import { NotFoundException } from '@/lib/errors'
// import { getSession } from 'next-auth/react'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     // Authentication
//     const session = await getSession({ req })
//     if (!session?.user) {
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' })
//     }
//     const userId = session.user.id

//     // Only handle GET requests
//     if (req.method !== 'GET') {
//       return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
//         message: 'Method not allowed'
//       })
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       include: {
//         availability: {
//           include: {
//             days: true,
//           },
//         },
//       },
//     })

//     if (!user || !user.availability) {
//       throw new NotFoundException("User not found or availability")
//     }

//     const availabilityData = {
//       timeGap: user.availability.timeGap,
//       days: user.availability.days.map((dayAvailability) => ({
//         day: dayAvailability.day,
//         startTime: dayAvailability.startTime.toISOString().slice(11, 16),
//         endTime: dayAvailability.endTime.toISOString().slice(11, 16),
//         isAvailable: dayAvailability.isAvailable,
//       })),
//     }

//     return res.status(HTTPSTATUS.OK).json({
//       message: "Fetched availability successfully",
//       availability: availabilityData,
//     })
//   } catch (error: any) {
//     // Handle custom exceptions
//     const status = error.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR
//     const message = error.message || 'Internal server error'
    
//     return res.status(status).json({
//       message,
//       ...(error.errors && { errors: error.errors })
//     })
//   }
// }

// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from 'lib/prisma'
// import { withAuth, withErrorHandling } from 'lib/middleware'
// import { HTTPSTATUS } from 'lib/http-status'
// import { NotFoundException } from '@/lib/errors'

// const handler = withAuth(async (req: NextRequest, userId: string) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     include: {
//       availability: {
//         include: {
//           days: true,
//         },
//       },
//     },
//   })

//   if (!user || !user.availability) {
//     throw new NotFoundException("User not found or availability")
//   }

//   const availabilityData = {
//     timeGap: user.availability.timeGap,
//     days: user.availability.days.map((dayAvailability) => ({
//       day: dayAvailability.day,
//       startTime: dayAvailability.startTime.toISOString().slice(11, 16),
//       endTime: dayAvailability.endTime.toISOString().slice(11, 16),
//       isAvailable: dayAvailability.isAvailable,
//     })),
//   }

//   return NextResponse.json(
//     {
//       message: "Fetched availability successfully",
//       availability: availabilityData,
//     },
//     { status: HTTPSTATUS.OK }
//   )
// })

// export const GET = withErrorHandling(handler)


// pages/api/availability/me/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { HTTPSTATUS } from '@/lib/http-status';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        availability: {
          include: {
            days: true,
          },
        },
      },
    });

    if (!user || !user.availability) {
      return res.status(HTTPSTATUS.OK).json({
        message: "User availability not configured",
        availability: {
          timeGap: 30, // Default value
          days: []
        }
      });
    }

    const availabilityData = {
      timeGap: user.availability.timeGap,
      days: user.availability.days.map((dayAvailability) => ({
        day: dayAvailability.day,
        startTime: dayAvailability.startTime.toISOString().slice(11, 16),
        endTime: dayAvailability.endTime.toISOString().slice(11, 16),
        isAvailable: dayAvailability.isAvailable,
      })),
    };

    return res.status(HTTPSTATUS.OK).json({
      message: "Fetched availability successfully",
      availability: availabilityData,
    });
  } catch (error: any) {
    console.error('Availability fetch error:', error);
    
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error'
    });
  }
}