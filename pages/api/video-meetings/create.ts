// pages/api/video-meetings/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const {
    title = 'My Meeting',
    requireApproval = false,
    isPublic = false,
    password,
    backgroundType = 'none',
    backgroundValue,
  } = req.body;

  // Generate a readable room ID like "abc-defg-hij"
  const raw = nanoid(10).toLowerCase();
  const roomId = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const meeting = await prisma.videoConference.create({
    data: {
      roomId,
      title: title.trim() || 'My Meeting',
      hostId: session.user.id,
      requireApproval,
      isPublic,
      password: hashedPassword,
      backgroundType,
      backgroundValue: backgroundValue || null,
      status: 'WAITING',
    },
  });

  const meetingUrl = `${process.env.NEXTAUTH_URL}/meeting/${roomId}`;

  return res.status(200).json({
    meeting: {
      id: meeting.id,
      roomId: meeting.roomId,
      title: meeting.title,
      url: meetingUrl,
    },
  });
}