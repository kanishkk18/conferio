// pages/api/integrations/[provider]/callback.ts
/**
 * GET /api/integrations/[provider]/callback
 * Handles OAuth callback for all providers.
 * Exchanges code for tokens, fetches user profile, saves to DB.
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { saveToken } from 'lib/integrations/token-manager'
import {
  exchangeGoogleCode,
  exchangeSlackCode,
  exchangeNotionCode,
  exchangeJiraCode,
  exchangeMicrosoftCode,
  exchangeBoxCode,
  exchangeDropboxCode,
  exchangeSalesforceCode,
  exchangeDiscordCode,
} from 'lib/integrations/providers'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4002'

// ── Per-provider token exchange + profile fetch ───────────────────────────

async function handleGoogle(code: string, userId: string) {
  const tokens = await exchangeGoogleCode(code)
  if (tokens.error) throw new Error(tokens.error_description ?? tokens.error)

  // Fetch Google profile
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const profile = await profileRes.json()

  await saveToken(userId, 'google', {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
    metadata: {
      accountName: profile.name,
      accountEmail: profile.email,
      accountAvatar: profile.picture,
      scopes: ['drive', 'gmail', 'calendar'],
    },
  })

  return { name: profile.name, email: profile.email }
}

async function handleSlack(code: string, userId: string) {
  const data = await exchangeSlackCode(code)
  if (!data.ok) throw new Error(data.error ?? 'Slack auth failed')

  await saveToken(userId, 'slack', {
    accessToken: data.access_token,
    refreshToken: undefined,
    metadata: {
      accountName: data.authed_user?.id,
      teamId: data.team?.id,
      teamName: data.team?.name,
      botToken: data.access_token,
      scopes: ['channels', 'messages', 'files'],
    },
  })

  return { name: data.team?.name, email: undefined }
}

async function handleNotion(code: string, userId: string) {
  const data = await exchangeNotionCode(code)
  if (data.error) throw new Error(data.error)

  await saveToken(userId, 'notion', {
    accessToken: data.access_token,
    metadata: {
      accountName: data.owner?.user?.name,
      accountEmail: data.owner?.user?.person?.email,
      workspaceId: data.workspace_id,
      workspaceName: data.workspace_name,
      workspaceIcon: data.workspace_icon,
      botId: data.bot_id,
      scopes: ['pages', 'databases'],
    },
  })

  return { name: data.workspace_name, email: data.owner?.user?.person?.email }
}

async function handleJira(code: string, userId: string) {
  const tokens = await exchangeJiraCode(code)
  if (tokens.error) throw new Error(tokens.error_description ?? tokens.error)

  // Get accessible Jira resources (cloud IDs)
  const resourcesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
    headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: 'application/json' },
  })
  const resources = await resourcesRes.json()
  const cloud = resources[0] // use first site

  await saveToken(userId, 'jira', {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
    metadata: {
      cloudId: cloud?.id,
      cloudName: cloud?.name,
      cloudUrl: cloud?.url,
      accountName: cloud?.name,
      scopes: ['issues', 'projects'],
    },
  })

  return { name: cloud?.name, email: undefined }
}

async function handleMicrosoft(code: string, userId: string) {
  const tokens = await exchangeMicrosoftCode(code)
  if (tokens.error) throw new Error(tokens.error_description ?? tokens.error)

  // Fetch Microsoft profile
  const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const profile = await profileRes.json()

  await saveToken(userId, 'microsoft', {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
    metadata: {
      accountName: profile.displayName,
      accountEmail: profile.mail ?? profile.userPrincipalName,
      userId: profile.id,
      scopes: ['onedrive', 'teams', 'outlook'],
    },
  })

  return { name: profile.displayName, email: profile.mail }
}

async function handleBox(code: string, userId: string) {
  const tokens = await exchangeBoxCode(code)
  if (tokens.error) throw new Error(tokens.error_description ?? tokens.error)

  // Fetch Box user info
  const userRes = await fetch('https://api.box.com/2.0/users/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const user = await userRes.json()

  await saveToken(userId, 'box', {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
    metadata: {
      accountName: user.name,
      accountEmail: user.login,
      boxUserId: user.id,
      scopes: ['files', 'folders'],
    },
  })

  return { name: user.name, email: user.login }
}

async function handleDropbox(code: string, userId: string) {
  const tokens = await exchangeDropboxCode(code)
  if (tokens.error) throw new Error(tokens.error_description ?? tokens.error)

  // Fetch Dropbox account info
  const accountRes = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    },
    body: 'null',
  })
  const account = await accountRes.json()

  await saveToken(userId, 'dropbox', {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    metadata: {
      accountName: account.name?.display_name,
      accountEmail: account.email,
      accountId: account.account_id,
      scopes: ['files', 'folders'],
    },
  })

  return { name: account.name?.display_name, email: account.email }
}

async function handleSalesforce(code: string, userId: string) {
  const tokens = await exchangeSalesforceCode(code)
  if (tokens.error) throw new Error(tokens.error_description ?? tokens.error)

  // Salesforce returns instance_url in the token response
  const instanceUrl = tokens.instance_url

  // Fetch user info
  const userRes = await fetch(`${instanceUrl}/services/oauth2/userinfo`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const user = await userRes.json()

  await saveToken(userId, 'salesforce', {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    metadata: {
      accountName: user.name,
      accountEmail: user.email,
      instanceUrl,
      orgId: user.organization_id,
      scopes: ['contacts', 'leads', 'opportunities'],
    },
  })

  return { name: user.name, email: user.email }
}

async function handleDiscord(code: string, userId: string) {
  const tokens = await exchangeDiscordCode(code)
  if (tokens.error) throw new Error(tokens.error_description ?? tokens.error)

  // Fetch Discord user info
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const user = await userRes.json()

  await saveToken(userId, 'discord', {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
    metadata: {
      accountName: user.username,
      accountEmail: user.email,
      discordId: user.id,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null,
      scopes: ['guilds', 'messages'],
    },
  })

  return { name: user.username, email: user.email }
}

// ── Main handler ─────────────────────────────────────────────────────────

const HANDLERS: Record<
  string,
  (code: string, userId: string) => Promise<{ name?: string; email?: string }>
> = {
  google:      handleGoogle,
  slack:       handleSlack,
  notion:      handleNotion,
  jira:        handleJira,
  microsoft:   handleMicrosoft,
  box:         handleBox,
  dropbox:     handleDropbox,
  salesforce:  handleSalesforce,
  discord:     handleDiscord,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider, code, state, error } = req.query as Record<string, string>

  // Handle provider-side errors (user denied access etc.)
  if (error) {
    console.error(`[OAuth] ${provider} error:`, error)
    return res.redirect(`${APP_URL}/settings/integrations?error=${encodeURIComponent(error)}&provider=${provider}`)
  }

  if (!code) {
    return res.redirect(`${APP_URL}/settings/integrations?error=no_code&provider=${provider}`)
  }

  // Validate state (CSRF protection)
  const storedState = req.cookies['oauth_state']
  if (!storedState || storedState !== state) {
    return res.redirect(`${APP_URL}/settings/integrations?error=invalid_state&provider=${provider}`)
  }

  // Decode userId from state
  let userId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    userId = decoded.userId
    if (!userId) throw new Error('No userId in state')
  } catch {
    return res.redirect(`${APP_URL}/settings/integrations?error=invalid_state&provider=${provider}`)
  }

  const handlerFn = HANDLERS[provider]
  if (!handlerFn) {
    return res.redirect(`${APP_URL}/settings/integrations?error=unknown_provider&provider=${provider}`)
  }

  try {
    await handlerFn(code, userId)

    // Clear state cookie
    res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; Path=/; Max-Age=0')

    return res.redirect(
      `${APP_URL}/settings/integrations?success=true&provider=${provider}`
    )
  } catch (err: any) {
    console.error(`[OAuth] ${provider} callback error:`, err.message)
    return res.redirect(
      `${APP_URL}/settings/integrations?error=${encodeURIComponent(err.message)}&provider=${provider}`
    )
  }
}