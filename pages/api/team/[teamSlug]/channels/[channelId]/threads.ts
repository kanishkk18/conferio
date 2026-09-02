import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { teamSlug, channelId } = req.query
  const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } })
  if (!team) return res.status(404).json({ error: 'Team not found' })

  const requester = await prisma.teamMember.findFirst({ where: { teamId: team.id, userId: session.user.id } })
  if (!requester) return res.status(403).json({ error: 'Not a team member' })

  const channel = await prisma.channel.findFirst({ where: { id: channelId as string, teamId: team.id } })
  if (!channel) return res.status(404).json({ error: 'Channel not found' })

  if (channel.visibility === 'RESTRICTED') {
    const hasAccess = await prisma.channelMember.findFirst({
      where: { channelId: channel.id, teamMemberId: requester.id },
    })
    if (!hasAccess) return res.status(403).json({ error: 'No access to this channel' })
  }

  const threads = await prisma.messageThread.findMany({
    where: { message: { channelId: channel.id } },
    include: {
      message: {
        select: {
          id: true,
          content: true,
          fileUrl: true,
          sender: { select: { user: { select: { id: true, name: true, image: true } } } },
        },
      },
      replies: {
        include: {
          sender: { select: { user: { select: { id: true, name: true, image: true } } } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { lastReplyAt: 'desc' },
    take: 50,
  })

  return res.status(200).json(threads)
}