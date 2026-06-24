// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

//   const { id } = req.query;
//   if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

//   const user = await prisma.user.findUnique({ where: { email: session.user.email } });
//   if (!user) return res.status(404).json({ error: 'User not found' });

//   const subtask = await prisma.subtask.findUnique({ where: { id }, include: { task: { include: { column: { include: { board: true } } } } } });
//   if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

//   const hasAccess = await prisma.board.findFirst({
//     where: { id: subtask.task.boardId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } }] },
//   });
//   if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

//   if (req.method === 'PUT') {
//     const { title, isCompleted, order } = req.body;
//     const updated = await prisma.subtask.update({ where: { id }, data: { title, isCompleted, order } });
//     if (isCompleted !== undefined) {
//       await prisma.activityLog.create({
//         data: { action: isCompleted ? 'COMPLETED' : 'UNCOMPLETED', entityType: 'SUBTASK', entityId: id, description: `${isCompleted ? 'Completed' : 'Uncompleted'} subtask "${title || subtask.title}"`, boardId: subtask.task.boardId, taskId: subtask.taskId, userId: user.id },
//       });
//     }
//     return res.status(200).json(updated);
//   }

//   if (req.method === 'DELETE') {
//     await prisma.subtask.delete({ where: { id } });
//     await prisma.activityLog.create({
//       data: { action: 'DELETED', entityType: 'SUBTASK', entityId: id, description: `Deleted subtask "${subtask.title}"`, boardId: subtask.task.boardId, taskId: subtask.taskId, userId: user.id },
//     });
//     return res.status(204).end();
//   }

//   res.setHeader('Allow', ['PUT', 'DELETE']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// pages/api/subtasks/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid subtask ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const subtask = await prisma.subtask.findUnique({
    where: { id },
    include: { task: { include: { column: { include: { board: true } } } } },
  });

  if (!subtask) {
    return res.status(404).json({ error: 'Subtask not found' });
  }

  const hasAccess = await prisma.board.findFirst({
    where: {
      id: subtask.task.boardId,
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
    case 'PUT':
      try {
        const { title, isCompleted, order } = req.body;
        
        const updated = await prisma.subtask.update({
          where: { id },
          data: { title, isCompleted, order },
        });

        if (isCompleted !== undefined) {
          await prisma.activityLog.create({
            data: {
              action: isCompleted ? 'COMPLETED' : 'UNCOMPLETED',
              entityType: 'SUBTASK',
              entityId: id,
              description: `${isCompleted ? 'Completed' : 'Uncompleted'} subtask "${title || subtask.title}"`,
              boardId: subtask.task.boardId,
              taskId: subtask.taskId,
              userId: user.id,
            },
          });
        }

        return res.status(200).json(updated);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update subtask' });
      }

    case 'DELETE':
      try {
        await prisma.subtask.delete({
          where: { id },
        });

        await prisma.activityLog.create({
          data: {
            action: 'DELETED',
            entityType: 'SUBTASK',
            entityId: id,
            description: `Deleted subtask "${subtask.title}"`,
            boardId: subtask.task.boardId,
            taskId: subtask.taskId,
            userId: user.id,
          },
        });

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete subtask' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}