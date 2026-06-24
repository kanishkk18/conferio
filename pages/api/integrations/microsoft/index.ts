// pages/api/integrations/microsoft/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getValidMicrosoftToken } from '@/lib/integrations/token-manager'
import {
  listOneDriveFiles, getOneDriveFileShareLink,
  downloadOneDriveFile, listTeams, listTeamsChannels,
  getTeamsChannelMessages, sendTeamsMessage,
} from '@/lib/integrations/microsoft/microsoft'
import { prisma } from '@/lib/prisma'
import { UploadSource, FileVisibility } from '@prisma/client'
import { uploadFilesService } from '@/lib/services/files'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  const userId = session.user.id

  const accessToken = await getValidMicrosoftToken(userId)
  if (!accessToken) return res.status(403).json({ error: 'Microsoft not connected', connectUrl: '/api/integrations/microsoft/connect' })

  if (req.method === 'GET') {
    const { service, action, folderId, teamId, channelId, search } = req.query as Record<string, string>
    try {
      // OneDrive
      if (service === 'onedrive') {
        const result = await listOneDriveFiles(accessToken, folderId, { search })
        return res.status(200).json(result)
      }
      // Teams
      if (service === 'teams') {
        if (action === 'list') return res.status(200).json({ teams: await listTeams(accessToken) })
        if (action === 'channels' && teamId) return res.status(200).json({ channels: await listTeamsChannels(accessToken, teamId) })
        if (action === 'messages' && teamId && channelId) return res.status(200).json({ messages: await getTeamsChannelMessages(accessToken, teamId, channelId) })
      }
      return res.status(400).json({ error: 'Invalid params' })
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method === 'POST') {
    const { action, fileId, teamId, channelId, content, targetTeamId, targetFolderId } = req.body
    try {
      if (action === 'share') {
        const url = await getOneDriveFileShareLink(accessToken, fileId)
        return res.status(200).json({ shareUrl: url })
      }
      if (action === 'import') {
        const { buffer, mimeType, name } = await downloadOneDriveFile(accessToken, fileId)
        const fileObj = new File([buffer], name, { type: mimeType })
        const result = await uploadFilesService(userId, [fileObj], UploadSource.WEB)
        const uploadedFile = (result.data || result.files || [])[0]
        if (!uploadedFile) throw new Error('Upload failed')
        const fileRecord = await prisma.file.update({
          where: { id: uploadedFile.fileId },
          data: {
            teamId: targetTeamId ?? null,
            folderId: targetFolderId ?? null,
            visibility: targetTeamId ? FileVisibility.TEAM : FileVisibility.PERSONAL,
            description: `Imported from OneDrive: ${name}`,
          },
        })
        return res.status(200).json({ success: true, file: fileRecord })
      }
      if (action === 'teams-send' && teamId && channelId && content) {
        await sendTeamsMessage(accessToken, teamId, channelId, content)
        return res.status(200).json({ success: true })
      }
      return res.status(400).json({ error: 'Invalid action' })
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}