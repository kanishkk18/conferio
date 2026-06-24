// // pages/api/tasks/[id]/cover.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../../lib/auth';
// import { prisma } from '../../../../lib/prisma';

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
//       OR: [
//         { ownerId: user.id },
//         { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
//       ],
//     },
//   });

//   if (!hasAccess) {
//     return res.status(403).json({ error: 'Access denied' });
//   }

//   if (req.method === 'PUT') {
//     try {
//       const { coverImage } = req.body;
      
//       const updatedTask = await prisma.task.update({
//         where: { id },
//         data: { coverImage },
//       });

//       await prisma.activityLog.create({
//         data: {
//           action: 'UPDATED',
//           entityType: 'TASK',
//           entityId: id,
//           description: `Updated cover image`,
//           boardId: task.boardId,
//           taskId: id,
//           userId: user.id,
//         },
//       });

//       return res.status(200).json(updatedTask);
//     } catch (error) {
//       return res.status(500).json({ error: 'Failed to update cover image' });
//     }
//   }

//   res.setHeader('Allow', ['PUT']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
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
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
      ],
    },
  });

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (req.method === 'PUT') {
    try {
      const { coverImage } = req.body;
      
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { coverImage },
        include: {
          assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
          labels: { include: { label: true } },
          attachments: true,
          subtasks: true,
          _count: { select: { boardComments: true, attachments: true } },
        },
      });

      broadcastClipEvent(SSE_EVENTS.TASK_UPDATED, {
        type: 'task:updated',
        boardId: task.boardId,
        task: updatedTask,
      });

      await prisma.activityLog.create({
        data: {
          action: 'UPDATED',
          entityType: 'TASK',
          entityId: id,
          description: `Updated cover image`,
          boardId: task.boardId,
          taskId: id,
          userId: user.id,
        },
      });

      return res.status(200).json(updatedTask);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update cover image' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}