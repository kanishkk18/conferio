import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    const type = req.query.type as string | undefined;

    const favorites = await prisma.musicFavorite.findMany({
      where: {
        userId,
        ...(type ? { type: type.toUpperCase() as never } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ favorites });
  }

  if (req.method === "POST") {
    const { itemId, type, title, subtitle, image } = req.body as {
      itemId: string;
      type: "SONG" | "ALBUM" | "PLAYLIST" | "ARTIST" | "SHOW";
      title: string;
      subtitle?: string;
      image?: string;
    };

    if (!itemId || !type || !title) {
      return res.status(400).json({ error: "itemId, type and title are required" });
    }

    const favorite = await prisma.musicFavorite.upsert({
      where: { userId_itemId_type: { userId, itemId, type } },
      update: {},
      create: { userId, itemId, type, title, subtitle, image },
    });

    return res.status(200).json({ favorite });
  }

  if (req.method === "DELETE") {
    const { itemId, type } = req.body as { itemId: string; type: string };

    if (!itemId || !type) {
      return res.status(400).json({ error: "itemId and type are required" });
    }

    await prisma.musicFavorite.deleteMany({
      where: { userId, itemId, type: type.toUpperCase() as never },
    });

    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).end();
}
