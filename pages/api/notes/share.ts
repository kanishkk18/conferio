import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id
  const { noteId } = req.query

  if (req.method === 'POST') {
    try {
      const { expiresAt } = req.body

      // Verify note ownership
      const note = await prisma.note.findFirst({
        where: {
          id: noteId as string,
          authorId: userId,
        },
        include: {
          blocks: {
            orderBy: { position: 'asc' }
          }
        }
      })

      if (!note) {
        return res.status(404).json({ error: 'Note not found' })
      }

      const share = await prisma.noteShare.create({
        data: {
          token: nanoid(16),
          noteId: noteId as string,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdById: userId,
        },
      })

      const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:4002'}/public/notes/${share.token}`

      res.json({
        shareUrl,
        token: share.token,
        expiresAt: share.expiresAt,
        createdAt: share.createdAt,
      })
    } catch (error) {
      console.error('Share creation error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } 
  
  else if (req.method === 'GET') {
    try {
      // Get existing shares for this note
      const shares = await prisma.noteShare.findMany({
        where: {
          noteId: noteId as string,
          note: {
            authorId: userId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.json(shares.map(share => ({
        ...share,
        shareUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:4002'}/public/notes/${share.token}`
      })))
    } catch (error) {
      console.error('Share fetch error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } 
  
  else if (req.method === 'DELETE') {
    try {
      const { shareId } = req.body
      
      await prisma.noteShare.deleteMany({
        where: {
          id: shareId,
          noteId: noteId as string,
          note: { authorId: userId }
        }
      })

      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete share' })
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}