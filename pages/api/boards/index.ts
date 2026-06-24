// // pages/api/boards/index.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   switch (req.method) {
//     case 'GET':
//       try {
//         const boards = await prisma.board.findMany({
//           where: {
//             OR: [
//               { ownerId: user.id },
//               { members: { some: { userId: user.id } } },
//             ],
//             isArchived: false,
//           },
//           include: {
//             owner: {
//               select: { id: true, name: true, image: true },
//             },
//             members: {
//               include: {
//                 user: {
//                   select: { id: true, name: true, image: true },
//                 },
//               },
//             },
//             _count: {
//               select: { columns: true },
//             },
//           },
//           orderBy: { updatedAt: 'desc' },
//         });
//         return res.status(200).json(boards);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to fetch boards' });
//       }

//     case 'POST':
//       try {
//         const { title, description, coverImage } = req.body;
        
//         const board = await prisma.board.create({
//           data: {
//             title,
//             description,
//             coverImage,
//             ownerId: user.id,
//             members: {
//               create: {
//                 userId: user.id,
//                 role: 'OWNER',
//               },
//             },
//           },
//           include: {
//             owner: {
//               select: { id: true, name: true, image: true },
//             },
//           },
//         });

//         // Create default columns
//         await prisma.column.createMany({
//           data: [
//             { title: 'To Do', boardId: board.id, order: 0, color: '#3b82f6' },
//             { title: 'In Progress', boardId: board.id, order: 1, color: '#f59e0b' },
//             { title: 'Done', boardId: board.id, order: 2, color: '#10b981' },
//           ],
//         });

//         // Log activity
//         await prisma.activityLog.create({
//           data: {
//             action: 'CREATED',
//             entityType: 'BOARD',
//             entityId: board.id,
//             description: `Created board "${title}"`,
//             boardId: board.id,
//             userId: user.id,
//           },
//         });

//         return res.status(201).json(board);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to create board' });
//       }

//     default:
//       res.setHeader('Allow', ['GET', 'POST']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const boards = await prisma.board.findMany({
          where: {
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id } } },
            ],
            isArchived: false,
          },
          include: {
            owner: { select: { id: true, name: true, image: true } },
            members: {
              include: { user: { select: { id: true, name: true, image: true } } },
            },
            _count: { select: { columns: true } },
          },
          orderBy: { updatedAt: 'desc' },
        });
        return res.status(200).json(boards);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch boards' });
      }

    case 'POST':
      try {
        const { title, description, coverImage } = req.body;

        const board = await prisma.board.create({
          data: {
            title,
            description,
            coverImage,
            ownerId: user.id,
            members: {
              create: { userId: user.id, role: 'OWNER' },
            },
          },
          include: {
            owner: { select: { id: true, name: true, image: true } },
          },
        });

        await prisma.column.createMany({
          data: [
            { title: 'To Do',       boardId: board.id, order: 0, color: '#3b82f6' },
            { title: 'In Progress', boardId: board.id, order: 1, color: '#f59e0b' },
            { title: 'Done',        boardId: board.id, order: 2, color: '#10b981' },
          ],
        });

        // ✅ Log board creation with creator name
        await prisma.activityLog.create({
          data: {
            action: 'CREATED',
            entityType: 'BOARD',
            entityId: board.id,
            description: `${user.name} created this board`,
            boardId: board.id,
            userId: user.id,
            metadata: {
              boardTitle: title,
              description: description ?? null,
              hasCover: !!coverImage,
            },
          },
        });

        return res.status(201).json(board);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create board' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}