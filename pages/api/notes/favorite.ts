
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  if (req.method === 'GET') {
    try {
      const favorites = await prisma.noteFavorite.findMany({
        where: { userId },
        include: {
          note: {
            include: {
              _count: {
                select: { blocks: true }
              }
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.json(favorites.map(fav => ({
        ...fav.note,
        favoritedAt: fav.createdAt,
        isFavorite: true
      })))
    } catch (error) {
      console.error('Error fetching favorites:', error)
      res.status(500).json({ error: 'Failed to fetch favorites' })
    }
  }

  else if (req.method === 'POST') {
    // Support both query param and body
    const noteId = req.query.noteId || req.body?.noteId
    
    if (!noteId) {
      return res.status(400).json({ error: 'noteId is required' })
    }
    
    try {
      // Verify note exists and user owns it
      const note = await prisma.note.findFirst({
        where: { id: noteId as string, authorId: userId }
      })
      
      if (!note) {
        return res.status(404).json({ error: 'Note not found' })
      }

      const favorite = await prisma.noteFavorite.create({
        data: {
          noteId: noteId as string,
          userId,
        },
      })
      res.json(favorite)
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Already favorited' })
      }
      console.error('Error adding favorite:', error)
      res.status(500).json({ error: 'Failed to add favorite' })
    }
  }

  else if (req.method === 'DELETE') {
    const { noteId } = req.query
    
    if (!noteId) {
      return res.status(400).json({ error: 'noteId is required' })
    }
    
    try {
      await prisma.noteFavorite.deleteMany({
        where: {
          noteId: noteId as string,
          userId,
        },
      })
      res.json({ success: true })
    } catch (error) {
      console.error('Error removing favorite:', error)
      res.status(500).json({ error: 'Failed to remove favorite' })
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}