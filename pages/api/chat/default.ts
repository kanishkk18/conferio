import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "utils/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Get user's first server
    const server = await prisma.server.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        channels: {
          where: {
            name: "general"
          },
          orderBy: { createdAt: "asc" }
        }
      }
    })

    if (!server) {
      return res.status(404).json({ error: 'No server found' })
    }

    const initialChannel = server.channels[0]

    res.status(200).json({
      serverId: server.id,
      channelId: initialChannel?.id || null
    })
  } catch (error) {
    console.error('Error fetching default chat data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}