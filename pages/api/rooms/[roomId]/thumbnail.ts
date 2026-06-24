// pages/api/rooms/[roomId]/thumbnail.ts
import type { NextApiRequest, NextApiResponse } from "next";
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

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { roomId } = req.query as { roomId: string };
  const { thumbnailUrl } = req.body as { thumbnailUrl: string };

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      team: {
        include: {
          members: { where: { userId: session.user.id }, select: { id: true } },
        },
      },
    },
  });

  if (!room || !room.team.members.length) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await prisma.room.update({
    where: { id: roomId },
    data: { thumbnailUrl, updatedAt: new Date() },
  });

  return res.status(200).json({ ok: true });
}