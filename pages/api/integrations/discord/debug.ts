// pages/api/integrations/discord/debug.ts
// DELETE THIS FILE after fixing — only for debugging
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const botToken = process.env.DISCORD_BOT_TOKEN

  // Check 1: Is the token set at all?
  if (!botToken) {
    return res.status(200).json({
      status: 'MISSING',
      message: 'DISCORD_BOT_TOKEN is not set in .env.local',
    })
  }

  // Check 2: Does it start with the right prefix?
  const tokenPreview = botToken.slice(0, 20) + '...'
  const looksValid = botToken.length > 50

  // Check 3: Test it against Discord API
  try {
    const res2 = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await res2.json()

    if (res2.status === 401) {
      return res.status(200).json({
        status: 'INVALID_TOKEN',
        message: 'Token is set but Discord says 401 Unauthorized. The token is wrong or expired.',
        hint: 'Go to Discord Developer Portal → Bot → Reset Token → copy the NEW token → update .env.local → restart dev server',
        tokenPreview,
        discordResponse: data,
      })
    }

    if (res2.ok) {
      return res.status(200).json({
        status: 'OK',
        message: 'Bot token is valid!',
        botUser: {
          id: data.id,
          username: data.username,
          discriminator: data.discriminator,
        },
        tokenPreview,
      })
    }

    return res.status(200).json({
      status: 'UNKNOWN_ERROR',
      httpStatus: res2.status,
      discordResponse: data,
      tokenPreview,
    })
  } catch (e: any) {
    return res.status(200).json({
      status: 'FETCH_ERROR',
      message: e.message,
      tokenPreview,
    })
  }
}