// pages/api/time-tracking/timer/resume.ts
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
    const pausedEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: session.user.id,
        isRunning: true,
        isPaused: true,
      },
    });

    if (!pausedEntry) {
      return res.status(404).json({ error: 'No paused timer found' });
    }

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: pausedEntry.id },
      data: {
        isPaused: false,
        lastResumedAt: new Date(),
        lastActiveAt: new Date(),
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

    return res.status(200).json({ success: true, entry: updatedEntry });
  } catch (error) {
    console.error('Resume timer error:', error);
    return res.status(500).json({ error: 'Failed to resume timer' });
  }
}