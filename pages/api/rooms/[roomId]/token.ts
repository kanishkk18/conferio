// pages/api/rooms/[roomId]/token.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ROOM_JWT_SECRET || process.env.NEXTAUTH_SECRET!
);

// Rate limit: 30 token requests per user per minute
async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `token_rl:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= 30;
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

  const { roomId } = req.query as { roomId: string };

  // Rate limiting
  const allowed = await checkRateLimit(session.user.id);
  if (!allowed) {
    return res.status(429).json({ error: "Too many requests" });
  }

  // Fetch room + verify team membership
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      team: {
        include: {
          members: {
            where: { userId: session.user.id },
            select: { id: true, role: true },
          },
        },
      },
    },
  });

  if (!room || room.isArchived) {
    return res.status(404).json({ error: "Room not found" });
  }

  const membership = room.team.members[0];
  if (!membership) {
    return res.status(403).json({ error: "Access denied" });
  }

  // Create a unique JWT ID for replay-attack prevention
  // const jti = `${room.tldrawRoomId}:${session.user.id}:${Date.now()}`;
  const jti = `${room.id}:${session.user.id}:${Date.now()}`; // Use room.id instead of room.tldrawRoomId


  // Sign a 5-minute JWT
  const token = await new jose.SignJWT({
    sub: session.user.id,
    roomId: room.id,
    // tldrawRoomId: room.tldrawRoomId,
    teamId: room.teamId,
    role: membership.role,
    name: session.user.name ?? "Anonymous",
    color: generateUserColor(session.user.id),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .setJti(jti)
    .sign(JWT_SECRET);

  // Store jti in Redis with 5-min TTL (whitelist approach)
  await redis.set(`room_jti:${jti}`, "1", { ex: 310 });

  return res.status(200).json({
    token,
    // tldrawRoomId: room.tldrawRoomId,
    expiresIn: 300,
  });
}

/** Deterministic color from user ID for cursor/presence coloring */
function generateUserColor(userId: string): string {
  const colors = [
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}