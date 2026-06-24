// // lib/integrations/discord/discord.ts
// const DISCORD_API = 'https://discord.com/api/v10'

// export interface DiscordGuild {
//   id: string
//   name: string
//   icon?: string
//   memberCount?: number
//   description?: string
// }

// export interface DiscordChannel {
//   id: string
//   name: string
//   type: number   // 0=text, 2=voice, 4=category
//   topic?: string
//   guildId?: string
//   position: number
// }

// export interface DiscordMessage {
//   id: string
//   content: string
//   author: { id: string; username: string; avatar?: string; bot: boolean }
//   timestamp: string
//   editedTimestamp?: string
//   attachments: { id: string; filename: string; url: string; size: number; contentType?: string }[]
//   embeds: unknown[]
//   reactions?: { emoji: { name: string }; count: number }[]
//   referencedMessage?: { id: string; content: string; author: { username: string } }
//   formattedDate: string
// }

// function discordHeaders(token: string) {
//   return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
// }

// function avatarUrl(userId: string, hash?: string): string | undefined {
//   if (!hash) return undefined
//   return `https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=64`
// }

// function mapMessage(m: any): DiscordMessage {
//   return {
//     id: m.id,
//     content: m.content ?? '',
//     author: {
//       id: m.author.id,
//       username: m.author.username,
//       avatar: avatarUrl(m.author.id, m.author.avatar),
//       bot: m.author.bot ?? false,
//     },
//     timestamp: m.timestamp,
//     editedTimestamp: m.edited_timestamp ?? undefined,
//     attachments: (m.attachments ?? []).map((a: any) => ({
//       id: a.id, filename: a.filename, url: a.url,
//       size: a.size, contentType: a.content_type,
//     })),
//     embeds: m.embeds ?? [],
//     reactions: (m.reactions ?? []).map((r: any) => ({
//       emoji: { name: r.emoji.name }, count: r.count,
//     })),
//     referencedMessage: m.referenced_message ? {
//       id: m.referenced_message.id,
//       content: m.referenced_message.content,
//       author: { username: m.referenced_message.author?.username },
//     } : undefined,
//     formattedDate: new Date(m.timestamp).toLocaleString(),
//   }
// }

// export async function listDiscordGuilds(token: string): Promise<DiscordGuild[]> {
//   const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
//     headers: discordHeaders(token),
//   })
//   const data = await res.json()
//   if (!res.ok) throw new Error(data.message ?? 'Discord guilds fetch failed')
//   return data.map((g: any) => ({
//     id: g.id,
//     name: g.name,
//     icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64` : undefined,
//     memberCount: g.approximate_member_count,
//     description: g.description,
//   }))
// }

// export async function listDiscordChannels(
//   token: string,
//   guildId: string
// ): Promise<DiscordChannel[]> {
//   const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
//     headers: discordHeaders(token),
//   })
//   const data = await res.json()
//   if (!res.ok) throw new Error(data.message ?? 'Discord channels fetch failed')
//   return data
//     .filter((c: any) => c.type === 0) // text channels only
//     .sort((a: any, b: any) => a.position - b.position)
//     .map((c: any) => ({
//       id: c.id, name: c.name, type: c.type,
//       topic: c.topic, guildId: c.guild_id, position: c.position,
//     }))
// }

// export async function getDiscordChannelMessages(
//   token: string,
//   channelId: string,
//   options: { limit?: number; before?: string; after?: string } = {}
// ): Promise<DiscordMessage[]> {
//   const params = new URLSearchParams({ limit: String(options.limit ?? 50) })
//   if (options.before) params.set('before', options.before)
//   if (options.after) params.set('after', options.after)

//   const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages?${params}`, {
//     headers: discordHeaders(token),
//   })
//   const data = await res.json()
//   if (!res.ok) throw new Error(data.message ?? 'Discord messages fetch failed')
//   return data.map(mapMessage)
// }

// export async function sendDiscordMessage(
//   token: string,
//   channelId: string,
//   content: string,
//   options: { embed?: unknown; reference?: { messageId: string } } = {}
// ): Promise<DiscordMessage> {
//   const body: any = { content }
//   if (options.embed) body.embeds = [options.embed]
//   if (options.reference) body.message_reference = { message_id: options.reference.messageId }

//   const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
//     method: 'POST',
//     headers: discordHeaders(token),
//     body: JSON.stringify(body),
//   })
//   const data = await res.json()
//   if (!res.ok) throw new Error(data.message ?? 'Discord send failed')
//   return mapMessage(data)
// }

// export async function searchDiscordMessages(
//   token: string,
//   guildId: string,
//   query: string,
//   channelId?: string
// ): Promise<DiscordMessage[]> {
//   const params = new URLSearchParams({ content: query, limit: '25' })
//   if (channelId) params.set('channel_id', channelId)

