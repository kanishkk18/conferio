// pages/api/screenshare/respond.ts
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

  const { sessionId, accept, action } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  // "action: start" – marks session ACTIVE once employee starts sharing
  if (action === 'start') {
    const updated = await prisma.screenShareSession.update({
      where: { id: sessionId },
      data: { status: 'ACTIVE' },
    });

    // Notify admin that sharing started
    pushSSEEvent(updated.adminId, {
      type: 'SCREEN_SHARE_STARTED',
      sessionId,
    });

    return res.status(200).json({ ok: true });
  }

  // Normal accept / reject flow
  const shareSession = await prisma.screenShareSession.findFirst({
    where: { id: sessionId, employeeId: session.user.id, status: 'PENDING' },
  });

  if (!shareSession) {
    return res.status(404).json({ error: 'Session not found or already handled' });
  }

  const newStatus = accept ? 'ACCEPTED' : 'REJECTED';

  const updated = await prisma.screenShareSession.update({
    where: { id: sessionId },
    data: { status: newStatus },
  });

  // Push the decision back to the waiting admin
  pushSSEEvent(shareSession.adminId, {
    type: accept ? 'SCREEN_SHARE_ACCEPTED' : 'SCREEN_SHARE_REJECTED',
    sessionId,
  });

  return res.status(200).json({ status: updated.status, sessionId });
}