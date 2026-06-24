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

//   const hasAccess = await prisma.board.findFirst({
//     where: { id, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
//   });
//   if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

//   if (req.method === 'GET') {
//     const board = await prisma.board.findUnique({
//       where: { id },
//       include: {
//         owner: { select: { id: true, name: true, image: true } },
//         members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
//         columns: {
//           orderBy: { order: 'asc' },
//           include: {
//             tasks: {
//               where: { isArchived: false },
//               orderBy: { order: 'asc' },
//               include: {
//                 assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
//                 labels: { include: { label: true } },
//                 attachments: true,
//                 subtasks: true,
//                 _count: { select: { comments: true, attachments: true } },
//               },
//             },
//           },
//         },
//         labels: true,
//         activities: { take: 20, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, image: true } } } },
//       },
//     });
//     return res.status(200).json(board);
//   }

//   if (req.method === 'PUT') {
//     const { title, description, coverImage, isArchived } = req.body;
//     const board = await prisma.board.update({
//       where: { id },
//       data: { title, description, coverImage, isArchived },
//     });
//     await prisma.activityLog.create({
//       data: { action: 'UPDATED', entityType: 'BOARD', entityId: id, description: `Updated board "${title}"`, boardId: id, userId: user.id },
//     });
//     return res.status(200).json(board);
//   }

//   if (req.method === 'DELETE') {
//     await prisma.board.delete({ where: { id } });
//     await prisma.activityLog.create({
//       data: { action: 'DELETED', entityType: 'BOARD', entityId: id, description: `Deleted board`, userId: user.id },
//     });
//     return res.status(204).end();
//   }

//   res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// pages/api/boards/[id].ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../lib/auth';
// import { prisma } from '../../../lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id } = req.query;
  
//   if (typeof id !== 'string') {
//     return res.status(400).json({ error: 'Invalid board ID' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   // Check access
//   const hasAccess = await prisma.board.findFirst({
//     where: {
//       id,
//       OR: [
//         { ownerId: user.id },
//         { members: { some: { userId: user.id } } },
//       ],
//     },
//   });

//   if (!hasAccess) {
//     return res.status(403).json({ error: 'Access denied' });
//   }

//   switch (req.method) {
//     case 'GET':
//       try {
//         const board = await prisma.board.findUnique({
//           where: { id },
//           include: {
//             owner: {
//               select: { id: true, name: true, image: true },
//             },
//             members: {
//               include: {
//                 user: {
//                   select: { id: true, name: true, email: true, image: true },
//                 },
//               },
//             },
//             columns: {
//               orderBy: { order: 'asc' },
//               include: {
//                 tasks: {
//                   where: { isArchived: false },
//                   orderBy: { order: 'asc' },
//                   include: {
//                     assignees: {
//                       include: {
//                         user: {
//                           select: { id: true, name: true, image: true },
//                         },
//                       },
//                     },
//                     labels: {
//                       include: {
//                         label: true,
//                       },
//                     },
//                     attachments: true,
//                     subtasks: true,
//                     boardComments: {              // <-- ADD THIS
//                       orderBy: { createdAt: 'desc' },
//                       include: {
//                         user: { select: { id: true, name: true, image: true } },
//                         attachments: true,
//                       },
//                     },
//                     activities: {              // <-- ADD THIS
//                       orderBy: { createdAt: 'desc' },
//                       take: 5,                 // Limit to recent 5 per task
//                       include: {
//                         user: { select: { id: true, name: true, image: true } },
//                       },
//                     },
//                     _count: {
//                       select: { boardComments: true, attachments: true },
//                     },
                    
//                   },
//                 },
//               },
//             },
//             labels: true,
//             activities: {
//               take: 20,
//               orderBy: { createdAt: 'desc' },
//               include: {
//                 user: {
//                   select: { id: true, name: true, image: true },
//                 },
//               },
//             },
//           },
//         });
//         return res.status(200).json(board);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to fetch board' });
//       }

//     case 'PUT':
//       try {
//         const { title, description, coverImage, isArchived } = req.body;
        
//         const oldBoard = await prisma.board.findUnique({
//           where: { id },
//           select: { title: true, description: true },
//         });

//         const board = await prisma.board.update({
//           where: { id },
//           data: {
//             title,
//             description,
//             coverImage,
//             isArchived,
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
//           },
//         });

