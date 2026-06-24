// lib/integrations/providers.ts
/**
 * All OAuth provider configurations.
 * Each provider defines its auth URL, scopes, and metadata.
 * 
 * ENV VARS NEEDED (add to .env.local):
 * 
 * # Google (you likely already have these)
 * GOOGLE_CLIENT_ID=
 * GOOGLE_CLIENT_SECRET=
 * 
 * # Slack
 * SLACK_CLIENT_ID=
 * SLACK_CLIENT_SECRET=
 * 
 * # Notion
 * NOTION_CLIENT_ID=
 * NOTION_CLIENT_SECRET=
 * 
 * # Jira (Atlassian)
 * JIRA_CLIENT_ID=
 * JIRA_CLIENT_SECRET=
 * 
 * # Microsoft (Azure AD)
 * MICROSOFT_CLIENT_ID=
 * MICROSOFT_CLIENT_SECRET=
 * MICROSOFT_TENANT_ID=common
 * 
 * # Box
 * BOX_CLIENT_ID=
 * BOX_CLIENT_SECRET=
 * 
 * # Dropbox
 * DROPBOX_CLIENT_ID=
 * DROPBOX_CLIENT_SECRET=
 * 
 * # Salesforce
 * SALESFORCE_CLIENT_ID=
 * SALESFORCE_CLIENT_SECRET=
 * 
 * # Discord
 * DISCORD_CLIENT_ID=
 * DISCORD_CLIENT_SECRET=
 * 
 * # Base URL (your app)
 * NEXT_PUBLIC_APP_URL=http://localhost:3000
 */

import type { ProviderConfig } from 'types/integrations'

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4002'

function callbackUrl(provider: string) {
  return `${APP_URL}/api/integrations/${provider}/callback`
}

// ── OAuth URL builders ────────────────────────────────────────────────────

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: callbackUrl('google'),
    response_type: 'code',
    scope: [
      'openid', 'email', 'profile',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/calendar',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export function getSlackAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    redirect_uri: callbackUrl('slack'),
    scope: [
      'channels:read', 'channels:history',
      'chat:write', 'users:read',
      'files:read', 'files:write',
      'im:read', 'im:write', 'im:history',
    ].join(','),
    state,
  })
  return `https://slack.com/oauth/v2/authorize?${params}`
}

export function getNotionAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID!,
    redirect_uri: callbackUrl('notion'),
    response_type: 'code',
    owner: 'user',
    state,
  })
  return `https://api.notion.com/v1/oauth/authorize?${params}`
}

export function getJiraAuthUrl(state: string): string {
  const params = new URLSearchParams({
    audience: 'api.atlassian.com',
    client_id: process.env.JIRA_CLIENT_ID!,
    scope: [
      'read:jira-work', 'read:jira-user',
      'write:jira-work', 'offline_access',
    ].join(' '),
    redirect_uri: callbackUrl('jira'),
    state,
    response_type: 'code',
    prompt: 'consent',
  })
  return `https://auth.atlassian.com/authorize?${params}`
}

export function getMicrosoftAuthUrl(state: string): string {
  const tenant = process.env.MICROSOFT_TENANT_ID ?? 'common'
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: callbackUrl('microsoft'),
    scope: [
      'openid', 'email', 'profile', 'offline_access',
      'Files.ReadWrite.All',
      'Mail.ReadWrite', 'Mail.Send',
      'Chat.ReadWrite',
      'User.Read',
    ].join(' '),
    state,
    prompt: 'consent',
  })
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params}`
}

export function getBoxAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.BOX_CLIENT_ID!,
    redirect_uri: callbackUrl('box'),
    response_type: 'code',
    state,
  })
  return `https://account.box.com/api/oauth2/authorize?${params}`
}

export function getDropboxAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.DROPBOX_CLIENT_ID!,
    redirect_uri: callbackUrl('dropbox'),
    response_type: 'code',
    token_access_type: 'offline',
    state,
  })
  return `https://www.dropbox.com/oauth2/authorize?${params}`
}

export function getSalesforceAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SALESFORCE_CLIENT_ID!,
    redirect_uri: callbackUrl('salesforce'),
    response_type: 'code',
    scope: 'api refresh_token openid profile email',
    state,
  })
  return `https://login.salesforce.com/services/oauth2/authorize?${params}`
}

export function getDiscordAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: callbackUrl('discord'),
    response_type: 'code',
    scope: 'identify email guilds messages.read',
    state,
  })
  return `https://discord.com/api/oauth2/authorize?${params}`
}

// ── Token exchange helpers ────────────────────────────────────────────────

export async function exchangeGoogleCode(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: callbackUrl('google'),
      grant_type: 'authorization_code',
    }),
  })
  return res.json()
}

export async function exchangeSlackCode(code: string) {
  const res = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      redirect_uri: callbackUrl('slack'),
    }),
  })
  return res.json()
}

export async function exchangeNotionCode(code: string) {
  const credentials = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
  ).toString('base64')
  const res = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl('notion'),
    }),
  })
  return res.json()
}

export async function exchangeJiraCode(code: string) {
  const res = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      code,
      redirect_uri: callbackUrl('jira'),
    }),
  })
  return res.json()
}

