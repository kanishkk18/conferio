import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { EventIdSchema } from 'lib/validation';
import { HTTPSTATUS } from 'lib/http-status';
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

    // Only handle PUT requests
    if (req.method !== 'PUT') {
      return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({
        message: 'Method not allowed'
      });
    }

    // Validation
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const data = EventIdSchema.parse(body);
    const eventId = data.eventId;

    // Check if event exists and belongs to user
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId, 
        userId 
      },
    });

    if (!event) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Event not found"
      });
    }

    // Toggle privacy setting
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: { isPrivate: !event.isPrivate },
    });

    return res.status(HTTPSTATUS.OK).json({
      message: `Event set to ${updatedEvent.isPrivate ? "private" : "public"} successfully`,
    });
  } catch (error: any) {
    console.error('Toggle privacy error:', error);
    
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