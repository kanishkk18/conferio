// // lib/integrations/google/gmail.ts
// /**
//  * Gmail API wrapper.
//  * All functions accept an accessToken — get via getValidGoogleToken(userId).
//  */

// export interface GmailMessage {
//   id: string
//   threadId: string
//   subject: string
//   from: { name?: string; email: string }
//   to: { name?: string; email: string }[]
//   cc?: { name?: string; email: string }[]
//   snippet: string
//   body: string         // decoded HTML or plain text
//   bodyPlain: string    // decoded plain text
//   date: string         // ISO string
//   isRead: boolean
//   isStarred: boolean
//   hasAttachments: boolean
//   attachments: GmailAttachment[]
//   labelIds: string[]
// }

// export interface GmailAttachment {
//   id: string
//   filename: string
//   mimeType: string
//   size: number
// }

// export interface GmailThread {
//   id: string
//   messages: GmailMessage[]
//   subject: string
//   snippet: string
//   messageCount: number
//   isRead: boolean
//   lastDate: string
// }

// export interface GmailListResponse {
//   messages: GmailMessage[]
//   nextPageToken?: string
//   total: number
// }

// interface SendGmailParams {
//   to: string | string[]
//   subject: string
//   body: string
//   cc?: string | string[]
//   bcc?: string | string[]
//   replyToMessageId?: string
//   threadId?: string
//   attachments?: {
//     filename: string
//     mimeType: string
//     data: string // base64 encoded
//   }[]
// }

// const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

// // ── Helpers ───────────────────────────────────────────────────────────────

// function parseEmail(raw: string): { name?: string; email: string } {
//   const match = raw.match(/^(.*?)\s*<(.+?)>$/)
//   if (match) return { name: match[1].trim().replace(/^"(.*)"$/, '$1'), email: match[2] }
//   return { email: raw.trim() }
// }

// function decodeBase64(data: string): string {
//   try {
//     return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
//   } catch {
//     return ''
//   }
// }

// function extractBody(payload: any): { html: string; plain: string } {
//   let html = ''
//   let plain = ''

//   function walk(part: any) {
//     if (!part) return

//     if (part.mimeType === 'text/html' && part.body?.data) {
//       html = decodeBase64(part.body.data)
//     } else if (part.mimeType === 'text/plain' && part.body?.data) {
//       plain = decodeBase64(part.body.data)
//     }

//     if (part.parts) {
//       for (const subpart of part.parts) walk(subpart)
//     }
//   }

//   walk(payload)
//   return { html, plain }
// }

// function extractAttachments(payload: any): GmailAttachment[] {
//   const attachments: GmailAttachment[] = []

//   function walk(part: any) {
//     if (!part) return
//     if (
//       part.filename &&
//       part.body?.attachmentId &&
//       part.mimeType !== 'text/plain' &&
//       part.mimeType !== 'text/html'
//     ) {
//       attachments.push({
//         id: part.body.attachmentId,
//         filename: part.filename,
//         mimeType: part.mimeType,
//         size: part.body.size ?? 0,
//       })
//     }
//     if (part.parts) part.parts.forEach(walk)
//   }

//   walk(payload)
//   return attachments
// }

// function getHeader(headers: any[], name: string): string {
//   return headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
// }

// function mapMessage(raw: any): GmailMessage {
//   const headers = raw.payload?.headers ?? []
//   const { html, plain } = extractBody(raw.payload)
//   const attachments = extractAttachments(raw.payload)
//   const toHeader = getHeader(headers, 'To')
//   const ccHeader = getHeader(headers, 'Cc')

