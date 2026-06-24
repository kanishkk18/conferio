// pages/api/video-meetings/[roomId]/kick.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { RoomServiceClient } from 'livekit-server-sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { roomId } = req.query as { roomId: string };
  const { identity } = req.body;

  const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
  if (!meeting) return res.status(404).json({ error: 'Not found' });
  if (meeting.hostId !== session.user.id) return res.status(403).json({ error: 'Host only' });

  try {
    // Use LiveKit server SDK to remove participant from room
    const svc = new RoomServiceClient(
      process.env.LIVEKIT_URL!.replace('wss://', 'https://'),
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    );
    await svc.removeParticipant(roomId, identity);
  } catch (err) {
    console.warn('[kick] LiveKit remove failed (participant may have already left):', err);
  }

  // Mark as left in DB
  await prisma.vMParticipant.updateMany({
    where: { meetingId: meeting.id, livekitIdentity: identity },
    data: { leftAt: new Date() },
  });

  return res.status(200).json({ success: true });
}