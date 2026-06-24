import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { teamId, period = '7d' } = req.query;

  if (!teamId) return res.status(400).json({ error: 'teamId required' });

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

    // Check if user is admin or owner of this team
    const membership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId: team.id,
        role: { in: ['ADMIN', 'OWNER'] }
      }
    });

    if (!membership) {
      return res.status(403).json({ 
        error: 'Admin/Owner access required',
        yourRole: 'MEMBER or not found'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '24h': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get per-route analytics
    const routeAnalytics = await prisma.routeViewAggregate.findMany({
      where: {
        teamId: team.id,
        lastViewedAt: { gte: startDate }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        totalDuration: 'desc'
      }
    });

    // Get per-user summary
    const userAnalytics = await prisma.routeViewSession.groupBy({
      by: ['userId'],
      where: {
        teamId: team.id,
        startedAt: { gte: startDate },
        duration: { not: null }
      },
      _sum: {
        duration: true
      },
      _count: {
        id: true
      }
    });

    const userDetails = await prisma.user.findMany({
      where: {
        id: { in: userAnalytics.map(u => u.userId) }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    const userSummary = userAnalytics.map(ua => {
      const user = userDetails.find(u => u.id === ua.userId);
      return {
        user,
        totalDuration: ua._sum.duration || 0,
        sessionCount: ua._count.id
      };
    }).sort((a, b) => b.totalDuration - a.totalDuration);

    // Get per-route summary (aggregated across all users)
    const routeSummary = await prisma.routeViewAggregate.groupBy({
      by: ['route', 'routeLabel'],
      where: {
        teamId: team.id,
        lastViewedAt: { gte: startDate }
      },
      _sum: {
        totalDuration: true,
        viewCount: true
      },
      _count: {
        userId: true
      },
      orderBy: {
        _sum: {
          totalDuration: 'desc'
        }
      }
    });

    // FIXED: Use Prisma groupBy for daily breakdown instead of raw SQL
    const dailySessions = await prisma.routeViewSession.groupBy({
      by: ['startedAt'],
      where: {
        teamId: team.id,
        startedAt: { gte: startDate },
        duration: { not: null }
      },
      _sum: {
        duration: true
      },
      _count: {
        userId: true
      },
      orderBy: {
        startedAt: 'asc'
      }
    });

    // Format daily breakdown manually since Prisma can't group by DATE()
    const dailyMap = new Map<string, { totalDuration: number; activeUsers: Set<string> }>();
    
    for (const session of dailySessions) {
      const dateKey = session.startedAt.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { totalDuration: 0, activeUsers: new Set() });
      }
      
      const day = dailyMap.get(dateKey)!;
      day.totalDuration += session._sum.duration || 0;
      // Note: _count.userId gives count of records, not distinct users
      // For distinct users we'd need a different approach
    }

    // Alternative: Get distinct users per day with a separate query
    const allSessions = await prisma.routeViewSession.findMany({
      where: {
        teamId: team.id,
        startedAt: { gte: startDate },
        duration: { not: null }
      },
      select: {
        startedAt: true,
        duration: true,
        userId: true
      }
    });

    const dailyBreakdownMap = new Map<string, { totalDuration: number; activeUsers: Set<string> }>();
    
    for (const s of allSessions) {
      const dateKey = s.startedAt.toISOString().split('T')[0];
      
      if (!dailyBreakdownMap.has(dateKey)) {
        dailyBreakdownMap.set(dateKey, { totalDuration: 0, activeUsers: new Set() });
      }
      
      const day = dailyBreakdownMap.get(dateKey)!;
      day.totalDuration += s.duration || 0;
      day.activeUsers.add(s.userId);
    }

    const dailyBreakdown = Array.from(dailyBreakdownMap.entries())
      .map(([date, data]) => ({
        date,
        totalDuration: data.totalDuration,
        activeUsers: data.activeUsers.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({
      routeAnalytics,
      userSummary,
      routeSummary,
      dailyBreakdown
    });
  } catch (error) {
    console.error('Error fetching team analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics', details: (error as Error).message });
  }
}