// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import { DEFAULT_TEST_USER, isTestMode } from '@/lib/test-user'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   let session = await getServerSession(req, res, authOptions)
  
//   if (isTestMode && !session) {
//     session = { user: DEFAULT_TEST_USER }
//   }

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   const userId = session.user.id

//   if (req.method === 'GET') {
//     try {
//       const { archived, search, favorite } = req.query
      
//       let where: any = { authorId: userId }
      
//       // Filter by archived status
//       if (archived === 'true') {
//         where.isArchived = true
//       } else if (archived === 'false') {
//         where.isArchived = false
//       }
      
//       // Filter by favorites
//       if (favorite === 'true') {
//         where.favoritedBy = {
//           some: { userId }
//         }
//       }
      
//       // Search in title or content
//       if (search) {
//         where.OR = [
//           { title: { contains: search as string, mode: 'insensitive' } },
//           { content: { path: ['text'], string_contains: search as string } }
//         ]
//       }

//       const notes = await prisma.note.findMany({
//         where,
//         include: {
//           blocks: {
//             orderBy: { position: 'asc' },
//             take: 1, // Just get first block for preview
//           },
//           favoritedBy: {
//             where: { userId },
//             select: { id: true }
//           },
//           _count: {
//             select: { blocks: true }
//           }
//         },
//         orderBy: [
//           { isPinned: 'desc' },
//           { updatedAt: 'desc' }
//         ],
//       })

//       res.json(notes.map(note => ({
//         ...note,
//         isFavorite: note.favoritedBy.length > 0,
//         favoritedBy: undefined,
//         preview: note.blocks[0]?.content?.text || ''
//       })))
//     } catch (error) {
//       console.error('Notes fetch error:', error)
//       res.status(500).json({ error: 'Failed to fetch notes' })
//     }
//   } 
  
//   else if (req.method === 'POST') {
//     try {
//       // Ensure user exists
//       if (isTestMode && userId === DEFAULT_TEST_USER.id) {
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
//       }

//       const { title = 'Untitled Note', content } = req.body

//       const note = await prisma.note.create({
//         data: {
//           title,
//           authorId: userId,
//           content: content || { blocks: [] },
//           isArchived: false,
//           isPinned: false,
//         },
//         include: {
//           _count: { select: { blocks: true } }
//         }
//       })

//       res.status(201).json(note)
//     } catch (error) {
//       console.error('Note creation error:', error)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   } 
  
//   else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }


import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TEST_USER, isTestMode } from '@/lib/test-user'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getServerSession(req, res, authOptions)
  
  if (isTestMode && !session) {
    session = { user: DEFAULT_TEST_USER }
  }

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  if (req.method === 'GET') {
    try {
      const { archived, search, favorite } = req.query
      
      let where: any = { authorId: userId }
      
      // Filter by archived status
      if (archived === 'true') {
        where.isArchived = true
      } else if (archived === 'false') {
        where.isArchived = false
      }
      
      // Filter by favorites - USE "favorites" NOT "favoritedBy"
      if (favorite === 'true') {
        where.favorites = {
          some: { userId }
        }
      }
      
      // Search in title or content
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { content: { path: ['text'], string_contains: search as string } }
        ]
      }

      const notes = await prisma.note.findMany({
        where,
        include: {
          blocks: {
            orderBy: { position: 'asc' },
            take: 1,
          },
          // USE "favorites" NOT "favoritedBy"
          favorites: {
            where: { userId },
            select: { id: true }
          },
          _count: {
            select: { blocks: true }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' }
        ],
      })

      res.json(notes.map(note => ({
        ...note,
        isFavorite: note.favorites.length > 0,
        favorites: undefined,
        preview: note.blocks[0]?.content?.text || ''
      })))
    } catch (error) {
      console.error('Notes fetch error:', error)
      res.status(500).json({ error: 'Failed to fetch notes' })
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      if (isTestMode && userId === DEFAULT_TEST_USER.id) {
        await prisma.user.upsert({
          where: { id: DEFAULT_TEST_USER.id },
          update: {},
          create: {
            id: DEFAULT_TEST_USER.id,
            name: DEFAULT_TEST_USER.name,
            email: DEFAULT_TEST_USER.email,
            image: DEFAULT_TEST_USER.image,
          },
        })
      }

      const { title = 'Untitled Note', content } = req.body

      const note = await prisma.note.create({
        data: {
          title,
          authorId: userId,
          content: content || { blocks: [] },
          isArchived: false,
          isPinned: false,
        },
        include: {
          _count: { select: { blocks: true } }
        }
      })

      res.status(201).json(note)
    } catch (error) {
      console.error('Note creation error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } 
  
  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}