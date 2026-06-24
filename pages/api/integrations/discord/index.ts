// // pages/api/integrations/discord/index.ts
// import type { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { getToken } from '@/lib/integrations/token-manager'
// import {
//   listDiscordGuilds, listDiscordChannels,
//   getDiscordChannelMessages, sendDiscordMessage, searchDiscordMessages,
// } from '@/lib/integrations/discord/discord'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
//   const userId = session.user.id

//   const token = await getToken(userId, 'discord')
//   if (!token) return res.status(403).json({ error: 'Discord not connected', connectUrl: '/api/integrations/discord/connect' })

//   if (req.method === 'GET') {
//     const { action, guildId, channelId, search, before, limit } = req.query as Record<string, string>
//     try {
//       if (action === 'guilds') return res.status(200).json({ guilds: await listDiscordGuilds(token.accessToken) })
//       if (action === 'channels' && guildId) return res.status(200).json({ channels: await listDiscordChannels(token.accessToken, guildId) })
//       if (action === 'messages' && channelId) {
//         const messages = await getDiscordChannelMessages(token.accessToken, channelId, { before, limit: limit ? parseInt(limit) : 50 })
//         return res.status(200).json({ messages })
//       }
//       if (action === 'search' && guildId && search) {
//         const messages = await searchDiscordMessages(token.accessToken, guildId, search, channelId)
//         return res.status(200).json({ messages })
//       }
//       return res.status(400).json({ error: 'Invalid action' })
//     } catch (e: any) { return res.status(500).json({ error: e.message }) }
//   }

//   if (req.method === 'POST') {
//     const { channelId, content, embedTitle, embedDescription, embedColor, replyToId } = req.body
//     if (!channelId || !content) return res.status(400).json({ error: 'channelId and content required' })
//     try {
//       const embed = embedTitle ? { title: embedTitle, description: embedDescription, color: embedColor ?? 0x5865F2 } : undefined
//       const message = await sendDiscordMessage(token.accessToken, channelId, content, {
//         embed,
//         reference: replyToId ? { messageId: replyToId } : undefined,
//       })
//       return res.status(200).json({ success: true, message })
//     } catch (e: any) { return res.status(500).json({ error: e.message }) }
//   }

//   return res.status(405).json({ error: 'Method not allowed' })
// }

// pages/api/integrations/discord/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getToken } from '@/lib/integrations/token-manager'
import {
  listDiscordGuilds,
  listDiscordChannels,
  getDiscordChannelMessages,
  sendDiscordMessage,
  searchDiscordMessages,
} from '@/lib/integrations/discord/discord'

// Bot token for server-level operations (channels, messages)
// User OAuth token only works for: identity, guilds list
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  const userId = session.user.id

  const token = await getToken(userId, 'discord')
  if (!token) {
    return res.status(403).json({
      error: 'Discord not connected',
      connectUrl: '/api/integrations/discord/connect',
    })
  }

  if (req.method === 'GET') {
    const { action, guildId, channelId, search, before, limit } = req.query as Record<string, string>

    try {
      // Guild LIST — uses user OAuth token (works fine)
      if (action === 'guilds') {
        const guilds = await listDiscordGuilds(token.accessToken)
        return res.status(200).json({ guilds })
      }

      // CHANNELS — requires Bot token
      if (action === 'channels' && guildId) {
        if (!BOT_TOKEN) {
          return res.status(503).json({
            error: 'Discord Bot not configured. Add DISCORD_BOT_TOKEN to .env.local and invite the bot to your server.',
            setupUrl: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=68608&scope=bot`,
          })
        }
        const channels = await listDiscordChannels(BOT_TOKEN, guildId)
        return res.status(200).json({ channels })
      }

      // MESSAGES — requires Bot token
      if (action === 'messages' && channelId) {
        if (!BOT_TOKEN) {
          return res.status(503).json({
            error: 'Discord Bot not configured.',
            setupUrl: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=68608&scope=bot`,
          })
        }
        const messages = await getDiscordChannelMessages(BOT_TOKEN, channelId, {
          before,
          limit: limit ? parseInt(limit) : 50,
        })
        return res.status(200).json({ messages })
      }

      // SEARCH — requires Bot token
      if (action === 'search' && guildId && search) {
        if (!BOT_TOKEN) {
          return res.status(503).json({ error: 'Discord Bot not configured.' })
        }
        const messages = await searchDiscordMessages(BOT_TOKEN, guildId, search, channelId)
        return res.status(200).json({ messages })
      }

      return res.status(400).json({ error: 'Invalid action. Use: guilds | channels | messages | search' })
    } catch (e: any) {
      console.error('[Discord API error]', e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'POST') {
    const { channelId, content, embedTitle, embedDescription, embedColor, replyToId } = req.body

    if (!channelId || !content) {
      return res.status(400).json({ error: 'channelId and content required' })
    }

    if (!BOT_TOKEN) {
      return res.status(503).json({
        error: 'Discord Bot not configured. Add DISCORD_BOT_TOKEN to .env.local.',
        setupUrl: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=68608&scope=bot`,
      })
    }

    try {
      const embed = embedTitle
        ? { title: embedTitle, description: embedDescription, color: embedColor ?? 0x5865F2 }
        : undefined

      const message = await sendDiscordMessage(BOT_TOKEN, channelId, content, {
        embed,
        reference: replyToId ? { messageId: replyToId } : undefined,
      })

      return res.status(200).json({ success: true, message })
    } catch (e: any) {
      console.error('[Discord send error]', e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}