import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: boardId, userId } = req.query;

  if (!boardId || !userId || typeof boardId !== 'string' || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid board ID or user ID' });
  }

  try {
    // Check if board exists
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: true,
      },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if current user has permission (OWNER or ADMIN)
    const currentUserMembership = await prisma.boardMember.findFirst({
      where: {
        boardId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!currentUserMembership) {
      return res.status(403).json({ error: 'Not authorized to remove members' });
    }

    // Check if target member exists
    const targetMember = await prisma.boardMember.findFirst({
      where: {
        boardId,
        userId: userId,
      },
    });

    if (!targetMember) {
      return res.status(404).json({ error: 'Member not found on this board' });
    }

    // Prevent removing the owner
    if (targetMember.role === 'OWNER') {
      return res.status(403).json({ error: 'Cannot remove the board owner' });
    }

    // Prevent self-removal if you're the last admin/owner
    if (userId === session.user.id) {
      const otherAdmins = await prisma.boardMember.count({
        where: {
          boardId,
          role: { in: ['OWNER', 'ADMIN'] },
          userId: { not: session.user.id },
        },
      });
      
      if (otherAdmins === 0) {
        return res.status(403).json({ error: 'Cannot remove yourself as the only admin' });
      }
    }

    // Delete the member
    await prisma.boardMember.deleteMany({
      where: {
        boardId,
        userId: userId,
      },
    });

    return res.status(200).json({ success: true, message: 'Member removed successfully' });

  } catch (error) {
    console.error('Error removing board member:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}