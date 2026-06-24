import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query

  if (req.method === 'GET') {
    try {
      const pageId = slug as string

      const page = await prisma.page.findFirst({
        where: {
          id: pageId,
          isPublished: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          workspace: {
            select: {
              name: true,
            },
          },
        },
      })

      if (!page) {
        return res.status(404).json({ error: 'Page not found' })
      }

      res.json({
        id: page.id,
        title: page.title,
        content: page.content,
        emoji: page.emoji,
        coverImage: page.coverImage,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        author: page.author,
        workspace: page.workspace,
      })
    } catch (error) {
      console.error('Public page error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}