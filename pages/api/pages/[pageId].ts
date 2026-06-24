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

  const { pageId } = req.query

  if (req.method === 'GET') {
    try {
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
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })

      if (!page) {
        return res.status(404).json({ error: 'Page not found' })
      }

      res.json(page)
    } catch (error) {
      console.error('Page fetch error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'PATCH') {
    try {
      const { title, content, emoji, coverImage } = req.body

      // Verify page access
      const existingPage = await prisma.page.findFirst({
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

      if (!existingPage) {
        return res.status(404).json({ error: 'Page not found' })
      }

      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (content !== undefined) updateData.content = content
      if (emoji !== undefined) updateData.emoji = emoji
      if (coverImage !== undefined) updateData.coverImage = coverImage

      const updatedPage = await prisma.page.update({
        where: { id: pageId as string },
        data: updateData,
      })

      res.json(updatedPage)
    } catch (error) {
      console.error('Page update error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verify page access and ownership/permissions
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

      await prisma.page.delete({
        where: { id: pageId as string },
      })

      res.json({ success: true })
    } catch (error) {
      console.error('Page deletion error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}