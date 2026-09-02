// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import { DEFAULT_TEST_USER, isTestMode } from '@/lib/test-user'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   let session = await getServerSession(req, res, authOptions)
  
//   // Use test user in development if enabled
//   if (isTestMode && !session) {
//     session = { user: DEFAULT_TEST_USER }
//   }

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   if (req.method === 'POST') {
//     try {
//       // Ensure user exists in database
//       let userId = session.user.id
      
//       if (isTestMode && userId === DEFAULT_TEST_USER.id) {
//         // Handle test user
//         await prisma.user.upsert({
//           where: { id: DEFAULT_TEST_USER.id },
//           update: {},
//           create: {
//             id: DEFAULT_TEST_USER.id,
//             name: DEFAULT_TEST_USER.name,
//             email: DEFAULT_TEST_USER.email,
//             image: DEFAULT_TEST_USER.image,
//           },
//         })
//       } else {
//         // Ensure real authenticated user exists (fallback for edge cases)
//         const existingUser = await prisma.user.findUnique({
//           where: { id: userId }
//         })
        
//         if (!existingUser) {
//           await prisma.user.create({
//             data: {
//               id: userId,
//               name: session.user.name || 'Unknown User',
//               email: session.user.email || '',
//               image: session.user.image,
//             },
//           })
//         }
//       }

//       const { workspaceId, parentId, title = 'Untitled' } = req.body

//       // Verify workspace access
//       const workspace = await prisma.workspace.findFirst({
//         where: {
//           id: workspaceId,
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

//       // Get position for new page
//       const lastPage = await prisma.page.findFirst({
//         where: {
//           workspaceId,
//           parentId: parentId || null,
//         },
//         orderBy: {
//           position: 'desc',
//         },
//       })

//       const position = lastPage ? lastPage.position + 1 : 0

//       const page = await prisma.page.create({
//         data: {
//           title,
//           workspaceId,
//           authorId: userId,
//           parentId: parentId || null,
//           position,
//           content: {
//             type: 'doc',
//             content: [
//               {
//                 type: 'paragraph',
//                 content: [],
//               },
//             ],
//           },
//         },
//       })

//       res.status(201).json(page)
//     } catch (error) {
//       console.error('Page creation error:', error)
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = session.user.id

    // Fallback: ensure the authenticated user exists (kept from original, minus test-user branch)
    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: userId,
          name: session.user.name || 'Unknown User',
          email: session.user.email || '',
          image: session.user.image,
        },
      })
    }

    const {
      teamId,
      parentId,
      title = 'Untitled',
      visibility = 'TEAM',       // 'TEAM' | 'PRIVATE'
      assignedToId,               // TeamMember.id, optional — single page only
    } = req.body

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' })
    }

    // Verify team membership
    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    })

    if (!member) {
      return res.status(404).json({ error: 'Team not found or you are not a member' })
    }

    // If assigning to someone, verify that person is also a member of this team
    if (assignedToId) {
      const assignee = await prisma.teamMember.findFirst({
        where: { id: assignedToId, teamId },
      })
      if (!assignee) {
        return res.status(400).json({ error: 'Assignee is not a member of this team' })
      }
    }

    // Get position for new page (scoped to team + parent)
    const lastPage = await prisma.page.findFirst({
      where: {
        teamId,
        parentId: parentId || null,
      },
      orderBy: { position: 'desc' },
    })

    const position = lastPage ? lastPage.position + 1 : 0

    const page = await prisma.page.create({
      data: {
        title,
        teamId,
        authorId: userId,
        parentId: parentId || null,
        position,
        visibility: visibility === 'PRIVATE' ? 'PRIVATE' : 'TEAM',
        assignedToId: assignedToId || null,
        assignedById: assignedToId ? userId : null,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [],
            },
          ],
        },
      },
    })

    res.status(201).json(page)
  } catch (error) {
    console.error('Page creation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}