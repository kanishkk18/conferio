import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { teamSlug, channelId } = req.query
  const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } })
  if (!team) return res.status(404).json({ error: 'Team not found' })

  const member = await prisma.teamMember.findFirst({ where: { teamId: team.id, userId: session.user.id } })
  if (!member || !['ADMIN', 'OWNER', 'MANAGER'].includes(member.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  const channel = await prisma.channel.findFirst({ where: { id: channelId as string, teamId: team.id } })
  if (!channel) return res.status(404).json({ error: 'Channel not found' })

  const { expiresInHours, maxUses } = req.body

  const invite = await prisma.channelInvite.create({
    data: {
      channelId: channel.id,
      token: crypto.randomBytes(24).toString('hex'),
      expiresAt: expiresInHours ? new Date(Date.now() + expiresInHours * 3600_000) : null,
      maxUses: maxUses ?? null,
      createdById: session.user.id,
    },
  })
 
  return res.status(201).json({
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/channel/${invite.token}`,
    invite,
  })
}