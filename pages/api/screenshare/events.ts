// pages/api/screenshare/events.ts
// Server-Sent Events – keeps a persistent connection open to push signals
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

// Global client map: userId → SSE response object
export const sseClients = new Map<string, NextApiResponse>();

export function pushSSEEvent(userId: string, payload: Record<string, unknown>) {
  const client = sseClients.get(userId);
  if (client) {
    try {
      client.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (_) {
      sseClients.delete(userId);
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).end();

  const userId = session.user.id;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx compatibility
  res.flushHeaders();

  // Register this client
  sseClients.set(userId, res);

  // Send a heartbeat immediately so the browser doesn't hang
  res.write(': heartbeat\n\n');

  // Send any pending screen share request right away
  const pending = await prisma.screenShareSession.findFirst({
    where: { employeeId: userId, status: 'PENDING' },
  });
  if (pending) {
    pushSSEEvent(userId, {
      type: 'SCREEN_SHARE_REQUEST',
      sessionId: pending.id,
    });
  }

  // Heartbeat every 25 s to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (_) {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(userId);
    res.end();
  });
}