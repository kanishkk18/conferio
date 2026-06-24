

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from 'lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  if (req.method === 'GET') {
    try {
      const favorites = await prisma.pageFavorite.findMany({
        where: { userId },
        include: {
          page: {
            include: {
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
              workspace: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.json(favorites.map(fav => ({
        ...fav.page,
        favoritedAt: fav.createdAt,
      })))
    } catch (error) {
      console.error('Error fetching favorites:', error)
      res.status(500).json({ error: 'Failed to fetch favorites' })
    }
  }

  else if (req.method === 'POST') {
    const { pageId } = req.body
    
    try {
      const favorite = await prisma.pageFavorite.create({
        data: {
          pageId,
          userId,
        },
      })
      res.json(favorite)
    } catch (error) {
      res.status(500).json({ error: 'Failed to add favorite' })
    }
  }

  else if (req.method === 'DELETE') {
    const { pageId } = req.query
    
    try {
      await prisma.pageFavorite.deleteMany({
        where: {
          pageId: pageId as string,
          userId,
        },
      })
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove favorite' })
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
