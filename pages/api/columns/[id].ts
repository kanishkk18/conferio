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

//   const column = await prisma.column.findUnique({ where: { id }, include: { board: true } });
//   if (!column) return res.status(404).json({ error: 'Column not found' });

//   const hasAccess = await prisma.board.findFirst({
//     where: { id: column.boardId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } }] },
//   });
//   if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

//   if (req.method === 'PUT') {
//     const { title, color, order } = req.body;
//     const updated = await prisma.column.update({
//       where: { id },
//       data: { title, color, order },
//       include: { tasks: { orderBy: { order: 'asc' }, include: { assignees: { include: { user: { select: { id: true, name: true, image: true } } } }, labels: { include: { label: true } }, _count: { select: { comments: true, attachments: true } } } } },
//     });
//     await prisma.activityLog.create({
//       data: { action: 'UPDATED', entityType: 'COLUMN', entityId: id, description: `Updated column "${title}"`, boardId: column.boardId, userId: user.id },
//     });
//     return res.status(200).json(updated);
//   }

//   if (req.method === 'DELETE') {
//     await prisma.column.delete({ where: { id } });
//     await prisma.activityLog.create({
//       data: { action: 'DELETED', entityType: 'COLUMN', entityId: id, description: `Deleted column "${column.title}"`, boardId: column.boardId, userId: user.id },
//     });
//     return res.status(204).end();
//   }

//   res.setHeader('Allow', ['PUT', 'DELETE']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }


// pages/api/columns/[id].ts
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
    return res.status(400).json({ error: 'Invalid column ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get column with board info for access check
  const column = await prisma.column.findUnique({
    where: { id },
    include: { board: true },
  });

  if (!column) {
    return res.status(404).json({ error: 'Column not found' });
  }

  const hasAccess = await prisma.board.findFirst({
    where: {
      id: column.boardId,
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
        const { title, color, order } = req.body;
        
        const updatedColumn = await prisma.column.update({
          where: { id },
          data: { title, color, order },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: {
                assignees: {
                  include: {
                    user: {
                      select: { id: true, name: true, image: true },
                    },
                  },
                },
                labels: {
                  include: { label: true },
                },
                _count: {
                  select: { boardComments: true, attachments: true },
                },
              },
            },
          },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            action: 'UPDATED',
            entityType: 'COLUMN',
            entityId: id,
            description: `Updated column "${title}"`,
            boardId: column.boardId,
            userId: user.id,
          },
        });

        return res.status(200).json(updatedColumn);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update column' });
      }

    case 'DELETE':
      try {
        await prisma.column.delete({
          where: { id },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            action: 'DELETED',
            entityType: 'COLUMN',
            entityId: id,
            description: `Deleted column "${column.title}"`,
            boardId: column.boardId,
            userId: user.id,
          },
        });

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete column' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}