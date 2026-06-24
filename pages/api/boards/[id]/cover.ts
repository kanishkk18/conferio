// // pages/api/boards/[id]/cover.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
// import { generateUploadURL, deleteFile, extractKeyFromUrl } from '@/lib/s3';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

//   const { id } = req.query;
//   if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

//   const user = await prisma.user.findUnique({ where: { email: session.user.email } });
//   if (!user) return res.status(404).json({ error: 'User not found' });

//   // Check access
//   const hasAccess = await prisma.board.findFirst({
//     where: { 
//       id, 
//       OR: [
//         { ownerId: user.id },
//         { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN'] } } } }
//       ]
//     },
//   });
//   if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

//   if (req.method === 'POST') {
//     const { type, unsplashUrl, filename, contentType } = req.body;

//     // Handle Unsplash image
//     if (type === 'unsplash' && unsplashUrl) {
//       // Validate Unsplash URL
//       if (!unsplashUrl.includes('images.unsplash.com')) {
//         return res.status(400).json({ error: 'Invalid Unsplash URL' });
//       }

//       // Delete old cover if exists (S3 only)
//       const oldBoard = await prisma.board.findUnique({ where: { id } });
//       if (oldBoard?.coverImageKey) {
//         try {
//           await deleteFile(oldBoard.coverImageKey);
//         } catch (e) {
//           console.error('Failed to delete old cover:', e);
//         }
//       }

//       const board = await prisma.board.update({
//         where: { id },
//         data: { 
//           coverImage: unsplashUrl,
//           coverImageKey: null // Unsplash images don't have S3 keys
//         },
//       });

//       await prisma.activityLog.create({
//         data: {
//           action: 'UPDATED',
//           entityType: 'BOARD',
//           entityId: id,
//           description: 'Updated board cover image (Unsplash)',
//           boardId: id,
//           userId: user.id,
//         },
//       });

//       return res.status(200).json(board);
//     }

//     // Handle local file upload (generate presigned URL)
//     if (type === 'local' && filename && contentType) {
//       const { uploadURL, fileUrl, key } = await generateUploadURL(filename, contentType);

//       return res.status(200).json({ uploadURL, fileUrl, key });
//     }

//     return res.status(400).json({ error: 'Invalid request' });
//   }

//   // Confirm local upload and save to DB
//   if (req.method === 'PUT') {
//     const { key, fileUrl } = req.body;

//     // Delete old cover if exists
//     const oldBoard = await prisma.board.findUnique({ where: { id } });
//     if (oldBoard?.coverImageKey) {
//       try {
//         await deleteFile(oldBoard.coverImageKey);
//       } catch (e) {
//         console.error('Failed to delete old cover:', e);
//       }
//     }

//     const board = await prisma.board.update({
//       where: { id },
//       data: { 
//         coverImage: fileUrl,
//         coverImageKey: key
//       },
//     });

//     await prisma.activityLog.create({
//       data: {
//         action: 'UPDATED',
//         entityType: 'BOARD',
//         entityId: id,
//         description: 'Updated board cover image',
//         boardId: id,
//         userId: user.id,
//       },
//     });

//     return res.status(200).json(board);
//   }

//   // Delete cover image
//   if (req.method === 'DELETE') {
//     const board = await prisma.board.findUnique({ where: { id } });
    
//     if (board?.coverImageKey) {
//       try {
//         await deleteFile(board.coverImageKey);
//       } catch (e) {
//         console.error('Failed to delete cover from S3:', e);
//       }
//     }

//     const updated = await prisma.board.update({
//       where: { id },
//       data: { coverImage: null, coverImageKey: null },
//     });

//     return res.status(200).json(updated);
//   }

//   res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { generateUploadURL, deleteFile } from '../../../../lib/s3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Check admin/owner access
  const hasAccess = await prisma.board.findFirst({
    where: { 
      id, 
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN'] } } } }
      ]
    },
  });
  if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

  // POST - Handle Unsplash or get presigned URL for local upload
  if (req.method === 'POST') {
    const { type, unsplashUrl, filename, contentType } = req.body;

    // Handle Unsplash image
    if (type === 'unsplash' && unsplashUrl) {
      if (!unsplashUrl.includes('images.unsplash.com')) {
        return res.status(400).json({ error: 'Invalid Unsplash URL' });
      }

      // Delete old cover if exists (S3 only)
      const oldBoard = await prisma.board.findUnique({ where: { id } });
      if (oldBoard?.coverImageKey) {
        try {
          await deleteFile(oldBoard.coverImageKey);
        } catch (e) {
          console.error('Failed to delete old cover:', e);
        }
      }

      const board = await prisma.board.update({
        where: { id },
        data: { 
          coverImage: unsplashUrl,
          coverImageKey: null 
        },
      });

      await prisma.activityLog.create({
        data: {
          action: 'UPDATED',
          entityType: 'BOARD',
          entityId: id,
          description: 'Updated board cover image (Unsplash)',
          boardId: id,
          userId: user.id,
        },
      });

      return res.status(200).json(board);
    }

    // Handle local file upload (generate presigned URL)
    if (type === 'local' && filename && contentType) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        return res.status(400).json({ error: 'Only image files allowed' });
      }

      const { uploadURL, fileUrl, key } = await generateUploadURL(filename, contentType);
      return res.status(200).json({ uploadURL, fileUrl, key });
    }

    return res.status(400).json({ error: 'Invalid request' });
  }

  // PUT - Confirm local upload and save to DB
  if (req.method === 'PUT') {
    const { key, fileUrl } = req.body;

    // Delete old cover if exists
    const oldBoard = await prisma.board.findUnique({ where: { id } });
    if (oldBoard?.coverImageKey) {
      try {
        await deleteFile(oldBoard.coverImageKey);
      } catch (e) {
        console.error('Failed to delete old cover:', e);
      }
    }

    const board = await prisma.board.update({
      where: { id },
      data: { 
        coverImage: fileUrl,
        coverImageKey: key
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATED',
        entityType: 'BOARD',
        entityId: id,
        description: 'Updated board cover image',
        boardId: id,
        userId: user.id,
      },
    });

    return res.status(200).json(board);
  }

  // DELETE - Remove cover image
  if (req.method === 'DELETE') {
    const board = await prisma.board.findUnique({ where: { id } });
    
    if (board?.coverImageKey) {
      try {
        await deleteFile(board.coverImageKey);
      } catch (e) {
        console.error('Failed to delete cover from S3:', e);
      }
    }

    const updated = await prisma.board.update({
      where: { id },
      data: { coverImage: null, coverImageKey: null },
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATED',
        entityType: 'BOARD',
        entityId: id,
        description: 'Removed board cover image',
        boardId: id,
        userId: user.id,
      },
    });

    return res.status(200).json(updated);
  }

  res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}