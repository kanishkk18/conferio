// // pages/api/files/[fileId]/assign.ts   code working perfectly but without notification
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../../../../lib/auth'
// import { prisma } from '../../../../lib/prisma'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' })
//   }

//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) {
//     return res.status(401).json({ message: 'Unauthorized' })
//   }

//   const { fileId } = req.query
//   const { userIds } = req.body // Array of user IDs to assign
//   const assignedBy = session.user.id

//   // Check if user can assign this file
//   const file = await prisma.file.findFirst({
//     where: {
//       id: fileId as string,
//       OR: [
//         { userId: assignedBy },
//         {
//           team: {
//             members: {
//               some: { userId: assignedBy, role: { in: ['OWNER', 'ADMIN'] } }
//             }
//           }
//         }
//       ]
//     }
//   })

//   if (!file) {
//     return res.status(404).json({ message: 'File not found or no permission' })
//   }

//   // Create assignments
//   await prisma.fileAssignment.createMany({
//     data: userIds.map((userId: string) => ({
//       fileId: fileId as string,
//       userId,
//       assignedBy,
//     })),
//     skipDuplicates: true,
//   })

//   return res.status(200).json({ message: 'File assigned successfully' })
// }

// pages/api/files/[fileId]/assign.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { notifyFileAssigned } from '../../../../lib/notifications/notification.triggers'
import { broadcastToUser } from '../../notifications/stream'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { fileId } = req.query
  // plainPassword is the raw password to show in notification (only pass this if file is password protected)
  const { userIds, plainPassword } = req.body
  const assignedById = session.user.id

  // Check if user can assign this file
  const file = await prisma.file.findFirst({
    where: {
      id: fileId as string,
      OR: [
        { userId: assignedById },
        {
          team: {
            members: {
              some: { userId: assignedById, role: { in: ['OWNER', 'ADMIN'] } }
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

  const assignedByUser = await prisma.user.findUnique({
    where: { id: assignedById },
    select: { name: true }
  })

  const isPasswordProtected = file.visibility === 'PASSWORD_PROTECTED' && !!file.password

  // Create assignments
  await prisma.fileAssignment.createMany({
    data: userIds.map((userId: string) => ({
      fileId: fileId as string,
      userId,
      assignedBy: assignedById,
    })),
    skipDuplicates: true,
  })

  // Notify each assigned user
  for (const userId of userIds) {
    // Skip notifying yourself
    if (userId === assignedById) continue

    await notifyFileAssigned({
      assigneeUserId: userId,
      assignedByName: assignedByUser?.name ?? 'Someone',
      fileId: fileId as string,
      fileName: file.originalName,
      isPasswordProtected,
      // Only pass plainPassword if provided in request body AND file is protected
      filePassword: isPasswordProtected ? (plainPassword ?? '(contact admin for password)') : undefined,
    })

    const notification = await prisma.notification.findFirst({
      where: {
        userId,
        fileId: fileId as string,
        type: { in: ['FILE_ASSIGNED', 'FILE_ASSIGNED_WITH_PASSWORD'] },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (notification) {
      broadcastToUser(userId, { type: 'notification', notification })
    }
  }

  return res.status(200).json({ message: 'File assigned successfully' })
}