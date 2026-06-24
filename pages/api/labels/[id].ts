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

//   const label = await prisma.label.findUnique({ where: { id }, include: { board: true } });
//   if (!label) return res.status(404).json({ error: 'Label not found' });

//   const hasAccess = await prisma.board.findFirst({
//     where: { id: label.boardId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } }] },
//   });
//   if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

//   if (req.method === 'PUT') {
//     const { name, color } = req.body;
//     const updated = await prisma.label.update({ where: { id }, data: { name, color } });
//     return res.status(200).json(updated);
//   }

//   if (req.method === 'DELETE') {
//     await prisma.label.delete({ where: { id } });
//     return res.status(204).end();
//   }

//   res.setHeader('Allow', ['PUT', 'DELETE']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }


// pages/api/labels/[id].ts
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
    return res.status(400).json({ error: 'Invalid label ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const label = await prisma.label.findUnique({
    where: { id },
    include: { board: true },
  });

  if (!label) {
    return res.status(404).json({ error: 'Label not found' });
  }

  const hasAccess = await prisma.board.findFirst({
    where: {
      id: label.boardId,
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
        const { name, color } = req.body;
        
        const updated = await prisma.label.update({
          where: { id },
          data: { name, color },
        });

        return res.status(200).json(updated);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update label' });
      }

    case 'DELETE':
      try {
        await prisma.label.delete({
          where: { id },
        });

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete label' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}