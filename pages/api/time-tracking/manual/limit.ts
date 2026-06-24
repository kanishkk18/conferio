// pages/api/time-tracking/manual/limit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { year, month } = req.query;
    
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;

    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!teamMember) {
      return res.status(400).json({ error: 'User not in any team' });
    }

    const manualRequest = await prisma.manualTimeRequest.findUnique({
      where: {
        userId_teamId_year_month: {
          userId: session.user.id,
          teamId: teamMember.teamId,
          year: currentYear,
          month: currentMonth,
        },
      },
    });

    const used = manualRequest?.requestCount || 0;
    const limit = 3;
    const remaining = Math.max(0, limit - used);
    const requiresApproval = used >= limit;

    return res.status(200).json({
      used,
      limit,
      remaining,
      requiresApproval,
    });
  } catch (error) {
    console.error('Check manual limit error:', error);
    return res.status(500).json({ error: 'Failed to check limit' });
  }
}