// pages/api/integrations/slack/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getToken } from '@/lib/integrations/token-manager'
import {
  listSlackChannels, getSlackChannelHistory,
  sendSlackMessage, searchSlackMessages,
} from '@/lib/integrations/slack/slack'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  const userId = session.user.id

  const token = await getToken(userId, 'slack')
  if (!token) return res.status(403).json({ error: 'Slack not connected', connectUrl: '/api/integrations/slack/connect' })
  const accessToken = token.accessToken

  if (req.method === 'GET') {
    const { action, channelId, search, cursor } = req.query as Record<string, string>
    try {
      if (action === 'channels') {
        const channels = await listSlackChannels(accessToken)
        return res.status(200).json({ channels })
      }
      if (action === 'messages' && channelId) {
        const result = await getSlackChannelHistory(accessToken, channelId, { cursor })
        return res.status(200).json(result)
      }
      if (action === 'search' && search) {
        const messages = await searchSlackMessages(accessToken, search)
        return res.status(200).json({ messages })
      }
      return res.status(400).json({ error: 'Invalid action' })
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method === 'POST') {
    const { channelId, text, username, threadTs } = req.body
    if (!channelId || !text) return res.status(400).json({ error: 'channelId and text required' })
    try {
      const result = await sendSlackMessage(accessToken, channelId, text, { username, threadTs })
      return res.status(200).json({ success: true, ...result })
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}