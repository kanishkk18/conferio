// pages/api/notes/[noteId]/snapshot.ts
// GET  — load Yjs snapshot for a note
// POST — save Yjs snapshot for a note
// This stores base64 Yjs binary in the note's content field (or a separate column)

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const { noteId } = req.query as { noteId: string }

  // Verify note belongs to user — adjust the where clause to match your Note model
  const note = await prisma.note.findFirst({
    where: { id: noteId, authorId: session.user.id },
    select: { id: true, content: true },
  })

  if (!note) return res.status(404).json({ error: 'Note not found' })

  // ── GET: load snapshot ───────────────────────────────────────────────────
  if (req.method === 'GET') {
    return res.status(200).json({
      // content stores the base64 Yjs binary — same field EditorJS used for JSON
      snapshot: note.content ?? null,
    })
  }

  // ── POST: save snapshot ──────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { snapshot } = req.body as { snapshot: string }

    if (!snapshot || typeof snapshot !== 'string') {
      return res.status(400).json({ error: 'Missing snapshot' })
    }

    // Store in the content field — replaces EditorJS JSON with Yjs base64
    await prisma.note.update({
      where: { id: noteId },
      data: {
        content: snapshot,
        updatedAt: new Date(),
      },
    })

    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}