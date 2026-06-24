// pages/api/messages/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Message ID required" });
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { serverId } = req.body;

      // Find the message and verify it exists
      const message = await prisma.message.findUnique({
        where: { id },
        include: {
          member: true,
          channel: {
            include: { server: true }
          }
        }
      });

      if (!message || message.deleted) {
        return res.status(404).json({ error: "Message not found" });
      }

      // Find the requesting user's member record for this server
      const requestingMember = await prisma.member.findFirst({
        where: {
          serverId: message.channel.serverId,
          userId: session.user.id
        }
      });

      if (!requestingMember) {
        return res.status(403).json({ error: "Not a member of this server" });
      }

      const isOwner = message.member.userId === session.user.id;
      const isAdmin = requestingMember.role === "ADMIN";
      const isModerator = requestingMember.role === "MODERATOR";

      if (!isOwner && !isAdmin && !isModerator) {
        return res.status(403).json({ error: "Not authorized to delete this message" });
      }

      // Soft delete — keeps thread history intact
      const updated = await prisma.message.update({
        where: { id },
        data: {
          deleted: true,
          content: "This message has been deleted.",
          fileUrl: null
        },
        include: {
          member: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true }
              }
            }
          }
        }
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("[MESSAGE_DELETE]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  // ─── PATCH (edit) ──────────────────────────────────────────────────────────
  if (req.method === "PATCH") {
    try {
      const { content } = req.body;

      if (!content || typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ error: "Content is required" });
      }

      const message = await prisma.message.findUnique({
        where: { id },
        include: {
          member: true,
          channel: true
        }
      });

      if (!message || message.deleted) {
        return res.status(404).json({ error: "Message not found" });
      }

      // Only the message author can edit
      if (message.member.userId !== session.user.id) {
        return res.status(403).json({ error: "Not authorized to edit this message" });
      }

      const updated = await prisma.message.update({
        where: { id },
        data: {
          content: content.trim(),
          updatedAt: new Date()
        },
        include: {
          member: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true }
              }
            }
          },
          reactions: {
            include: {
              member: {
                include: {
                  user: {
                    select: { id: true, name: true, image: true }
                  }
                }
              }
            }
          }
        }
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("[MESSAGE_PATCH]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}