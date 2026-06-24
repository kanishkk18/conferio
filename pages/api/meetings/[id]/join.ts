import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const JoinSchema = z.object({
  deviceInfo: z.object({
    browser: z.string(),
    os: z.string(),
    isMobile: z.boolean(),
    audioInput: z.string().optional(),
    videoInput: z.string().optional(),
  }).optional(),
  role: z.enum(['host', 'participant', 'moderator']).optional(),
});

export async function joinHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };
  const parsed = JoinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

  const meeting = await prisma.videoMeeting.findUnique({ where: { id } });
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  // Check max participants
  const settings = meeting.settings as any;
  if (settings?.maxParticipants) {
    const activeCount = await prisma.videoMeetingParticipant.count({
      where: { meetingId: id, leftAt: null },
    });
    if (activeCount >= settings.maxParticipants) {
      return res.status(403).json({ error: 'Meeting is full' });
    }
  }

  // Upsert participant (handles rejoins)
  const participant = await prisma.videoMeetingParticipant.upsert({
    where: {
      // compound unique required — add to schema
      id: `${id}-${session.user.id}`,
    },
    create: {
      id: `${id}-${session.user.id}`,
      meetingId: id,
      userId: session.user.id,
      role: meeting.createdById === session.user.id ? 'host' : (parsed.data.role ?? 'participant'),
      deviceInfo: parsed.data.deviceInfo ?? null,
      joinedAt: new Date(),
    },
    update: {
      joinedAt: new Date(),
      leftAt: null,
      deviceInfo: parsed.data.deviceInfo ?? undefined,
    },
  });

  // Set meeting startedAt if first join
  if (!meeting.startedAt) {
    await prisma.videoMeeting.update({
      where: { id },
      data: { startedAt: new Date() },
    });
  }

  return res.status(200).json({ participant });
}

export default joinHandler;