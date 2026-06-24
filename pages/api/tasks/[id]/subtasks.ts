// // pages/api/tasks/[id]/subtasks.ts
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

//   // Verify access
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
//         const { title } = req.body;
        
//         const maxOrder = await prisma.subtask.aggregate({
//           where: { taskId },
//           _max: { order: true },
//         });

//         const subtask = await prisma.subtask.create({
//           data: {
//             title,
//             taskId,
//             order: (maxOrder._max.order ?? -1) + 1,
//           },
//         });

//         await prisma.activityLog.create({
//           data: {
//             action: 'CREATED',
//             entityType: 'SUBTASK',
//             entityId: subtask.id,
//             description: `Added subtask "${title}"`,
//             boardId: task.boardId,
//             taskId,
//             userId: user.id,
//           },
//         });

//         return res.status(201).json(subtask);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to create subtask' });
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
//         const { title } = req.body;
        
//         const maxOrder = await prisma.subtask.aggregate({
//           where: { taskId },
//           _max: { order: true },
//         });

//         const subtask = await prisma.subtask.create({
//           data: {
//             title,
//             taskId,
//             order: (maxOrder._max.order ?? -1) + 1,
//           },
//         });

//         // Get updated task
//         const updatedTask = await prisma.task.findUnique({
//           where: { id: taskId },
//           include: {
//             assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
//             labels: { include: { label: true } },
//             attachments: true,
//             subtasks: true,
//             _count: { select: { boardComments: true, subtasks: true } },
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
//             action: 'CREATED',
//             entityType: 'SUBTASK',
//             entityId: subtask.id,
//             description: `Added subtask "${title}"`,
//             boardId: task.boardId,
//             taskId,
//             userId: user.id,
//           },
//         }).catch(console.error);

//         return res.status(201).json(subtask);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to create subtask' });
//       }

//     default:
//       res.setHeader('Allow', ['POST']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// // pages/api/tasks/[id]/subtasks.ts
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
//         const { title } = req.body;

//         const maxOrder = await prisma.subtask.aggregate({
//           where: { taskId },
//           _max: { order: true },
//         });

//         const subtask = await prisma.subtask.create({
//           data: {
//             title,
//             taskId,
//             order: (maxOrder._max.order ?? -1) + 1,
//           },
//         });

//         // ✅ Fetch updated task and emit to board room
//         const updatedTask = await prisma.task.findUnique({
//           where: { id: taskId },
//           include: {
//             assignees: {
//               include: { user: { select: { id: true, name: true, image: true } } },
//             },
//             labels: { include: { label: true } },
//             attachments: true,
//             subtasks: { orderBy: { order: 'asc' } },
//             _count: { select: { boardComments: true, attachments: true } },
//           },
//         });

//         const io = getIO();
//         if (io && updatedTask) {
//           console.log('[API] Emitting task_updated (subtask) to board:', task.boardId);
//           io.to(`board:${task.boardId}`).emit('task_updated', {
//             task: updatedTask,
//             boardId: task.boardId,
//           });
//         }

//         prisma.activityLog
//           .create({
//             data: {
//               action: 'CREATED',
//               entityType: 'SUBTASK',
//               entityId: subtask.id,
//               description: `Added subtask "${title}"`,
//               boardId: task.boardId,
//               taskId,
//               userId: user.id,
//             },
//           })
//           .catch((err) => console.error('Activity log error:', err));

//         return res.status(201).json(subtask);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to create subtask' });
//       }

//     default:
//       res.setHeader('Allow', ['POST']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
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
        const { title } = req.body;
        
        const maxOrder = await prisma.subtask.aggregate({
          where: { taskId },
          _max: { order: true },
        });

        const subtask = await prisma.subtask.create({
          data: {
            title,
            taskId,
            order: (maxOrder._max.order ?? -1) + 1,
          },
        });

        const updatedTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
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

        return res.status(201).json(subtask);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create subtask' });
      }

    case 'PUT':
      try {
        const { subtaskId, isCompleted, title } = req.body;

        const updatedSubtask = await prisma.subtask.update({
          where: { id: subtaskId },
          data: { isCompleted, title },
        });

        const updatedTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
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

        return res.status(200).json(updatedSubtask);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update subtask' });
      }

    default:
      res.setHeader('Allow', ['POST', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}