import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { DEFAULT_TEST_USER, isTestMode } from 'lib/test-user'

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
          // This shouldn't happen with Prisma adapter, but just in case
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

      const { name, description } = req.body

      if (!name?.trim()) {
        return res.status(400).json({ error: 'Workspace name is required' })
      }

      const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${nanoid(8)}`

      const workspace = await prisma.workspace.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          slug,
          memberships: {
            create: {
              userId: userId,
              DocRole: 'OWNER',
            },
          },
        },
      })

      res.status(201).json(workspace)
    } catch (error) {
      console.error('Workspace creation error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}