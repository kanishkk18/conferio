// pages/api/files/folders.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const userId = session.user.id

  if (req.method === 'GET') {
    // Get folders
    const { teamId, parentId } = req.query
    
    const folders = await prisma.folder.findMany({
      where: {
        OR: [
          { userId, teamId: null }, // Personal folders
          { teamId: teamId as string }, // Team folders
        ],
        parentId: (parentId as string) || null,
      },
      include: {
        _count: {
          select: { files: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ folders })
  }

  if (req.method === 'POST') {
    // Create folder
    const { name, teamId, parentId } = req.body

    const folder = await prisma.folder.create({
      data: {
        name,
        userId,
        teamId,
        parentId,
      }
    })

    return res.status(201).json({ folder })
  }

  if (req.method === 'PUT') {
    // Rename folder
    const { folderId, name } = req.body

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: { name }
    })

    return res.status(200).json({ folder })
  }

  if (req.method === 'DELETE') {
    // Delete folder (and optionally move files to parent)
    const { folderId } = req.query

    // Check if folder is empty or move files
    const fileCount = await prisma.file.count({
      where: { folderId: folderId as string }
    })

    if (fileCount > 0) {
      // Move files to parent or root
      await prisma.file.updateMany({
        where: { folderId: folderId as string },
        data: { folderId: null }
      })
    }

    await prisma.folder.delete({
      where: { id: folderId as string }
    })

    return res.status(200).json({ message: 'Folder deleted' })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}