// // pages/api/time-tracking/timer/pause.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     const runningEntry = await prisma.timeEntry.findFirst({
//       where: {
//         userId: session.user.id,
//         isRunning: true,
//         isPaused: false,
//       },
//     });

//     if (!runningEntry) {
//       return res.status(404).json({ error: 'No active timer found' });
//     }

//     const now = new Date();
//     const lastResumedAt = new Date(runningEntry.lastResumedAt || runningEntry.startTime);
//     const sessionMinutes = Math.floor((now.getTime() - lastResumedAt.getTime()) / 60000);

//     const updatedEntry = await prisma.timeEntry.update({
//       where: { id: runningEntry.id },
//       data: {
//         isPaused: true,
//         duration: runningEntry.duration + sessionMinutes,
//         totalPausedTime: runningEntry.totalPausedTime + sessionMinutes,
//         lastActiveAt: now,
//       },
//     });

//     return res.status(200).json({ success: true, entry: updatedEntry });
//   } catch (error) {
//     console.error('Pause timer error:', error);
//     return res.status(500).json({ error: 'Failed to pause timer' });
//   }
// }

// pages/api/time-tracking/timer/pause.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyTimerPaused } from '@/lib/notifications/notification.triggers';
import { broadcastToUser } from '../../notifications/stream';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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
        isPaused: false,
      },
      include: { task: true },
    });

    if (!runningEntry) {
      return res.status(404).json({ error: 'No active timer found' });
    }

    const now = new Date();
    const lastResumedAt = new Date(runningEntry.lastResumedAt || runningEntry.startTime);
    const sessionMinutes = Math.floor((now.getTime() - lastResumedAt.getTime()) / 60000);
    const totalElapsed = runningEntry.duration + sessionMinutes;

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: runningEntry.id },
      data: {
        isPaused: true,
        duration: totalElapsed,
        totalPausedTime: runningEntry.totalPausedTime + sessionMinutes,
        lastActiveAt: now,
      },
    });

    // ── Notify team owners/admins that timer paused ───────────────────
    const teamOwners = await prisma.teamMember.findMany({
      where: {
        teamId: runningEntry.teamId,
        role: { in: ['OWNER', 'ADMIN'] },
        NOT: { userId: session.user.id },
      },
    });

    const ownerIds = teamOwners.map(m => m.userId);

    if (ownerIds.length > 0) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });

      await notifyTimerPaused({
        ownerUserIds: ownerIds,
        memberName: user?.name ?? 'Someone',
        timeEntryId: runningEntry.id,
        taskTitle: runningEntry.task?.title,
        teamId: runningEntry.teamId,
        elapsed: totalElapsed,
      });

      for (const uid of ownerIds) {
        const notification = await prisma.notification.findFirst({
          where: { userId: uid, type: 'TIMER_PAUSED' },
          orderBy: { createdAt: 'desc' },
        });
        if (notification) {
          broadcastToUser(uid, { type: 'notification', notification });
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────

    return res.status(200).json({ success: true, entry: updatedEntry });
  } catch (error) {
    console.error('Pause timer error:', error);
    return res.status(500).json({ error: 'Failed to pause timer' });
  }
}