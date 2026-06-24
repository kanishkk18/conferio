// pages/api/integrations/dropbox/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getToken } from '@/lib/integrations/token-manager'
import { listDropboxFiles, shareDropboxFile, downloadDropboxFile } from '@/lib/integrations/storage/storage-providers'
import { prisma } from '@/lib/prisma'
import { UploadSource, FileVisibility } from '@prisma/client'
import { uploadFilesService } from '@/lib/services/files'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  const userId = session.user.id

  const token = await getToken(userId, 'dropbox')
  if (!token) return res.status(403).json({ error: 'Dropbox not connected', connectUrl: '/api/integrations/dropbox/connect' })

  if (req.method === 'GET') {
    const { path, search, cursor } = req.query as Record<string, string>
    try {
      const result = await listDropboxFiles(token.accessToken, path ?? '', { search, cursor })
      return res.status(200).json(result)
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method === 'POST') {
    const { action, filePath, targetTeamId } = req.body
    try {
      if (action === 'share') {
        const shareUrl = await shareDropboxFile(token.accessToken, filePath)
        return res.status(200).json({ shareUrl })
      }
      if (action === 'import') {
        const { buffer, name } = await downloadDropboxFile(token.accessToken, filePath)
        const fileObj = new File([buffer], name, { type: 'application/octet-stream' })
        const result = await uploadFilesService(userId, [fileObj], UploadSource.WEB)
        const uploadedFile = (result.data || result.files || [])[0]
        if (!uploadedFile) throw new Error('Upload failed')
        const fileRecord = await prisma.file.update({
          where: { id: uploadedFile.fileId },
          data: {
            teamId: targetTeamId ?? null,
            visibility: targetTeamId ? FileVisibility.TEAM : FileVisibility.PERSONAL,
            description: `Imported from Dropbox`,
          },
        })
        return res.status(200).json({ success: true, file: fileRecord })
      }
      return res.status(400).json({ error: 'Invalid action' })
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}