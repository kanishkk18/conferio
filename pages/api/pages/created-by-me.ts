
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from 'lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const pages = await prisma.page.findMany({
      where: {
        authorId: session.user.id,
        isTemplate: false,
      },
      include: {
        workspace: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            favoritedBy: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    res.json(pages)
  } catch (error) {
    console.error('Error fetching created pages:', error)
    res.status(500).json({ error: 'Failed to fetch pages' })
  }
}
