// pages/api/screenshare/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).end();

  const { sessionId } = req.query;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId required' });
  }

  const shareSession = await prisma.screenShareSession.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true, adminId: true, employeeId: true },
  });

  if (!shareSession) return res.status(404).json({ error: 'Not found' });

  // Only participants can poll
  if (
    shareSession.adminId !== session.user.id &&
    shareSession.employeeId !== session.user.id
  ) {
    return res.status(403).end();
  }

  return res.status(200).json({ status: shareSession.status });
}