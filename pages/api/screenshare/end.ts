// pages/api/screenshare/end.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { pushSSEEvent } from './events';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const shareSession = await prisma.screenShareSession.findUnique({
    where: { id: sessionId },
  });

  if (!shareSession) return res.status(404).json({ error: 'Not found' });

  // Only participants can end the session
  if (
    shareSession.adminId !== session.user.id &&
    shareSession.employeeId !== session.user.id
  ) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await prisma.screenShareSession.update({
    where: { id: sessionId },
    data: { status: 'ENDED' },
  });

  // Notify the other party
  const otherUserId =
    session.user.id === shareSession.adminId
      ? shareSession.employeeId
      : shareSession.adminId;

  pushSSEEvent(otherUserId, { type: 'SCREEN_SHARE_ENDED', sessionId });

  return res.status(200).json({ ok: true });
}