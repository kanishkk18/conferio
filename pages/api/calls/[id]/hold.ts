// pages/api/calls/[id]/hold.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.query as { id: string };
  try {
    await prisma.call.update({ where: { id }, data: { status: 'ON_HOLD', isOnHold: true } });
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed' });
  }
}