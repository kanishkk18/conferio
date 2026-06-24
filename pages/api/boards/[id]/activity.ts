import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { limit = '50', cursor } = req.query;

      const activities = await prisma.activityLog.findMany({
        where: { boardId: id as string },
        include: {
          user: { select: { id: true, name: true, image: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        ...(cursor ? { skip: 1, cursor: { id: cursor as string } } : {}),
      });

      const nextCursor =
        activities.length === parseInt(limit as string)
          ? activities[activities.length - 1].id
          : null;

      return res.status(200).json({ activities, nextCursor });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end();
}