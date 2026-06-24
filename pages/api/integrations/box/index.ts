// pages/api/integrations/box/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getToken } from '@/lib/integrations/token-manager'
import { listBoxFiles, shareBoxFile, downloadBoxFile } from '@/lib/integrations/storage/storage-providers'
import { prisma } from '@/lib/prisma'
import { UploadSource, FileVisibility } from '@prisma/client'
import { uploadFilesService } from '@/lib/services/files'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  const userId = session.user.id

  const token = await getToken(userId, 'box')
  if (!token) return res.status(403).json({ error: 'Box not connected', connectUrl: '/api/integrations/box/connect' })

  if (req.method === 'GET') {
    const { folderId, search } = req.query as Record<string, string>
    try {
      const result = await listBoxFiles(token.accessToken, folderId ?? '0', { search })
      return res.status(200).json(result)
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method === 'POST') {
    const { action, fileId, fileName, targetTeamId } = req.body
    try {
      if (action === 'share') {
        const shareUrl = await shareBoxFile(token.accessToken, fileId)
        return res.status(200).json({ shareUrl })
      }
      if (action === 'import') {
        const buffer = await downloadBoxFile(token.accessToken, fileId)
        const fileObj = new File([buffer], fileName ?? 'box-file', { type: 'application/octet-stream' })
        const result = await uploadFilesService(userId, [fileObj], UploadSource.WEB)
        const uploadedFile = (result.data || result.files || [])[0]
        if (!uploadedFile) throw new Error('Upload failed')
        const fileRecord = await prisma.file.update({
          where: { id: uploadedFile.fileId },
          data: {
            teamId: targetTeamId ?? null,
            visibility: targetTeamId ? FileVisibility.TEAM : FileVisibility.PERSONAL,
            description: `Imported from Box`,
          },
        })
        return res.status(200).json({ success: true, file: fileRecord })
      }
      return res.status(400).json({ error: 'Invalid action' })
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}