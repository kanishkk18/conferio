import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { pageId } = req.query

  const links = await prisma.fileLink.findMany({
    where: { type: 'PAGE', contextId: pageId as string },
    include: {
      file: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const files = links
    .filter((l) => l.file && !l.file.isDeleted)
    .map((l) => ({
      fileLinkId: l.id,
      id: l.file!.id,
      filename: l.file!.originalName,
      url: l.file!.url,
      mimeType: l.file!.mimeType,
      size: l.file!.size,
      createdAt: l.file!.createdAt,
      user: l.file!.user,
    }))

  return res.status(200).json(files)
}