export async function exchangeMicrosoftCode(code: string) {
  const tenant = process.env.MICROSOFT_TENANT_ID ?? 'common'
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code,
      redirect_uri: callbackUrl('microsoft'),
      grant_type: 'authorization_code',
    }),
  })
  return res.json()
}

export async function exchangeBoxCode(code: string) {
  const res = await fetch('https://api.box.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.BOX_CLIENT_ID!,
      client_secret: process.env.BOX_CLIENT_SECRET!,
      redirect_uri: callbackUrl('box'),
    }),
  })
  return res.json()
}

export async function exchangeDropboxCode(code: string) {
  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.DROPBOX_CLIENT_ID!,
      client_secret: process.env.DROPBOX_CLIENT_SECRET!,
      redirect_uri: callbackUrl('dropbox'),
    }),
  })
  return res.json()
}

export async function exchangeSalesforceCode(code: string) {
  const res = await fetch('https://login.salesforce.com/services/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SALESFORCE_CLIENT_ID!,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
      redirect_uri: callbackUrl('salesforce'),
      code,
    }),
  })
  return res.json()
}

export async function exchangeDiscordCode(code: string) {
  const res = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl('discord'),
    }),
  })
  return res.json()
}

// ── Provider UI metadata ──────────────────────────────────────────────────

export const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Connect Google Drive, Gmail, and Calendar',
    icon: 'https://www.google.com/favicon.ico',
    color: '#4285F4',
    category: 'productivity',
    scopes: ['drive', 'gmail', 'calendar'],
    authUrl: '/api/integrations/google/connect',
    features: [
      'Browse & share Drive files in chat',
      'Read & send Gmail from Conferio',
      'Sync Google Calendar meetings',
    ],
    docsUrl: 'https://console.cloud.google.com',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect your Slack workspace',
    icon: 'https://slack.com/favicon.ico',
    color: '#4A154B',
    category: 'communication',
    scopes: ['slack'],
    authUrl: '/api/integrations/slack/connect',
    features: [
      'Read messages from Slack channels',
      'Send messages to Slack from Conferio',
      'Search Slack in universal search',
    ],
    docsUrl: 'https://api.slack.com/apps',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Import and sync Notion pages',
    icon: 'https://www.notion.so/favicon.ico',
    color: '#000000',
    category: 'productivity',
    scopes: ['notion'],
    authUrl: '/api/integrations/notion/connect',
    features: [
      'Import Notion pages into Docs',
      'Search Notion content',
      'Sync page updates',
    ],
    docsUrl: 'https://www.notion.so/my-integrations',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Link Jira issues to tasks',
    icon: 'https://jira.atlassian.com/favicon.ico',
    color: '#0052CC',
    category: 'project',
    scopes: ['jira'],
    authUrl: '/api/integrations/jira/connect',
    features: [
      'Search Jira issues',
      'Link Jira issues to Conferio tasks',
      'Sync status updates',
    ],
    docsUrl: 'https://developer.atlassian.com',
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    description: 'Connect OneDrive, Teams, and Outlook',
    icon: 'https://microsoft.com/favicon.ico',
    color: '#00A4EF',
    category: 'productivity',
    scopes: ['onedrive', 'teams'],
    authUrl: '/api/integrations/microsoft/connect',
    features: [
      'Browse & share OneDrive files',
      'Send Teams messages',
      'Read Outlook emails',
    ],
    docsUrl: 'https://portal.azure.com',
  },
  {
    id: 'box',
    name: 'Box',
    description: 'Access and share Box files',
    icon: 'https://box.com/favicon.ico',
    color: '#0061D5',
    category: 'storage',
    scopes: ['box'],
    authUrl: '/api/integrations/box/connect',
    features: [
      'Browse Box folders',
      'Attach Box files to tasks',
      'Share Box files in chat',
    ],
    docsUrl: 'https://developer.box.com',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Access and share Dropbox files',
    icon: 'https://dropbox.com/favicon.ico',
    color: '#0061FF',
    category: 'storage',
    scopes: ['dropbox'],
    authUrl: '/api/integrations/dropbox/connect',
    features: [
      'Browse Dropbox folders',
      'Attach Dropbox files to tasks',
      'Share files in chat',
    ],
    docsUrl: 'https://dropbox.com/developers',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'View contacts, leads, and deals',
    icon: 'https://salesforce.com/favicon.ico',
    color: '#00A1E0',
    category: 'crm',
    scopes: ['salesforce'],
    authUrl: '/api/integrations/salesforce/connect',
    features: [
      'Search contacts and accounts',
      'View deals and opportunities',
      'Link CRM records to tasks',
    ],
    docsUrl: 'https://developer.salesforce.com',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Connect your Discord server',
    icon: 'https://discord.com/favicon.ico',
    color: '#5865F2',
    category: 'communication',
    scopes: ['discord'],
    authUrl: '/api/integrations/discord/connect',
    features: [
      'Read Discord messages',
      'Send notifications to Discord',
      'Search Discord in universal search',
    ],
    docsUrl: 'https://discord.com/developers',
  },
]
