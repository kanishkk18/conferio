import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_RECENT = 50;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    const items = await prisma.recentlyPlayed.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      take: MAX_RECENT,
      distinct: ["itemId"],
    });

    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const { itemId, title, subtitle, image, duration } = req.body as {
      itemId: string;
      title: string;
      subtitle?: string;
      image?: string;
      duration?: number;
    };

    if (!itemId || !title) {
      return res.status(400).json({ error: "itemId and title are required" });
    }

    // Remove any existing entry for this item so it moves to the top
    await prisma.recentlyPlayed.deleteMany({ where: { userId, itemId } });

    await prisma.recentlyPlayed.create({
      data: { userId, itemId, title, subtitle, image, duration },
    });

    // Trim to MAX_RECENT
    const all = await prisma.recentlyPlayed.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      select: { id: true },
    });

    if (all.length > MAX_RECENT) {
      const toDelete = all.slice(MAX_RECENT).map((r) => r.id);
      await prisma.recentlyPlayed.deleteMany({ where: { id: { in: toDelete } } });
    }

    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
