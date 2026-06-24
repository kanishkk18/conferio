// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { prisma } from '@/lib/prisma'
// import { authOptions } from 'lib/auth'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
  
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   const { pageId } = req.query

//   if (req.method === 'GET') {
//     try {
//       const comments = await prisma.comment.findMany({
//         where: {
//           pageId: pageId as string,
//           parentId: null, // Only top-level comments
//         },
//         include: {
//           author: {
//             select: {
//               id: true,
//               name: true,
//               image: true,
//             },
//           },
//           replies: {
//             include: {
//               author: {
//                 select: {
//                   id: true,
//                   name: true,
//                   image: true,
//                 },
//               },
//             },
//             orderBy: {
//               createdAt: 'asc',
//             },
//           },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       })

//       res.json(comments)
//     } catch (error) {
//       console.error('Error fetching comments:', error)
//       res.status(500).json({ error: 'Failed to fetch comments' })
//     }
//   }

//   else if (req.method === 'POST') {
//     const { content, parentId, blockId } = req.body

//     if (!content?.trim()) {
//       return res.status(400).json({ error: 'Content is required' })
//     }

//     try {
//       const comment = await prisma.comment.create({
//         data: {
//           content: content.trim(),
//           authorId: session.user.id,
//           pageId: pageId as string,
//           parentId: parentId || null,
//           blockId: blockId || null,
//         },
//         include: {
//           author: {
//             select: {
//               id: true,
//               name: true,
//               image: true,
//             },
//           },
//         },
//       })

//       res.json(comment)
//     } catch (error) {
//       console.error('Error creating comment:', error)
//       res.status(500).json({ error: 'Failed to create comment' })
//     }
//   }

//   else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }

// pages/api/pages/[pageId]/comments.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from 'lib/auth'
import { WorkflowEngine } from '@/lib/workflows/engine'
import type { TriggerPayload } from 'types/workflow'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { pageId } = req.query as { pageId: string }

  if (req.method === 'GET') {
    try {
      const comments = await prisma.comment.findMany({
        where: { pageId, parentId: null },
        include: {
          author: { select: { id: true, name: true, image: true } },
          replies: {
            include: { author: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      res.json(comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      res.status(500).json({ error: 'Failed to fetch comments' })
    }
  }

  else if (req.method === 'POST') {
    const { content, parentId, blockId } = req.body

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Content is required' })
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          authorId: session.user.id,
          pageId,
          parentId: parentId || null,
          blockId: blockId || null,
        },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      })

      // ── Workflow trigger ─────────────────────────────────────────────────
      if (!parentId) {
        fireWorkflow({ pageId, userId: session.user.id, userName: session.user.name ?? 'Someone', content: content.trim() })
          .catch(err => console.error('[Workflow] fire failed:', err))
      }

      res.json(comment)
    } catch (error) {
      console.error('Error creating comment:', error)
      res.status(500).json({ error: 'Failed to create comment' })
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

async function fireWorkflow({ pageId, userId, userName, content }: {
  pageId: string
  userId: string
  userName: string
  content: string
}) {
  // Page has no teamId — resolve team via workspace membership
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      authorId: true,
      teamId: true,
      workspaceId: true,
    },
  })

  if (!page) {
    console.log('[Workflow] page not found:', pageId)
    return
  }

  // Strategy 1: page has direct teamId
  let teamId = page.teamId ?? null

  // Strategy 2: resolve via workspace memberships
  if (!teamId && page.workspaceId) {
    // Find a team member who is also in this workspace
    const membership = await prisma.workspaceMembership.findFirst({
      where: { workspaceId: page.workspaceId, userId },
    })

    if (membership) {
      // Get the first team the current user belongs to
      const teamMember = await prisma.teamMember.findFirst({
        where: { userId },
        select: { teamId: true },
      })
      teamId = teamMember?.teamId ?? null
      console.log('[Workflow] Resolved teamId via workspace membership:', teamId)
    }
  }

  if (!teamId) {
    console.log('[Workflow] Could not resolve teamId for page:', pageId, 'workspaceId:', page.workspaceId)
    return
  }

  const workflows = await prisma.workflow.findMany({
    where: { trigger: 'page.comment_added', isActive: true, teamId },
  })

  console.log('[Workflow] page.comment_added — teamId:', teamId, '— workflows found:', workflows.length)

  if (workflows.length === 0) return

  const payload: TriggerPayload = {
    teamId,
    userId,
    entityId: pageId,
    entityType: 'page',
    data: {
      pageId,
      pageAuthorId: page.authorId,
      commenterId: userId,
      commenterName: userName,
      commentPreview: content.slice(0, 100),
    },
    timestamp: new Date().toISOString(),
  }

  const engine = new WorkflowEngine(prisma)
  const runIds = await engine.trigger('page.comment_added', payload)
  console.log('[Workflow] triggered runIds:', runIds)
}