//   return {
//     id: raw.id,
//     threadId: raw.threadId,
//     subject: getHeader(headers, 'Subject') || '(no subject)',
//     from: parseEmail(getHeader(headers, 'From')),
//     to: toHeader ? toHeader.split(',').map((e: string) => parseEmail(e.trim())) : [],
//     cc: ccHeader ? ccHeader.split(',').map((e: string) => parseEmail(e.trim())) : undefined,
//     snippet: raw.snippet ?? '',
//     body: html || `<pre style="font-family:inherit;white-space:pre-wrap">${plain}</pre>`,
//     bodyPlain: plain,
//     date: new Date(parseInt(raw.internalDate)).toISOString(),
//     isRead: !raw.labelIds?.includes('UNREAD'),
//     isStarred: raw.labelIds?.includes('STARRED') ?? false,
//     hasAttachments: attachments.length > 0,
//     attachments,
//     labelIds: raw.labelIds ?? [],
//   }
// }

// // ── API Functions ─────────────────────────────────────────────────────────

// /**
//  * List inbox messages.
//  */
// export async function listGmailMessages(
//   accessToken: string,
//   options: {
//     labelIds?: string[]
//     q?: string
//     pageToken?: string
//     maxResults?: number
//   } = {}
// ): Promise<GmailListResponse> {
//   const { labelIds = ['INBOX'], q, pageToken, maxResults = 20 } = options

//   const params = new URLSearchParams({
//     maxResults: String(maxResults),
//     ...(q ? { q } : {}),
//     ...(pageToken ? { pageToken } : {}),
//   })
//   for (const label of labelIds) params.append('labelIds', label)

//   // First get message list (IDs only)
//   const listRes = await fetch(`${GMAIL_API}/messages?${params}`, {
//     headers: { Authorization: `Bearer ${accessToken}` },
//   })
//   if (!listRes.ok) {
//     const err = await listRes.json()
//     throw new Error(err.error?.message ?? 'Gmail list failed')
//   }
//   const listData = await listRes.json()
//   const messageIds: string[] = (listData.messages ?? []).map((m: any) => m.id)

//   if (messageIds.length === 0) {
//     return { messages: [], nextPageToken: listData.nextPageToken, total: 0 }
//   }

//   // Batch fetch full messages
//   const messages = await Promise.all(
//     messageIds.map((id) => getGmailMessage(accessToken, id))
//   )

//   return {
//     messages,
//     nextPageToken: listData.nextPageToken,
//     total: listData.resultSizeEstimate ?? messages.length,
//   }
// }

// /**
//  * Get a single message by ID.
//  */
// export async function getGmailMessage(
//   accessToken: string,
//   messageId: string
// ): Promise<GmailMessage> {
//   const res = await fetch(`${GMAIL_API}/messages/${messageId}?format=full`, {
//     headers: { Authorization: `Bearer ${accessToken}` },
//   })
//   if (!res.ok) throw new Error(`Gmail message ${messageId} fetch failed`)
//   return mapMessage(await res.json())
// }

// /**
//  * Search messages using Gmail query syntax.
//  */
// export async function searchGmail(
//   accessToken: string,
//   query: string,
//   maxResults = 15
// ): Promise<GmailMessage[]> {
//   const result = await listGmailMessages(accessToken, { q: query, maxResults })
//   return result.messages
// }

// /**
//  * Send an email.
//  */
// export async function sendGmail(
//   accessToken: string,
//   options: {
//     to: string | string[]
//     subject: string
//     body: string        // HTML body
//     cc?: string[]
//     bcc?: string[]
//     replyToMessageId?: string
//     threadId?: string
//   }
// ): Promise<{ messageId: string; threadId: string }> {
//   const {
//     to, subject, body, cc, bcc,
//     replyToMessageId, threadId,
//   } = options

//   const toList = Array.isArray(to) ? to : [to]

//   // Build RFC 2822 raw email
//   const headers: string[] = [
//     `To: ${toList.join(', ')}`,
//     `Subject: ${subject}`,
//     'MIME-Version: 1.0',
//     'Content-Type: text/html; charset=utf-8',
//   ]
//   if (cc?.length) headers.push(`Cc: ${cc.join(', ')}`)
//   if (bcc?.length) headers.push(`Bcc: ${bcc.join(', ')}`)
//   if (replyToMessageId) headers.push(`In-Reply-To: ${replyToMessageId}`)

//   const rawEmail = [...headers, '', body].join('\r\n')
//   const encoded = Buffer.from(rawEmail).toString('base64url')

