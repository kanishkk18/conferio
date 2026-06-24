// pages/api/notifications/stream.ts
/**
 * Server-Sent Events (SSE) endpoint for real-time notification delivery.
 * Connect with: const es = new EventSource('/api/notifications/stream')
 *
 * The client polls this endpoint and receives new notifications as they arrive.
 * Uses long-polling with periodic keep-alive pings.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Map of userId -> response writers (supports multiple tabs)
const clients = new Map<string, Set<NextApiResponse>>();

/** Broadcast a new notification to all open SSE connections for a user */
export function broadcastToUser(userId: string, data: object) {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of userClients) {
    try {
      res.write(message);
    } catch {
      // Client disconnected — clean up handled in close handler
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  // ── SSE headers ──────────────────────────────────────────────────────────
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();

  // ── Register client ──────────────────────────────────────────────────────
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(res);

  // ── Send any unread notifications immediately on connect ─────────────────
  try {
    const unread = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (unread.length > 0) {
      res.write(
        `data: ${JSON.stringify({ type: "initial", notifications: unread })}\n\n`
      );
    }
  } catch (error) {
    console.error("[SSE] Failed to fetch initial notifications:", error);
  }

  // ── Keep-alive ping every 25s ─────────────────────────────────────────────
  const pingInterval = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(pingInterval);
    }
  }, 25_000);

  // ── Cleanup on disconnect ─────────────────────────────────────────────────
  req.on("close", () => {
    clearInterval(pingInterval);
    const userClients = clients.get(userId);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) {
        clients.delete(userId);
      }
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
    // Increase response time limit for SSE
    externalResolver: true,
  },
};