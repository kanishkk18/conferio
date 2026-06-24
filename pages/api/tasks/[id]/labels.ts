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
        { members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } } } },
      ],
    },
  });

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { labelId } = req.body;
        
        const taskLabel = await prisma.taskLabel.create({
          data: { taskId, labelId },
          include: { label: true },
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

        return res.status(201).json(taskLabel);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to add label' });
      }

    case 'DELETE':
      try {
        const { labelId } = req.query;
        
        if (typeof labelId !== 'string') {
          return res.status(400).json({ error: 'Invalid label ID' });
        }

        await prisma.taskLabel.deleteMany({
          where: { taskId, labelId },
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

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to remove label' });
      }

    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}