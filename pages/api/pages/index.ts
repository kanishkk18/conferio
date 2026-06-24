import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TEST_USER, isTestMode } from '@/lib/test-user'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getServerSession(req, res, authOptions)
  
  // Use test user in development if enabled
  if (isTestMode && !session) {
    session = { user: DEFAULT_TEST_USER }
  }

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const { workspaceId, tree, limit } = req.query

      // Verify workspace access
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId as string,
          memberships: {
            some: {
              userId: session.user.id,
            },
          },
        },
      })

      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' })
      }

      if (tree === 'true') {
        // Return hierarchical structure
        const rootPages = await prisma.page.findMany({
          where: {
            workspaceId: workspaceId as string,
            parentId: null,
          },
          select: {
            id: true,
            title: true,
            emoji: true,
            children: {
              select: {
                id: true,
                title: true,
                emoji: true,
                children: {
                  select: {
                    id: true,
                    title: true,
                    emoji: true,
                  },
                },
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        })

        res.json(rootPages)
      } else {
        // Return flat list
        const pages = await prisma.page.findMany({
          where: {
            workspaceId: workspaceId as string,
          },
          select: {
            id: true,
            title: true,
            emoji: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: limit ? parseInt(limit as string) : undefined,
        })

        res.json(pages)
      }
    } catch (error) {
      console.error('Pages fetch error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}