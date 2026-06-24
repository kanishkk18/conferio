// // pages/api/integrations/google/gmail/messages.ts
// /**
//  * GET  /api/integrations/google/gmail/messages?label=INBOX&q=&page=
//  * POST /api/integrations/google/gmail/messages  { action: 'send' | 'read' | 'star' }
//  */
// import type { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { getValidGoogleToken } from '@/lib/integrations/token-manager'
// import {
//   listGmailMessages,
//   getGmailMessage,
//   sendGmail,
//   markGmailRead,
//   starGmailMessage,
//   getGmailUnreadCount,
// } from '@/lib/integrations/google/gmail'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

//   const userId = session.user.id

//   const accessToken = await getValidGoogleToken(userId)
//   if (!accessToken) {
//     return res.status(403).json({
//       error: 'Gmail not connected',
//       connectUrl: '/api/integrations/google/connect',
//     })
//   }

//   // ── GET: list or read ─────────────────────────────────────────────────
//   if (req.method === 'GET') {
//     const { label, q, pageToken, messageId, unreadCount } = req.query as Record<string, string>

//     try {
//       // Get unread count only
//       if (unreadCount === 'true') {
//         const count = await getGmailUnreadCount(accessToken)
//         return res.status(200).json({ unreadCount: count })
//       }

//       // Get a single message
//       if (messageId) {
//         const message = await getGmailMessage(accessToken, messageId)
//         // Auto-mark as read when opened
//         if (!message.isRead) {
//           await markGmailRead(accessToken, messageId).catch(() => {})
//         }
//         return res.status(200).json({ message })
//       }

//       // List messages
//       const result = await listGmailMessages(accessToken, {
//         labelIds: label ? [label] : ['INBOX'],
//         q: q || undefined,
//         pageToken: pageToken || undefined,
//         maxResults: 20,
//       })

//       return res.status(200).json(result)
//     } catch (err: any) {
//       return res.status(500).json({ error: err.message })
//     }
//   }

//   // ── POST: send / mark-read / star ─────────────────────────────────────
//   if (req.method === 'POST') {
//     const body = req.body

//     try {
//       // Send email
//       if (body.action === 'send') {
//         const { to, subject, emailBody, cc, bcc, replyToMessageId, threadId } = body

//         if (!to || !subject || !emailBody) {
//           return res.status(400).json({ error: 'to, subject, and emailBody are required' })
//         }

//         const result = await sendGmail(accessToken, {
//           to,
//           subject,
//           body: emailBody,
//           cc,
//           bcc,
//           replyToMessageId,
//           threadId,
//         })

//         return res.status(200).json({ success: true, ...result })
//       }

//       // Mark as read
//       if (body.action === 'read') {
//         if (!body.messageId) return res.status(400).json({ error: 'messageId required' })
//         await markGmailRead(accessToken, body.messageId)
//         return res.status(200).json({ success: true })
//       }

//       // Star / unstar
//       if (body.action === 'star') {
//         if (!body.messageId) return res.status(400).json({ error: 'messageId required' })
//         await starGmailMessage(accessToken, body.messageId, body.starred ?? true)
//         return res.status(200).json({ success: true })
//       }

//       return res.status(400).json({ error: 'Invalid action. Use: send | read | star' })
//     } catch (err: any) {
//       console.error('[Gmail action error]', err)
//       return res.status(500).json({ error: err.message })
//     }
//   }

//   return res.status(405).json({ error: 'Method not allowed' })
// }

// pages/api/integrations/google/gmail/messages.ts
/**
 * GET  /api/integrations/google/gmail/messages?label=INBOX&q=&page=
 * POST /api/integrations/google/gmail/messages  { action: 'send' | 'read' | 'star' | 'schedule' | 'cancel-schedule' }
 */
// import type { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { getValidGoogleToken } from '@/lib/integrations/token-manager'
// import {
//   listGmailMessages,
//   getGmailMessage,
//   sendGmail,
//   markGmailRead,
//   starGmailMessage,
//   getGmailUnreadCount,
// } from '@/lib/integrations/google/gmail'
// import { prisma } from '@/lib/prisma'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

//   const userId = session.user.id

//   const accessToken = await getValidGoogleToken(userId)
//   if (!accessToken) {
//     return res.status(403).json({
//       error: 'Gmail not connected',
//       connectUrl: '/api/integrations/google/connect',
//     })
//   }

//   // ── GET: list or read ─────────────────────────────────────────────────
//   if (req.method === 'GET') {
//     const { label, q, pageToken, messageId, unreadCount } = req.query as Record<string, string>

//     try {
//       // Get unread count only
//       if (unreadCount === 'true') {
//         const count = await getGmailUnreadCount(accessToken)
//         return res.status(200).json({ unreadCount: count })
//       }

//       // Get a single message
//       if (messageId) {
//         const message = await getGmailMessage(accessToken, messageId)
//         // Auto-mark as read when opened
//         if (!message.isRead) {
//           await markGmailRead(accessToken, messageId).catch(() => {})
//         }
//         return res.status(200).json({ message })
//       }

