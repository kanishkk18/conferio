
// pages/api/rooms/[roomId]/snapshot.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" })

  const { roomId } = req.query as { roomId: string }

  // Verify room access
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      team: {
        include: {
          members: { where: { userId: session.user.id }, select: { id: true } },
        },
      },
    },
  })

  if (!room) return res.status(404).json({ error: "Room not found" })
  if (!room.team.members.length) return res.status(403).json({ error: "Forbidden" })

  // ── GET: load snapshot ───────────────────────────────────────────────────
  if (req.method === "GET") {
    return res.status(200).json({ 
      snapshot: room.snapshot ?? null 
    })
  }

  // ── POST: save snapshot ──────────────────────────────────────────────────
  if (req.method === "POST") {
    const { snapshot } = req.body as { snapshot: string }
    
    if (!snapshot || typeof snapshot !== 'string') {
      return res.status(400).json({ error: "Missing or invalid snapshot" })
    }

    await prisma.room.update({
      where: { id: roomId },
      data: {
        snapshot,        // base64 Yjs binary string
        updatedAt: new Date(),
      },
    })

    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: "Method not allowed" })
}