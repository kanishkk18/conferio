// pages/api/teams/[slug]/messages/[messageId]/bookmark.ts
// Uses correct prisma model name.

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { messageId } = req.query as { messageId: string };

  if (req.method === "POST") {
    // upsert so double-clicking never throws a unique constraint error
    await prisma.teamDirectMessageBookmark.upsert({
      where: {
        messageId_userId: { messageId, userId: session.user.id }
      },
      create: { messageId, userId: session.user.id },
      update: {}
    });
    return res.status(200).json({ bookmarked: true });
  }

  if (req.method === "DELETE") {
    await prisma.teamDirectMessageBookmark.deleteMany({
      where: { messageId, userId: session.user.id }
    });
    return res.status(200).json({ bookmarked: false });
  }

  return res.status(405).json({ error: "Method not allowed" });
}