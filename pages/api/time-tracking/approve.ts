// // pages/api/time-tracking/approve.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
// import { z } from 'zod';

// const approveSchema = z.object({
//   entryId: z.string(),
//   status: z.enum(['APPROVED', 'REJECTED']),
//   notes: z.string().optional(),
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
//     const { entryId, status, notes } = approveSchema.parse(req.body);

//     // Check permissions
//     const currentUserMember = await prisma.teamMember.findFirst({
//       where: { userId: session.user.id },
//     });

//     if (!currentUserMember || !['ADMIN', 'OWNER'].includes(currentUserMember.role)) {
//       return res.status(403).json({ error: 'Only admins can approve entries' });
//     }

//     const entry = await prisma.timeEntry.findFirst({
//       where: { id: entryId },
//       include: { user: true },
//     });

//     if (!entry) {
//       return res.status(404).json({ error: 'Entry not found' });
//     }

//     if (entry.teamId !== currentUserMember.teamId) {
//       return res.status(403).json({ error: 'Cannot approve entries from other teams' });
//     }

//     const updatedEntry = await prisma.timeEntry.update({
//       where: { id: entryId },
//       data: {
//         billableStatus: status,
//         approvedBy: session.user.id,
//         approvedAt: new Date(),
//         notes: notes || entry.notes,
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
//         approvedByUser: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//       },
//     });

//     return res.status(200).json({ success: true, entry: updatedEntry });
//   } catch (error) {
//     console.error('Approve entry error:', error);
//     return res.status(500).json({ error: 'Failed to approve entry' });
//   }
// }

// pages/api/time-tracking/approve.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  notifyTimesheetApproved,
  notifyTimesheetRejected,
} from '@/lib/notifications/notification.triggers';
import { broadcastToUser } from '../notifications/stream';

const approveSchema = z.object({
  entryId: z.string(),
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
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
    const { entryId, status, notes } = approveSchema.parse(req.body);

    // Check permissions
    const currentUserMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!currentUserMember || !['ADMIN', 'OWNER'].includes(currentUserMember.role)) {
      return res.status(403).json({ error: 'Only admins can approve entries' });
    }

    const entry = await prisma.timeEntry.findFirst({
      where: { id: entryId },
      include: {
        user: true,
        task: true,
      },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (entry.teamId !== currentUserMember.teamId) {
      return res.status(403).json({ error: 'Cannot approve entries from other teams' });
    }

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: entryId },
      data: {
        billableStatus: status,
        approvedBy: session.user.id,
        approvedAt: new Date(),
        notes: notes || entry.notes,
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
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // ── Notify submitter of the decision ──────────────────────────────
    const approver = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    const approverName = approver?.name ?? 'Admin';
    const taskTitle = entry.task?.title;

    if (status === 'APPROVED') {
      await notifyTimesheetApproved({
        submitterUserId: entry.userId,
        approverName,
        timeEntryId: entryId,
        duration: entry.duration,
        taskTitle,
      });

      const notification = await prisma.notification.findFirst({
        where: { userId: entry.userId, type: 'TIMESHEET_APPROVED' },
        orderBy: { createdAt: 'desc' },
      });
      if (notification) {
        broadcastToUser(entry.userId, { type: 'notification', notification });
      }
    }

    if (status === 'REJECTED') {
      await notifyTimesheetRejected({
        submitterUserId: entry.userId,
        approverName,
        timeEntryId: entryId,
        duration: entry.duration,
        taskTitle,
        reason: notes,
      });

      const notification = await prisma.notification.findFirst({
        where: { userId: entry.userId, type: 'TIMESHEET_REJECTED' },
        orderBy: { createdAt: 'desc' },
      });
      if (notification) {
        broadcastToUser(entry.userId, { type: 'notification', notification });
      }
    }
    // ─────────────────────────────────────────────────────────────────

    return res.status(200).json({ success: true, entry: updatedEntry });
  } catch (error) {
    console.error('Approve entry error:', error);
    return res.status(500).json({ error: 'Failed to approve entry' });
  }
}