// pages/api/calls/merge.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });
  const { callId1, callId2 } = req.body;
  try {
    await prisma.call.update({ where: { id: callId2 }, data: { parentCallId: callId1, status: 'COMPLETED' } });
    await prisma.call.update({ where: { id: callId1 }, data: { isGroupCall: true } });
    const parts = await prisma.callParticipant.findMany({ where: { callId: callId2 } });
    for (const p of parts) {
      await prisma.callParticipant.upsert({
        where: { callId_userId: { callId: callId1, userId: p.userId } },
        create: { callId: callId1, userId: p.userId },
        update: {},
      });
    }
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to merge' });
  }
}