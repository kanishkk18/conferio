// pages/api/invites/[token].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { token } = req.query;
  if (typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid token' });
  }

  if (req.method === 'GET') {
    // Validate invite
    const invite = await prisma.boardInvite.findUnique({
      where: { token },
      include: {
        board: {
          select: { id: true, title: true },
        },
        inviter: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (invite.acceptedAt) {
      return res.status(400).json({ error: 'Invite already accepted' });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invite expired' });
    }

    if (invite.email !== session.user.email) {
      return res.status(403).json({ error: 'This invite is for a different email' });
    }

    return res.status(200).json({
      invite: {
        board: invite.board,
        inviter: invite.inviter,
        role: invite.role,
      },
    });
  }

  if (req.method === 'POST') {
    try {
      const invite = await prisma.boardInvite.findUnique({
        where: { token },
      });

      if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired invite' });
      }

      if (invite.email !== session.user.email) {
        return res.status(403).json({ error: 'Email mismatch' });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add member to board
      await prisma.boardMember.create({
        data: {
          boardId: invite.boardId,
          userId: user.id,
          role: invite.role,
        },
      });

      // Mark invite as accepted
      await prisma.boardInvite.update({
        where: { token },
        data: { acceptedAt: new Date() },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          action: 'JOINED',
          entityType: 'BOARD',
          entityId: invite.boardId,
          description: `Joined board via invite`,
          boardId: invite.boardId,
          userId: user.id,
        },
      });

      return res.status(200).json({ success: true, boardId: invite.boardId });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to accept invite' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}