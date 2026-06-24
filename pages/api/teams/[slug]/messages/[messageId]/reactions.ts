// pages/api/teams/[slug]/messages/[messageId]/reactions.ts
// Uses correct prisma model name. Returns reactions with user info.

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: { server: NetServer & { io?: ServerIO } };
}

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { slug, messageId } = req.query as { slug: string; messageId: string };
  const { emoji } = req.body;

  if (!emoji) return res.status(400).json({ error: "Emoji required" });

  const teamMember = await prisma.teamMember.findFirst({
    where: { team: { slug }, userId: session.user.id }
  });
  if (!teamMember) return res.status(403).json({ error: "Not a team member" });

  const message = await prisma.teamDirectMessage.findUnique({
    where: { id: messageId }
  });
  if (!message) return res.status(404).json({ error: "Message not found" });

  // ── Toggle reaction ───────────────────────────────────────────────────────
  // Use the EXACT Prisma model name from your schema: teamDirectMessageReaction
  const existing = await prisma.teamDirectMessageReaction.findFirst({
    where: { messageId, userId: session.user.id, emoji }
  });

  if (existing) {
    await prisma.teamDirectMessageReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.teamDirectMessageReaction.create({
      data: { emoji, messageId, userId: session.user.id }
    });
  }

  // ── Fetch updated reactions — same shape as the GET endpoint ─────────────
  const reactions = await prisma.teamDirectMessageReaction.findMany({
    where: { messageId },
    include: {
      user: { select: { id: true, name: true, image: true } }
    }
  });

  // ── Broadcast to both conversation participants ───────────────────────────
  const io = res.socket.server.io;
  if (io) {
    io.in(`conversation:${message.conversationId}`).emit("message_reaction_updated", {
      messageId,
      reactions
    });
  }

  return res.status(200).json({ reactions });
}