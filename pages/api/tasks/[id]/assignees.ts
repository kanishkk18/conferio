// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../../lib/auth';
// import { prisma } from '../../../../lib/prisma';
// import { notifyTaskAssigned, notifyTaskUnassigned } from '../../../../lib/notifications/notification.triggers';
// import { broadcastToUser } from '../../notifications/stream';
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
//         const { userId } = req.body;
        
//         const assignee = await prisma.taskAssignee.create({
//           data: {
//             taskId,
//             userId,
//             assignedBy: user.id,
//           },
//           include: {
//             user: { select: { id: true, name: true, email: true, image: true } },
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
//             _count: { select: { boardComments: true } },
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
//             action: 'ASSIGNED',
//             entityType: 'TASK',
//             entityId: taskId,
//             description: `Assigned user to task`,
//             boardId: task.boardId,
//             taskId,
//             userId: user.id,
//           },
//         }).catch(console.error);

//         // Notification
//         if (userId !== user.id) {
//           await notifyTaskAssigned({
//             assigneeUserId: userId,
//             assignedByName: user.name ?? 'Someone',
//             taskId,
//             taskTitle: task.title,
//             boardId: task.column.boardId,
//             boardTitle: task.column.board.title,
//             columnTitle: task.column.title,
//           });

//           const notification = await prisma.notification.findFirst({
//             where: { userId, taskId, type: 'TASK_ASSIGNED' },
//             orderBy: { createdAt: 'desc' },
//           });
//           if (notification) {
//             broadcastToUser(userId, { type: 'notification', notification });
//           }
//         }

//         return res.status(201).json(assignee);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to assign user' });
//       }

//     case 'DELETE':
//       try {
//         const { userId } = req.query;
        
//         if (typeof userId !== 'string') {
//           return res.status(400).json({ error: 'Invalid user ID' });
//         }

//         await prisma.taskAssignee.deleteMany({
//           where: { taskId, userId },
//         });

//         // Get updated task
//         const updatedTask = await prisma.task.findUnique({
//           where: { id: taskId },
//           include: {
//             assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
//             labels: { include: { label: true } },
//             attachments: true,
//             subtasks: true,
//             _count: { select: { boardComments: true } },
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
//             action: 'UNASSIGNED',
//             entityType: 'TASK',
//             entityId: taskId,
//             description: `Unassigned user from task`,
//             boardId: task.boardId,
//             taskId,
//             userId: user.id,
//           },
//         }).catch(console.error);

//         // Notification
//         if (userId !== user.id) {
//           await notifyTaskUnassigned({
//             removedUserId: userId,
//             removedByName: user.name ?? 'Someone',
//             taskId,
//             taskTitle: task.title,
//             boardId: task.column.boardId,
//             boardTitle: task.column.board.title,
//           });

//           const notification = await prisma.notification.findFirst({
//             where: { userId, taskId, type: 'TASK_UNASSIGNED' },
//             orderBy: { createdAt: 'desc' },
//           });
//           if (notification) {
//             broadcastToUser(userId, { type: 'notification', notification });
//           }
//         }

//         return res.status(204).end();
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to unassign user' });
//       }

//     default:
//       res.setHeader('Allow', ['POST', 'DELETE']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { notifyTaskAssigned, notifyTaskUnassigned } from 'lib/notifications/notification.triggers';
import { broadcastToUser } from '../../notifications/stream';
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
        const { userId } = req.body;

        // ✅ Fetch the assigned user's name before creating for use in the log
        const assignedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true },
        });

        if (!assignedUser) {
          return res.status(404).json({ error: 'User to assign not found' });
        }

        const assignee = await prisma.taskAssignee.create({
          data: { taskId, userId, assignedBy: user.id },
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        });

        const updatedTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
            labels: { include: { label: true } },
            attachments: true,
            subtasks: true,
            _count: { select: { boardComments: true } },
          },
        });

       if (updatedTask) {
          broadcastClipEvent(SSE_EVENTS.TASK_UPDATED, {
            type: 'task:updated',
            boardId: task.boardId,
            task: updatedTask,
          });
        }

        // ✅ Rich log: names of both the assigner and the assigned person
        const isSelfAssign = userId === user.id;
        prisma.activityLog.create({
          data: {
            action: 'ASSIGNED',
            entityType: 'TASK',
            entityId: taskId,
            description: isSelfAssign
              ? `${user.name} assigned themselves to "${task.title}"`
              : `${user.name} assigned ${assignedUser.name} to "${task.title}"`,
            boardId: task.boardId,
            taskId,
            userId: user.id,
            metadata: {
              assignedUserId: assignedUser.id,
              assignedUserName: assignedUser.name,
              assignedByName: user.name,
              taskTitle: task.title,
            },
          },
        }).catch(console.error);

        if (userId !== user.id) {
          await notifyTaskAssigned({
            assigneeUserId: userId,
            assignedByName: user.name ?? 'Someone',
            taskId,
            taskTitle: task.title,
            boardId: task.column.boardId,
            boardTitle: task.column.board.title,
            columnTitle: task.column.title,
          });

          const notification = await prisma.notification.findFirst({
            where: { userId, taskId, type: 'TASK_ASSIGNED' },
            orderBy: { createdAt: 'desc' },
          });
          if (notification) {
            broadcastToUser(userId, { type: 'notification', notification });
          }
        }

        return res.status(201).json(assignee);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to assign user' });
      }

    case 'DELETE':
      try {
        const { userId } = req.query;

        if (typeof userId !== 'string') {
          return res.status(400).json({ error: 'Invalid user ID' });
        }

        // ✅ Fetch the removed user's name before deleting for use in the log
        const removedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true },
        });

        await prisma.taskAssignee.deleteMany({
          where: { taskId, userId },
        });

        const updatedTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
            labels: { include: { label: true } },
            attachments: true,
            subtasks: true,
            _count: { select: { boardComments: true } },
          },
        });

        if (updatedTask) {
          broadcastClipEvent(SSE_EVENTS.TASK_UPDATED, {
            type: 'task:updated',
            boardId: task.boardId,
            task: updatedTask,
          });
        } 

        // ✅ Rich log: names of both the remover and the removed person
        const isSelfRemove = userId === user.id;
        prisma.activityLog.create({
          data: {
            action: 'UNASSIGNED',
            entityType: 'TASK',
            entityId: taskId,
            description: isSelfRemove
              ? `${user.name} unassigned themselves from "${task.title}"`
              : `${user.name} removed ${removedUser?.name ?? 'a member'} from "${task.title}"`,
            boardId: task.boardId,
            taskId,
            userId: user.id,
            metadata: {
              removedUserId: userId,
              removedUserName: removedUser?.name,
              removedByName: user.name,
              taskTitle: task.title,
            },
          },
        }).catch(console.error);

        if (userId !== user.id) {
          await notifyTaskUnassigned({
            removedUserId: userId,
            removedByName: user.name ?? 'Someone',
            taskId,
            taskTitle: task.title,
            boardId: task.column.boardId,
            boardTitle: task.column.board.title,
          });

          const notification = await prisma.notification.findFirst({
            where: { userId, taskId, type: 'TASK_UNASSIGNED' },
            orderBy: { createdAt: 'desc' },
          });
          if (notification) {
            broadcastToUser(userId, { type: 'notification', notification });
          }
        }

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to unassign user' });
      }

    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}