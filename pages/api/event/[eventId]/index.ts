// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { EventIdSchema } from 'lib/validation'
// import { withAuth, withErrorHandling, withValidation } from 'lib/middleware'
// import { HTTPSTATUS } from 'lib/http-status'
// import { NotFoundException } from '@/lib/errors'

// const handler = withAuth(
//   withValidation(
//     EventIdSchema,
//     async (req: NextRequest, data: any, userId: string) => {
//       const event = await prisma.event.findFirst({
//         where: { 
//           id: data.eventId, 
//           userId 
//         },
//       })

//       if (!event) {
//         throw new NotFoundException("Event not found")
//       }

//       await prisma.event.delete({
//         where: { id: event.id },
//       })

//       return NextResponse.json(
//         {
//           message: "Event deleted successfully",
//         },
//         { status: HTTPSTATUS.OK }
//       )
//     }
//   )
// )

// export const DELETE = withErrorHandling((req: NextRequest, { params }: { params: { eventId: string } }) => 
//   handler(req, { eventId: params.eventId })
// )

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { EventIdSchema } from 'lib/validation';
import { HTTPSTATUS } from 'lib/http-status';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Only handle DELETE requests
    if (req.method !== 'DELETE') {
      return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
        message: 'Method not allowed'
      });
    }

    // Extract eventId from query parameters
    const { eventId } = req.query;

    // Validation
    const validatedData = EventIdSchema.parse({ eventId });

    // Check if event exists and belongs to user
    const event = await prisma.event.findFirst({
      where: { 
        id: validatedData.eventId, 
        userId 
      },
    });

    if (!event) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Event not found"
      });
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: event.id },
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error('Delete event error:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }
}