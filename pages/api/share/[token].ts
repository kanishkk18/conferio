// import { NextApiRequest, NextApiResponse } from 'next'
// import { prisma } from '@/lib/prisma'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { token } = req.query

//   if (req.method === 'POST') {
//     try {
//       const { password } = req.body

//       const share = await prisma.share.findUnique({
//         where: { token: token as string },
//         include: {
//           page: {
//             include: {
//               author: {
//                 select: {
//                   id: true,
//                   name: true,
//                   image: true,
//                 },
//               },
//               workspace: {
//                 select: {
//                   name: true,
//                 },
//               },
//             },
//           },
//         },
//       })

//       if (!share) {
//         return res.status(404).json({ error: 'Share not found' })
//       }

//       // Check if share has expired
//       if (share.expiresAt && new Date() > share.expiresAt) {
//         return res.status(410).json({ error: 'Share has expired' })
//       }

//       // Check password if required
//       if (share.password) {
//         if (!password) {
//           return res.status(401).json({ error: 'Password required' })
//         }
//         if (password !== share.password) {
//           return res.status(403).json({ error: 'Invalid password' })
//         }
//       }

//       const response = {
//         id: share.page.id,
//         title: share.page.title,
//         content: share.page.content,
//         emoji: share.page.emoji,
//         coverImage: share.page.coverImage,
//         author: share.page.author,
//         workspace: share.page.workspace,
//         share: {
//           type: share.type,
//           expiresAt: share.expiresAt,
//           password: !!share.password,
//         },
//       }

//       res.json(response)
//     } catch (error) {
//       console.error('Share access error:', error)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }'


import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query

  if (req.method === 'POST') {
    try {
      const { password } = req.body

      const share = await prisma.share.findUnique({
        where: { token: token as string },
        include: {
          page: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              workspace: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      if (!share) {
        return res.status(404).json({ error: 'Share not found' })
      }

      // Check if share has expired
      if (share.expiresAt && new Date() > share.expiresAt) {
        return res.status(410).json({ error: 'Share has expired' })
      }

      // Check password if required
      if (share.password) {
        if (!password) {
          return res.status(401).json({ error: 'Password required' })
        }
        if (password !== share.password) {
          return res.status(403).json({ error: 'Invalid password' })
        }
      }

      // FIX: Properly serialize the content JSON
      const response = {
        id: share.page.id,
        title: share.page.title,
        content: share.page.content, // This is already JSON, will be serialized by res.json()
        emoji: share.page.emoji,
        coverImage: share.page.coverImage,
        author: share.page.author,
        workspace: share.page.workspace,
        share: {
          type: share.type,
          expiresAt: share.expiresAt,
          password: !!share.password,
        },
      }

      res.json(response)
    } catch (error) {
      console.error('Share access error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
