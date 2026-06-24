// // pages/api/tasks/[id].ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../lib/auth';
// import { prisma } from '../../../lib/prisma';
// import { getIO } from '../../../lib/socket-store';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);

//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id } = req.query;

//   if (typeof id !== 'string') {
//     return res.status(400).json({ error: 'Invalid task ID' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   // Get task with board info
//   const task = await prisma.task.findUnique({
//     where: { id },
//     include: { column: { include: { board: true } } },
//   });

//   if (!task) {
//     return res.status(404).json({ error: 'Task not found' });
//   }

//   const hasAccess = await prisma.board.findFirst({
//     where: {
//       id: task.boardId,
//       OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
//     },
//   });

//   if (!hasAccess) {
//     return res.status(403).json({ error: 'Access denied' });
//   }

//   switch (req.method) {
//     case 'GET':
//       try {
//         const fullTask = await prisma.task.findUnique({
//           where: { id },
//           include: {
//             assignees: {
//               include: {
//                 user: { select: { id: true, name: true, email: true, image: true } },
//               },
//             },
//             labels: { include: { label: true } },
//             attachments: true,
//             subtasks: { orderBy: { order: 'asc' } },
//             boardComments: {
//               orderBy: { createdAt: 'desc' },
//               include: {
//                 user: { select: { id: true, name: true, image: true } },
//                 attachments: true,
//               },
//             },
//             activities: {
//               orderBy: { createdAt: 'desc' },
//               take: 20,
//               include: {
//                 user: { select: { id: true, name: true, image: true } },
//               },
//             },
//           },
//         });
//         return res.status(200).json(fullTask);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to fetch task' });
//       }

//     case 'PUT':
//       try {
//         const { title, description, columnId, priority, dueDate, status, coverImage, isArchived, order } =
//           req.body;

//         const oldTask = await prisma.task.findUnique({
//           where: { id },
//           select: { columnId: true, status: true, title: true, boardId: true },
//         });

//         if (!oldTask) return res.status(404).json({ error: 'Task not found' });

//         const updatedTask = await prisma.task.update({
//           where: { id },
//           data: {
//             title,
//             description,
//             columnId,
//             priority,
//             dueDate: dueDate ? new Date(dueDate) : null,
//             status,
//             coverImage,
//             isArchived,
//             order,
//           },
//           include: {
//             assignees: {
//               include: {
//                 user: { select: { id: true, name: true, image: true } },
//               },
//             },
//             labels: { include: { label: true } },
//             attachments: true,
//             subtasks: true,
//             _count: { select: { boardComments: true } },
//           },
//         });

//         // ✅ EMIT TO BOARD ROOM — all members get this immediately
//         const io = getIO();
//         if (io) {
//           const isColumnChanged = columnId && columnId !== oldTask.columnId;

//           if (isColumnChanged) {
//             console.log('[API] Emitting task_moved to board:', oldTask.boardId);
//             io.to(`board:${oldTask.boardId}`).emit('task_moved', {
//               taskId: id,
//               fromColumnId: oldTask.columnId,
//               toColumnId: columnId,
//               task: updatedTask,
//               boardId: oldTask.boardId,
//             });
//           } else {
//             console.log('[API] Emitting task_updated to board:', oldTask.boardId);
//             io.to(`board:${oldTask.boardId}`).emit('task_updated', {
//               task: updatedTask,
//               boardId: oldTask.boardId,
//             });
//           }
//         }

//         // Fire-and-forget activity log
//         const action = columnId && columnId !== oldTask.columnId ? 'MOVED' : 'UPDATED';
//         prisma.activityLog
//           .create({
//             data: {
//               action,
//               entityType: 'TASK',
//               entityId: id,
//               description:
//                 action === 'MOVED'
//                   ? `Moved task "${title}" to another column`
//                   : `Updated task "${title}"`,
//               metadata:
//                 action === 'MOVED'
//                   ? { oldColumnId: oldTask.columnId, newColumnId: columnId }
//                   : undefined,
//               boardId: oldTask.boardId,
//               taskId: id,
//               userId: user.id,
//             },
//           })
//           .catch((err) => console.error('Activity log error:', err));

//         return res.status(200).json(updatedTask);
//       } catch (error) {
//         console.error('Task update error:', error);
//         return res.status(500).json({ error: 'Failed to update task' });
//       }

//     case 'DELETE':
//       try {
//         await prisma.task.delete({ where: { id } });

//         // ✅ EMIT TO BOARD ROOM
//         const io = getIO();
//         if (io) {
//           io.to(`board:${task.boardId}`).emit('task_deleted', {
//             taskId: id,
//             boardId: task.boardId,
//           });
//         }

//         prisma.activityLog
//           .create({
//             data: {
//               action: 'DELETED',
//               entityType: 'TASK',
//               entityId: id,
//               description: `Deleted task "${task.title}"`,
//               boardId: task.boardId,
//               userId: user.id,
//             },
//           })
//           .catch((err) => console.error('Activity log error:', err));

//         return res.status(204).end();
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to delete task' });
//       }

//     default:
//       res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { getIO } from '../../../lib/socket-store';
import { broadcastClipEvent, SSE_EVENTS } from '@/lib/sse';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: { column: { include: { board: true } } },
  });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const hasAccess = await prisma.board.findFirst({
    where: {
      id: task.boardId,
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
  });

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const fullTask = await prisma.task.findUnique({
          where: { id },
          include: {
            assignees: {
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            },
            labels: { include: { label: true } },
            attachments: true,
            subtasks: { orderBy: { order: 'asc' } },
            boardComments: {
              orderBy: { createdAt: 'desc' },
              include: {
                user: { select: { id: true, name: true, image: true } },
                attachments: true,
              },
            },
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 20,
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        });
        return res.status(200).json(fullTask);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch task' });
      }

    case 'PUT':
      try {
        const {
          title,
          description,
          columnId,
          priority,
          dueDate,
          status,
          coverImage,
          isArchived,
          order,
        } = req.body;

        // ✅ Fetch the old task state AND column names before updating
        const oldTask = await prisma.task.findUnique({
          where: { id },
          select: {
            title: true,
            columnId: true,
            priority: true,
            status: true,
            dueDate: true,
            coverImage: true,
            boardId: true,
            isArchived: true,
            column: { select: { title: true } },
          },
        });

        if (!oldTask) return res.status(404).json({ error: 'Task not found' });

        const updatedTask = await prisma.task.update({
          where: { id },
          data: {
            title,
            description,
            columnId,
            priority,
            dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
            status,
            coverImage,
            isArchived,
            order,
          },
          include: {
            assignees: {
              include: { user: { select: { id: true, name: true, image: true } } },
            },
            labels: { include: { label: true } },
            attachments: true,
            subtasks: true,
            _count: { select: { boardComments: true } },
          },
        });

        const isColumnChanged = columnId && columnId !== oldTask.columnId;
        if (isColumnChanged) {
          broadcastClipEvent(SSE_EVENTS.TASK_MOVED, {
            type: 'task:moved',
            boardId: oldTask.boardId,
            taskId: id,
            fromColumnId: oldTask.columnId,
            toColumnId: columnId,
            task: updatedTask,
          });
        } else {
          broadcastClipEvent(SSE_EVENTS.TASK_UPDATED, {
            type: 'task:updated',
            boardId: oldTask.boardId,
            task: updatedTask,
          });
        }
        // ✅ Detect exactly what changed and log each change separately
        const taskTitle = title ?? oldTask.title;

        // Column move
        if (columnId && columnId !== oldTask.columnId) {
          const newColumn = await prisma.column.findUnique({
            where: { id: columnId },
            select: { title: true },
          });
          prisma.activityLog.create({
            data: {
              action: 'MOVED',
              entityType: 'TASK',
              entityId: id,
              description: `${user.name} moved "${taskTitle}" from "${oldTask.column.title}" to "${newColumn?.title}"`,
              boardId: oldTask.boardId,
              taskId: id,
              userId: user.id,
              metadata: {
                fromColumnId: oldTask.columnId,
                fromColumnTitle: oldTask.column.title,
                toColumnId: columnId,
                toColumnTitle: newColumn?.title,
              },
            },
          }).catch(console.error);
        }

        // Title rename
        if (title && title !== oldTask.title) {
          prisma.activityLog.create({
            data: {
              action: 'RENAMED',
              entityType: 'TASK',
              entityId: id,
              description: `${user.name} renamed task from "${oldTask.title}" to "${title}"`,
              boardId: oldTask.boardId,
              taskId: id,
              userId: user.id,
              metadata: { oldTitle: oldTask.title, newTitle: title },
            },
          }).catch(console.error);
        }

        // Priority change
        if (priority && priority !== oldTask.priority) {
          prisma.activityLog.create({
            data: {
              action: 'PRIORITY_CHANGED',
              entityType: 'TASK',
              entityId: id,
              description: `${user.name} changed priority of "${taskTitle}" from ${oldTask.priority} to ${priority}`,
              boardId: oldTask.boardId,
              taskId: id,
              userId: user.id,
              metadata: { from: oldTask.priority, to: priority },
            },
          }).catch(console.error);
        }

        // Status change
        if (status && status !== oldTask.status) {
          prisma.activityLog.create({
            data: {
              action: 'STATUS_CHANGED',
              entityType: 'TASK',
              entityId: id,
              description: `${user.name} changed status of "${taskTitle}" from ${oldTask.status} to ${status}`,
              boardId: oldTask.boardId,
              taskId: id,
              userId: user.id,
              metadata: { from: oldTask.status, to: status },
            },
          }).catch(console.error);
        }

        // Due date change
        if (dueDate !== undefined) {
          const oldDue = oldTask.dueDate?.toISOString().split('T')[0];
          const newDue = dueDate ? new Date(dueDate).toISOString().split('T')[0] : null;

          if (oldDue !== newDue) {
            prisma.activityLog.create({
              data: {
                action: 'DUE_DATE_SET',
                entityType: 'TASK',
                entityId: id,
                description: dueDate
                  ? `${user.name} set due date of "${taskTitle}" to ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : `${user.name} removed the due date from "${taskTitle}"`,
                boardId: oldTask.boardId,
                taskId: id,
                userId: user.id,
                metadata: {
                  oldDueDate: oldTask.dueDate,
                  newDueDate: dueDate || null,
                },
              },
            }).catch(console.error);
          }
        }

        // Archive / restore
        if (isArchived !== undefined && isArchived !== oldTask.isArchived) {
          prisma.activityLog.create({
            data: {
              action: isArchived ? 'ARCHIVED' : 'RESTORED',
              entityType: 'TASK',
              entityId: id,
              description: isArchived
                ? `${user.name} archived task "${taskTitle}"`
                : `${user.name} restored task "${taskTitle}"`,
              boardId: oldTask.boardId,
              taskId: id,
              userId: user.id,
              metadata: { taskTitle },
            },
          }).catch(console.error);
        }

        // Cover image change
        if (coverImage !== undefined && coverImage !== oldTask.coverImage) {
          prisma.activityLog.create({
            data: {
              action: 'COVER_CHANGED',
              entityType: 'TASK',
              entityId: id,
              description: coverImage
                ? `${user.name} added a cover image to "${taskTitle}"`
                : `${user.name} removed the cover image from "${taskTitle}"`,
              boardId: oldTask.boardId,
              taskId: id,
              userId: user.id,
              metadata: { taskTitle },
            },
          }).catch(console.error);
        }

        return res.status(200).json(updatedTask);
      } catch (error) {
        console.error('Task update error:', error);
        return res.status(500).json({ error: 'Failed to update task' });
      }

    case 'DELETE':
      try {
        // ✅ Log BEFORE deleting so we have the task data
        prisma.activityLog.create({
          data: {
            action: 'DELETED',
            entityType: 'TASK',
            entityId: id,
            description: `${user.name} deleted task "${task.title}"`,
            boardId: task.boardId,
            // taskId intentionally omitted — task is about to not exist
            userId: user.id,
            metadata: {
              taskTitle: task.title,
              columnId: task.columnId,
              columnTitle: task.column.title,
            },
          },
        }).catch(console.error);

        await prisma.task.delete({ where: { id } });

        broadcastClipEvent(SSE_EVENTS.TASK_DELETED, {
          type: 'task:deleted',
          boardId: task.boardId,
          taskId: id,
        });

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete task' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}