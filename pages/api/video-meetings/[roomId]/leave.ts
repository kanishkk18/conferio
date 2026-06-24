// pages/api/video-meetings/[roomId]/leave.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  const { roomId } = req.query as { roomId: string };

  const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
  if (!meeting) return res.status(404).json({ error: 'Not found' });

  if (session?.user?.id) {
    // Mark participant as left
    await prisma.vMParticipant.updateMany({
      where: { meetingId: meeting.id, userId: session.user.id, leftAt: null },
      data: { leftAt: new Date() },
    });

    // If host leaving — end the meeting
    if (meeting.hostId === session.user.id) {
      await prisma.videoConference.update({
        where: { id: meeting.id },
        data: { status: 'ENDED', endedAt: new Date() },
      });
    }
  }

  return res.status(200).json({ success: true });
}