//   const body2: any = { raw: encoded }
//   if (threadId) body2.threadId = threadId

//   const res = await fetch(`${GMAIL_API}/messages/send`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(body2),
//   })

//   if (!res.ok) {
//     const err = await res.json()
//     throw new Error(err.error?.message ?? 'Gmail send failed')
//   }

//   const data = await res.json()
//   return { messageId: data.id, threadId: data.threadId }
// }

// /**
//  * Mark a message as read.
//  */
// export async function markGmailRead(accessToken: string, messageId: string): Promise<void> {
//   await fetch(`${GMAIL_API}/messages/${messageId}/modify`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
//   })
// }

// /**
//  * Star / unstar a message.
//  */
// export async function starGmailMessage(
//   accessToken: string,
//   messageId: string,
//   starred: boolean
// ): Promise<void> {
//   const body = starred
//     ? { addLabelIds: ['STARRED'] }
//     : { removeLabelIds: ['STARRED'] }

//   await fetch(`${GMAIL_API}/messages/${messageId}/modify`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(body),
//   })
// }

// /**
//  * Get unread count per label.
//  */
// export async function getGmailUnreadCount(accessToken: string): Promise<number> {
//   const res = await fetch(`${GMAIL_API}/labels/INBOX`, {
//     headers: { Authorization: `Bearer ${accessToken}` },
//   })
//   if (!res.ok) return 0
//   const data = await res.json()
//   return data.messagesUnread ?? 0
// }

// /**
//  * Download an attachment.
//  */
// export async function getGmailAttachment(
//   accessToken: string,
//   messageId: string,
//   attachmentId: string
// ): Promise<Buffer> {
//   const res = await fetch(
//     `${GMAIL_API}/messages/${messageId}/attachments/${attachmentId}`,
//     { headers: { Authorization: `Bearer ${accessToken}` } }
//   )
//   if (!res.ok) throw new Error('Gmail attachment download failed')
//   const data = await res.json()
//   return Buffer.from(data.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
// }

// lib/integrations/google/gmail.ts
/**
 * Gmail API wrapper.
 * All functions accept an accessToken — get via getValidGoogleToken(userId).
 */

export interface GmailMessage {
  id: string
  threadId: string
  subject: string
  from: { name?: string; email: string }
  to: { name?: string; email: string }[]
  cc?: { name?: string; email: string }[]
  snippet: string
  body: string         // decoded HTML or plain text
  bodyPlain: string    // decoded plain text
  date: string         // ISO string
  isRead: boolean
  isStarred: boolean
  hasAttachments: boolean
  attachments: GmailAttachment[]
  labelIds: string[]
}

export interface GmailAttachment {
  id: string
  filename: string
  mimeType: string
  size: number
}

export interface GmailThread {
  id: string
  messages: GmailMessage[]
  subject: string
  snippet: string
  messageCount: number
  isRead: boolean
  lastDate: string
}

export interface GmailListResponse {
  messages: GmailMessage[]
  nextPageToken?: string
  total: number
}

interface SendGmailParams {
  to: string | string[]
  subject: string
  body: string
  cc?: string | string[]
  bcc?: string | string[]
  replyToMessageId?: string
  threadId?: string
  attachments?: {
    filename: string
    mimeType: string
    data: string // base64 encoded
  }[]
}

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

// ── Helpers ───────────────────────────────────────────────────────────────

function parseEmail(raw: string): { name?: string; email: string } {
  const match = raw.match(/^(.*?)\s*<(.+?)>$/)
  if (match) return { name: match[1].trim().replace(/^"(.*)"$/, '$1'), email: match[2] }
  return { email: raw.trim() }
}

function decodeBase64(data: string): string {
  try {
    return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
  } catch {
    return ''
  }
}

function extractBody(payload: any): { html: string; plain: string } {
  let html = ''
  let plain = ''

  function walk(part: any) {
    if (!part) return

    if (part.mimeType === 'text/html' && part.body?.data) {
      html = decodeBase64(part.body.data)
    } else if (part.mimeType === 'text/plain' && part.body?.data) {
      plain = decodeBase64(part.body.data)
    }

    if (part.parts) {
      for (const subpart of part.parts) walk(subpart)
    }
  }

  walk(payload)
  return { html, plain }
}