//       // List messages
//       const result = await listGmailMessages(accessToken, {
//         labelIds: label ? [label] : ['INBOX'],
//         q: q || undefined,
//         pageToken: pageToken || undefined,
//         maxResults: 20,
//       })

//       return res.status(200).json(result)
//     } catch (err: any) {
//       return res.status(500).json({ error: err.message })
//     }
//   }

//   // ── POST: send / schedule / mark-read / star ────────────────────────────
//   if (req.method === 'POST') {
//     const body = req.body

//     try {
//       // Send email immediately
//       if (body.action === 'send') {
//         const { to, subject, emailBody, cc, bcc, replyToMessageId, threadId } = body

//         if (!to || !subject || !emailBody) {
//           return res.status(400).json({ error: 'to, subject, and emailBody are required' })
//         }

//         const result = await sendGmail(accessToken, {
//           to,
//           subject,
//           body: emailBody,
//           cc,
//           bcc,
//           replyToMessageId,
//           threadId,
//         })

//         return res.status(200).json({ success: true, ...result })
//       }

//       // Schedule email for later
//       if (body.action === 'schedule') {
//         const { to, subject, emailBody, cc, bcc, replyToMessageId, threadId, scheduledAt } = body

//         if (!to || !subject || !emailBody) {
//           return res.status(400).json({ error: 'to, subject, and emailBody are required' })
//         }

//         if (!scheduledAt) {
//           return res.status(400).json({ error: 'scheduledAt is required for scheduling' })
//         }

//         const scheduleTime = new Date(scheduledAt)
//         if (scheduleTime <= new Date()) {
//           return res.status(400).json({ error: 'Scheduled time must be in the future' })
//         }

//         // Store in database for cron job processing
//         const scheduledEmail = await prisma.scheduledEmail.create({
//           data: {
//             userId,
//             to: Array.isArray(to) ? to : [to],
//             subject,
//             body: emailBody,
//             cc: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
//             bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
//             replyToMessageId: replyToMessageId || null,
//             threadId: threadId || null,
//             scheduledAt: scheduleTime,
//             status: 'pending',
//           },
//         })

//         return res.status(200).json({ 
//           success: true, 
//           scheduledEmailId: scheduledEmail.id,
//           scheduledAt: scheduleTime.toISOString(),
//           message: `Email scheduled for ${scheduleTime.toLocaleString()}`
//         })
//       }

//       // Cancel scheduled email
//       if (body.action === 'cancel-schedule') {
//         const { scheduledEmailId } = body
        
//         if (!scheduledEmailId) {
//           return res.status(400).json({ error: 'scheduledEmailId is required' })
//         }

//         const email = await prisma.scheduledEmail.findFirst({
//           where: { id: scheduledEmailId, userId }
//         })

//         if (!email) {
//           return res.status(404).json({ error: 'Scheduled email not found' })
//         }

//         if (email.status !== 'pending') {
//           return res.status(400).json({ error: `Cannot cancel email with status: ${email.status}` })
//         }

//         await prisma.scheduledEmail.update({
//           where: { id: scheduledEmailId },
//           data: { status: 'cancelled' }
//         })

//         return res.status(200).json({ success: true, message: 'Scheduled email cancelled' })
//       }

//       // Mark as read
//       if (body.action === 'read') {
//         if (!body.messageId) return res.status(400).json({ error: 'messageId required' })
//         await markGmailRead(accessToken, body.messageId)
//         return res.status(200).json({ success: true })
//       }

//       // Star / unstar
//       if (body.action === 'star') {
//         if (!body.messageId) return res.status(400).json({ error: 'messageId required' })
//         await starGmailMessage(accessToken, body.messageId, body.starred ?? true)
//         return res.status(200).json({ success: true })
//       }

//       return res.status(400).json({ error: 'Invalid action. Use: send | schedule | cancel-schedule | read | star' })
//     } catch (err: any) {
//       console.error('[Gmail action error]', err)
//       return res.status(500).json({ error: err.message })
//     }
//   }

//   return res.status(405).json({ error: 'Method not allowed' })
// }

