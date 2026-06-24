import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { teamId, userId, period = '7d' } = req.query;

  if (!teamId || !userId) return res.status(400).json({ error: 'teamId and userId required' });

  try {
    // Find team by slug first, then by ID
    let team = await prisma.team.findUnique({
      where: { slug: teamId as string }
    });

    if (!team) {
      team = await prisma.team.findUnique({
        where: { id: teamId as string }
      });
    }

    if (!team) return res.status(404).json({ error: 'Team not found' });

    const membership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId: team.id,
        role: { in: ['ADMIN', 'OWNER'] }
      }
    });

    if (!membership) return res.status(403).json({ error: 'Admin/Owner access required' });

    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '24h': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
    }

    const userRoutes = await prisma.routeViewAggregate.findMany({
      where: {
        userId: userId as string,
        teamId: team.id,
        lastViewedAt: { gte: startDate }
      },
      orderBy: {
        totalDuration: 'desc'
      }
    });

    const sessions = await prisma.routeViewSession.findMany({
      where: {
        userId: userId as string,
        teamId: team.id,
        startedAt: { gte: startDate },
        duration: { not: null }
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 50
    });

    return res.status(200).json({
      userRoutes,
      recentSessions: sessions
    });
  } catch (error) {
    console.error('Error fetching user detail:', error);
    return res.status(500).json({ error: 'Failed to fetch user detail', details: (error as Error).message });
  }
}