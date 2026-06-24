// pages/api/teams/[slug]/messages/index.ts
// Full fix: include reactions, bookmarks, and parent on every fetch

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MESSAGES_BATCH = 20;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const { cursor, conversationId, slug } = req.query;

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID Missing" });
    }

    const currentTeamMember = await prisma.teamMember.findFirst({
      where: {
        team: { slug: slug as string },
        userId: session.user.id
      }
    });

    if (!currentTeamMember) {
      return res.status(403).json({ error: "Not a team member" });
    }

    const conversation = await prisma.teamConversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          { participantOneId: currentTeamMember.id },
          { participantTwoId: currentTeamMember.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await prisma.teamDirectMessage.findMany({
      where: {
        conversationId: conversationId as string,
        deleted: false,
      },
      include: {
        sender: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        // ── FIX: include reactions with user info ──────────────────────────
        reactions: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        },
        // ── FIX: include bookmarks filtered to current user ────────────────
        bookmarks: {
          where: { userId: session.user.id }
        },
        // ── FIX: include parent message for reply context ──────────────────
        parent: {
          include: {
            sender: {
              include: {
                user: {
                  select: { id: true, name: true, image: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: MESSAGES_BATCH,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor as string } : undefined,
    });

    const nextCursor = messages.length === MESSAGES_BATCH
      ? messages[messages.length - 1].id
      : null;

    return res.status(200).json({
      items: messages,
      nextCursor,
      currentMemberId: currentTeamMember.id
    });

  } catch (error) {
    console.error("[TEAM_MESSAGES_GET]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}