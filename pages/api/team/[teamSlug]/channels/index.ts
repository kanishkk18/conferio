import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CAN_CREATE_CHANNEL: string[] = ['ADMIN', 'OWNER', 'MANAGER']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const { teamSlug } = req.query as { teamSlug: string }
  const team = await prisma.team.findUnique({ where: { slug: teamSlug } })
  if (!team) return res.status(404).json({ error: 'Team not found' })

  const member = await prisma.teamMember.findFirst({
    where: { teamId: team.id, userId: session.user.id },
  })
  if (!member) return res.status(403).json({ error: 'Not a team member' })

  if (req.method === 'GET') {
    // Channels the user can see: TEAM visibility, or RESTRICTED ones they're a ChannelMember of
    const channels = await prisma.channel.findMany({
      where: {
        teamId: team.id,
        OR: [
          { visibility: 'TEAM' },
          { members: { some: { teamMemberId: member.id } } },
        ],
      },
      include: {
        _count: { select: { messages: true, members: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return res.status(200).json(channels)
  }

  if (req.method === 'POST') {
    if (!CAN_CREATE_CHANNEL.includes(member.role)) {
      return res.status(403).json({ error: 'Only admins, owners, or managers can create channels' })
    }

const { name, type = 'TEXT', description, visibility = 'TEAM', memberIds = [], coverImage } = req.body

    if (!name) return res.status(400).json({ error: 'Name is required' })

    // If RESTRICTED, verify every memberId actually belongs to this team
    if (visibility === 'RESTRICTED' && memberIds.length > 0) {
      const validMembers = await prisma.teamMember.findMany({
        where: { id: { in: memberIds }, teamId: team.id },
        select: { id: true },
      })
      if (validMembers.length !== memberIds.length) {
        return res.status(400).json({ error: 'One or more selected members are not part of this team' })
      }
    }

    const channel = await prisma.channel.create({
      data: {
    name,
    type,
    description,
    visibility,
    coverImage: coverImage || null, // NEW
    teamId: team.id,
    createdById: session.user.id,
    members: visibility === 'RESTRICTED' ? { /* unchanged */ } : undefined,
  }
    })

    return res.status(201).json(channel)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method not allowed' })
}