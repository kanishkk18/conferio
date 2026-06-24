import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  const { sessionId } = req.body;

  try {
    const routeSession = await prisma.routeViewSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
        endedAt: null
      }
    });

    if (!routeSession) return res.status(404).json({ error: 'Session not found' });

    return res.status(200).json({ active: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to heartbeat' });
  }
}