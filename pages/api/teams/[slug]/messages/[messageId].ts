// pages/api/teams/[slug]/messages/[messageId].ts
// PATCH = edit, DELETE = delete. Broadcasts via socket.

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
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { slug, messageId } = req.query as { slug: string; messageId: string };

  const message = await prisma.teamDirectMessage.findUnique({
    where: { id: messageId },
    include: { sender: true }
  });

  if (!message) return res.status(404).json({ error: "Message not found" });

  const teamMember = await prisma.teamMember.findFirst({
    where: { team: { slug }, userId: session.user.id }
  });

  if (!teamMember || message.senderId !== teamMember.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const io = res.socket.server.io;

  if (req.method === "PATCH") {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content required" });

    const updated = await prisma.teamDirectMessage.update({
      where: { id: messageId },
      data: { content: content.trim() },
      include: {
        sender: { include: { user: true } },
        reactions: true,
        bookmarks: true,
        parent: { include: { sender: { include: { user: true } } } }
      }
    });

    if (io) io.in(`conversation:${message.conversationId}`).emit("message_edited", updated);
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.teamDirectMessage.delete({ where: { id: messageId } });
    if (io) io.in(`conversation:${message.conversationId}`).emit("message_deleted", { messageId });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}