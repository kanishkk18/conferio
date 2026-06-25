import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const { q, workspaceId } = req.query

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' })
      }

      // Basic text search for now (can be enhanced with full-text search later)
      const pages = await prisma.page.findMany({
        where: {
          AND: [
            {
              workspace: {
                memberships: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            },
            workspaceId ? { workspaceId: workspaceId as string } : {},
            {
              OR: [
                {
                  title: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
                // Add content search when implementing full-text search
              ],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          emoji: true,
          workspaceId: true,
          workspace: {
            select: {
              name: true,
            },
          },
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 20,
      })

      res.json(pages)
    } catch (error) {
      console.error('Search error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}