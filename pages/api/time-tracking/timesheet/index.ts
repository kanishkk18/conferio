// pages/api/time-tracking/timesheet/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, format, subDays } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { userId, startDate, endDate, view = 'week' } = req.query;

    // Check permissions
    const currentUserMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: true },
    });

    if (!currentUserMember) {
      return res.status(400).json({ error: 'User not in any team' });
    }

    const targetUserId = userId as string || session.user.id;
    
    // Only admins/owners can view other users' timesheets
    if (targetUserId !== session.user.id && !['ADMIN', 'OWNER'].includes(currentUserMember.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Calculate date range
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      const now = new Date();
      start = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
      end = endOfWeek(now, { weekStartsOn: 0 });
    }

    // Fetch entries
    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: targetUserId,
        teamId: currentUserMember.teamId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Group by date
    const groupedByDate = entries.reduce((acc, entry) => {
      const dateKey = format(new Date(entry.startTime), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(entry);
      return acc;
    }, {} as Record<string, typeof entries>);

    // Generate all dates in range
    const allDates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      allDates.push(format(new Date(d), 'yyyy-MM-dd'));
    }

    // Build timesheet data
    const timesheetData = allDates.map(date => {
      const dayEntries = groupedByDate[date] || [];
      const totalMinutes = dayEntries.reduce((sum, e) => sum + e.duration, 0);
      const billableMinutes = dayEntries
        .filter(e => e.isBillable && e.billableStatus === 'APPROVED')
        .reduce((sum, e) => sum + e.duration, 0);
      const nonBillableMinutes = dayEntries
        .filter(e => !e.isBillable)
        .reduce((sum, e) => sum + e.duration, 0);

      return {
        date,
        totalMinutes,
        billableMinutes,
        nonBillableMinutes,
        entries: dayEntries,
      };
    });

    const weekTotal = {
      total: timesheetData.reduce((sum, d) => sum + d.totalMinutes, 0),
      billable: timesheetData.reduce((sum, d) => sum + d.billableMinutes, 0),
      nonBillable: timesheetData.reduce((sum, d) => sum + d.nonBillableMinutes, 0),
    };

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return res.status(200).json({
      user: targetUser,
      entries: timesheetData,
      weekTotal,
      dateRange: { start, end },
    });
  } catch (error) {
    console.error('Fetch timesheet error:', error);
    return res.status(500).json({ error: 'Failed to fetch timesheet' });
  }
}