// // pages/api/meetings/stats.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '@/lib/prisma';
// import { getSession } from 'next-auth/react';
// import { HTTPSTATUS } from '@/lib/http-status';
// import { startOfMonth, endOfMonth } from 'date-fns';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' });
//   }

//   try {
//     const session = await getSession({ req });
//     if (!session?.user?.id) {
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' });
//     }

//     const userId = session.user.id;
//     const now = new Date();
//     const monthStart = startOfMonth(now);
//     const monthEnd = endOfMonth(now);

//     // Get all meetings where user is attendee or host this month
//     const meetings = await prisma.meeting.findMany({
//       where: {
//         AND: [
//           {
//             OR: [
//               { userId }, // User is host
//               {
//                 meetingAttendees: {
//                   some: { userId }, // User is attendee
//                 },
//               },
//             ],
//           },
//           {
//             startTime: {
//               gte: monthStart,
//               lte: monthEnd,
//             },
//           },
//         ],
//       },
//       include: {
//         meetingAttendees: {
//           where: { userId },
//           select: { status: true },
//         },
//       },
//     });

//     const totalMeetings = meetings.length;
    
//     // Count joined meetings (status = 'accepted' or user clicked join)
//     const joinedMeetings = meetings.filter(m => {
//       const attendeeRecord = m.meetingAttendees[0];
//       return attendeeRecord?.status === 'accepted' || attendeeRecord?.status === 'joined';
//     }).length;

//     return res.status(HTTPSTATUS.OK).json({
//       totalMeetings,
//       joinedMeetings,
//       percentage: totalMeetings > 0 ? Math.round((joinedMeetings / totalMeetings) * 100) : 0,
//     });

//   } catch (error) {
//     console.error('Error fetching meeting stats:', error);
//     return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
//   }
// }



// pages/api/meetings/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path to your authOptions
import { prisma } from '@/lib/prisma';
import { HTTPSTATUS } from '@/lib/http-status';
import { startOfMonth, endOfMonth } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' });
    }

    const userId = session.user.id;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Get all meetings where user is attendee or host this month
    const meetings = await prisma.meeting.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId },
              {
                meetingAttendees: {
                  some: { userId },
                },
              },
            ],
          },
          {
            startTime: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        ],
      },
      include: {
        meetingAttendees: {
          where: { userId },
          select: { status: true },
        },
      },
    });

    const totalMeetings = meetings.length;
    
    // Count joined meetings (status = 'joined')
    const joinedMeetings = meetings.filter(m => {
      const attendeeRecord = m.meetingAttendees[0];
      return attendeeRecord?.status === 'joined';
    }).length;

    return res.status(HTTPSTATUS.OK).json({
      totalMeetings,
      joinedMeetings,
      percentage: totalMeetings > 0 ? Math.round((joinedMeetings / totalMeetings) * 100) : 0,
    });

  } catch (error) {
    console.error('Error fetching meeting stats:', error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
}