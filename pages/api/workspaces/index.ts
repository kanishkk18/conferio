import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

  if (req.method === 'GET') {
    try {
      const workspaces = await prisma.workspace.findMany({
        where: {
          memberships: {
            some: {
              userId: session.user.id,
            },
          },
        },
        include: {
          memberships: {
            where: {
              userId: session.user.id,
            },
            select: {
              DocRole: true,
            },
          },
          _count: {
            select: {
              pages: true,
              memberships: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      res.json(workspaces)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}