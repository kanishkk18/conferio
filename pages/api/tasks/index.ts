// // import type { NextApiRequest, NextApiResponse } from 'next';
// // import { getServerSession } from 'next-auth/next';
// // import { authOptions } from '../auth/[...nextauth]';
// // import { prisma } from '@/lib/prisma';

// // export default async function handler(req: NextApiRequest, res: NextApiResponse) {
// //   const session = await getServerSession(req, res, authOptions);
// //   if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

// //   const user = await prisma.user.findUnique({ where: { email: session.user.email } });
// //   if (!user) return res.status(404).json({ error: 'User not found' });

// //   if (req.method === 'POST') {
// //     const { title, description, columnId, boardId, priority, dueDate, status, coverImage, assigneeIds = [], labelIds = [] } = req.body;

// //     const hasAccess = await prisma.board.findFirst({
// //       where: { id: boardId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } }] },
// //     });
// //     if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

// //     const maxOrder = await prisma.task.aggregate({ where: { columnId }, _max: { order: true } });
// //     const task = await prisma.task.create({
// //       data: {
// //         title, description, columnId, boardId, priority: priority || 'MEDIUM', dueDate: dueDate ? new Date(dueDate) : null, status: status || 'TODO', coverImage,
// //         order: (maxOrder._max.order ?? -1) + 1,
// //         assignees: assigneeIds.length > 0 ? { create: assigneeIds.map((uid: string) => ({ userId: uid, assignedBy: user.id })) } : undefined,
// //         labels: labelIds.length > 0 ? { create: labelIds.map((lid: string) => ({ labelId: lid })) } : undefined,
// //       },
// //       include: { assignees: { include: { user: { select: { id: true, name: true, image: true } } } }, labels: { include: { label: true } }, attachments: true, subtasks: true },
// //     });

// //     await prisma.activityLog.create({
// //       data: { action: 'CREATED', entityType: 'TASK', entityId: task.id, description: `Created task "${title}"`, boardId, taskId: task.id, userId: user.id },
// //     });

// //     return res.status(201).json(task);
// //   }

// //   res.setHeader('Allow', ['POST']);
// //   return res.status(405).end(`Method ${req.method} Not Allowed`);
// // }


// // pages/api/tasks/index.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../lib/auth';
// import { prisma } from '../../../lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   switch (req.method) {
//     case 'POST':
//       try {
//         const { 
//           title, 
//           description, 
//           columnId, 
//           boardId,
//           priority, 
//           dueDate, 
//           status,
//           coverImage,
//           assigneeIds = [],
//           labelIds = [],
//         } = req.body;

//         // Check access
//         const hasAccess = await prisma.board.findFirst({
//           where: {
//             id: boardId,
//             OR: [
//               { ownerId: user.id },
//               { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
//             ],
//           },
//         });

//         if (!hasAccess) {
//           return res.status(403).json({ error: 'Access denied' });
//         }

//         // Get max order in column
//         const maxOrder = await prisma.task.aggregate({
//           where: { columnId },
//           _max: { order: true },
//         });

//         const task = await prisma.task.create({
//           data: {
//             title,
//             description,
//             columnId,
//             boardId,
//             priority: priority || 'MEDIUM',
//             dueDate: dueDate ? new Date(dueDate) : null,
//             status: status || 'TODO',
//             coverImage,
//             order: (maxOrder._max.order ?? -1) + 1,
//             assignees: assigneeIds.length > 0 ? {
//               create: assigneeIds.map((userId: string) => ({
//                 userId,
//                 assignedBy: user.id,
//               })),
//             } : undefined,
//             labels: labelIds.length > 0 ? {
//               create: labelIds.map((labelId: string) => ({
//                 labelId,
//               })),
//             } : undefined,
//           },
//           include: {
//             assignees: {
//               include: {
//                 user: {
//                   select: { id: true, name: true, image: true },
//                 },
//               },
//             },
//             labels: {
//               include: { label: true },
//             },
//             attachments: true,
//             subtasks: true,
//           },
//         });

//         // Log activity
//         await prisma.activityLog.create({
//           data: {
//             action: 'CREATED',
//             entityType: 'TASK',
//             entityId: task.id,
//             description: `Created task "${title}"`,
//             boardId,
//             taskId: task.id,
//             userId: user.id,
//           },
//         });

//         return res.status(201).json(task);
//       } catch (error) {
//         console.error('Task creation error:', error);
//         return res.status(500).json({ error: 'Failed to create task' });
//       }

