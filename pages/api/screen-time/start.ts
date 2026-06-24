import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeRoute, getRouteLabel } from '@/lib/route-labels';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  const { route } = req.body;
  if (!route) return res.status(400).json({ error: 'route required' });

  try {
    // Get user's team membership
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: true }
    });

    if (!teamMember) return res.status(400).json({ error: 'Not in a team' });

    const normalizedRoute = normalizeRoute(route);
    const routeLabel = getRouteLabel(normalizedRoute);

    // Close any existing open sessions for this user
    await prisma.routeViewSession.updateMany({
      where: {
        userId: session.user.id,
        endedAt: null
      },
      data: {
        endedAt: new Date(),
      }
    });

    // Create new session
    const session_record = await prisma.routeViewSession.create({
      data: {
        route: normalizedRoute,
        routeLabel,
        userId: session.user.id,
        teamId: teamMember.teamId,
        startedAt: new Date()
      }
    });

    return res.status(200).json({ sessionId: session_record.id });
  } catch (error) {
    console.error('Error starting screen time:', error);
    return res.status(500).json({ error: 'Failed to start tracking' });
  }
}