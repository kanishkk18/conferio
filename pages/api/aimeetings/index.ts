import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const meetings = await prisma.aiMeeting.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          meetingName: true,
          meetingUrl: true,
          platform: true,
          status: true,
          duration: true,
          createdAt: true,
          updatedAt: true,
          speakers: true,
          summary: true,
        },
      });

      return res.status(200).json(meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      return res.status(500).json({ error: 'Failed to fetch meetings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

