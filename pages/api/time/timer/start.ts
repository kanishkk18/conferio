// // pages/api/time-tracking/timer/start.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';
// import { z } from 'zod';

// const startTimerSchema = z.object({
//   taskId: z.string().optional(),
//   isBillable: z.boolean().default(true),
//   description: z.string().optional(),
// });

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     const { taskId, isBillable, description } = startTimerSchema.parse(req.body);

//     // Check if there's already a running timer
//     const existingRunning = await prisma.timeEntry.findFirst({
//       where: {
//         userId: session.user.id,
//         isRunning: true,
//       },
//     });

//     if (existingRunning) {
//       return res.status(400).json({ error: 'Timer already running' });
//     }

//     // Get user's team
//     const teamMember = await prisma.teamMember.findFirst({
//       where: { userId: session.user.id },
//       include: { team: true },
//     });

//     if (!teamMember) {
//       return res.status(400).json({ error: 'User not in any team' });
//     }

//     // Create new time entry
//     // const entry = await prisma.timeEntry.create({
//     //   data: {
//     //     userId: session.user.id,
//     //     teamId: teamMember.teamId,
//     //     taskId: taskId || null,
//     //     startTime: new Date(),
//     //     isBillable,
//     //     description: description || null,
//     //     isRunning: true,
//     //     lastResumedAt: new Date(),
//     //     lastActiveAt: new Date(),
//     //     entryType: 'TIMER',
//     //     billableStatus: 'APPROVED', // Auto-approve timer entries
//     //   },
//     //   include: {
//     //     task: {
//     //       include: {
//     //         column: {
//     //           include: {
//     //             board: true,
//     //           },
//     //         },
//     //       },
//     //     },
//     //   },
//     // });

//         // Create new time entry
//         const entry = await prisma.timeEntry.create({
//             data: {
//               userId: session.user.id,
//               teamId: teamMember.teamId,
//               taskId: taskId || null,
//               startTime: new Date(),
//               duration: 0,  // ADD THIS LINE - starts at 0
//               isBillable,
//               description: description || null,
//               isRunning: true,
//               lastResumedAt: new Date(),
//               lastActiveAt: new Date(),
//               entryType: 'TIMER',
//               billableStatus: 'APPROVED', // Auto-approve timer entries
//             },
//             include: {
//               task: {
//                 include: {
//                   column: {
//                     include: {
//                       board: true,
//                     },
//                   },
//                 },
//               },
//             },
//           });

//     return res.status(200).json({ success: true, entry });
//   } catch (error) {
//     console.error('Start timer error:', error);
//     return res.status(500).json({ error: 'Failed to start timer' });
//   }
// }

// pages/api/time-tracking/timer/start.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { notifyTimerStarted } from '@/lib/notifications/notification.triggers';
import { broadcastToUser } from '../../notifications/stream';

const startTimerSchema = z.object({
  taskId: z.string().optional(),
  isBillable: z.boolean().default(true),
  description: z.string().optional(),
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
    const { taskId, isBillable, description } = startTimerSchema.parse(req.body);

    // Check if there's already a running timer
    const existingRunning = await prisma.timeEntry.findFirst({
      where: {
        userId: session.user.id,
        isRunning: true,
      },
    });

    if (existingRunning) {
      return res.status(400).json({ error: 'Timer already running' });
    }

    // Get user's team
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: true },
    });

    if (!teamMember) {
      return res.status(400).json({ error: 'User not in any team' });
    }

    // Create new time entry
    const entry = await prisma.timeEntry.create({
      data: {
        userId: session.user.id,
        teamId: teamMember.teamId,
        taskId: taskId || null,
        startTime: new Date(),
        duration: 0,
        isBillable,
        description: description || null,
        isRunning: true,
        lastResumedAt: new Date(),
        lastActiveAt: new Date(),
        entryType: 'TIMER',
        billableStatus: 'APPROVED',
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

    // ── Notify team owners/admins that timer started ───────────────────
    const teamOwners = await prisma.teamMember.findMany({
      where: {
        teamId: teamMember.teamId,
        role: { in: ['OWNER', 'ADMIN'] },
        // Don't notify if the owner started their own timer
        NOT: { userId: session.user.id },
      },
    });

    const ownerIds = teamOwners.map(m => m.userId);

    if (ownerIds.length > 0) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });

      await notifyTimerStarted({
        ownerUserIds: ownerIds,
        memberName: user?.name ?? 'Someone',
        timeEntryId: entry.id,
        taskTitle: entry.task?.title,
        teamId: teamMember.teamId,
      });

      for (const uid of ownerIds) {
        const notification = await prisma.notification.findFirst({
          where: { userId: uid, type: 'TIMER_STARTED' },
          orderBy: { createdAt: 'desc' },
        });
        if (notification) {
          broadcastToUser(uid, { type: 'notification', notification });
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────

    return res.status(200).json({ success: true, entry });
  } catch (error) {
    console.error('Start timer error:', error);
    return res.status(500).json({ error: 'Failed to start timer' });
  }
}