//         // Log activity
//         await prisma.activityLog.create({
//           data: {
//             action: 'UPDATED',
//             entityType: 'BOARD',
//             entityId: id,
//             description: `Updated board "${title}"`,
//             metadata: { old: oldBoard, new: { title, description, coverImage } },
//             boardId: id,
//             userId: user.id,
//           },
//         });

//         return res.status(200).json(board);
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to update board' });
//       }

//     case 'DELETE':
//       try {
//         await prisma.board.delete({
//           where: { id },
//         });

//         // Log activity
//         await prisma.activityLog.create({
//           data: {
//             action: 'DELETED',
//             entityType: 'BOARD',
//             entityId: id,
//             description: `Deleted board`,
//             userId: user.id,
//           },
//         });

//         return res.status(204).end();
//       } catch (error) {
//         return res.status(500).json({ error: 'Failed to delete board' });
//       }

//     default:
//       res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
//       return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }


import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { deleteFile, extractKeyFromUrl } from '../../../lib/s3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid board ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check access
  const hasAccess = await prisma.board.findFirst({
    where: {
      id,
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
  });

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const board = await prisma.board.findUnique({
          where: { id },
          include: {
            owner: {
              select: { id: true, name: true, image: true },
            },
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, image: true },
                },
              },
            },
            columns: {
              orderBy: { order: 'asc' },
              include: {
                tasks: {
                  where: { isArchived: false },
                  orderBy: { order: 'asc' },
                  include: {
                    assignees: {
                      include: {
                        user: {
                          select: { id: true, name: true, image: true },
                        },
                      },
                    },
                    labels: {
                      include: {
                        label: true,
                      },
                    },
                    attachments: true,
                    subtasks: true,
                    boardComments: {
                      orderBy: { createdAt: 'desc' },
                      include: {
                        user: { select: { id: true, name: true, image: true } },
                        attachments: true,
                      },
                    },
                    activities: {
                      orderBy: { createdAt: 'desc' },
                      take: 5,
                      include: {
                        user: { select: { id: true, name: true, image: true } },
                      },
                    },
                    _count: {
                      select: { boardComments: true, attachments: true },
                    },
                  },
                },
              },
            },
            labels: true,
            activities: {
              take: 20,
              orderBy: { createdAt: 'desc' },
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
          },
        });
        return res.status(200).json(board);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch board' });
      }

    case 'PUT':
      try {
        const { title, description, coverImage, coverImageKey, isArchived } = req.body;
        
        const oldBoard = await prisma.board.findUnique({
          where: { id },
          select: { title: true, description: true, isArchived: true, coverImageKey: true },
        });

        const board = await prisma.board.update({
          where: { id },
          data: {
            title,
            description,
            coverImage,
            coverImageKey,
            isArchived,
          },
          include: {
            owner: {
              select: { id: true, name: true, image: true },
            },
            members: {
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
          },
        });

        // Log activity based on what changed
        if (isArchived !== undefined && isArchived !== oldBoard?.isArchived) {
          await prisma.activityLog.create({
            data: {
              action: isArchived ? 'ARCHIVED' : 'UNARCHIVED',
              entityType: 'BOARD',
              entityId: id,
              description: isArchived ? `Archived board "${title}"` : `Unarchived board "${title}"`,
              boardId: id,
              userId: user.id,
            },
          });
        } else {
          await prisma.activityLog.create({
            data: {
              action: 'UPDATED',
              entityType: 'BOARD',
              entityId: id,
              description: `Updated board "${title}"`,
              metadata: { old: oldBoard, new: { title, description, coverImage } },
              boardId: id,
              userId: user.id,
            },
          });
        }

        return res.status(200).json(board);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update board' });
      }

    case 'DELETE':
      try {
        // Get board to check for cover image to delete from S3
        const boardToDelete = await prisma.board.findUnique({
          where: { id },
          select: { coverImageKey: true },
        });

        // Delete cover from S3 if exists
        if (boardToDelete?.coverImageKey) {
          try {
            await deleteFile(boardToDelete.coverImageKey);
          } catch (e) {
            console.error('Failed to delete cover from S3:', e);
          }
        }

        await prisma.board.delete({
          where: { id },
        });

        await prisma.activityLog.create({
          data: {
            action: 'DELETED',
            entityType: 'BOARD',
            entityId: id,
            description: `Deleted board`,
            userId: user.id,
          },
        });

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete board' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}