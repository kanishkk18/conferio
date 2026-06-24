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

  if (req.method === 'POST') {
    try {
      // Ensure user exists in database
      let userId = session.user.id
      
      if (isTestMode && userId === DEFAULT_TEST_USER.id) {
        // Handle test user
        await prisma.user.upsert({
          where: { id: DEFAULT_TEST_USER.id },
          update: {},
          create: {
            id: DEFAULT_TEST_USER.id,
            name: DEFAULT_TEST_USER.name,
            email: DEFAULT_TEST_USER.email,
            image: DEFAULT_TEST_USER.image,
          },
        })
      } else {
        // Ensure real authenticated user exists (fallback for edge cases)
        const existingUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        
        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: userId,
              name: session.user.name || 'Unknown User',
              email: session.user.email || '',
              image: session.user.image,
            },
          })
        }
      }

      const { workspaceId, parentId, title = 'Untitled' } = req.body

      // Verify workspace access
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
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

      // Get position for new page
      const lastPage = await prisma.page.findFirst({
        where: {
          workspaceId,
          parentId: parentId || null,
        },
        orderBy: {
          position: 'desc',
        },
      })

      const position = lastPage ? lastPage.position + 1 : 0

      const page = await prisma.page.create({
        data: {
          title,
          workspaceId,
          authorId: userId,
          parentId: parentId || null,
          position,
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [],
              },
            ],
          },
        },
      })

      res.status(201).json(page)
    } catch (error) {
      console.error('Page creation error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}