import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { DEFAULT_TEST_USER, isTestMode } from '@/lib/test-user'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getServerSession(req, res, authOptions)
  
  if (isTestMode && !session) {
    session = { user: DEFAULT_TEST_USER }
  }

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { pageId } = req.query

  if (req.method === 'POST') {
    try {
      const { type = 'VIEW', expiresAt, password } = req.body

      // Verify page access
      const page = await prisma.page.findFirst({
        where: {
          id: pageId as string,
          workspace: {
            memberships: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      })

      if (!page) {
        return res.status(404).json({ error: 'Page not found' })
      }

      const share = await prisma.share.create({
        data: {
          token: nanoid(16),
          pageId: pageId as string,
          workspaceId: page.workspaceId,
          type: type as any,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          password,
          createdById: session.user.id,
        },
      })

      const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:4002'}/share/${share.token}`

      res.json({
        shareUrl,
        token: share.token,
        type: share.type,
        expiresAt: share.expiresAt,
      })
    } catch (error) {
      console.error('Share creation error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'GET') {
    try {
      // Get existing shares for this page
      const shares = await prisma.share.findMany({
        where: {
          pageId: pageId as string,
          page: {
            workspace: {
              memberships: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.json(shares)
    } catch (error) {
      console.error('Share fetch error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}