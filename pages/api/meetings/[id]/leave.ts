
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function leaveHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };

  const participant = await prisma.videoMeetingParticipant.findUnique({
    where: { id: `${id}-${session.user.id}` },
  });

  if (!participant) return res.status(404).json({ error: 'Participant not found' });

  const leftAt = new Date();
  const duration = Math.floor((leftAt.getTime() - participant.joinedAt.getTime()) / 1000);

  await prisma.videoMeetingParticipant.update({
    where: { id: participant.id },
    data: { leftAt, duration },
  });

  // If host leaves, end meeting after 60s grace period if no one else is active
  if (participant.role === 'host') {
    setTimeout(async () => {
      const remaining = await prisma.videoMeetingParticipant.count({
        where: { meetingId: id, leftAt: null },
      });
      if (remaining === 0) {
        await prisma.videoMeeting.update({
          where: { id },
          data: { endedAt: new Date() },
        });
      }
    }, 60000);
  }

  return res.status(200).json({ ok: true, duration });
}

export default leaveHandler;