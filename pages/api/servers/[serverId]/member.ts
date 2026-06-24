import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "utils/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { serverId } = req.query
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const member = await prisma.member.findFirst({
      where: { 
        serverId: serverId as string, 
        userId: session.user.id 
      },
      include: {
        user: true
      }
    })

    if (!member) {
      return res.status(404).json({ error: 'Member not found' })
    }

    res.status(200).json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}