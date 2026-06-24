// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

//   const { id } = req.query;
//   if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

//   const user = await prisma.user.findUnique({ where: { email: session.user.email } });
//   if (!user) return res.status(404).json({ error: 'User not found' });

//   const comment = await prisma.comment.findUnique({ where: { id }, include: { task: { include: { column: { include: { board: true } } } } } });
//   if (!comment) return res.status(404).json({ error: 'Comment not found' });

//   const isAuthor = comment.userId === user.id;
//   const isAdmin = await prisma.boardMember.findFirst({ where: { boardId: comment.task.boardId, userId: user.id, role: { in: ['OWNER', 'ADMIN'] } } });
//   if (!isAuthor && !isAdmin) return res.status(403).json({ error: 'Not authorized' });

//   if (req.method === 'PUT') {
//     const { content } = req.body;
//     const updated = await prisma.comment.update({
//       where: { id },
//       data: { content },
//       include: { user: { select: { id: true, name: true, image: true } }, attachments: true },
//     });
//     return res.status(200).json(updated);
//   }

//   if (req.method === 'DELETE') {
//     await prisma.comment.delete({ where: { id } });
//     return res.status(204).end();
//   }

//   res.setHeader('Allow', ['PUT', 'DELETE']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// pages/api/comments/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const comment = await prisma.boardComment.findUnique({
    where: { id },
    include: { 
      task: { include: { column: { include: { board: true } } } },
    },
  });

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  // Only comment author or board admin/owner can edit/delete
  const isAuthor = comment.userId === user.id;
  const isAdmin = await prisma.boardMember.findFirst({
    where: {
      boardId: comment.task.boardId,
      userId: user.id,
      role: { in: ['OWNER', 'ADMIN'] },
    },
  });

  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized to modify this comment' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { content } = req.body;
        
        const updated = await prisma.boardComment.update({
          where: { id },
          data: { content },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
            attachments: true,
          },
        });

        return res.status(200).json(updated);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update comment' });
      }

    case 'DELETE':
      try {
        await prisma.comment.delete({
          where: { id },
        });

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete comment' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}