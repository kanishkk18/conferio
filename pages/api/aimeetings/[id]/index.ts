import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid meeting ID' });
  }

  if (req.method === 'GET') {
    try {
      const meeting = await prisma.aiMeeting.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
        include: {
          chatMessages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
      });
      return res.status(200).json({
        ...meeting,
        chatMessages: meeting?.chatMessages || [], // Ensure array
        transcript: meeting?.transcript || [], // Ensure array
      });
      
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      return res.status(200).json(meeting);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      return res.status(500).json({ error: 'Failed to fetch meeting' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.aiMeeting.deleteMany({
        where: {
          id,
          userId: session.user.id,
        },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return res.status(500).json({ error: 'Failed to delete meeting' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

