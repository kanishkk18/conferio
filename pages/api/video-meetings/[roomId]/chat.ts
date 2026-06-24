// pages/api/video-meetings/[roomId]/chat.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const { roomId } = req.query as { roomId: string };

  const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
  if (!meeting) return res.status(404).json({ error: 'Not found' });

  // ── GET: fetch chat history ──────────────────────────────────────────────
  if (req.method === 'GET') {
    const messages = await prisma.vMChatMessage.findMany({
      where: { meetingId: meeting.id },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    return res.status(200).json({ messages });
  }

  // ── POST: save new message ───────────────────────────────────────────────
  if (req.method === 'POST') {
    const { content, senderName } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

    const message = await prisma.vMChatMessage.create({
      data: {
        meetingId: meeting.id,
        senderId: session?.user?.id || null,
        senderName: senderName || session?.user?.name || 'Guest',
        senderImage: session?.user?.image || null,
        content: content.trim(),
        type: 'TEXT',
      },
    });

    return res.status(200).json({ message });
  }

  return res.status(405).end();
}