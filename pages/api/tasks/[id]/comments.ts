// // pages/api/tasks/[id]/comments.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../../lib/auth';
// import { prisma } from '../../../../lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id: taskId } = req.query;
  
//   if (typeof taskId !== 'string') {
//     return res.status(400).json({ error: 'Invalid task ID' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   const task = await prisma.task.findUnique({
//     where: { id: taskId },
//     include: { column: { include: { board: true } } },
//   });

//   if (!task) {
//     return res.status(404).json({ error: 'Task not found' });
//   }

//   const hasAccess = await prisma.board.findFirst({
//     where: {
//       id: task.boardId,
//       OR: [
//         { ownerId: user.id },
//         { members: { some: { userId: user.id } } },
//       ],
//     },
//   });

//   if (!hasAccess) {
//     return res.status(403).json({ error: 'Access denied' });
//   }

//   if (req.method === 'POST') {
//     try {
//       const { content, attachments = [] } = req.body;
      
//       // Validate content or attachments must exist
//       if (!content?.trim() && attachments.length === 0) {
//         return res.status(400).json({ error: 'Comment must have content or attachments' });
//       }

//       // Build attachment create data properly
//       const attachmentData = attachments.length > 0 ? {
//         create: attachments.map((att: any) => ({
//           filename: att.filename || 'unnamed',
//           url: att.url,
//           // key: att.key || '',
//           mimeType: att.mimeType || att.contentType || 'application/octet-stream',
//           size: att.size || 0,
//         })),
//       } : undefined;

//       const comment = await prisma.boardComment.create({
//         data: {
//           content: content || '',
//           taskId,
//           userId: user.id,
//           attachments: attachmentData,
//         },
//         include: {
//           user: {
//             select: { id: true, name: true, image: true },
//           },
//           attachments: true,
//         },
//       });

//       await prisma.activityLog.create({
//         data: {
//           action: 'COMMENTED',
//           entityType: 'TASK',
//           entityId: taskId,
//           description: `Added a comment`,
//           boardId: task.boardId,
//           taskId,
//           userId: user.id,
//         },
//       });

//       return res.status(201).json(comment);
//     } catch (error) {
//       console.error('Comment creation error:', error);
//       return res.status(500).json({ 
//         error: 'Failed to create comment',
//         details: (error as Error).message 
//       });
//     }
//   }

//   res.setHeader('Allow', ['POST']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { broadcastClipEvent, SSE_EVENTS } from '@/lib/sse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: taskId } = req.query;
  
  if (typeof taskId !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

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

  if (req.method === 'POST') {
    try {
      const { content, attachments = [] } = req.body;
      
      if (!content?.trim() && attachments.length === 0) {
        return res.status(400).json({ error: 'Comment must have content or attachments' });
      }

      const attachmentData = attachments.length > 0 ? {
        create: attachments.map((att: any) => ({
          filename: att.filename || 'unnamed',
          url: att.url,
          mimeType: att.mimeType || att.contentType || 'application/octet-stream',
          size: att.size || 0,
        })),
      } : undefined;

      const comment = await prisma.boardComment.create({
        data: {
          content: content || '',
          taskId,
          userId: user.id,
          attachments: attachmentData,
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
          attachments: true,
        },
      });

      await prisma.activityLog.create({
        data: {
          action: 'COMMENTED',
          entityType: 'TASK',
          entityId: taskId,
          description: `Added a comment`,
          boardId: task.boardId,
          taskId,
          userId: user.id,
        },
      });

      const updatedTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
          labels: { include: { label: true } },
          attachments: true,
          subtasks: true,
          _count: { select: { boardComments: true, attachments: true } },
        },
      });

      if (updatedTask) {
        broadcastClipEvent(SSE_EVENTS.TASK_UPDATED, {
          type: 'task:updated',
          boardId: task.boardId,
          task: updatedTask,
        });
      }

      return res.status(201).json(comment);
    } catch (error) {
      console.error('Comment creation error:', error);
      return res.status(500).json({ 
        error: 'Failed to create comment',
        details: (error as Error).message 
      });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}