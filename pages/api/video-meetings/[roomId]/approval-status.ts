// pages/api/video-meetings/[roomId]/approval-status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { waitingId } = req.query as { waitingId: string };
  if (!waitingId) return res.status(400).json({ error: 'waitingId required' });

  const entry = await prisma.vMWaitingEntry.findUnique({ where: { id: waitingId } });
  if (!entry) return res.status(404).json({ error: 'Not found' });

  return res.status(200).json({ status: entry.status });
}