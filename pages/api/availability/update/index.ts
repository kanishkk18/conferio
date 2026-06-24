import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { UpdateAvailabilitySchema } from '@/lib/validation';
import { HTTPSTATUS } from '@/lib/http-status';
import { DayOfWeek } from '@prisma/client';
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
    const data = UpdateAvailabilitySchema.parse(body);

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

    if (!user) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({ 
        message: "User not found" 
      });
    }

    // Prepare day availability data
    const dayAvailabilityData = data.days.map(({ day, isAvailable, startTime, endTime }) => {
      const baseDate = new Date().toISOString().split("T")[0];
      return {
        day: day.toUpperCase() as DayOfWeek,
        startTime: new Date(`${baseDate}T${startTime}:00Z`),
        endTime: new Date(`${baseDate}T${endTime}:00Z`),
        isAvailable,
      };
    });

    // Transaction to update availability
    await prisma.$transaction(async (tx) => {
      if (user.availability) {
        // Delete existing day availabilities
        await tx.dayAvailability.deleteMany({
          where: { availabilityId: user.availability.id },
        });

        // Update availability
        await tx.availability.update({
          where: { id: user.availability.id },
          data: {
            timeGap: data.timeGap,
            days: {
              create: dayAvailabilityData,
            },
          },
        });
      } else {
        // Create new availability
        await tx.availability.create({
          data: {
            userId,
            timeGap: data.timeGap,
            days: {
              create: dayAvailabilityData,
            },
          },
        });
      }
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Availability updated successfully",
    });
  } catch (error: any) {
    console.error('Availability update error:', error);
    
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