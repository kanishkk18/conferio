// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { id } = req.query;
//   if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid meeting ID' });

//   if (req.method === 'GET') {
//     const aiMeeting = await prisma.aiMeeting.findUnique({
//       where: { sourceMeetingId: id },
//     });
//     return res.status(200).json({ 
//       enabled: !!aiMeeting && ['scheduled', 'pending'].includes(aiMeeting.status) 
//     });
//   }

//   if (req.method === 'POST') {
//     try {
//       const { enabled } = req.body as { enabled: boolean };

//       const meeting = await prisma.meeting.findFirst({
//         where: { id, userId: session.user.id },
//       });
//       if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
//       if (!meeting.meetLink) return res.status(400).json({ error: 'No meet link' });

//       if (enabled) {
//         await prisma.aiMeeting.upsert({
//           where: { sourceMeetingId: id },
//           update: {
//             status: 'scheduled',
//             meetingUrl: meeting.meetLink,
//             meetingName: meeting.guestName || `Meeting ${meeting.startTime.toLocaleString()}`,
//             scheduledFor: meeting.startTime,
//             platform: detectPlatform(meeting.meetLink),
//           },
//           create: {
//             userId: session.user.id,
//             sourceMeetingId: id,
//             meetingUrl: meeting.meetLink,
//             meetingName: meeting.guestName || `Meeting ${meeting.startTime.toLocaleString()}`,
//             platform: detectPlatform(meeting.meetLink),
//             status: 'scheduled',
//             scheduledFor: meeting.startTime,
//             transcriptionProvider: 'assemblyai',
//           },
//         });
//       } else {
//         await prisma.aiMeeting.deleteMany({
//           where: { sourceMeetingId: id, userId: session.user.id },
//         });
//       }

//       return res.status(200).json({ success: true, enabled });
//     } catch (error: any) {
//       console.error('Toggle error:', error);
//       return res.status(500).json({ error: error.message || 'Failed to toggle' });
//     }
//   }

//   return res.status(405).json({ error: 'Method not allowed' });
// }

// function detectPlatform(url: string): string {
//   if (url.includes('zoom.us')) return 'zoom';
//   if (url.includes('meet.google.com')) return 'google_meet';
//   if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'teams';
//   return 'unknown';
// } working but for the host only not guests 

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid meeting ID' });

  const userId = session.user.id;

  if (req.method === 'GET') {
    const aiMeeting = await prisma.aiMeeting.findUnique({
      where: { sourceMeetingId: id },
    });
    
    // Also check if user has access to this meeting (host or attendee)
    const hasAccess = await checkMeetingAccess(id, userId);
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

    return res.status(200).json({ 
      enabled: !!aiMeeting && ['scheduled', 'pending'].includes(aiMeeting.status) 
    });
  }

  if (req.method === 'POST') {
    try {
      const { enabled } = req.body as { enabled: boolean };

      // Check if user is host OR attendee of the meeting
      const meeting = await prisma.meeting.findFirst({
        where: {
          id,
          OR: [
            { userId: userId },                    // User is host
            { meetingAttendees: { some: { userId: userId } } },  // User is attendee
          ],
        },
      });

      if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
      if (!meeting.meetLink) return res.status(400).json({ error: 'No meet link' });

      // Only HOST can toggle AI notetaker (or allow anyone with access?)
      // If you want ONLY host to control it, keep this check:
      // const isHost = meeting.userId === userId;
      // if (!isHost) {
      //   return res.status(403).json({ error: 'Only the host can manage AI notetaker' });
      // }

      if (enabled) {
        await prisma.aiMeeting.upsert({
          where: { sourceMeetingId: id },
          update: {
            status: 'scheduled',
            meetingUrl: meeting.meetLink,
            meetingName: meeting.guestName || `Meeting ${meeting.startTime.toLocaleString()}`,
            scheduledFor: meeting.startTime,
            platform: detectPlatform(meeting.meetLink),
          },
          create: {
            userId: meeting.userId,  // AI notetaker belongs to the HOST, not the guest
            sourceMeetingId: id,
            meetingUrl: meeting.meetLink,
            meetingName: meeting.guestName || `Meeting ${meeting.startTime.toLocaleString()}`,
            platform: detectPlatform(meeting.meetLink),
            status: 'scheduled',
            scheduledFor: meeting.startTime,
            transcriptionProvider: 'assemblyai',
          },
        });
      } else {
        await prisma.aiMeeting.deleteMany({
          where: { sourceMeetingId: id, userId: meeting.userId },  // Only host's AI entry
        });
      }

      return res.status(200).json({ success: true, enabled });
    } catch (error: any) {
      console.error('Toggle error:', error);
      return res.status(500).json({ error: error.message || 'Failed to toggle' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Helper to check if user has access to a meeting
async function checkMeetingAccess(meetingId: string, userId: string): Promise<boolean> {
  const meeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      OR: [
        { userId: userId },
        { meetingAttendees: { some: { userId: userId } } },
      ],
    },
  });
  return !!meeting;
}

function detectPlatform(url: string): string {
  if (url.includes('zoom.us')) return 'zoom';
  if (url.includes('meet.google.com')) return 'google_meet';
  if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'teams';
  if (url.includes('localhost:4002') || url.includes('conferio')) return 'conferio';
  return 'unknown';
}