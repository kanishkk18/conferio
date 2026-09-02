// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   let session = await getServerSession(req, res, authOptions)
  

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   const { pageId } = req.query

//   if (req.method === 'GET') {
//     try {
//       const page = await prisma.page.findFirst({
//         where: {
//           id: pageId as string,
//           workspace: {
//             memberships: {
//               some: {
//                 userId: session.user.id,
//               },
//             },
//           },
//         },
//         include: {
//           author: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               image: true,
//             },
//           },
//         },
//       })

//       if (!page) {
//         return res.status(404).json({ error: 'Page not found' })
//       }

//       res.json(page)
//     } catch (error) {
//       console.error('Page fetch error:', error)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   } else if (req.method === 'PATCH') {
//     try {
//       const { title, content, emoji, coverImage } = req.body

//       // Verify page access
//       const existingPage = await prisma.page.findFirst({
//         where: {
//           id: pageId as string,
//           workspace: {
//             memberships: {
//               some: {
//                 userId: session.user.id,
//               },
//             },
//           },
//         },
//       })

//       if (!existingPage) {
//         return res.status(404).json({ error: 'Page not found' })
//       }

//       const updateData: any = {}
//       if (title !== undefined) updateData.title = title
//       if (content !== undefined) updateData.content = content
//       if (emoji !== undefined) updateData.emoji = emoji
//       if (coverImage !== undefined) updateData.coverImage = coverImage

//       const updatedPage = await prisma.page.update({
//         where: { id: pageId as string },
//         data: updateData,
//       })

//       res.json(updatedPage)
//     } catch (error) {
//       console.error('Page update error:', error)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   } else if (req.method === 'DELETE') {
//     try {
//       // Verify page access and ownership/permissions
//       const page = await prisma.page.findFirst({
//         where: {
//           id: pageId as string,
//           workspace: {
//             memberships: {
//               some: {
//                 userId: session.user.id,
//               DocRole: {
//                   in: ['OWNER', 'ADMIN', 'EDITOR'],
//                 },
//               },
//             },
//           },
//         },
//       })

//       if (!page) {
//         return res.status(404).json({ error: 'Page not found or insufficient permissions' })
//       }

//       await prisma.page.delete({
//         where: { id: pageId as string },
//       })

//       res.json({ success: true })
//     } catch (error) {
//       console.error('Page deletion error:', error)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { pageId } = req.query
  const userId = session.user.id

  // Fetch the page + resolve the requester's team membership up front
  const page = await prisma.page.findUnique({
    where: { id: pageId as string },
  })

  if (!page) {
    return res.status(404).json({ error: 'Page not found' })
  }

  const member = await prisma.teamMember.findFirst({
    where: { teamId: page.teamId, userId },
  })

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this team' })
  }

  const isAuthor = page.authorId === userId
  const isAdmin = member.role === 'ADMIN' || member.role === 'OWNER'
  const hasReadAccess =
    isAuthor || page.visibility === 'TEAM' || page.assignedToId === member.id

  if (!hasReadAccess) {
    return res.status(403).json({ error: 'No access to this page' })
  }

  if (req.method === 'GET') {
    try {
      const fullPage = await prisma.page.findUnique({
        where: { id: pageId as string },
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
          assignedTo: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
        },
      })

      res.json(fullPage)
    } catch (error) {
      console.error('Page fetch error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'PATCH') {
    try {
      const { title, content, emoji, coverImage, visibility, assignedToId } = req.body

      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (content !== undefined) updateData.content = content
      if (emoji !== undefined) updateData.emoji = emoji
      if (coverImage !== undefined) updateData.coverImage = coverImage

      // Visibility / assignment changes are gated to author or team admins
      if (visibility !== undefined) {
        if (!isAuthor && !isAdmin) {
          return res.status(403).json({ error: 'Cannot change visibility on this page' })
        }
        updateData.visibility = visibility
      }

      if (assignedToId !== undefined) {
        if (!isAuthor && !isAdmin) {
          return res.status(403).json({ error: 'Cannot reassign this page' })
        }
        if (assignedToId) {
          // Confirm assignee belongs to the same team — this assignment
          // applies to THIS page only, never to the member's other pages.
          const assignee = await prisma.teamMember.findFirst({
            where: { id: assignedToId, teamId: page.teamId },
          })
          if (!assignee) {
            return res.status(400).json({ error: 'Assignee is not a member of this team' })
          }
          updateData.assignedToId = assignedToId
          updateData.assignedById = userId
        } else {
          updateData.assignedToId = null
          updateData.assignedById = null
        }
      }

      const updatedPage = await prisma.page.update({
        where: { id: pageId as string },
        data: updateData,
      })

      res.json(updatedPage)
    } catch (error) {
      console.error('Page update error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: 'Insufficient permissions to delete this page' })
      }

      await prisma.page.delete({ where: { id: pageId as string } })

      res.json({ success: true })
    } catch (error) {
      console.error('Page deletion error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}