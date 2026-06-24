// lib/integrations/slack/slack.ts
const SLACK_API = 'https://slack.com/api'

export interface SlackChannel {
  id: string
  name: string
  isPrivate: boolean
  memberCount: number
  topic?: string
  purpose?: string
  isMember: boolean
}

export interface SlackMessage {
  ts: string
  text: string
  userId: string
  userName?: string
  userAvatar?: string
  reactions?: { name: string; count: number }[]
  files?: { id: string; name: string; url: string; mimeType: string; size: number }[]
  isBot: boolean
  threadTs?: string
  replyCount?: number
  formattedDate: string
}

export interface SlackUser {
  id: string
  name: string
  realName: string
  email?: string
  avatar?: string
  isBot: boolean
  statusText?: string
  statusEmoji?: string
}

async function slackFetch(token: string, method: string, params: Record<string, string> = {}) {
  const url = new URL(`${SLACK_API}/${method}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error ?? `Slack ${method} failed`)
  return data
}

async function slackPost(token: string, method: string, body: Record<string, unknown>) {
  const res = await fetch(`${SLACK_API}/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error ?? `Slack ${method} failed`)
  return data
}

export async function listSlackChannels(token: string, limit = 50): Promise<SlackChannel[]> {
  const data = await slackFetch(token, 'conversations.list', {
    limit: String(limit),
    types: 'public_channel,private_channel',
    exclude_archived: 'true',
  })
  return (data.channels ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    isPrivate: c.is_private,
    memberCount: c.num_members ?? 0,
    topic: c.topic?.value,
    purpose: c.purpose?.value,
    isMember: c.is_member,
  }))
}

export async function getSlackChannelHistory(
  token: string,
  channelId: string,
  options: { limit?: number; oldest?: string; cursor?: string } = {}
): Promise<{ messages: SlackMessage[]; hasMore: boolean; nextCursor?: string }> {
  const params: Record<string, string> = {
    channel: channelId,
    limit: String(options.limit ?? 30),
  }
  if (options.oldest) params.oldest = options.oldest
  if (options.cursor) params.cursor = options.cursor

  const data = await slackFetch(token, 'conversations.history', params)

  // Batch fetch user info
  const userIds = [...new Set((data.messages ?? []).map((m: any) => m.user).filter(Boolean))] as string[]
  const userMap: Record<string, SlackUser> = {}
  await Promise.all(
    userIds.slice(0, 20).map(async (uid) => {
      try {
        const u = await getSlackUser(token, uid)
        userMap[uid] = u
      } catch {}
    })
  )

  const messages: SlackMessage[] = (data.messages ?? []).map((m: any) => ({
    ts: m.ts,
    text: m.text ?? '',
    userId: m.user ?? m.bot_id ?? '',
    userName: userMap[m.user]?.realName ?? userMap[m.user]?.name,
    userAvatar: userMap[m.user]?.avatar,
    isBot: !!m.bot_id,
    threadTs: m.thread_ts,
    replyCount: m.reply_count,
    reactions: m.reactions?.map((r: any) => ({ name: r.name, count: r.count })),
    files: m.files?.map((f: any) => ({
      id: f.id,
      name: f.name,
      url: f.url_private,
      mimeType: f.mimetype,
      size: f.size,
    })),
    formattedDate: new Date(parseFloat(m.ts) * 1000).toLocaleString(),
  }))

  return {
    messages,
    hasMore: data.has_more,
    nextCursor: data.response_metadata?.next_cursor,
  }
}

export async function getSlackUser(token: string, userId: string): Promise<SlackUser> {
  const data = await slackFetch(token, 'users.info', { user: userId })
  const u = data.user
  return {
    id: u.id,
    name: u.name,
    realName: u.real_name,
    email: u.profile?.email,
    avatar: u.profile?.image_72,
    isBot: u.is_bot,
    statusText: u.profile?.status_text,
    statusEmoji: u.profile?.status_emoji,
  }
}

export async function sendSlackMessage(
  token: string,
  channelId: string,
  text: string,
  options: { username?: string; iconEmoji?: string; threadTs?: string; blocks?: unknown[] } = {}
): Promise<{ ts: string; channel: string }> {
  const data = await slackPost(token, 'chat.postMessage', {
    channel: channelId,
    text,
    ...(options.username ? { username: options.username } : {}),
    ...(options.iconEmoji ? { icon_emoji: options.iconEmoji } : {}),
    ...(options.threadTs ? { thread_ts: options.threadTs } : {}),
    ...(options.blocks ? { blocks: options.blocks } : {}),
  })
  return { ts: data.ts, channel: data.channel }
}

export async function searchSlackMessages(
  token: string,
  query: string,
  count = 20
): Promise<SlackMessage[]> {
  const data = await slackFetch(token, 'search.messages', {
    query,
    count: String(count),
    sort: 'timestamp',
    sort_dir: 'desc',
  })
  return (data.messages?.matches ?? []).map((m: any) => ({
    ts: m.ts,
    text: m.text ?? '',
    userId: m.user ?? '',
    userName: m.username,
    userAvatar: undefined,
    isBot: false,
    formattedDate: new Date(parseFloat(m.ts) * 1000).toLocaleString(),
  }))
}

export async function listSlackDMs(token: string, limit = 20): Promise<SlackChannel[]> {
  const data = await slackFetch(token, 'conversations.list', {
    types: 'im',
    limit: String(limit),
  })
  return (data.channels ?? []).map((c: any) => ({
    id: c.id,
    name: c.user ?? c.id,
    isPrivate: true,
    memberCount: 1,
    isMember: true,
  }))
}
