import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Resolves a FileLink's contextId into the actual record's display info,
// since FileLink doesn't have real FK relations to 5 different tables.
async function resolveContext(type: string, contextId: string) {
  switch (type) {
    case 'CHANNEL': {
      const c = await prisma.channel.findUnique({ where: { id: contextId }, select: { id: true, name: true } })
      return c ? { label: `#${c.name}`, ...c } : null
    }
    case 'PAGE': {
      const p = await prisma.page.findUnique({ where: { id: contextId }, select: { id: true, title: true } })
      return p ? { label: p.title, ...p } : null
    }
    case 'NOTE': {
      const n = await prisma.note.findUnique({ where: { id: contextId }, select: { id: true, title: true } })
      return n ? { label: n.title, ...n } : null
    }
    case 'TASK': {
      const t = await prisma.task.findUnique({ where: { id: contextId }, select: { id: true, title: true } })
      return t ? { label: t.title, ...t } : null
    }
    case 'MESSAGE': {
      const m = await prisma.message.findUnique({ where: { id: contextId }, select: { id: true, content: true } })
      return m ? { label: m.content?.slice(0, 40) || 'Message', ...m } : null
    }
    default:
      return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })

  const { fileId } = req.query

  const file = await prisma.file.findUnique({ where: { id: fileId as string } })
  if (!file || file.isDeleted) return res.status(404).json({ error: 'File not found' })

  if (req.method === 'GET') {
    const links = await prisma.fileLink.findMany({ where: { fileId: file.id } })
    const resolved = await Promise.all(
      links.map(async (l) => ({ ...l, context: await resolveContext(l.type, l.contextId) }))
    )
    return res.status(200).json(resolved)
  }

  if (req.method === 'POST') {
    const { type, contextId } = req.body as { type: string; contextId: string }
    if (!type || !contextId) return res.status(400).json({ error: 'type and contextId required' })

    const link = await prisma.fileLink.upsert({
      where: { fileId_type_contextId: { fileId: file.id, type: type as any, contextId } },
      update: {},
      create: { fileId: file.id, type: type as any, contextId, linkedById: session.user.id },
    })
    return res.status(201).json(link)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method not allowed' })
}