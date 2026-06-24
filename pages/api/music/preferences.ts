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
    const prefs = await prisma.userMusicPreferences.findUnique({ where: { userId } });

    return res.status(200).json({
      preferences: prefs ?? {
        languages: ["hindi", "english"],
        streamQuality: "excellent",
      },
    });
  }

  if (req.method === "PUT") {
    const { languages, streamQuality } = req.body as {
      languages?: string[];
      streamQuality?: "low" | "medium" | "high" | "excellent";
    };

    const prefs = await prisma.userMusicPreferences.upsert({
      where: { userId },
      update: {
        ...(languages ? { languages } : {}),
        ...(streamQuality ? { streamQuality } : {}),
      },
      create: {
        userId,
        languages: languages ?? ["hindi", "english"],
        streamQuality: streamQuality ?? "excellent",
      },
    });

    return res.status(200).json({ preferences: prefs });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).end();
}
