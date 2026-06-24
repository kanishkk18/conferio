// // pages/api/files/[fileId]/index.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../../../../lib/auth'
// import { prisma } from '../../../../lib/prisma'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) {
//     return res.status(401).json({ message: 'Unauthorized' })
//   }

//   const { fileId } = req.query
//   const userId = session.user.id

//   if (req.method === 'PUT') {
//     // Rename file or update properties
//     const { originalName, visibility, password, folderId } = req.body

//     // Check ownership
//     const file = await prisma.file.findFirst({
//       where: {
//         id: fileId as string,
//         OR: [
//           { userId },
//           {
//             team: {
//               members: {
//                 some: { userId, role: { in: ['OWNER', 'ADMIN'] } }
//               }
//             }
//           }
//         ]
//       }
//     })

//     if (!file) {
//       return res.status(404).json({ message: 'File not found or no permission' })
//     }

//     const updateData: any = {}
//     if (originalName) updateData.originalName = originalName
//     if (visibility) updateData.visibility = visibility
//     if (password) updateData.password = password
//     if (folderId !== undefined) updateData.folderId = folderId

//     const updatedFile = await prisma.file.update({
//       where: { id: fileId as string },
//       data: updateData
//     })

//     return res.status(200).json({ file: updatedFile })
//   }

//   if (req.method === 'DELETE') {
//     // Delete file
//     const file = await prisma.file.findFirst({
//       where: {
//         id: fileId as string,
//         OR: [
//           { userId },
//           {
//             team: {
//               members: {
//                 some: { userId, role: { in: ['OWNER', 'ADMIN'] } }
//               }
//             }
//           }
//         ]
//       }
//     })

//     if (!file) {
//       return res.status(404).json({ message: 'File not found or no permission' })
//     }

//     // Delete from storage first (implement your storage deletion)
//     // await deleteFromStorage(file.storageKey)

//     await prisma.file.delete({
//       where: { id: fileId as string }
//     })

//     return res.status(200).json({ message: 'File deleted' })
//   }

//   return res.status(405).json({ message: 'Method not allowed' })
// }

// pages/api/files/[fileId]/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { notifyFileUploadedToTeam } from '../../../../lib/notifications/notification.triggers'
import { broadcastToUser } from '../../notifications/stream'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { fileId } = req.query
  const userId = session.user.id

  if (req.method === 'PUT') {
    const { originalName, visibility, password, folderId } = req.body

    // Check ownership
    const file = await prisma.file.findFirst({
      where: {
        id: fileId as string,
        OR: [
          { userId },
          {
            team: {
              members: {
                some: { userId, role: { in: ['OWNER', 'ADMIN'] } }
              }
            }
          }
        ]
      },
      include: { folder: true }
    })

    if (!file) {
      return res.status(404).json({ message: 'File not found or no permission' })
    }

    const updateData: any = {}
    if (originalName) updateData.originalName = originalName
    if (visibility) updateData.visibility = visibility
    if (password) updateData.password = password
    if (folderId !== undefined) updateData.folderId = folderId

    const updatedFile = await prisma.file.update({
      where: { id: fileId as string },
      data: updateData,
      include: { folder: true }
    })

    // ── Notify team when visibility changes to TEAM ───────────────────
    // This covers: new upload with TEAM visibility OR changing from PERSONAL → TEAM
    const wasNotTeam = file.visibility !== 'TEAM'
    const isNowTeam = visibility === 'TEAM'

    if (isNowTeam && wasNotTeam && file.teamId) {
      const team = await prisma.team.findUnique({
        where: { id: file.teamId },
        include: { members: true }
      })

      if (team) {
        const uploader = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true }
        })

        // Notify all team members except the uploader
        const memberIds = team.members
          .map(m => m.userId)
          .filter(id => id !== userId)

        if (memberIds.length > 0) {
          await notifyFileUploadedToTeam({
            teamMemberIds: memberIds,
            uploaderName: uploader?.name ?? 'Someone',
            fileId: fileId as string,
            fileName: updatedFile.originalName,
            teamId: file.teamId,
            teamName: team.name,
            folderId: updatedFile.folderId ?? undefined,
            folderName: updatedFile.folder?.name,
          })

          for (const uid of memberIds) {
            const notification = await prisma.notification.findFirst({
              where: { userId: uid, fileId: fileId as string, type: 'FILE_UPLOADED_TEAM' },
              orderBy: { createdAt: 'desc' },
            })
            if (notification) {
              broadcastToUser(uid, { type: 'notification', notification })
            }
          }
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────

    return res.status(200).json({ file: updatedFile })
  }

  if (req.method === 'DELETE') {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId as string,
        OR: [
          { userId },
          {
            team: {
              members: {
                some: { userId, role: { in: ['OWNER', 'ADMIN'] } }
              }
            }
          }
        ]
      }
    })

    if (!file) {
      return res.status(404).json({ message: 'File not found or no permission' })
    }

    // Delete from storage first (implement your storage deletion)
    // await deleteFromStorage(file.storageKey)

    await prisma.file.delete({
      where: { id: fileId as string }
    })

    return res.status(200).json({ message: 'File deleted' })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}