// pages/api/integrations/google/gmail/messages.ts
/**
 * GET  /api/integrations/google/gmail/messages?label=INBOX&q=&page=
 * POST /api/integrations/google/gmail/messages  { action: 'send' | 'read' | 'star' | 'schedule' | 'cancel-schedule' }
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getValidGoogleToken } from '@/lib/integrations/token-manager'
import {
  listGmailMessages,
  getGmailMessage,
  sendGmail,
  markGmailRead,
  starGmailMessage,
  getGmailUnreadCount,
} from '@/lib/integrations/google/gmail'
import { prisma } from '@/lib/prisma'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { fetch as nodeFetch } from 'undici' // or use native fetch if Node 18+

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const userId = session.user.id

  const accessToken = await getValidGoogleToken(userId)
  if (!accessToken) {
    return res.status(403).json({
      error: 'Gmail not connected',
      connectUrl: '/api/integrations/google/connect',
    })
  }

  // ── GET: list or read ─────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { label, q, pageToken, messageId, unreadCount } = req.query as Record<string, string>

    try {
      if (unreadCount === 'true') {
        const count = await getGmailUnreadCount(accessToken)
        return res.status(200).json({ unreadCount: count })
      }

      if (messageId) {
        const message = await getGmailMessage(accessToken, messageId)
        if (!message.isRead) {
          await markGmailRead(accessToken, messageId).catch(() => {})
        }
        return res.status(200).json({ message })
      }

      const result = await listGmailMessages(accessToken, {
        labelIds: label ? [label] : ['INBOX'],
        q: q || undefined,
        pageToken: pageToken || undefined,
        maxResults: 20,
      })

      return res.status(200).json(result)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── POST: send / schedule / mark-read / star ────────────────────────────
  if (req.method === 'POST') {
    const body = req.body

    try {
      // Send email immediately
      if (body.action === 'send') {
        const { to, subject, emailBody, cc, bcc, replyToMessageId, threadId, attachments } = body

        if (!to || !subject || !emailBody) {
          return res.status(400).json({ error: 'to, subject, and emailBody are required' })
        }

        // Download attachments from S3 and convert to base64
        const attachmentData = await Promise.all(
          (attachments || []).map(async (att: any) => {
            try {
              // If using public S3 URL, fetch directly
              if (att.url && att.url.includes('amazonaws.com')) {
                const response = await nodeFetch(att.url)
                const buffer = Buffer.from(await response.arrayBuffer())
                return {
                  filename: att.filename,
                  mimeType: att.mimeType || 'application/octet-stream',
                  data: buffer.toString('base64'),
                }
              }
              
              // Otherwise fetch from S3 using SDK
              const response = await s3Client.send(new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET!,
                Key: att.fileId,
              }))
              
              const stream = response.Body as any
              const chunks: Buffer[] = []
              
              for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk))
              }
              
              const buffer = Buffer.concat(chunks)
              
              return {
                filename: att.filename,
                mimeType: att.mimeType || response.ContentType || 'application/octet-stream',
                data: buffer.toString('base64'),
              }
            } catch (err) {
              console.error('[Attachment Download Error]', err)
              throw new Error(`Failed to download attachment: ${att.filename}`)
            }
          })
        )

        const result = await sendGmail(accessToken, {
          to,
          subject,
          body: emailBody,
          cc,
          bcc,
          replyToMessageId,
          threadId,
          attachments: attachmentData,
        })

        return res.status(200).json({ success: true, ...result })
      }

      // Schedule email for later
      if (body.action === 'schedule') {
        const { to, subject, emailBody, cc, bcc, replyToMessageId, threadId, scheduledAt, attachments } = body

        if (!to || !subject || !emailBody) {
          return res.status(400).json({ error: 'to, subject, and emailBody are required' })
        }

        if (!scheduledAt) {
          return res.status(400).json({ error: 'scheduledAt is required for scheduling' })
        }

        const scheduleTime = new Date(scheduledAt)
        if (scheduleTime <= new Date()) {
          return res.status(400).json({ error: 'Scheduled time must be in the future' })
        }

        const scheduledEmail = await prisma.scheduledEmail.create({
          data: {
            userId,
            to: Array.isArray(to) ? to : [to],
            subject,
            body: emailBody,
            cc: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
            bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
            replyToMessageId: replyToMessageId || null,
            threadId: threadId || null,
            scheduledAt: scheduleTime,
            status: 'pending',
            attachments: attachments || [], // Store attachment metadata
          },
        })

        return res.status(200).json({ 
          success: true, 
          scheduledEmailId: scheduledEmail.id,
          scheduledAt: scheduleTime.toISOString(),
          message: `Email scheduled for ${scheduleTime.toLocaleString()}`
        })
      }

      // Cancel scheduled email
      if (body.action === 'cancel-schedule') {
        const { scheduledEmailId } = body
        
        if (!scheduledEmailId) {
          return res.status(400).json({ error: 'scheduledEmailId is required' })
        }

        const email = await prisma.scheduledEmail.findFirst({
          where: { id: scheduledEmailId, userId }
        })

        if (!email) {
          return res.status(404).json({ error: 'Scheduled email not found' })
        }

        if (email.status !== 'pending') {
          return res.status(400).json({ error: `Cannot cancel email with status: ${email.status}` })
        }

        await prisma.scheduledEmail.update({
          where: { id: scheduledEmailId },
          data: { status: 'cancelled' }
        })

        return res.status(200).json({ success: true, message: 'Scheduled email cancelled' })
      }

      // Mark as read
      if (body.action === 'read') {
        if (!body.messageId) return res.status(400).json({ error: 'messageId required' })
        await markGmailRead(accessToken, body.messageId)
        return res.status(200).json({ success: true })
      }

      // Star / unstar
      if (body.action === 'star') {
        if (!body.messageId) return res.status(400).json({ error: 'messageId required' })
        await starGmailMessage(accessToken, body.messageId, body.starred ?? true)
        return res.status(200).json({ success: true })
      }

      return res.status(400).json({ error: 'Invalid action. Use: send | schedule | cancel-schedule | read | star' })
    } catch (err: any) {
      console.error('[Gmail action error]', err)
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}