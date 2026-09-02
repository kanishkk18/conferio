import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { teamSlug } = req.query
  const q = ((req.query.q as string) || '').trim()
  const channelId = req.query.channelId as string | undefined

  if (!q) return res.status(200).json({ messages: [], members: [], channels: [] })

  const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } })
  if (!team) return res.status(404).json({ error: 'Team not found' })

  const requester = await prisma.teamMember.findFirst({ where: { teamId: team.id, userId: session.user.id } })
  if (!requester) return res.status(403).json({ error: 'Not a team member' })

  // Which channels the requester can see at all — used to scope message search
  const accessibleChannels = await prisma.channel.findMany({
    where: {
      teamId: team.id,
      OR: [
        { visibility: 'TEAM' },
        { members: { some: { teamMemberId: requester.id } } },
      ],
      ...(channelId ? { id: channelId } : {}),
    },
    select: { id: true, name: true, coverImage: true, visibility: true },
  })
  const accessibleChannelIds = accessibleChannels.map((c) => c.id)

  const [messages, members, channels] = await Promise.all([
    prisma.message.findMany({
      where: {
        channelId: { in: accessibleChannelIds },
        deleted: false,
        content: { contains: q, mode: 'insensitive' },
      },
      select: {
        id: true,
        content: true,
        channelId: true,
        createdAt: true,
        sender: { select: { user: { select: { id: true, name: true, image: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    channelId
      ? [] // don't surface member matches when searching inside a single channel's drawer
      : prisma.teamMember.findMany({
          where: {
            teamId: team.id,
            user: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
          take: 20,
        }),
    channelId
      ? []
      : accessibleChannels.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())),
  ])

  return res.status(200).json({ messages, members, channels })
}