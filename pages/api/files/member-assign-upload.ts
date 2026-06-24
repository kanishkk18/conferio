// pages/api/files/upload.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FileVisibility, UploadSource } from '@prisma/client'
import formidable from 'formidable'
import { uploadFilesService } from '@/lib/services/files'
import fs from 'fs'
import { hash } from 'bcryptjs'
import { notifyFileUploadedToTeam, notifyFileAssigned } from '@/lib/notifications/notification.triggers'
import { broadcastToUser } from '../notifications/stream'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userId = session.user.id

    // Parse form data
    const form = formidable({ multiples: true })
    const [fields, files] = await form.parse(req)
    
    const fileList = files.files || []
    
    if (!fileList || fileList.length === 0) {
      return res.status(400).json({ message: 'No files provided' })
    }

    // Extract metadata from form fields
    const visibility = (fields.visibility?.[0] as FileVisibility) || FileVisibility.PERSONAL
    const teamId = fields.teamId?.[0] || null
    const password = fields.password?.[0] || null
    const plainPassword = fields.password?.[0] || null
    const folderId = fields.folderId?.[0] || null

    // ── FIX: parse assignTo and strip any null/empty/undefined IDs immediately ──
    const rawAssignTo: unknown[] = fields.assignTo?.[0]
      ? JSON.parse(fields.assignTo[0])
      : []
    const assignTo: string[] = rawAssignTo.filter(
      (id): id is string => typeof id === 'string' && id.trim() !== ''
    )

    // Check storage quota before uploading
    const canUpload = await checkStorageQuota(userId, teamId, fileList)
    if (!canUpload.allowed) {
      return res.status(400).json({ message: canUpload.message })
    }

    // Convert formidable files to format your existing service expects
    const formattedFiles = await Promise.all(
      fileList.map(async (file) => {
        const buffer = await fs.promises.readFile(file.filepath)
        const fileData = new File([buffer], file.originalFilename || 'unknown', {
          type: file.mimetype || 'application/octet-stream',
        })
        return fileData
      })
    )

    // Use your existing upload service (S3)
    const result = await uploadFilesService(
      userId,
      formattedFiles,
      UploadSource.WEB
    )

    const uploadedFileResults = result.data || result.files || []
    
    if (!uploadedFileResults || uploadedFileResults.length === 0) {
      throw new Error('Upload service returned no files')
    }

    // Fetch uploader info once (used in notifications)
    const uploader = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })

    // Fetch team info once if needed
    const team = teamId
      ? await prisma.team.findUnique({
          where: { id: teamId },
          include: { members: true },
        })
      : null

    const isPasswordProtected =
      visibility === FileVisibility.PASSWORD_PROTECTED && !!password

    const uploadedFiles = []
    
    for (let i = 0; i < uploadedFileResults.length; i++) {
      const uploadedFile = uploadedFileResults[i]
      const originalFile = fileList[i]

      // Hash password if provided
      let hashedPassword = null
      if (password && visibility === FileVisibility.PASSWORD_PROTECTED) {
        hashedPassword = await hash(password, 10 as string)
      }

      const fileRecord = await prisma.file.update({
        where: { id: uploadedFile.fileId },
        data: {
          visibility,
          teamId,
          password: hashedPassword,
          folderId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          folder: true,
        },
      })

      // ── FIX: only createMany when there are valid (non-null) assignees ──
      if (assignTo.length > 0) {
        await prisma.fileAssignment.createMany({
          data: assignTo.map((targetUserId) => ({
            fileId: fileRecord.id,
            userId: targetUserId,   // guaranteed non-null string by filter above
            assignedBy: userId,
          })),
        })
      }

      uploadedFiles.push(fileRecord)

      // ── Notify team members when file is uploaded with TEAM visibility ──
      if (visibility === FileVisibility.TEAM && team) {
        const memberIds = team.members
          .map((m) => m.userId)
          .filter((id): id is string => !!id && id !== userId)

        if (memberIds.length > 0) {
          await notifyFileUploadedToTeam({
            teamMemberIds: memberIds,
            uploaderName: uploader?.name ?? 'Someone',
            fileId: fileRecord.id,
            fileName: fileRecord.originalName,
            teamId: teamId!,
            teamName: team.name,
            folderId: fileRecord.folderId ?? undefined,
            folderName: fileRecord.folder?.name,
          })

          for (const uid of memberIds) {
            const notification = await prisma.notification.findFirst({
              where: { userId: uid, fileId: fileRecord.id, type: 'FILE_UPLOADED_TEAM' },
              orderBy: { createdAt: 'desc' },
            })
            if (notification) {
              broadcastToUser(uid, { type: 'notification', notification })
            }
          }
        }
      }

      // ── Notify assigned users ──────────────────────────────────────────
      // assignTo is already filtered — every id here is a valid non-empty string
      for (const targetUserId of assignTo) {
        if (targetUserId === userId) continue   // skip notifying yourself

        await notifyFileAssigned({
          assigneeUserId: targetUserId,
          assignedByName: uploader?.name ?? 'Someone',
          fileId: fileRecord.id,
          fileName: fileRecord.originalName,
          isPasswordProtected,
          filePassword: isPasswordProtected
            ? (plainPassword ?? '(contact admin for password)')
            : undefined,
        })

        const notification = await prisma.notification.findFirst({
          where: {
            userId: targetUserId,
            fileId: fileRecord.id,
            type: { in: ['FILE_ASSIGNED', 'FILE_ASSIGNED_WITH_PASSWORD'] },
          },
          orderBy: { createdAt: 'desc' },
        })
        if (notification) {
          broadcastToUser(targetUserId, { type: 'notification', notification })
        }
      }
      // ──────────────────────────────────────────────────────────────────

      // Clean up temp file
      fs.unlinkSync(originalFile.filepath)
    }

    // Update storage usage
    await updateStorageUsage(userId, teamId)

    return res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// ── Helper functions ───────────────────────────────────────────────────────────

async function checkStorageQuota(
  userId: string,
  teamId: string | null,
  files: formidable.File[]
): Promise<{ allowed: boolean; message?: string }> {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0)

  if (teamId) {
    const teamStorage = await prisma.teamStorage.findUnique({ where: { teamId } })
    if (teamStorage) {
      const newUsage = teamStorage.usedStorage + BigInt(totalSize)
      if (newUsage > teamStorage.quota) {
        return { allowed: false, message: 'Team storage quota exceeded (10GB)' }
      }
    }
  } else {
    const userStorage = await prisma.storage.findUnique({ where: { userId } })
    if (userStorage) {
      const newUsage = userStorage.storageQuota + BigInt(totalSize)
      if (newUsage > 2147483648) {
        return { allowed: false, message: 'Personal storage quota exceeded (2GB)' }
      }
    }
  }

  return { allowed: true }
}

async function updateStorageUsage(userId: string, teamId: string | null) {
  if (teamId) {
    const totalSize = await prisma.file.aggregate({
      where: { teamId },
      _sum: { size: true },
    })
    
    await prisma.teamStorage.upsert({
      where: { teamId },
      update: { usedStorage: totalSize._sum.size || BigInt(0) },
      create: {
        teamId,
        usedStorage: totalSize._sum.size || BigInt(0),
        quota: BigInt(10 * 1024 * 1024 * 1024),
      },
    })
  }
}