import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { EventIdSchema } from '@/lib/validation';
import { withErrorHandling, withValidation } from '@/lib/middleware';
import { HTTPSTATUS } from '@/lib/http-status';
import { DayOfWeek } from '@prisma/client';
import { addDays, addMinutes, format, parseISO } from 'date-fns';

type AvailableDay = {
  day: DayOfWeek;
  slots: string[];
  isAvailable: boolean;
};

function getNextDateForDay(dayOfWeek: DayOfWeek): Date {
  const days = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY, 
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];

  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = days.indexOf(dayOfWeek);
  const daysUntilTarget = (targetDay - todayDay + 7) % 7;

  return addDays(today, daysUntilTarget);
}

// function generateAvailableTimeSlots(
//   startTime: Date,
//   endTime: Date,
//   duration: number,
//   meetings: { startTime: Date; endTime: Date }[],
//   dateStr: string,
//   timeGap: number = 30
// ): string[] {
//   const slots: string[] = [];

//   // Create dates with correct date part
//   const slotStartTime = new Date(`${dateStr}T${format(startTime, 'HH:mm')}`);
//   const slotEndTime = new Date(`${dateStr}T${format(endTime, 'HH:mm')}`);

//   const now = new Date();
//   const isToday = format(now, 'yyyy-MM-dd') === dateStr;

//   let currentTime = slotStartTime;
  
//   while (currentTime < slotEndTime) {
//     const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    
//     // Skip past time slots for today
//     if (!isToday || currentTime >= now) {
//       // Check if slot is available
//       const isAvailable = meetings.every(meeting => 
//         slotEnd <= meeting.startTime || currentTime >= meeting.endTime
//       );

//       if (isAvailable) {
//         slots.push(format(currentTime, 'HH:mm'));
//       }
//     }

//     currentTime = addMinutes(currentTime, timeGap);
//   }

//   return slots;
// }

function generateAvailableTimeSlots(
  startTime: Date,
  endTime: Date,
  duration: number,
  meetings: { startTime: Date; endTime: Date }[],
  dateStr: string,
  timeGap: number = 30
): string[] {
  const slots: string[] = [];

  // FIX: Use UTC hours/minutes to avoid timezone shifts
  const startHours = startTime.getUTCHours();
  const startMinutes = startTime.getUTCMinutes();
  const endHours = endTime.getUTCHours();
  const endMinutes = endTime.getUTCMinutes();

  const slotStartTime = new Date(`${dateStr}T${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`);
  const slotEndTime = new Date(`${dateStr}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`);

  const now = new Date();
  const isToday = format(now, 'yyyy-MM-dd') === dateStr;

  let currentTime = slotStartTime;
  
  while (currentTime < slotEndTime) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    
    if (!isToday || currentTime >= now) {
      const isAvailable = meetings.every(meeting => {
        // FIX: Convert meeting times to same timezone as slots for comparison
        const meetingStart = new Date(meeting.startTime);
        const meetingEnd = new Date(meeting.endTime);
        return slotEnd <= meetingStart || currentTime >= meetingEnd;
      });

      if (isAvailable) {
        slots.push(format(currentTime, 'HH:mm'));
      }
    }

    currentTime = addMinutes(currentTime, timeGap);
  }

  return slots;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  data: { eventId: string }
) {
  try {
    const event = await prisma.event.findFirst({
      where: { 
        id: data.eventId, 
        isPrivate: false 
      },
      include: {
        user: {
          include: {
            availability: {
              include: {
                days: true,
              },
            },
            meetings: {
              select: {
                startTime: true,
                endTime: true,
              },
              where: {
                status: 'SCHEDULED',
              },
            },
          },
        },
      },
    });

    if (!event || !event.user.availability) {
      return res.status(HTTPSTATUS.OK).json({
        message: "Event availability fetched successfully",
        data: [],
      });
    }

    const { availability, meetings } = event.user;
    const daysOfWeek = Object.values(DayOfWeek);
    const availableDays: AvailableDay[] = [];

    for (const dayOfWeek of daysOfWeek) {
      const dayAvailability = availability.days.find(d => d.day === dayOfWeek);
      
      if (!dayAvailability) continue;

      const nextDate = getNextDateForDay(dayOfWeek);
      const dateStr = format(nextDate, 'yyyy-MM-dd');

      const slots = dayAvailability.isAvailable
        ? generateAvailableTimeSlots(
            dayAvailability.startTime,
            dayAvailability.endTime,
            event.duration,
            meetings,
            dateStr,
            availability.timeGap
          )
        : [];

      availableDays.push({
        day: dayOfWeek,
        slots,
        isAvailable: dayAvailability.isAvailable,
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Event availability fetched successfully",
      data: availableDays,
    });
  } catch (error) {
    console.error('Availability fetch error:', error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

export default withErrorHandling(withValidation(EventIdSchema, handler));