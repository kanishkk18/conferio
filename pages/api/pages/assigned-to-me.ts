import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from 'lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Find all team memberships for the user
    const teamMemberships = await prisma.teamMember.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    })

    const teamMemberIds = teamMemberships.map(tm => tm.id)

    // Find pages assigned to any of these team memberships
    const pages = await prisma.page.findMany({
      where: {
        assignedToId: {
          in: teamMemberIds,
        },
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        workspace: {
          select: {
            name: true,
          },
        },
        assignedTo: {
          include: {
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    res.json(pages)
  } catch (error) {
    console.error('Error fetching assigned pages:', error)
    res.status(500).json({ error: 'Failed to fetch assigned pages' })
  }
}

