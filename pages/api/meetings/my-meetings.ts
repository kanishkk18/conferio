// // pages/api/meetings/my-meetings.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getSession } from 'next-auth/react'
// import { prisma } from '@/lib/prisma'
// import { HTTPSTATUS } from '@/lib/http-status'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' })
//   }

//   try {
//     const session = await getSession({ req })
    
//     if (!session?.user?.id) {
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' })
//     }

//     const userId = session.user.id
//     const filter = (req.query.filter as string) || 'upcoming'

//     // Build where clause
//     let where: any = {}

//     switch (filter.toLowerCase()) {
//       case 'upcoming':
//         where.OR = [
//           // Meetings where user is host
//           {
//             userId,
//             status: 'SCHEDULED',
//             startTime: { gt: new Date() },
//           },
//           // Meetings where user is an attendee
//           {
//             meetingAttendees: {
//               some: {
//                 OR: [
//                   { userId },
//                   { email: session.user.email },
//                 ],
//                 status: { not: 'declined' },
//               },
//             },
//             status: 'SCHEDULED',
//             startTime: { gt: new Date() },
//           },
//         ]
//         break
//       case 'past':
//         where.OR = [
//           {
//             userId,
//             status: 'SCHEDULED',
//             startTime: { lt: new Date() },
//           },
//           {
//             meetingAttendees: {
//               some: {
//                 OR: [{ userId }, { email: session.user.email }],
//               },
//             },
//             status: 'SCHEDULED',
//             startTime: { lt: new Date() },
//           },
//         ]
//         break
//       case 'cancelled':
//         where.status = 'CANCELLED'
//         where.OR = [
//           { userId },
//           {
//             meetingAttendees: {
//               some: {
//                 OR: [{ userId }, { email: session.user.email }],
//               },
//             },
//           },
//         ]
//         break
//       default:
//         where.OR = [
//           { userId },
//           {
//             meetingAttendees: {
//               some: {
//                 OR: [{ userId }, { email: session.user.email }],
//               },
//             },
//           },
//         ]
//     }

//     const meetings = await prisma.meeting.findMany({
//       where,
//       include: {
//         event: true,
//         meetingAttendees: {
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 image: true,
//               }
//             }
//           }
//         },
//         teamMeetingLink: {
//           include: {
//             team: {
//               select: {
//                 i+d: true,
//                 name: true,
//               }
//             }
//           }
//         },
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           }
//         },
//       },
//       orderBy: { startTime: 'asc' },
//     })

//     // Add metadata for frontend
//     const enrichedMeetings = meetings.map(meeting => {
//       const isHost = meeting.userId === userId
//       const myAttendeeRecord = meeting.meetingAttendees.find(
//         a => a.userId === userId || a.email === session.user.email
//       )QZXGHJ\/*-
      
//       return {
//         ...meeting,
//         isHost,
//         myRsvpStatus: myAttendeeRecord?.status || null,
//         attendeeCount: meeting.meetingAttendees.length,
//         isTeamMeeting: meeting.meetingAttendees.length > 1 || !!meeting.teamMeetingLink,
//       }
//     })

//     return res.status(HTTPSTATUS.OK).json({
//       message: 'Meetings fetched successfully',
//       meetings: enrichedMeetings,
//     })

//   } catch (error) {
//     console.error('Error fetching meetings:', error)
//     return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//       message: 'Internal server error',
//     })
//   }
// }

// import { NextApiRequest, NextApiResponse } from 'next'
// import { prisma } from '@/lib/prisma'
// import { getSession } from 'next-auth/react'
// import { HTTPSTATUS } from '@/lib/http-status'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(HTTPSTATUS.METHOD_NOT_ALLOWED).json({ message: 'Method not allowed' })
//   }

//   try {
//     const session = await getSession({ req })
    
//     if (!session?.user?.id) {
//       return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: 'Unauthorized' })
//     }

//     const userId = session.user.id
//     const userEmail = session.user.email
//     const filter = (req.query.filter as string) || 'upcoming'
// pages/api/meetings/my-meetings.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path to your authOptions
import { prisma } from '@/lib/prisma';
import { HTTPSTATUS } from '@/lib/http-status';

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
    const userEmail = session.user.email;
    const filter = (req.query.filter as string) || 'upcoming';

    // Build where clause to get meetings where user is host OR attendee
    const where: any = {}

    switch (filter.toLowerCase()) {
      case 'upcoming':
        where.AND = [
          {
            OR: [
              // User is the host
              { userId },
              // User is an attendee (by userId or email)
              {
                meetingAttendees: {
                  some: {
                    OR: [
                      { userId },
                      { email: userEmail },
                    ],
                  },
                },
              },
            ],
          },
          { status: 'SCHEDULED' },
          { startTime: { gt: new Date() } },
        ]
        break
      case 'past':
        where.AND = [
          {
            OR: [
              { userId },
              {
                meetingAttendees: {
                  some: {
                    OR: [{ userId }, { email: userEmail }],
                  },
                },
              },
            ],
          },
          { status: 'SCHEDULED' },
          { startTime: { lt: new Date() } },
        ]
        break
      case 'cancelled':
        where.AND = [
          {
            OR: [
              { userId },
              {
                meetingAttendees: {
                  some: {
                    OR: [{ userId }, { email: userEmail }],
                  },
                },
              },
            ],
          },
          { status: 'CANCELLED' },
        ]
        break
      default:
        where.AND = [
          {
            OR: [
              { userId },
              {
                meetingAttendees: {
                  some: {
                    OR: [{ userId }, { email: userEmail }],
                  },
                },
              },
            ],
          },
          { status: 'SCHEDULED' },
          { startTime: { gt: new Date() } },
        ]
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        event: true,
        meetingAttendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        },
        teamMeetingLink: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
      },
      orderBy: { startTime: 'asc' },
    })

    // Add metadata for frontend
    const enrichedMeetings = meetings.map(meeting => {
      const isHost = meeting.userId === userId
      const myAttendeeRecord = meeting.meetingAttendees.find(
        a => a.userId === userId || a.email === userEmail
      )
      
      return {
        ...meeting,
        isHost,
        myRsvpStatus: myAttendeeRecord?.status || null,
        attendeeCount: meeting.meetingAttendees.length,
        isTeamMeeting: meeting.meetingAttendees.length > 1 || !!meeting.teamMeetingLink,
      }
    })

    return res.status(HTTPSTATUS.OK).json({
      message: 'Meetings fetched successfully',
      meetings: enrichedMeetings,
    })

  } catch (error) {
    console.error('Error fetching meetings:', error)
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    })
  }
}