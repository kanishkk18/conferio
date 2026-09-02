import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CAN_MANAGE_CHANNEL: string[] = ['ADMIN', 'OWNER', 'MANAGER']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const { teamSlug, channelId } = req.query
  const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } })
  if (!team) return res.status(404).json({ error: 'Team not found' })

  const member = await prisma.teamMember.findFirst({
    where: { teamId: team.id, userId: session.user.id },
  })
  if (!member) return res.status(403).json({ error: 'Not a team member' })

  const channel = await prisma.channel.findFirst({
    where: { id: channelId as string, teamId: team.id },
  })
  if (!channel) return res.status(404).json({ error: 'Channel not found' })

  const isRestrictedAndNotMember =
    channel.visibility === 'RESTRICTED' &&
    !(await prisma.channelMember.findFirst({
      where: { channelId: channel.id, teamMemberId: member.id },
    }))

  if (isRestrictedAndNotMember) {
    return res.status(403).json({ error: 'You do not have access to this channel' })
  }

  if (req.method === 'GET') {
    const full = await prisma.channel.findUnique({
      where: { id: channel.id },
      include: {
        members: { include: { teamMember: { include: { user: { select: { id: true, name: true, image: true } } } } } },
        createdBy: { select: { id: true, name: true, image: true } },
      },
    })
    return res.status(200).json(full)
  }

  if (req.method === 'PATCH') {
    if (!CAN_MANAGE_CHANNEL.includes(member.role) && channel.createdById !== session.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions to edit this channel' })
    }

    const { name, description, type, coverImage, coverImageKey, visibility } = req.body
    const data: any = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (type !== undefined) data.type = type
    if (coverImage !== undefined) data.coverImage = coverImage
    if (coverImageKey !== undefined) data.coverImageKey = coverImageKey
    if (visibility !== undefined) data.visibility = visibility

    const updated = await prisma.channel.update({ where: { id: channel.id }, data })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    if (!CAN_MANAGE_CHANNEL.includes(member.role) && channel.createdById !== session.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions to delete this channel' })
    }
    await prisma.channel.delete({ where: { id: channel.id } })
    return res.status(200).json({ success: true })
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
  return res.status(405).json({ error: 'Method not allowed' })
}