import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Get the user's most recent team
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!teamMember?.team) {
      return res.status(404).json({ error: 'No team found' })
    }

    // Pick the first channel this member can access
    const initialChannel = await prisma.channel.findFirst({
      where: {
        teamId: teamMember.team.id,
        OR: [
          { visibility: 'TEAM' },
          { members: { some: { teamMemberId: teamMember.id } } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })

    res.status(200).json({
      teamSlug: teamMember.team.slug,
      teamId: teamMember.team.id,
      channelId: initialChannel?.id || null,
    })
  } catch (error) {
    console.error('Error fetching default chat data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}