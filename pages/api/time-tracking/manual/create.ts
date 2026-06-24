// pages/api/time-tracking/manual/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const manualEntrySchema = z.object({
  taskId: z.string().optional(),
  date: z.string(), // ISO date string
  duration: z.number().min(1).max(1440), // Max 24 hours in minutes
  isBillable: z.boolean().default(true),
  description: z.string().min(1),
  startTime: z.string().optional(), // Optional specific start time
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = manualEntrySchema.parse(req.body);

    // Get user's team
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: true },
    });

    if (!teamMember) {
      return res.status(400).json({ error: 'User not in any team' });
    }

    // Check manual entry limit
    const entryDate = new Date(data.date);
    const year = entryDate.getFullYear();
    const month = entryDate.getMonth() + 1;

    let manualRequest = await prisma.manualTimeRequest.findUnique({
      where: {
        userId_teamId_year_month: {
          userId: session.user.id,
          teamId: teamMember.teamId,
          year,
          month,
        },
      },
    });

    const currentCount = manualRequest?.requestCount || 0;
    const requiresApproval = currentCount >= 3;

    // Create or update manual request counter
    if (!manualRequest) {
      manualRequest = await prisma.manualTimeRequest.create({
        data: {
          userId: session.user.id,
          teamId: teamMember.teamId,
          year,
          month,
          requestCount: 1,
        },
      });
    } else {
      await prisma.manualTimeRequest.update({
        where: { id: manualRequest.id },
        data: { requestCount: { increment: 1 } },
      });
    }

    // Calculate start and end times
    const startDateTime = data.startTime 
      ? new Date(`${data.date}T${data.startTime}`)
      : new Date(`${data.date}T09:00:00`);
    
    const endDateTime = new Date(startDateTime.getTime() + data.duration * 60000);

    // Create time entry
    const entry = await prisma.timeEntry.create({
      data: {
        userId: session.user.id,
        teamId: teamMember.teamId,
        taskId: data.taskId || null,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: data.duration,
        isBillable: data.isBillable,
        description: data.description,
        entryType: 'MANUAL',
        billableStatus: requiresApproval ? 'PENDING' : 'APPROVED',
        isRunning: false,
        isPaused: false,
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return res.status(200).json({ 
      success: true, 
      entry,
      requiresApproval,
      remainingFreeEntries: Math.max(0, 3 - (currentCount + 1)),
    });
  } catch (error) {
    console.error('Create manual entry error:', error);
    return res.status(500).json({ error: 'Failed to create manual entry' });
  }
}