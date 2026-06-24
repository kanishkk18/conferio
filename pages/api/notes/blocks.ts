import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.query

  try {
    const share = await prisma.noteShare.findUnique({
      where: { token: token as string },
      include: {
        note: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
            blocks: {
              orderBy: { position: 'asc' }
            },
          },
        },
      },
    })

    if (!share) {
      return res.status(404).json({ error: 'Share not found' })
    }

    // Check if expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return res.status(410).json({ error: 'Share link has expired' })
    }

    res.json({
      note: {
        id: share.note.id,
        title: share.note.title,
        emoji: share.note.emoji,
        content: share.note.content,
        blocks: share.note.blocks,
        author: share.note.author,
        createdAt: share.note.createdAt,
        updatedAt: share.note.updatedAt,
      },
      sharedAt: share.createdAt,
    })
  } catch (error) {
    console.error('Public share fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}