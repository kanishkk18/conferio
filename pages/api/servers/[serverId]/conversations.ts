// pages/api/servers/[serverId]/conversations.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { memberOneId, memberTwoId } = req.body;
    const { serverId } = req.query;

    if (!serverId || typeof serverId !== "string") {
      return res.status(400).json({ error: "Server ID required" });
    }

    if (!memberOneId || !memberTwoId) {
      return res.status(400).json({ error: "Member IDs required" });
    }

    // Verify both members exist in this server
    const [memberOne, memberTwo] = await Promise.all([
      prisma.member.findFirst({
        where: { id: memberOneId, serverId },
        include: { user: true },
      }),
      prisma.member.findFirst({
        where: { id: memberTwoId, serverId },
        include: { user: true },
      }),
    ]);

    if (!memberOne || !memberTwo) {
      return res.status(404).json({ error: "Members not found" });
    }

    // Check for existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { memberOneId, memberTwoId },
          { memberOneId: memberTwoId, memberTwoId: memberOneId },
        ],
      },
      include: {
        memberOne: { include: { user: true } },
        memberTwo: { include: { user: true } },
      },
    });

    // Create if not exists
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          memberOneId,
          memberTwoId,
        },
        include: {
          memberOne: { include: { user: true } },
          memberTwo: { include: { user: true } },
        },
      });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("[SERVER_CONVERSATIONS_POST]", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}