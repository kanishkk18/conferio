// pages/api/integrations/notion/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getToken } from '@/lib/integrations/token-manager'
import {
  searchNotionPages, getNotionPage,
  getNotionPageBlocks, notionBlocksToPageContent,
} from '@/lib/integrations/notion/notion'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  const userId = session.user.id

  const token = await getToken(userId, 'notion')
  if (!token) return res.status(403).json({ error: 'Notion not connected', connectUrl: '/api/integrations/notion/connect' })

  if (req.method === 'GET') {
    const { search } = req.query as Record<string, string>
    try {
      const pages = await searchNotionPages(token.accessToken, search ?? '')
      return res.status(200).json({ pages })
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method === 'POST') {
    const { action, notionPageId, workspaceId, title } = req.body
    if (!notionPageId || !workspaceId) return res.status(400).json({ error: 'notionPageId and workspaceId required' })

    try {
      if (action === 'import') {
        // Fetch Notion page + blocks
        const [notionPage, blocks] = await Promise.all([
          getNotionPage(token.accessToken, notionPageId),
          getNotionPageBlocks(token.accessToken, notionPageId),
        ])

        const pageContent = notionBlocksToPageContent(blocks)

        // Create Conferio Page record
        const newPage = await prisma.page.create({
          data: {
            title: title ?? notionPage.title,
            content: pageContent,
            emoji: notionPage.icon ?? '📄',
            workspaceId,
            authorId: userId,
            visibility: 'WORKSPACE',
          },
        })

        return res.status(200).json({ success: true, page: newPage, notionSource: notionPage })
      }
      return res.status(400).json({ error: 'Invalid action' })
    } catch (e: any) { return res.status(500).json({ error: e.message }) }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}