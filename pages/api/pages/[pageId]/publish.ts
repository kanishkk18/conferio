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
      const { isPublished, publishedUrl } = req.body

      // Verify page access
      const page = await prisma.page.findFirst({
        where: {
          id: pageId as string,
          workspace: {
            memberships: {
              some: {
                userId: session.user.id,
                DocRole: {
                  in: ['OWNER', 'ADMIN', 'EDITOR'],
                },
              },
            },
          },
        },
      })

      if (!page) {
        return res.status(404).json({ error: 'Page not found or insufficient permissions' })
      }

      let finalPublishedUrl = publishedUrl
      
      // Generate published URL if not provided and publishing
      if (isPublished && !finalPublishedUrl) {
        finalPublishedUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:4002'}/public/${page.id}`
      }

      const updatedPage = await prisma.page.update({
        where: { id: pageId as string },
        data: {
          isPublished,
          publishedUrl: isPublished ? finalPublishedUrl : null,
        },
      })

      res.json({
        isPublished: updatedPage.isPublished,
        publishedUrl: updatedPage.publishedUrl,
      })
    } catch (error) {
      console.error('Publish error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}