// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   let session = await getServerSession(req, res, authOptions)
  

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   if (req.method === 'GET') {
//     try {
//       const { workspaceId, tree, limit } = req.query

//       // Verify workspace access
//       const workspace = await prisma.workspace.findFirst({
//         where: {
//           id: workspaceId as string,
//           memberships: {
//             some: {
//               userId: session.user.id,
//             },
//           },
//         },
//       })

//       if (!workspace) {
//         return res.status(404).json({ error: 'Workspace not found' })
//       }

//       if (tree === 'true') {
//         // Return hierarchical structure
//         const rootPages = await prisma.page.findMany({
//           where: {
//             workspaceId: workspaceId as string,
//             parentId: null,
//           },
//           select: {
//             id: true,
//             title: true,
//             emoji: true,
//             children: {
//               select: {
//                 id: true,
//                 title: true,
//                 emoji: true,
//                 children: {
//                   select: {
//                     id: true,
//                     title: true,
//                     emoji: true,
//                   },
//                 },
//               },
//             },
//           },
//           orderBy: {
//             position: 'asc',
//           },
//         })

//         res.json(rootPages)
//       } else {
//         // Return flat list
//         const pages = await prisma.page.findMany({
//           where: {
//             workspaceId: workspaceId as string,
//           },
//           select: {
//             id: true,
//             title: true,
//             emoji: true,
//             createdAt: true,
//             updatedAt: true,
//           },
//           orderBy: {
//             updatedAt: 'desc',
//           },
//           take: limit ? parseInt(limit as string) : undefined,
//         })

//         res.json(pages)
//       }
//     } catch (error) {
//       console.error('Pages fetch error:', error)
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { teamId, tree, limit } = req.query
    const userId = session.user.id

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' })
    }

    // Verify team membership
    const member = await prisma.teamMember.findFirst({
      where: { teamId: teamId as string, userId },
    })

    if (!member) {
      return res.status(404).json({ error: 'Team not found or you are not a member' })
    }

    const accessFilter = {
      teamId: teamId as string,
      OR: [
        { visibility: 'TEAM' as const },
        { authorId: userId },
        { assignedToId: member.id },
      ],
    }

    if (tree === 'true') {
      // Hierarchical structure — note: access filter is applied at the root
      // level only, matching the original 2-level shallow tree behavior.
      const rootPages = await prisma.page.findMany({
        where: { ...accessFilter, parentId: null },
        select: {
          id: true,
          title: true,
          emoji: true,
          children: {
            select: {
              id: true,
              title: true,
              emoji: true,
              children: {
                select: {
                  id: true,
                  title: true,
                  emoji: true,
                },
              },
            },
          },
        },
        orderBy: { position: 'asc' },
      })

      res.json(rootPages)
    } else {
      // Flat list
      const pages = await prisma.page.findMany({
        where: accessFilter,
        select: {
          id: true,
          title: true,
          emoji: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit ? parseInt(limit as string) : undefined,
      })

      res.json(pages)
    }
  } catch (error) {
    console.error('Pages fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}