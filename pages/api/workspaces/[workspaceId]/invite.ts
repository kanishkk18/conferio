import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TEST_USER, isTestMode } from '@/lib/test-user'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getServerSession(req, res, authOptions)
  
  if (isTestMode && !session) {
    session = { user: DEFAULT_TEST_USER }
  }

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { workspaceId } = req.query

  if (req.method === 'POST') {
    try {
      const { email, role = 'VIEWER' } = req.body

      if (!email) {
        return res.status(400).json({ error: 'Email is required' })
      }

      // Check if user has permission to invite
      const membership = await prisma.workspaceMembership.findFirst({
        where: {
          workspaceId: workspaceId as string,
          userId: session.user.id,
          DocRole: {
            in: ['OWNER', 'ADMIN'],
          },
        },
      })

      if (!membership) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        // Create user if they don't exist
        user = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0], // Use email prefix as name
          },
        })
      }

      // Check if user is already a member
      const existingMembership = await prisma.workspaceMembership.findFirst({
        where: {
          workspaceId: workspaceId as string,
          userId: user.id,
        },
      })

      if (existingMembership) {
        return res.status(400).json({ error: 'User is already a member' })
      }

      // Create membership
      const newMembership = await prisma.workspaceMembership.create({
        data: {
          workspaceId: workspaceId as string,
          userId: user.id,
          DocRole: role as any,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })

      res.json(newMembership)
    } catch (error) {
      console.error('Invite error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'GET') {
    try {
      // Get workspace members
      const members = await prisma.workspaceMembership.findMany({
        where: {
          workspaceId: workspaceId as string,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      res.json(members)
    } catch (error) {
      console.error('Members fetch error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}