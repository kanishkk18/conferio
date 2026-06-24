


// pages/api/upload/confirm.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
// import { headObject } from '@/lib/s3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { key, taskId, commentId, type } = req.body;

    // Verify file exists in S3
    // const head = await headObject(key); // Optional: verify file was uploaded

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let attachment;

    if (type === 'task' && taskId) {
      // Verify task access
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { column: { include: { board: true } } },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const hasAccess = await prisma.board.findFirst({
        where: {
          id: task.boardId,
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      const fileUrl = `${process.env.S3_PUBLIC_URL}/${key}`;
      // Extract filename from key
      const filename = key.split('-').slice(1).join('-');

      attachment = await prisma.attachment.create({
        data: {
          filename,
          url: fileUrl,
          key, 
          mimeType: req.body.contentType,
          size: req.body.size,
          taskId,
          uploadedById: user.id,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          action: 'ATTACHED',
          entityType: 'TASK',
          entityId: taskId,
          description: `Attached file "${filename}"`,
          boardId: task.boardId,
          taskId,
          userId: user.id,
        },
      });
    } else if (type === 'comment' && commentId) {
      // Handle comment attachments
      const comment = await prisma.boardComment.findUnique({
        where: { id: commentId },
        include: { task: { include: { column: { include: { board: true } } } } },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.AWS_S3_BUCKET}/${key}`;
      const filename = key.split('-').slice(1).join('-');

      attachment = await prisma.commentAttachment.create({
        data: {
          filename,
          url: fileUrl,
          // key,
          mimeType: req.body.contentType,
          size: req.body.size,
          commentId,
        },
      });
    }

    return res.status(201).json(attachment);
  } catch (error) {
    console.error('Error confirming upload:', error);
    return res.status(500).json({ error: 'Failed to confirm upload' });
  }
}

// // pages/api/upload/confirm.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../lib/auth';
// import { prisma } from '../../../lib/prisma';
// import { generateDownloadURL, headObject } from '../../../lib/s3'; // ADD THIS

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   if (req.method !== 'POST') {
//     res.setHeader('Allow', ['POST']);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }

//   try {
//     const { key, taskId, commentId, type } = req.body;

//     // Verify file actually exists in R2 before recording it
//     try {
//       await headObject(key);
//     } catch (err) {
//       console.error('File not found in R2:', err);
//       return res.status(400).json({ error: 'File not found in storage. Upload may have failed.' });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     let attachment;

//     if (type === 'task' && taskId) {
//       const task = await prisma.task.findUnique({
//         where: { id: taskId },
//         include: { column: { include: { board: true } } },
//       });

//       if (!task) {
//         return res.status(404).json({ error: 'Task not found' });
//       }

//       const hasAccess = await prisma.board.findFirst({
//         where: {
//           id: task.boardId,
//           OR: [
//             { ownerId: user.id },
//             { members: { some: { userId: user.id } } },
//           ],
//         },
//       });

//       if (!hasAccess) {
//         return res.status(403).json({ error: 'Access denied' });
//       }

//       const filename = key.split('-').slice(1).join('-');

//       attachment = await prisma.attachment.create({
//         data: {
//           filename,
//           url: '', // Raw URLs don't work for private buckets. Use presigned URLs on fetch.
//           key,
//           mimeType: req.body.contentType,
//           size: req.body.size,
//           taskId,
//           uploadedById: user.id,
//         },
//       });

//       await prisma.activityLog.create({
//         data: {
//           action: 'ATTACHED',
//           entityType: 'TASK',
//           entityId: taskId,
//           description: `Attached file "${filename}"`,
//           boardId: task.boardId,
//           taskId,
//           userId: user.id,
//         },
//       });
//     } else if (type === 'comment' && commentId) {
//       const comment = await prisma.boardComment.findUnique({
//         where: { id: commentId },
//         include: { task: { include: { column: { include: { board: true } } } } },
//       });

//       if (!comment) {
//         return res.status(404).json({ error: 'Comment not found' });
//       }

//       const filename = key.split('-').slice(1).join('-');

//       attachment = await prisma.commentAttachment.create({
//         data: {
//           filename,
//           url: '',
//           key, // ADD THIS — needed to generate download URLs later
//           mimeType: req.body.contentType,
//           size: req.body.size,
//           commentId,
//         },
//       });
//     }

//     if (!attachment) {
//       return res.status(400).json({ error: 'Invalid attachment type' });
//     }

//     // Generate a temporary presigned URL for immediate frontend display
//     const presignedUrl = await generateDownloadURL(key, 3600); // 1 hour

//     return res.status(201).json({
//       ...attachment,
//       url: presignedUrl, // Frontend gets a working URL, but it expires
//     });

//   } catch (error) {
//     console.error('Error confirming upload:', error);
//     return res.status(500).json({ error: 'Failed to confirm upload' });
//   }
// }