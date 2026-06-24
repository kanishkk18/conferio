// pages/api/integrations/google/drive/files.ts
/**
 * GET /api/integrations/google/drive/files
 *   ?folderId=root  → list files in folder
 *   ?search=query   → search all files
 *   ?recent=true    → get recently modified files
 *
 * POST /api/integrations/google/drive/files
 *   body: { action: 'share' | 'import', fileId, ... }
 *   - share: makes file public, returns shareable link
 *   - import: downloads from Drive → uploads to Conferio storage (S3)
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getValidGoogleToken } from '@/lib/integrations/token-manager'
import {
  listDriveFiles,
  searchDriveFiles,
  getRecentDriveFiles,
  shareDriveFile,
  downloadDriveFile,
  getDriveFile,
  getDriveBreadcrumb,
} from '@/lib/integrations/google/drive'
import { prisma } from '@/lib/prisma'
import { uploadFilesService } from '@/lib/services/files'
import { UploadSource, FileVisibility } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const userId = session.user.id

  const accessToken = await getValidGoogleToken(userId)
  if (!accessToken) {
    return res.status(403).json({
      error: 'Google Drive not connected',
      connectUrl: '/api/integrations/google/connect',
    })
  }

  // ── GET: list / search / recent ────────────────────────────────────────
  if (req.method === 'GET') {
    const { folderId, search, recent, pageToken } = req.query as Record<string, string>

    try {
      if (search) {
        const files = await searchDriveFiles(accessToken, search)
        return res.status(200).json({ files, type: 'search' })
      }

      if (recent === 'true') {
        const files = await getRecentDriveFiles(accessToken, 20)
        return res.status(200).json({ files, type: 'recent' })
      }

      const result = await listDriveFiles(accessToken, {
        folderId: folderId ?? 'root',
        pageToken,
      })

      const breadcrumb = await getDriveBreadcrumb(accessToken, folderId ?? 'root')

      return res.status(200).json({ ...result, breadcrumb, type: 'list' })
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── POST: share or import ──────────────────────────────────────────────
  if (req.method === 'POST') {
    const { action, fileId, teamId, folderId: targetFolderId, visibility } = req.body as {
      action: 'share' | 'import' | 'get'
      fileId: string
      teamId?: string
      folderId?: string
      visibility?: FileVisibility
    }

    if (!fileId) return res.status(400).json({ error: 'fileId required' })

    try {
      // ── action: share → return shareable link ──────────────────────
      if (action === 'share') {
        const shareUrl = await shareDriveFile(accessToken, fileId)
        const fileMeta = await getDriveFile(accessToken, fileId)
        return res.status(200).json({
          shareUrl,
          file: fileMeta,
        })
      }

      // ── action: get → return file metadata ────────────────────────
      if (action === 'get') {
        const file = await getDriveFile(accessToken, fileId)
        return res.status(200).json({ file })
      }

      // ── action: import → download from Drive, upload to S3 ────────
      if (action === 'import') {
        const fileMeta = await getDriveFile(accessToken, fileId)

        // Download from Drive
        const { buffer, exportedMimeType } = await downloadDriveFile(
          accessToken,
          fileId,
          fileMeta.mimeType
        )

        // Build a File-like object for your existing upload service
        const fileName = fileMeta.name + (
          exportedMimeType !== fileMeta.mimeType
            ? exportedMimeType.includes('wordprocessingml') ? '.docx'
            : exportedMimeType.includes('spreadsheetml') ? '.xlsx'
            : exportedMimeType.includes('presentationml') ? '.pptx'
            : ''
            : ''
        )

        const fileObj = new File([buffer], fileName, { type: exportedMimeType })

        // Use your existing upload service
        const result = await uploadFilesService(userId, [fileObj], UploadSource.WEB)
        const uploadedFileResults = result.data || result.files || [] 
        if (!uploadedFileResults.length) throw new Error('Upload failed')

        const uploadedFile = uploadedFileResults[0]

        // Update with team/folder/visibility metadata
        const fileRecord = await prisma.file.update({
          where: { id: uploadedFile.fileId },
          data: {
            teamId: teamId ?? null,
            folderId: targetFolderId ?? null,
            visibility: visibility ?? (teamId ? FileVisibility.TEAM : FileVisibility.PERSONAL),
            description: `Imported from Google Drive: ${fileMeta.name}`,
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            folder: true,
          },
        })

        return res.status(200).json({
          success: true,
          file: fileRecord,
          source: 'google_drive',
          originalDriveFile: fileMeta,
        })
      }

      return res.status(400).json({ error: 'Invalid action. Use: share | import | get' })
    } catch (err: any) {
      console.error('[Drive action error]', err)
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}