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

    const endedAt = new Date();
    const duration = Math.floor((endedAt.getTime() - routeSession.startedAt.getTime()) / 1000);

    // Update the session
    await prisma.routeViewSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        duration
      }
    });

    // Update or create aggregate
    await prisma.routeViewAggregate.upsert({
      where: {
        route_userId: {
          route: routeSession.route,
          userId: session.user.id
        }
      },
      create: {
        route: routeSession.route,
        routeLabel: routeSession.routeLabel,
        userId: session.user.id,
        teamId: routeSession.teamId,
        totalDuration: duration,
        viewCount: 1,
        lastViewedAt: endedAt
      },
      update: {
        totalDuration: { increment: duration },
        viewCount: { increment: 1 },
        lastViewedAt: endedAt
      }
    });

    return res.status(200).json({ duration });
  } catch (error) {
    console.error('Error ending screen time:', error);
    return res.status(500).json({ error: 'Failed to end tracking' });
  }
}