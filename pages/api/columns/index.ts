// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

//   const user = await prisma.user.findUnique({ where: { email: session.user.email } });
//   if (!user) return res.status(404).json({ error: 'User not found' });

//   if (req.method === 'POST') {
//     const { title, boardId, color } = req.body;
    
//     const hasAccess = await prisma.board.findFirst({
//       where: { id: boardId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } }] },
//     });
//     if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

//     const maxOrder = await prisma.column.aggregate({ where: { boardId }, _max: { order: true } });
//     const column = await prisma.column.create({
//       data: { title, boardId, color, order: (maxOrder._max.order ?? -1) + 1 },
//       include: { tasks: true },
//     });

//     await prisma.activityLog.create({
//       data: { action: 'CREATED', entityType: 'COLUMN', entityId: column.id, description: `Created column "${title}"`, boardId, userId: user.id },
//     });

//     return res.status(201).json(column);
//   }

//   res.setHeader('Allow', ['POST']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// pages/api/columns/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

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
        const { title, boardId, color } = req.body;
        
        // Check access
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

        // Get max order
        const maxOrder = await prisma.column.aggregate({
          where: { boardId },
          _max: { order: true },
        });

        const column = await prisma.column.create({
          data: {
            title,
            boardId,
            color,
            order: (maxOrder._max.order ?? -1) + 1,
          },
          include: {
            tasks: true,
          },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            action: 'CREATED',
            entityType: 'COLUMN',
            entityId: column.id,
            description: `Created column "${title}"`,
            boardId,
            userId: user.id,
          },
        });

        return res.status(201).json(column);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create column' });
      }

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}