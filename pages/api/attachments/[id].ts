// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]';
// import { prisma } from '@/lib/prisma';
// import { deleteFile, extractKeyFromUrl } from '@/lib/s3';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

//   const { id } = req.query;
//   if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

//   const user = await prisma.user.findUnique({ where: { email: session.user.email } });
//   if (!user) return res.status(404).json({ error: 'User not found' });

//   const attachment = await prisma.attachment.findUnique({ where: { id }, include: { task: { include: { column: { include: { board: true } } } } } });
//   if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

//   const hasAccess = await prisma.board.findFirst({
//     where: { id: attachment.task.boardId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } }] },
//   });
//   if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

//   if (req.method === 'DELETE') {
//     // Delete from S3
//     try {
//       const key = extractKeyFromUrl(attachment.url);
//       await deleteFile(key);
//     } catch (error) {
//       console.error('Failed to delete from S3:', error);
//     }

//     await prisma.attachment.delete({ where: { id } });
//     await prisma.activityLog.create({
//       data: { action: 'REMOVED', entityType: 'ATTACHMENT', entityId: id, description: `Removed attachment "${attachment.filename}"`, boardId: attachment.task.boardId, taskId: attachment.taskId, userId: user.id },
//     });
//     return res.status(204).end();
//   }

//   res.setHeader('Allow', ['DELETE']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// pages/api/attachments/[id].ts
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
    return res.status(400).json({ error: 'Invalid attachment ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: { task: { include: { column: { include: { board: true } } } } },
  });

  if (!attachment) {
    return res.status(404).json({ error: 'Attachment not found' });
  }

  const hasAccess = await prisma.board.findFirst({
    where: {
      id: attachment.task.boardId,
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
      ],
    },
  });

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  switch (req.method) {
    case 'DELETE':
      try {
        await prisma.attachment.delete({
          where: { id },
        });

        await prisma.activityLog.create({
          data: {
            action: 'REMOVED',
            entityType: 'ATTACHMENT',
            entityId: id,
            description: `Removed attachment "${attachment.filename}"`,
            boardId: attachment.task.boardId,
            taskId: attachment.taskId,
            userId: user.id,
          },
        });

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete attachment' });
      }

    default:
      res.setHeader('Allow', ['DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}