//     default:
//       res.setHeader('Allow', ['POST']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// // pages/api/tasks/index.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../lib/auth';
// import { prisma } from '../../../lib/prisma';
// import { getIO } from '../../../lib/socket-store'; // ADD THIS

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   switch (req.method) {
//     case 'POST':
//       try {
//         const { 
//           title, 
//           description, 
//           columnId, 
//           boardId,
//           priority, 
//           dueDate, 
//           status,
//           coverImage,
//           assigneeIds = [],
//           labelIds = [],
//         } = req.body;

//         // Check access
//         const hasAccess = await prisma.board.findFirst({
//           where: {
//             id: boardId,
//             OR: [
//               { ownerId: user.id },
//               { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
//             ],
//           },
//         });

//         if (!hasAccess) {
//           return res.status(403).json({ error: 'Access denied' });
//         }

//         // Get max order in column
//         const maxOrder = await prisma.task.aggregate({
//           where: { columnId },
//           _max: { order: true },
//         });

//         // Create task with MINIMAL includes for speed
//         const task = await prisma.task.create({
//           data: {
//             title,
//             description,
//             columnId,
//             boardId,
//             priority: priority || 'MEDIUM',
//             dueDate: dueDate ? new Date(dueDate) : null,
//             status: status || 'TODO',
//             coverImage,
//             order: (maxOrder._max.order ?? -1) + 1,
//             assignees: assigneeIds.length > 0 ? {
//               create: assigneeIds.map((userId: string) => ({
//                 userId,
//                 assignedBy: user.id,
//               })),
//             } : undefined,
//             labels: labelIds.length > 0 ? {
//               create: labelIds.map((labelId: string) => ({
//                 labelId,
//               })),
//             } : undefined,
//           },
//           // MINIMAL includes - only what the board view needs
//           include: {
//             assignees: {
//               include: {
//                 user: { select: { id: true, name: true, image: true } },
//               },
//             },
//             labels: { include: { label: true } },
//             attachments: true,
//             subtasks: true,
//             _count: {
//               select: { boardComments: true, attachments: true },
//             },
//           },
//         });

//         // EMIT TO BOARD ROOM IMMEDIATELY - THIS IS THE FIX FOR REAL-TIME
//         const io = getIO();
//         if (io) {
//           console.log('[API] Emitting task_created to board:', boardId);
//           // Emit to board room so ALL members receive it
//           io.to(`board:${boardId}`).emit('task_created', {
//             task,
//             boardId,
//             columnId,
//           });
//         }

//         // Log activity asynchronously (don't await - speeds up response)
//         prisma.activityLog.create({
//           data: {
//             action: 'CREATED',
//             entityType: 'TASK',
//             entityId: task.id,
//             description: `Created task "${title}"`,
//             boardId,
//             taskId: task.id,
//             userId: user.id,
//           },
//         }).catch(err => console.error('Activity log error:', err));

//         return res.status(201).json(task);
//       } catch (error) {
//         console.error('Task creation error:', error);
//         return res.status(500).json({ error: 'Failed to create task' });
//       }

//     default:
//       res.setHeader('Allow', ['POST']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// // pages/api/tasks/index.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../lib/auth';
// import { prisma } from '../../../lib/prisma';
// import { getIO } from '../../../lib/socket-store'; // ADD THIS

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   switch (req.method) {
//     case 'POST':
//       try {
//         const { 
//           title, 
//           description, 
//           columnId, 
//           boardId,
//           priority, 
//           dueDate, 
//           status,
//           coverImage,
//           assigneeIds = [],
//           labelIds = [],
//         } = req.body;

//         // Check access
//         const hasAccess = await prisma.board.findFirst({
//           where: {
//             id: boardId,
//             OR: [
//               { ownerId: user.id },
//               { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
//             ],
//           },
//         });

//         if (!hasAccess) {
//           return res.status(403).json({ error: 'Access denied' });
//         }

//         // Get max order in column
//         const maxOrder = await prisma.task.aggregate({
//           where: { columnId },
//           _max: { order: true },
//         });

//         // Create task with MINIMAL includes for speed
//         const task = await prisma.task.create({
//           data: {
//             title,
//             description,
//             columnId,
//             boardId,
//             priority: priority || 'MEDIUM',
//             dueDate: dueDate ? new Date(dueDate) : null,
//             status: status || 'TODO',
//             coverImage,
//             order: (maxOrder._max.order ?? -1) + 1,
//             assignees: assigneeIds.length > 0 ? {
//               create: assigneeIds.map((userId: string) => ({
//                 userId,
//                 assignedBy: user.id,
//               })),
//             } : undefined,
//             labels: labelIds.length > 0 ? {
//               create: labelIds.map((labelId: string) => ({
//                 labelId,
//               })),
//             } : undefined,
//           },
//           // MINIMAL includes - only what the board view needs
//           include: {
//             assignees: {
//               include: {
//                 user: { select: { id: true, name: true, image: true } },
//               },
//             },
//             labels: { include: { label: true } },
//             attachments: true,
//             subtasks: true,
//             _count: {
//               select: { boardComments: true, attachments: true },
//             },
//           },
//         });

//         // EMIT TO BOARD ROOM IMMEDIATELY - THIS IS THE FIX FOR REAL-TIME
//         const io = getIO();
//         if (io) {
//           console.log('[API] Emitting task_created to board:', boardId);
//           // Emit to board room so ALL members receive it
//           io.to(`board:${boardId}`).emit('task_created', {
//             task,
//             boardId,
//             columnId,
//           });
//         }

//         // Log activity asynchronously (don't await - speeds up response)
//         prisma.activityLog.create({
//           data: {
//             action: 'CREATED',
//             entityType: 'TASK',
//             entityId: task.id,
//             description: `Created task "${title}"`,
//             boardId,
//             taskId: task.id,
//             userId: user.id,
//           },
//         }).catch(err => console.error('Activity log error:', err));

//         return res.status(201).json(task);
//       } catch (error) {
//         console.error('Task creation error:', error);
//         return res.status(500).json({ error: 'Failed to create task' });
//       }

//     default:
//       res.setHeader('Allow', ['POST']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

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

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   switch (req.method) {
//     case 'POST':
//       try {
//         const { title, description, columnId, boardId, priority, dueDate, status, coverImage, assigneeIds = [], labelIds = [] } = req.body;

//         const hasAccess = await prisma.board.findFirst({
//           where: {
//             id: boardId,
//             OR: [
//               { ownerId: user.id },
//               { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
//             ],
//           },
//         });

//         if (!hasAccess) {
//           return res.status(403).json({ error: 'Access denied' });
//         }

//         const maxOrder = await prisma.task.aggregate({
//           where: { columnId },
//           _max: { order: true },
//         });

//         const task = await prisma.task.create({
//           data: {
//             title,
//             description,
//             columnId,
//             boardId,
//             priority: priority || 'MEDIUM',
//             dueDate: dueDate ? new Date(dueDate) : null,
//             status: status || 'TODO',
//             coverImage,
//             order: (maxOrder._max.order ?? -1) + 1,
//             assignees: assigneeIds.length > 0 ? {
//               create: assigneeIds.map((userId: string) => ({ userId, assignedBy: user.id })),
//             } : undefined,
//             labels: labelIds.length > 0 ? {
//               create: labelIds.map((labelId: string) => ({ labelId })),
//             } : undefined,
//           },
//           include: {
//             assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
//             labels: { include: { label: true } },
//             attachments: true,
//             subtasks: true,
//             _count: { select: { boardComments: true, attachments: true } },
//           },
//         });

//         // EMIT TO BOARD ROOM
//         const io = getIO();
//         if (io) {
//           io.to(`board:${boardId}`).emit('task_created', {
//             task,
//             boardId,
//             columnId,
//           });
//         }

//         // Log async
//         prisma.activityLog.create({
//           data: {
//             action: 'CREATED',
//             entityType: 'TASK',
//             entityId: task.id,
//             description: `Created task "${title}"`,
//             boardId,
//             taskId: task.id,
//             userId: user.id,
//           },
//         }).catch(console.error);

//         return res.status(201).json(task);
//       } catch (error) {
//         console.error('Task creation error:', error);
//         return res.status(500).json({ error: 'Failed to create task' });
//       }

//     default:
//       res.setHeader('Allow', ['POST']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// // pages/api/tasks/index.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../lib/auth';
// import { prisma } from '../../../lib/prisma';
// import { getIO } from '../../../lib/socket-store';
// import { logActivity } from '@/lib/boardActivityLogger';


// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);

//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   switch (req.method) {
//     case 'POST':
//       try {
//         const {
//           title,
//           description,
//           columnId,
//           boardId,
//           priority,
//           dueDate,
//           status,
//           coverImage,
//           assigneeIds = [],
//           labelIds = [],
//         } = req.body;

        
//         // Check access
//         const hasAccess = await prisma.board.findFirst({
//           where: {
//             id: boardId,
//             OR: [
//               { ownerId: user.id },
//               { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
//             ],
//           },
//         });

//         if (!hasAccess) {
//           return res.status(403).json({ error: 'Access denied' });
//         }

//         // Get max order in column
//         const maxOrder = await prisma.task.aggregate({
//           where: { columnId },
//           _max: { order: true },
//         });

//         const task = await prisma.task.create({
//           data: {
//             title,
//             description,
//             columnId,
//             boardId,
//             priority: priority || 'MEDIUM',
//             dueDate: dueDate ? new Date(dueDate) : null,
//             status: status || 'TODO',
//             coverImage,
//             order: (maxOrder._max.order ?? -1) + 1,
//             assignees:
//               assigneeIds.length > 0
//                 ? {
//                     create: assigneeIds.map((userId: string) => ({
//                       userId,
//                       assignedBy: user.id,
//                     })),
//                   }
//                 : undefined,
//             labels:
//               labelIds.length > 0
//                 ? {
//                     create: labelIds.map((labelId: string) => ({ labelId })),
//                   }
//                 : undefined,
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
//             _count: {
//               select: { boardComments: true, attachments: true },
//             },
//           },
//         });

//         // ✅ EMIT TO BOARD ROOM — all members get this immediately
//         const io = getIO();
//         if (io) {
//           console.log('[API] Emitting task_created to board:', boardId);
//           io.to(`board:${boardId}`).emit('task_created', { task, boardId, columnId });
//         }

//         // Fire-and-forget activity log — don't slow down the response
//         prisma.activityLog
//           .create({
//             data: {
//               action: 'CREATED',
//               entityType: 'TASK',
//               entityId: task.id,
//               description: `Created task "${title}"`,
//               boardId,
//               taskId: task.id,
//               userId: user.id,
//             },
//           })
//           .catch((err) => console.error('Activity log error:', err));

//         return res.status(201).json(task);
//       } catch (error) {
//         console.error('Task creation error:', error);
//         return res.status(500).json({ error: 'Failed to create task' });
//       }

//     default:
//       res.setHeader('Allow', ['POST']);
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const {
          title,
          description,
          columnId,
          boardId,
          priority,
          dueDate,
          status,
          coverImage,
          assigneeIds = [],
          labelIds = [],
        } = req.body;

        const hasAccess = await prisma.board.findFirst({
          where: {
            id: boardId,
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
            ],
          },
        });

        if (!hasAccess) {
          return res.status(403).json({ error: 'Access denied' });
        }

        // Fetch column name for richer log description
        const column = await prisma.column.findUnique({
          where: { id: columnId },
          select: { title: true },
        });

        const maxOrder = await prisma.task.aggregate({
          where: { columnId },
          _max: { order: true },
        });

        const task = await prisma.task.create({
          data: {
            title,
            description,
            columnId,
            boardId,
            priority: priority || 'MEDIUM',
            dueDate: dueDate ? new Date(dueDate) : null,
            status: status || 'TODO',
            coverImage,
            order: (maxOrder._max.order ?? -1) + 1,
            assignees:
              assigneeIds.length > 0
                ? { create: assigneeIds.map((userId: string) => ({ userId, assignedBy: user.id })) }
                : undefined,
            labels:
              labelIds.length > 0
                ? { create: labelIds.map((labelId: string) => ({ labelId })) }
                : undefined,
          },
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

       broadcastClipEvent(SSE_EVENTS.TASK_CREATED, {
  type: 'task:created',
  boardId,
  columnId,
  task,
});
        // ✅ Rich log: includes who, what task, which column
        prisma.activityLog.create({
          data: {
            action: 'CREATED',
            entityType: 'TASK',
            entityId: task.id,
            description: `${user.name} created task "${title}" in ${column?.title ?? 'a column'}`,
            boardId,
            taskId: task.id,
            userId: user.id,
            metadata: {
              taskTitle: title,
              columnId,
              columnTitle: column?.title,
              priority: priority || 'MEDIUM',
            },
          },
        }).catch((err) => console.error('[ActivityLog]', err));

        // ✅ If task was created with assignees, log each assignment too
        if (assigneeIds.length > 0) {
          const assignedUsers = await prisma.user.findMany({
            where: { id: { in: assigneeIds } },
            select: { id: true, name: true },
          });

          prisma.activityLog.createMany({
            data: assignedUsers.map((assignedUser) => ({
              action: 'ASSIGNED',
              entityType: 'TASK',
              entityId: task.id,
              description: `${user.name} assigned ${assignedUser.name} to "${title}"`,
              boardId,
              taskId: task.id,
              userId: user.id,
              metadata: {
                assignedUserId: assignedUser.id,
                assignedUserName: assignedUser.name,
                taskTitle: title,
              },
            })),
          }).catch((err) => console.error('[ActivityLog]', err));
        }

        return res.status(201).json(task);
      } catch (error) {
        console.error('Task creation error:', error);
        return res.status(500).json({ error: 'Failed to create task' });
      }

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}