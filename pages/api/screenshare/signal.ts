// pages/api/screenshare/signal.ts
// In-memory store — swap for Redis (Upstash) in production
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';

interface SignalStore {
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidateInit[];
  updatedAt: number;
}

const store = new Map<string, SignalStore>();

// Clean up entries older than 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [key, val] of store.entries()) {
    if (val.updatedAt < cutoff) store.delete(key);
  }
}, 5 * 60 * 1000);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  const { sessionId } = req.method === 'GET' ? req.query : req.body;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId required' });
  }

  if (req.method === 'POST') {
    const { type, data } = req.body;
    if (!store.has(sessionId)) {
      store.set(sessionId, { iceCandidates: [], updatedAt: Date.now() });
    }
    const entry = store.get(sessionId)!;
    entry.updatedAt = Date.now();

    if (type === 'offer') entry.offer = data;
    else if (type === 'answer') entry.answer = data;
    else if (type === 'ice') entry.iceCandidates.push(data);

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {
    const entry = store.get(sessionId) ?? { iceCandidates: [] };
    return res.status(200).json(entry);
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}