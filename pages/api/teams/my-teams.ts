// pages/api/teams/my-teams.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userId = session.user.id

    // Get all teams where user is a member (any role)
    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            _count: {
              select: { members: true }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const teams = memberships.map((membership) => ({
      id: membership.team.id,
      name: membership.team.name,
      slug: membership.team.slug,
      role: membership.role,
      memberCount: membership.team._count.members,
      joinedAt: membership.createdAt,
    }))

    return res.status(200).json({ teams })

  } catch (error) {
    console.error('Get my teams error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}