// pages/api/time-tracking/timer/reset.ts
//
// Nuclear reset: forcibly marks all running/paused timer entries as stopped
// for the current user. Safe to call at any time — idempotent.
// Use this when the client is stuck and normal stop/resume fails.

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();

    // Find ALL stuck entries (running OR paused but never stopped)
    const stuckEntries = await prisma.timeEntry.findMany({
      where: {
        userId: session.user.id,
        isRunning: true,
      },
    });

    if (stuckEntries.length === 0) {
      // Nothing stuck — also clear localStorage signal by returning clean state
      return res.status(200).json({ success: true, cleared: 0, message: 'No stuck timers found' });
    }

    // Forcibly terminate all stuck entries
    const updateResults = await Promise.all(
      stuckEntries.map((entry) => {
        const lastResumedAt = entry.lastResumedAt
          ? new Date(entry.lastResumedAt)
          : new Date(entry.startTime);
        const currentSessionMinutes = Math.floor(
          (now.getTime() - lastResumedAt.getTime()) / 60000
        );
        // Don't add negative time if something is off with timestamps
        const additionalMinutes = Math.max(0, currentSessionMinutes);
        const totalDuration = entry.duration + additionalMinutes;

        return prisma.timeEntry.update({
          where: { id: entry.id },
          data: {
            isRunning: false,
            isPaused: false,
            endTime: now,
            duration: totalDuration,
            lastActiveAt: now,
            billableStatus: 'PENDING',
          },
        });
      })
    );

    return res.status(200).json({
      success: true,
      cleared: updateResults.length,
      entries: updateResults.map((e) => ({ id: e.id, duration: e.duration })),
    });
  } catch (error) {
    console.error('Timer reset error:', error);
    return res.status(500).json({ error: 'Failed to reset timer state' });
  }
}