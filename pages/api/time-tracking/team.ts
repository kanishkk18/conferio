// // pages/api/time-tracking/team.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';
// import { startOfWeek, endOfWeek } from 'date-fns';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     const { startDate, endDate } = req.query;

//     // Check permissions
//     const currentUserMember = await prisma.teamMember.findFirst({
//       where: { userId: session.user.id },
//     });

//     if (!currentUserMember || !['ADMIN', 'OWNER'].includes(currentUserMember.role)) {
//       return res.status(403).json({ error: 'Forbidden' });
//     }

//     const start = startDate ? new Date(startDate as string) : startOfWeek(new Date(), { weekStartsOn: 0 });
//     const end = endDate ? new Date(endDate as string) : endOfWeek(new Date(), { weekStartsOn: 0 });

//     // Get all team members with their time entries
//     const members = await prisma.teamMember.findMany({
//       where: { teamId: currentUserMember.teamId },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           },
//         },
//         timeEntries: {
//           where: {
//             startTime: {
//               gte: start,
//               lte: end,
//             },
//           },
//         },
//       },
//     });

//     const formattedMembers = members.map(member => {
//       const totalMinutes = member.timeEntries.reduce((sum, e) => sum + e.duration, 0);
//       const billableMinutes = member.timeEntries
//         .filter(e => e.isBillable && e.billableStatus === 'APPROVED')
//         .reduce((sum, e) => sum + e.duration, 0);
//       const pendingApprovals = member.timeEntries
//         .filter(e => e.entryType === 'MANUAL' && e.billableStatus === 'PENDING')
//         .length;

//       return {
//         id: member.id,
//         userId: member.userId,
//         role: member.role,
//         user: member.user,
//         totalHours: totalMinutes,
//         billableHours: billableMinutes,
//         pendingApprovals,
//       };
//     });

//     return res.status(200).json({ members: formattedMembers });
//   } catch (error) {
//     console.error('Fetch team timesheet error:', error);
//     return res.status(500).json({ error: 'Failed to fetch team data' });
//   }
// }
// pages/api/time-tracking/team.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { startDate, endDate } = req.query;

    // Check permissions
    const currentUserMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!currentUserMember || !['ADMIN', 'OWNER'].includes(currentUserMember.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const start = startDate ? new Date(startDate as string) : startOfWeek(new Date(), { weekStartsOn: 0 });
    const end = endDate ? new Date(endDate as string) : endOfWeek(new Date(), { weekStartsOn: 0 });

    // Get all team members
    const members = await prisma.teamMember.findMany({
      where: { teamId: currentUserMember.teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Get time entries for all members separately
    const memberIds = members.map(m => m.userId);
    
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: { in: memberIds },
        teamId: currentUserMember.teamId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
    });

    // Group entries by user
    const entriesByUser = timeEntries.reduce((acc, entry) => {
      if (!acc[entry.userId]) acc[entry.userId] = [];
      acc[entry.userId].push(entry);
      return acc;
    }, {} as Record<string, typeof timeEntries>);

    const formattedMembers = members.map(member => {
      const userEntries = entriesByUser[member.userId] || [];
      const totalMinutes = userEntries.reduce((sum, e) => sum + e.duration, 0);
      const billableMinutes = userEntries
        .filter(e => e.isBillable && e.billableStatus === 'APPROVED')
        .reduce((sum, e) => sum + e.duration, 0);
      const pendingApprovals = userEntries
        .filter(e => e.entryType === 'MANUAL' && e.billableStatus === 'PENDING')
        .length;

      return {
        id: member.id,
        userId: member.userId,
        role: member.role,
        user: member.user,
        totalHours: totalMinutes,
        billableHours: billableMinutes,
        pendingApprovals,
      };
    });

    return res.status(200).json({ members: formattedMembers });
  } catch (error) {
    console.error('Fetch team timesheet error:', error);
    return res.status(500).json({ error: 'Failed to fetch team data' });
  }
}