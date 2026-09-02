// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// const CAN_MANAGE_CHANNEL: string[] = ['ADMIN', 'OWNER', 'MANAGER']

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

//   const { teamSlug, channelId } = req.query
//   const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } })
//   if (!team) return res.status(404).json({ error: 'Team not found' })

//   const requester = await prisma.teamMember.findFirst({ where: { teamId: team.id, userId: session.user.id } })
//   if (!requester || !CAN_MANAGE_CHANNEL.includes(requester.role)) {
//     return res.status(403).json({ error: 'Insufficient permissions' })
//   }

//   const channel = await prisma.channel.findFirst({ where: { id: channelId as string, teamId: team.id } })
//   if (!channel) return res.status(404).json({ error: 'Channel not found' })

//   const { memberIds } = req.body as { memberIds: string[] }
//   if (!Array.isArray(memberIds) || memberIds.length === 0) {
//     return res.status(400).json({ error: 'memberIds is required' })
//   }

//   const validMembers = await prisma.teamMember.findMany({
//     where: { id: { in: memberIds }, teamId: team.id },
//     select: { id: true },
//   })
//   if (validMembers.length !== memberIds.length) {
//     return res.status(400).json({ error: 'One or more members are not part of this team' })
//   }

//   const created = await prisma.channelMember.createMany({
//     data: memberIds.map((id) => ({ channelId: channel.id, teamMemberId: id, role: 'MEMBER' as const })),
//     skipDuplicates: true,
//   })

//   return res.status(200).json({ added: created.count })
// }


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

  const requester = await prisma.teamMember.findFirst({ where: { teamId: team.id, userId: session.user.id } })
  if (!requester) return res.status(403).json({ error: 'Not a team member' })

  const channel = await prisma.channel.findFirst({ where: { id: channelId as string, teamId: team.id } })
  if (!channel) return res.status(404).json({ error: 'Channel not found' })

  if (req.method === 'GET') {
    // Restricted channels: verify requester actually has access before listing members
    if (channel.visibility === 'RESTRICTED') {
      const hasAccess = await prisma.channelMember.findFirst({
        where: { channelId: channel.id, teamMemberId: requester.id },
      })
      if (!hasAccess) return res.status(403).json({ error: 'No access to this channel' })
    }

    const members =
      channel.visibility === 'TEAM'
        ? await prisma.teamMember.findMany({
            where: { teamId: team.id },
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
            orderBy: { createdAt: 'asc' },
          })
        : (
            await prisma.channelMember.findMany({
              where: { channelId: channel.id },
              include: {
                teamMember: {
                  include: { user: { select: { id: true, name: true, email: true, image: true } } },
                },
              },
              orderBy: { joinedAt: 'asc' },
            })
          ).map((cm) => cm.teamMember)

    return res.status(200).json(members)
  }

  if (req.method === 'POST') {
    if (!CAN_MANAGE_CHANNEL.includes(requester.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const { memberIds } = req.body as { memberIds: string[] }
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: 'memberIds is required' })
    }

    const validMembers = await prisma.teamMember.findMany({
      where: { id: { in: memberIds }, teamId: team.id },
      select: { id: true },
    })
    if (validMembers.length !== memberIds.length) {
      return res.status(400).json({ error: 'One or more members are not part of this team' })
    }

    const created = await prisma.channelMember.createMany({
      data: memberIds.map((id) => ({ channelId: channel.id, teamMemberId: id, role: 'MEMBER' as const })),
      skipDuplicates: true,
    })

    return res.status(200).json({ added: created.count })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method not allowed' })
}