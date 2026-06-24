// pages/api/event/update.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { HTTPSTATUS } from '@/lib/http-status';

// Validation schema for updating events
const UpdateEventSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  locationType: z.enum(['GOOGLE_MEET_AND_CALENDAR', 'ZOOM_MEETING', 'CONFERIO']),
});

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
    const data = UpdateEventSchema.parse(body);

    // Check if event exists and belongs to user
    const event = await prisma.event.findFirst({
      where: { 
        id: data.id, 
        userId 
      },
    });

    if (!event) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Event not found"
      });
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        locationType: data.locationType,
      },
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    
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