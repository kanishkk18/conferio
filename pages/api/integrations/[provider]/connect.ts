// pages/api/integrations/[provider]/connect.ts
/**
 * GET /api/integrations/[provider]/connect
 * Generates a secure state token and redirects user to provider OAuth page.
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'
import {
  getGoogleAuthUrl,
  getSlackAuthUrl,
  getNotionAuthUrl,
  getJiraAuthUrl,
  getMicrosoftAuthUrl,
  getBoxAuthUrl,
  getDropboxAuthUrl,
  getSalesforceAuthUrl,
  getDiscordAuthUrl,
} from 'lib/integrations/providers'

const AUTH_URL_BUILDERS: Record<string, (state: string) => string> = {
  google:      getGoogleAuthUrl,
  slack:       getSlackAuthUrl,
  notion:      getNotionAuthUrl,
  jira:        getJiraAuthUrl,
  microsoft:   getMicrosoftAuthUrl,
  box:         getBoxAuthUrl,
  dropbox:     getDropboxAuthUrl,
  salesforce:  getSalesforceAuthUrl,
  discord:     getDiscordAuthUrl,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { provider } = req.query as { provider: string }
  const builder = AUTH_URL_BUILDERS[provider]

  if (!builder) {
    return res.status(400).json({ error: `Unknown provider: ${provider}` })
  }

  // Generate state token: userId:randomBytes (prevents CSRF)
  const state = Buffer.from(
    JSON.stringify({ userId: session.user.id, nonce: randomBytes(16).toString('hex') })
  ).toString('base64url')

  // Store state in a short-lived cookie for validation in callback
  res.setHeader('Set-Cookie', [
    `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  ])

  const authUrl = builder(state)
  res.redirect(authUrl)
  res.end()
}