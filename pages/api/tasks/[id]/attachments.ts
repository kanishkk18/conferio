// // pages/api/tasks/[id]/attachments.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../../lib/auth';
// import { prisma } from '../../../../lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id: taskId } = req.query;
  
//   if (typeof taskId !== 'string') {
//     return res.status(400).json({ error: 'Invalid task ID' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   const task = await prisma.task.findUnique({
//     where: { id: taskId },
//     include: { column: { include: { board: true } } },
//   });

//   if (!task) {
//     return res.status(404).json({ error: 'Task not found' });
//   }

//   const hasAccess = await prisma.board.findFirst({
//     where: {
//       id: task.boardId,
//       OR: [
//         { ownerId: user.id },
//         { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
//       ],
//     },
//   });

//   if (!hasAccess) {
//     return res.status(403).json({ error: 'Access denied' });
//   }

//   switch (req.method) {
//     case 'POST':
//       try {
//         const { filename, url, size, mimeType } = req.body;
        
//         const attachment = await prisma.attachment.create({
//           data: {
//             filename,
//             url,
//             size,
//             mimeType,
//             taskId,
//             uploadedBy: user.id,
//           },
//         });

//         await prisma.activityLog.create({
//           data: {
//             action: 'ATTACHED',
//             entityType: 'TASK',
//             entityId: taskId,
//             description: `Attached file "${filename}"`,
//             boardId: task.boardId,
//             taskId,
//             userId: user.id,
//           },
//         });

//         return res.status(201).json(attachment);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to add attachment' });
//       }

//     default:
//       res.setHeader('Allow', ['POST']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../../lib/auth';
// import { prisma } from '../../../../lib/prisma';
// import { getIO } from '../../../../lib/socket-store';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id: taskId } = req.query;
  
//   if (typeof taskId !== 'string') {
//     return res.status(400).json({ error: 'Invalid task ID' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   const task = await prisma.task.findUnique({
//     where: { id: taskId },
//     include: { column: { include: { board: true } } },
//   });

//   if (!task) {
//     return res.status(404).json({ error: 'Task not found' });
//   }

//   const hasAccess = await prisma.board.findFirst({
//     where: {
//       id: task.boardId,
//       OR: [
//         { ownerId: user.id },
//         { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
//       ],
//     },
//   });

//   if (!hasAccess) {
//     return res.status(403).json({ error: 'Access denied' });
//   }

//   switch (req.method) {
//     case 'POST':
//       try {
//         const { filename, url, size, mimeType } = req.body;
        
//         const attachment = await prisma.attachment.create({
//           data: {
//             filename,
//             url,
//             size,
//             mimeType,
//             taskId,
//             uploadedBy: user.id,
//           },
//         });

//         // Get updated task for socket emission
//         const updatedTask = await prisma.task.findUnique({
//           where: { id: taskId },
//           include: {
//             assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
//             labels: { include: { label: true } },
//             attachments: true,
//             subtasks: true,
//             _count: { select: { boardComments: true, attachments: true } },
//           },
//         });

//         const io = getIO();
//         if (io && updatedTask) {
//           io.to(`board:${task.boardId}`).emit('task_updated', {
//             task: updatedTask,
//             boardId: task.boardId,
//           });
//         }

//         // Log async
//         prisma.activityLog.create({
//           data: {
//             action: 'ATTACHED',
//             entityType: 'TASK',
//             entityId: taskId,
//             description: `Attached file "${filename}"`,
//             boardId: task.boardId,
//             taskId,
//             userId: user.id,
//           },
//         }).catch(console.error);

//         return res.status(201).json(attachment);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to add attachment' });
//       }

//     default:
//       res.setHeader('Allow', ['POST']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// pages/api/tasks/[id]/attachments.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { getIO } from '../../../../lib/socket-store';
import { broadcastClipEvent, SSE_EVENTS } from '@/lib/sse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: taskId } = req.query;

  if (typeof taskId !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { column: { include: { board: true } } },
  });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const hasAccess = await prisma.board.findFirst({
    where: {
      id: task.boardId,
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
      ],
    },
  });

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { filename, url, size, mimeType } = req.body;

        const attachment = await prisma.attachment.create({
          data: {
            filename,
            url,
            size,
            mimeType,
            taskId,
            uploadedBy: user.id,
          },
        });

        // ✅ Fetch the updated task and emit to board room
        const updatedTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            assignees: {
              include: { user: { select: { id: true, name: true, image: true } } },
            },
            labels: { include: { label: true } },
            attachments: true,
            subtasks: true,
            _count: { select: { boardComments: true, attachments: true } },
          },
        });

        if (updatedTask) {
  broadcastClipEvent(SSE_EVENTS.TASK_UPDATED, {
    type: 'task:updated',
    boardId: task.boardId,
    task: updatedTask,
  });
}

        // Fire-and-forget activity log
        prisma.activityLog
          .create({
            data: {
              action: 'ATTACHED',
              entityType: 'TASK',
              entityId: taskId,
              description: `Attached file "${filename}"`,
              boardId: task.boardId,
              taskId,
              userId: user.id,
            },
          })
          .catch((err) => console.error('Activity log error:', err));

        return res.status(201).json(attachment);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to add attachment' });
      }

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}