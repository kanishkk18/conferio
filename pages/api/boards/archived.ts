// pages/api/boards/archived.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (req.method === 'GET') {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ],
        isArchived: true,
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        members: { include: { user: { select: { id: true, name: true, image: true } } } },
        _count: { select: { columns: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.status(200).json(boards);
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

//   const user = await prisma.user.findUnique({ where: { email: session.user.email } });
//   if (!user) return res.status(404).json({ error: 'User not found' });

//   if (req.method === 'GET') {
//     const boards = await prisma.board.findMany({
//       where: {
//         OR: [
//           { ownerId: user.id },
//           { members: { some: { userId: user.id } } }
//         ],
//         isArchived: true,
//       },
//       include: {
//         owner: { select: { id: true, name: true, image: true } },
//         members: { include: { user: { select: { id: true, name: true, image: true } } } },
//         _count: { select: { columns: true } },
//       },
//       orderBy: { updatedAt: 'desc' },
//     });

//     return res.status(200).json(boards);
//   }

//   res.setHeader('Allow', ['GET']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// // pages/api/boards/archived.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../lib/auth';
// import { prisma } from '../../../lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email }
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   if (req.method !== 'GET') {
//     res.setHeader('Allow', ['GET']);
//     return res.status(405).end();
//   }

//   try {
//     const boards = await prisma.board.findMany({
//       where: {
//         isArchived: true,
//         OR: [
//           { ownerId: user.id },
//           { members: { some: { userId: user.id } } }
//         ]
//       },
//       include: {
//         owner: { select: { id: true, name: true, image: true } },
//         members: { 
//           include: { 
//             user: { select: { id: true, name: true, image: true } } 
//           } 
//         },
//         _count: {
//           select: {
//             tasks: true,
//             members: true
//           }
//         }
//       },
//       orderBy: {
//         updatedAt: 'desc'
//       }
//     });

//     return res.status(200).json(boards);
//   } catch (error) {
//     console.error('Error fetching archived boards:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }