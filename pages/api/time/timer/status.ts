// pages/api/time-tracking/timer/status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const runningEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: session.user.id,
        isRunning: true,
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
      },
    });

    if (!runningEntry) {
      return res.status(200).json({ 
        isRunning: false,
        isPaused: false,
        elapsedSeconds: 0,
        taskId: null,
        entryId: null,
      });
    }

    // Calculate elapsed time
    const now = new Date();
    const startTime = new Date(runningEntry.startTime);
    const lastResumedAt = runningEntry.lastResumedAt 
      ? new Date(runningEntry.lastResumedAt) 
      : startTime;
    
    let elapsedMinutes = runningEntry.duration;
    
    if (!runningEntry.isPaused) {
      const currentSessionMinutes = Math.floor((now.getTime() - lastResumedAt.getTime()) / 60000);
      elapsedMinutes += currentSessionMinutes;
    }

    // Check for auto-pause (30 minutes of inactivity)
    const lastActiveAt = runningEntry.lastActiveAt 
      ? new Date(runningEntry.lastActiveAt) 
      : lastResumedAt;
    const inactiveMinutes = Math.floor((now.getTime() - lastActiveAt.getTime()) / 60000);
    const shouldAutoPause = inactiveMinutes >= 30 && !runningEntry.isPaused;

    return res.status(200).json({
      isRunning: true,
      isPaused: runningEntry.isPaused || shouldAutoPause,
      entryId: runningEntry.id,
      taskId: runningEntry.taskId,
      isBillable: runningEntry.isBillable,
      description: runningEntry.description,
      startTime: runningEntry.startTime,
      elapsedSeconds: elapsedMinutes * 60,
      shouldAutoPause,
      inactiveMinutes: shouldAutoPause ? inactiveMinutes : 0,
    });
  } catch (error) {
    console.error('Get timer status error:', error);
    return res.status(500).json({ error: 'Failed to get timer status' });
  }
}