//   const res = await fetch(`${DISCORD_API}/guilds/${guildId}/messages/search?${params}`, {
//     headers: discordHeaders(token),
//   })
//   const data = await res.json()
//   if (!res.ok) throw new Error(data.message ?? 'Discord search failed')
//   return (data.messages ?? []).flat().map(mapMessage)
// }

// lib/integrations/discord/discord.ts
const DISCORD_API = 'https://discord.com/api/v10'

export interface DiscordGuild {
  id: string
  name: string
  icon?: string
  memberCount?: number
  description?: string
}

export interface DiscordChannel {
  id: string
  name: string
  type: number
  topic?: string
  guildId?: string
  position: number
}

export interface DiscordMessage {
  id: string
  content: string
  author: { id: string; username: string; avatar?: string; bot: boolean }
  timestamp: string
  editedTimestamp?: string
  attachments: { id: string; filename: string; url: string; size: number; contentType?: string }[]
  embeds: unknown[]
  reactions?: { emoji: { name: string }; count: number }[]
  referencedMessage?: { id: string; content: string; author: { username: string } }
  formattedDate: string
}

// ── Two separate header builders ─────────────────────────────────────────

/** For user OAuth token — only for guild list */
function userHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

/** For Bot token — channels, messages, send. MUST have "Bot " prefix */
function botHeaders(token: string) {
  return { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' }
}

function avatarUrl(userId: string, hash?: string): string | undefined {
  if (!hash) return undefined
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=64`
}

function mapMessage(m: any): DiscordMessage {
  return {
    id: m.id,
    content: m.content ?? '',
    author: {
      id: m.author.id,
      username: m.author.username,
      avatar: avatarUrl(m.author.id, m.author.avatar),
      bot: m.author.bot ?? false,
    },
    timestamp: m.timestamp,
    editedTimestamp: m.edited_timestamp ?? undefined,
    attachments: (m.attachments ?? []).map((a: any) => ({
      id: a.id, filename: a.filename, url: a.url,
      size: a.size, contentType: a.content_type,
    })),
    embeds: m.embeds ?? [],
    reactions: (m.reactions ?? []).map((r: any) => ({
      emoji: { name: r.emoji.name }, count: r.count,
    })),
    referencedMessage: m.referenced_message ? {
      id: m.referenced_message.id,
      content: m.referenced_message.content,
      author: { username: m.referenced_message.author?.username },
    } : undefined,
    formattedDate: new Date(m.timestamp).toLocaleString(),
  }
}

/** List guilds — uses user OAuth Bearer token */
export async function listDiscordGuilds(userToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: userHeaders(userToken),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Discord guilds fetch failed')
  return data.map((g: any) => ({
    id: g.id,
    name: g.name,
    icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64` : undefined,
    memberCount: g.approximate_member_count,
    description: g.description,
  }))
}

/** List text channels — MUST use Bot token with "Bot " prefix */
export async function listDiscordChannels(botToken: string, guildId: string): Promise<DiscordChannel[]> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
    headers: botHeaders(botToken),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`${data.message ?? 'Discord channels failed'} (code: ${data.code ?? res.status})`)
  return data
    .filter((c: any) => c.type === 0)
    .sort((a: any, b: any) => a.position - b.position)
    .map((c: any) => ({ id: c.id, name: c.name, type: c.type, topic: c.topic, guildId: c.guild_id, position: c.position }))
}

/** Get channel messages — MUST use Bot token */
export async function getDiscordChannelMessages(
  botToken: string,
  channelId: string,
  options: { limit?: number; before?: string; after?: string } = {}
): Promise<DiscordMessage[]> {
  const params = new URLSearchParams({ limit: String(options.limit ?? 50) })
  if (options.before) params.set('before', options.before)
  if (options.after) params.set('after', options.after)
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages?${params}`, {
    headers: botHeaders(botToken),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`${data.message ?? 'Discord messages failed'} (code: ${data.code ?? res.status})`)
  return data.map(mapMessage)
}

/** Send message — MUST use Bot token */
export async function sendDiscordMessage(
  botToken: string,
  channelId: string,
  content: string,
  options: { embed?: unknown; reference?: { messageId: string } } = {}
): Promise<DiscordMessage> {
  const body: any = { content }
  if (options.embed) body.embeds = [options.embed]
  if (options.reference) body.message_reference = { message_id: options.reference.messageId }
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: botHeaders(botToken),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`${data.message ?? 'Discord send failed'} (code: ${data.code ?? res.status})`)
  return mapMessage(data)
}

/** Search messages — MUST use Bot token */
export async function searchDiscordMessages(
  botToken: string,
  guildId: string,
  query: string,
  channelId?: string
): Promise<DiscordMessage[]> {
  const params = new URLSearchParams({ content: query, limit: '25' })
  if (channelId) params.set('channel_id', channelId)
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/messages/search?${params}`, {
    headers: botHeaders(botToken),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Discord search failed')
  return (data.messages ?? []).flat().map(mapMessage)
}
