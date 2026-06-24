// pages/api/teams/by-id/[teamId]/members.ts
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
    const { teamId } = req.query

    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ message: 'Team ID is required' })
    }

    // Check if user is a member of this team
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId,
      },
    })

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this team' })
    }

    // Get all members with user details
    const members = await prisma.teamMember.findMany({
      where: { 
        teamId: teamId 
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
      orderBy: [
        { role: 'asc' }, // OWNER, ADMIN, MEMBER
        { createdAt: 'desc' }
      ],
    })

    // Format response to match expected structure
    const formattedMembers = members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      user: member.user,
      createdAt: member.createdAt,
    }))

    return res.status(200).json({
      data: formattedMembers,
    })

  } catch (error) {
    console.error('Get team members error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}