// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import { uploadToR2 } from 'lib/r2'

// const CAN_MANAGE_CHANNEL: string[] = ['ADMIN', 'OWNER', 'MANAGER']

// export const config = { api: { bodyParser: false } } // if you're streaming a file upload

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

//   const { teamSlug, channelId } = req.query
//   const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } })
//   if (!team) return res.status(404).json({ error: 'Team not found' })

//   const member = await prisma.teamMember.findFirst({ where: { teamId: team.id, userId: session.user.id } })
//   if (!member || !CAN_MANAGE_CHANNEL.includes(member.role)) {
//     return res.status(403).json({ error: 'Insufficient permissions' })
//   }

//   const channel = await prisma.channel.findFirst({ where: { id: channelId as string, teamId: team.id } })
//   if (!channel) return res.status(404).json({ error: 'Channel not found' })

//   // Parse the incoming file however your existing upload routes do it
//   // (multer/formidable/etc — plug into whatever Board cover upload already uses)
//   const { url, key } = await uploadToR2(req, `channels/${channel.id}`)

//   const updated = await prisma.channel.update({
//     where: { id: channel.id },
//     data: { coverImage: url, coverImageKey: key },
//   })

//   return res.status(200).json(updated)
// }

// pages/api/teams/[teamSlug]/channels/[channelId]/cover.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'

const CAN_MANAGE_CHANNEL: string[] = ['ADMIN', 'OWNER', 'MANAGER']
const MAX_SIZE = 4 * 1024 * 1024 // 4MB, same limit FileUpload uses for images
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { teamSlug, channelId } = req.query
  const team = await prisma.team.findUnique({ where: { slug: teamSlug as string } })
  if (!team) return res.status(404).json({ error: 'Team not found' })

  const member = await prisma.teamMember.findFirst({
    where: { teamId: team.id, userId: session.user.id },
  })
  if (!member || !CAN_MANAGE_CHANNEL.includes(member.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  const channel = await prisma.channel.findFirst({
    where: { id: channelId as string, teamId: team.id },
  })
  if (!channel) return res.status(404).json({ error: 'Channel not found' })

  try {
    const { fileName, fileType, fileData } = req.body as {
      fileName: string
      fileType: string
      fileData: string // data URL: "data:image/png;base64,...."
    }

    if (!fileName || !fileType || !fileData) {
      return res.status(400).json({ error: 'Missing file data' })
    }

    if (!ALLOWED_TYPES.has(fileType)) {
      return res.status(400).json({ error: 'Only JPG, PNG, GIF, or WEBP images allowed' })
    }

    const base64 = fileData.split(',')[1] ?? fileData
    const buffer = Buffer.from(base64, 'base64')

    if (buffer.byteLength > MAX_SIZE) {
      return res.status(400).json({ error: 'Image must be under 4MB' })
    }

    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `channels/${channel.id}/cover-${Date.now()}-${cleanName}`

    const url = await uploadToR2(key, buffer, fileType)

    // clean up the old cover if one existed, so R2 doesn't accumulate orphans
    if (channel.coverImageKey) {
      await deleteFromR2(channel.coverImageKey).catch(() => {
        // non-fatal — old file just lingers if this fails
      })
    }

    const updated = await prisma.channel.update({
      where: { id: channel.id },
      data: { coverImage: url, coverImageKey: key },
    })

    return res.status(200).json(updated)
  } catch (error) {
    console.error('[CHANNEL_COVER_UPLOAD]', error)
    return res.status(500).json({ error: 'Upload failed' })
  }
}