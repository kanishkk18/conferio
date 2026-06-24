// lib/integrations/token-manager.ts
/**
 * Handles storing, retrieving, and refreshing OAuth tokens
 * using your existing Integration model in Prisma.
 *
 * Your Integration model already has:
 *   provider, appType, accessToken, refreshToken, expiryDate, metadata
 *
 * We map each provider+scope to an IntegrationAppType string.
 * Since your enum only has a few values, we store extras as metadata.
 */
import { prisma } from '@/lib/prisma'

export type TokenProvider =
  | 'google'
  | 'slack'
  | 'notion'
  | 'jira'
  | 'microsoft'
  | 'box'
  | 'dropbox'
  | 'salesforce'
  | 'discord'

// Map provider string → IntegrationProvider enum value
// const PROVIDER_MAP: Record<TokenProvider, string> = {
//   google:      'GOOGLE',
//   slack:       'SLACK',
//   notion:      'SLACK',      // store as SLACK (reuse), differentiated by appType
//   jira:        'MICROSOFT',  // store as MICROSOFT, differentiated by appType
//   microsoft:   'MICROSOFT',
//   box:         'DISCORD',    // store as DISCORD, differentiated by appType
//   dropbox:     'DISCORD',
//   salesforce:  'DISCORD',
//   discord:     'DISCORD',
// }

const PROVIDER_MAP: Record<TokenProvider, string> = {
  google:      'GOOGLE',
  slack:       'GOOGLE',      // ✅ reuse existing enum value
  notion:      'GOOGLE',
  jira:        'MICROSOFT',
  microsoft:   'MICROSOFT',
  box:         'MICROSOFT',
  dropbox:     'ZOOM',
  salesforce:  'ZOOM',
  discord:     'ZOOM',
}

// Maps provider → IntegrationAppType enum value
// NOTE: Until you run the migration adding NOTION, JIRA etc. to your enum,
// new providers reuse existing enum values (differentiated by provider field).
// After migration, update these to their proper values.
const APP_TYPE_MAP: Record<TokenProvider, string> = {
  google:      'GOOGLE_MEET_AND_CALENDAR',
  slack:       'SLACK',
  notion:      'NOTION',
  jira:        'JIRA',
  microsoft:   'MICROSOFT_ONEDRIVE',
  box:         'BOX',
  dropbox:     'DROPBOX',
  salesforce:  'SALESFORCE',
  discord:     'DISCORD',
}

export interface SavedToken {
  accessToken: string
  refreshToken?: string
  expiryDate?: number    // unix ms
  metadata: Record<string, unknown>
}

/**
 * Save or update an OAuth token for a user+provider.
 * Uses upsert so reconnecting overwrites the old token.
 */
export async function saveToken(
  userId: string,
  provider: TokenProvider,
  token: SavedToken
): Promise<void> {
  await prisma.integration.upsert({
    where: {
      userId_appType: {
        userId,
        appType: APP_TYPE_MAP[provider] as any,
      },
    },
    create: {
      userId,
      provider: PROVIDER_MAP[provider] as any,
      category: 'CALENDAR_AND_VIDEO_CONFERENCING' as any,
      appType: APP_TYPE_MAP[provider] as any,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken ?? null,
      expiryDate: token.expiryDate ? BigInt(token.expiryDate) : null,
      metadata: token.metadata,
      isConnected: true,
    },
    update: {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken ?? null,
      expiryDate: token.expiryDate ? BigInt(token.expiryDate) : null,
      metadata: token.metadata,
      isConnected: true,
    },
  })
}

/**
 * Get the stored token for a user+provider.
 * Returns null if not connected.
 */
export async function getToken(
  userId: string,
  provider: TokenProvider
): Promise<SavedToken | null> {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_appType: {
        userId,
        appType: APP_TYPE_MAP[provider] as any,
      },
    },
  })

  if (!integration || !integration.isConnected) return null

  return {
    accessToken: integration.accessToken,
    refreshToken: integration.refreshToken ?? undefined,
    expiryDate: integration.expiryDate ? Number(integration.expiryDate) : undefined,
    metadata: (integration.metadata as Record<string, unknown>) ?? {},
  }
}

/**
 * Disconnect a provider for a user.
 */
export async function disconnectProvider(
  userId: string,
  provider: TokenProvider
): Promise<void> {
  await prisma.integration.updateMany({
    where: {
      userId,
      appType: APP_TYPE_MAP[provider] as any,
    },
    data: {
      isConnected: false,
      accessToken: '',
      refreshToken: null,
    },
  })
}

/**
 * Check if a provider is connected for a user.
 */
export async function isConnected(
  userId: string,
  provider: TokenProvider
): Promise<boolean> {
  const token = await getToken(userId, provider)
  return !!token?.accessToken
}

/**
 * Get all connected providers for a user.
 */
export async function getConnectedProviders(userId: string): Promise<TokenProvider[]> {
  const integrations = await prisma.integration.findMany({
    where: { userId, isConnected: true },
    select: { appType: true, metadata: true },
  })

  const appTypeToProvider = Object.fromEntries(
    Object.entries(APP_TYPE_MAP).map(([p, a]) => [a, p])
  ) as Record<string, TokenProvider>

  return integrations
    .map((i: any) => appTypeToProvider[i.appType])
    .filter(Boolean)
}

/**
 * Refresh a Google access token using the refresh token.
 */
export async function refreshGoogleToken(
  userId: string
): Promise<string | null> {
  const token = await getToken(userId, 'google')
  if (!token?.refreshToken) return null

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: token.refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const data = await res.json()
  if (!data.access_token) return null

  await saveToken(userId, 'google', {
    ...token,
    accessToken: data.access_token,
    expiryDate: Date.now() + data.expires_in * 1000,
  })

  return data.access_token
}

/**
 * Get a valid (non-expired) Google access token, refreshing if needed.
 */
export async function getValidGoogleToken(userId: string): Promise<string | null> {
  const token = await getToken(userId, 'google')
  if (!token) return null

  const isExpired = token.expiryDate && token.expiryDate < Date.now() + 60_000
  if (isExpired) {
    return refreshGoogleToken(userId)
  }
  return token.accessToken
}

/**
 * Generic: get a valid Microsoft token (refresh if expired).
 */
export async function getValidMicrosoftToken(userId: string): Promise<string | null> {
  const token = await getToken(userId, 'microsoft')
  if (!token) return null

  const isExpired = token.expiryDate && token.expiryDate < Date.now() + 60_000
  if (!isExpired) return token.accessToken

  if (!token.refreshToken) return null

  const tenant = process.env.MICROSOFT_TENANT_ID ?? 'common'
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      refresh_token: token.refreshToken,
      grant_type: 'refresh_token',
      scope: 'Files.ReadWrite.All Mail.ReadWrite offline_access',
    }),
  })

  const data = await res.json()
  if (!data.access_token) return null

  await saveToken(userId, 'microsoft', {
    ...token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? token.refreshToken,
    expiryDate: Date.now() + data.expires_in * 1000,
  })

  return data.access_token
}
