// // pages/api/time-tracking/timer/stop.ts
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
//       },
//     });

//     if (!runningEntry) {
//       return res.status(404).json({ error: 'No running timer found' });
//     }

//     const now = new Date();
//     const startTime = new Date(runningEntry.startTime);
//     const lastResumedAt = runningEntry.lastResumedAt ? new Date(runningEntry.lastResumedAt) : startTime;
    
//     // Calculate duration
//     const currentSessionMinutes = Math.floor((now.getTime() - lastResumedAt.getTime()) / 60000);
//     const totalDuration = runningEntry.duration + currentSessionMinutes;

//     const updatedEntry = await prisma.timeEntry.update({
//       where: { id: runningEntry.id },
//       data: {
//         isRunning: false,
//         isPaused: false,
//         endTime: now,
//         duration: totalDuration,
//         lastActiveAt: now,
//       },
//       include: {
//         task: {
//           include: {
//             column: {
//               include: {
//                 board: true,
//               },
//             },
//           },
//         },
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           },
//         },
//       },
//     });

//     return res.status(200).json({ success: true, entry: updatedEntry });
//   } catch (error) {
//     console.error('Stop timer error:', error);
//     return res.status(500).json({ error: 'Failed to stop timer' });
//   }
// }

// pages/api/time-tracking/timer/stop.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  notifyTimerStopped,
  notifyTimesheetApprovalPending,
} from '@/lib/notifications/notification.triggers';
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
      },
      include: { task: true },
    });

    if (!runningEntry) {
      return res.status(404).json({ error: 'No running timer found' });
    }

    const now = new Date();
    const lastResumedAt = runningEntry.lastResumedAt
      ? new Date(runningEntry.lastResumedAt)
      : new Date(runningEntry.startTime);

    const currentSessionMinutes = Math.floor((now.getTime() - lastResumedAt.getTime()) / 60000);
    const totalDuration = runningEntry.duration + currentSessionMinutes;

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: runningEntry.id },
      data: {
        isRunning: false,
        isPaused: false,
        endTime: now,
        duration: totalDuration,
        lastActiveAt: now,
        // Mark as PENDING so owners can approve
        billableStatus: 'PENDING',
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

    // ── Notify owners: timer stopped + approval needed ────────────────
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

      const memberName = user?.name ?? 'Someone';
      const taskTitle = runningEntry.task?.title;

      // Notify stopped
      await notifyTimerStopped({
        ownerUserIds: ownerIds,
        memberName,
        timeEntryId: runningEntry.id,
        taskTitle,
        teamId: runningEntry.teamId,
        total: totalDuration,
      });

      // Notify approval pending
      await notifyTimesheetApprovalPending({
        approverUserIds: ownerIds,
        submitterName: memberName,
        timeEntryId: runningEntry.id,
        teamId: runningEntry.teamId,
        duration: totalDuration,
        taskTitle,
      });

      for (const uid of ownerIds) {
        for (const type of ['TIMER_STOPPED', 'TIMER_APPROVAL_PENDING']) {
          const notification = await prisma.notification.findFirst({
            where: { userId: uid, type },
            orderBy: { createdAt: 'desc' },
          });
          if (notification) {
            broadcastToUser(uid, { type: 'notification', notification });
          }
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────

    return res.status(200).json({ success: true, entry: updatedEntry });
  } catch (error) {
    console.error('Stop timer error:', error);
    return res.status(500).json({ error: 'Failed to stop timer' });
  }
}