function extractAttachments(payload: any): GmailAttachment[] {
  const attachments: GmailAttachment[] = []

  function walk(part: any) {
    if (!part) return
    if (
      part.filename &&
      part.body?.attachmentId &&
      part.mimeType !== 'text/plain' &&
      part.mimeType !== 'text/html'
    ) {
      attachments.push({
        id: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size ?? 0,
      })
    }
    if (part.parts) part.parts.forEach(walk)
  }

  walk(payload)
  return attachments
}

function getHeader(headers: any[], name: string): string {
  return headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

function mapMessage(raw: any): GmailMessage {
  const headers = raw.payload?.headers ?? []
  const { html, plain } = extractBody(raw.payload)
  const attachments = extractAttachments(raw.payload)
  const toHeader = getHeader(headers, 'To')
  const ccHeader = getHeader(headers, 'Cc')

  return {
    id: raw.id,
    threadId: raw.threadId,
    subject: getHeader(headers, 'Subject') || '(no subject)',
    from: parseEmail(getHeader(headers, 'From')),
    to: toHeader ? toHeader.split(',').map((e: string) => parseEmail(e.trim())) : [],
    cc: ccHeader ? ccHeader.split(',').map((e: string) => parseEmail(e.trim())) : undefined,
    snippet: raw.snippet ?? '',
    body: html || `<pre style="font-family:inherit;white-space:pre-wrap">${plain}</pre>`,
    bodyPlain: plain,
    date: new Date(parseInt(raw.internalDate)).toISOString(),
    isRead: !raw.labelIds?.includes('UNREAD'),
    isStarred: raw.labelIds?.includes('STARRED') ?? false,
    hasAttachments: attachments.length > 0,
    attachments,
    labelIds: raw.labelIds ?? [],
  }
}

// ── API Functions ─────────────────────────────────────────────────────────

/**
 * List inbox messages.
 */
export async function listGmailMessages(
  accessToken: string,
  options: {
    labelIds?: string[]
    q?: string
    pageToken?: string
    maxResults?: number
  } = {}
): Promise<GmailListResponse> {
  const { labelIds = ['INBOX'], q, pageToken, maxResults = 20 } = options

  const params = new URLSearchParams({
    maxResults: String(maxResults),
    ...(q ? { q } : {}),
    ...(pageToken ? { pageToken } : {}),
  })
  for (const label of labelIds) params.append('labelIds', label)

  // First get message list (IDs only)
  const listRes = await fetch(`${GMAIL_API}/messages?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!listRes.ok) {
    const err = await listRes.json()
    throw new Error(err.error?.message ?? 'Gmail list failed')
  }
  const listData = await listRes.json()
  const messageIds: string[] = (listData.messages ?? []).map((m: any) => m.id)

  if (messageIds.length === 0) {
    return { messages: [], nextPageToken: listData.nextPageToken, total: 0 }
  }

  // Batch fetch full messages
  const messages = await Promise.all(
    messageIds.map((id) => getGmailMessage(accessToken, id))
  )

  return {
    messages,
    nextPageToken: listData.nextPageToken,
    total: listData.resultSizeEstimate ?? messages.length,
  }
}

/**
 * Get a single message by ID.
 */
export async function getGmailMessage(
  accessToken: string,
  messageId: string
): Promise<GmailMessage> {
  const res = await fetch(`${GMAIL_API}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Gmail message ${messageId} fetch failed`)
  return mapMessage(await res.json())
}

/**
 * Search messages using Gmail query syntax.
 */
export async function searchGmail(
  accessToken: string,
  query: string,
  maxResults = 15
): Promise<GmailMessage[]> {
  const result = await listGmailMessages(accessToken, { q: query, maxResults })
  return result.messages
}

/**
 * Send an email with optional attachments.
 */
export async function sendGmail(
  accessToken: string,
  params: SendGmailParams
): Promise<{ messageId: string; threadId: string }> {
  const { to, subject, body, cc, bcc, replyToMessageId, threadId, attachments } = params

  const toList = Array.isArray(to) ? to : [to]
  const ccList = cc ? (Array.isArray(cc) ? cc : [cc]) : []
  const bccList = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : []

  // If no attachments, send simple HTML email
  if (!attachments || attachments.length === 0) {
    const headers: string[] = [
      `To: ${toList.join(', ')}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
    ]
    if (ccList.length) headers.push(`Cc: ${ccList.join(', ')}`)
    if (bccList.length) headers.push(`Bcc: ${bccList.join(', ')}`)
    if (replyToMessageId) headers.push(`In-Reply-To: ${replyToMessageId}`)

    const rawEmail = [...headers, '', body].join('\r\n')
    const encoded = Buffer.from(rawEmail).toString('base64url')

    const payload: any = { raw: encoded }
    if (threadId) payload.threadId = threadId

    const res = await fetch(`${GMAIL_API}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message ?? 'Gmail send failed')
    }

    const data = await res.json()
    return { messageId: data.id, threadId: data.threadId }
  }

  // Build multipart email with attachments
  const boundary = `----=_Part_${Math.random().toString(36).substring(2)}`

  const headers: string[] = [
    `To: ${toList.join(', ')}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
  ]
  if (ccList.length) headers.push(`Cc: ${ccList.join(', ')}`)
  if (bccList.length) headers.push(`Bcc: ${bccList.join(', ')}`)
  if (replyToMessageId) headers.push(`In-Reply-To: ${replyToMessageId}`)

  // Build parts
  const parts: string[] = []

  // HTML body part
  parts.push(
    `--${boundary}\n` +
    'Content-Type: text/html; charset="UTF-8"\n' +
    'Content-Transfer-Encoding: 7bit\n\n' +
    `${body}\n`
  )

  // Attachment parts
  for (const att of attachments) {
    // Wrap base64 at 76 chars per line (RFC 2045)
    const wrappedData = att.data.match(/.{1,76}/g)?.join('\n') || att.data
    
    parts.push(
      `--${boundary}\n` +
      `Content-Type: ${att.mimeType}; name="${att.filename}"\n` +
      `Content-Disposition: attachment; filename="${att.filename}"\n` +
      'Content-Transfer-Encoding: base64\n\n' +
      `${wrappedData}\n`
    )
  }

  // Close boundary
  parts.push(`--${boundary}--`)

  const rawEmail = [...headers, '', ...parts].join('\r\n')
  const encoded = Buffer.from(rawEmail).toString('base64url')

  const payload: any = { raw: encoded }
  if (threadId) payload.threadId = threadId

  const res = await fetch(`${GMAIL_API}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? 'Gmail send failed')
  }

  const data = await res.json()
  return { messageId: data.id, threadId: data.threadId }
}

/**
 * Mark a message as read.
 */
export async function markGmailRead(accessToken: string, messageId: string): Promise<void> {
  await fetch(`${GMAIL_API}/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
  })
}

/**
 * Star / unstar a message.
 */
export async function starGmailMessage(
  accessToken: string,
  messageId: string,
  starred: boolean
): Promise<void> {
  const body = starred
    ? { addLabelIds: ['STARRED'] }
    : { removeLabelIds: ['STARRED'] }

  await fetch(`${GMAIL_API}/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

/**
 * Get unread count per label.
 */
export async function getGmailUnreadCount(accessToken: string): Promise<number> {
  const res = await fetch(`${GMAIL_API}/labels/INBOX`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return 0
  const data = await res.json()
  return data.messagesUnread ?? 0
}

/**
 * Download an attachment.
 */
export async function getGmailAttachment(
  accessToken: string,
  messageId: string,
  attachmentId: string
): Promise<Buffer> {
  const res = await fetch(
    `${GMAIL_API}/messages/${messageId}/attachments/${attachmentId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error('Gmail attachment download failed')
  const data = await res.json()
  return Buffer.from(data.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}
