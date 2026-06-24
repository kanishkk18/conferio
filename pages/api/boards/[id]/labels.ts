// pages/api/boards/[id]/labels.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: boardId } = req.query;
  
  if (typeof boardId !== 'string') {
    return res.status(400).json({ error: 'Invalid board ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const hasAccess = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
  });

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { name, color } = req.body;
        
        const label = await prisma.label.create({
          data: {
            name,
            color,
            boardId,
          },
        });

        return res.status(201).json(label);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create label' });
      }

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}