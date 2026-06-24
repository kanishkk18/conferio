// // pages/api/boards/[id]/invites.ts
// its working code for inviting member to the board using email and the invite link 
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../../lib/auth';
// import { prisma } from '../../../../lib/prisma';
// import { randomBytes } from 'crypto';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.email) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id: boardId } = req.query;
//   if (typeof boardId !== 'string') {
//     return res.status(400).json({ error: 'Invalid board ID' });
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   // Check if user is owner or admin
//   const membership = await prisma.boardMember.findFirst({
//     where: {
//       boardId,
//       userId: user.id,
//       role: { in: ['OWNER', 'ADMIN'] },
//     },
//   });

//   if (!membership) {
//     return res.status(403).json({ error: 'Only owners and admins can invite members' });
//   }

//   if (req.method === 'POST') {
//     try {
//       const { email, role = 'MEMBER' } = req.body;

//       // Check if user already exists
//       const existingUser = await prisma.user.findUnique({
//         where: { email },
//       });

//       // Check if already a member
//       if (existingUser) {
//         const existingMember = await prisma.boardMember.findFirst({
//           where: { boardId, userId: existingUser.id },
//         });
//         if (existingMember) {
//           return res.status(400).json({ error: 'User is already a member' });
//         }
//       }

//       // Generate invite token
//       const token = randomBytes(32).toString('hex');
//       const expiresAt = new Date();
//       expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

//       const invite = await prisma.boardInvite.create({
//         data: {
//           email,
//           role,
//           token,
//           expiresAt,
//           boardId,
//           invitedBy: user.id,
//         },
//       });

//       // TODO: Send email with invite link
//       // For now, return the invite link
//       const inviteLink = `${process.env.NEXTAUTH_URL}/invites/${token}`;

//       return res.status(201).json({
//         invite: {
//           id: invite.id,
//           email,
//           role,
//           inviteLink,
//           expiresAt,
//         },
//       });
//     } catch (error) {
//       return res.status(500).json({ error: 'Failed to create invite' });
//     }
//   }

//   if (req.method === 'GET') {
//     // Get pending invites
//     const invites = await prisma.boardInvite.findMany({
//       where: {
//         boardId,
//         acceptedAt: null,
//         expiresAt: { gt: new Date() },
//       },
//       include: {
//         inviter: {
//           select: { id: true, name: true, image: true },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     return res.status(200).json(invites);
//   }

//   res.setHeader('Allow', ['POST', 'GET']);
//   return res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// pages/api/boards/[id]/invites.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: boardId } = req.query;
  if (typeof boardId !== 'string') {
    return res.status(400).json({ error: 'Invalid board ID' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get board with team info
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      owner: {
        include: {
          teamMembers: {
            include: {
              team: true,
            },
          },
        },
      },
    },
  });

  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }

  // Check if user is owner or admin of the board
  const membership = await prisma.boardMember.findFirst({
    where: {
      boardId,
      userId: user.id,
      role: { in: ['OWNER', 'ADMIN'] },
    },
  });

  const isOwner = board.ownerId === user.id;

  if (!membership && !isOwner) {
    return res.status(403).json({ error: 'Only owners and admins can invite members' });
  }

  // GET: List available team members to invite + pending invites
  if (req.method === 'GET') {
    try {
      // Get user's teams
      const userTeamMemberships = await prisma.teamMember.findMany({
        where: { userId: user.id },
        include: { team: true },
      });

      const teamIds = userTeamMemberships.map(tm => tm.teamId);

      // Get all team members from those teams (excluding already board members)
      const existingBoardMemberIds = await prisma.boardMember.findMany({
        where: { boardId },
        select: { userId: true },
      });
      const existingMemberIds = existingBoardMemberIds.map(bm => bm.userId);

      // Get team members who are not already in the board
      const availableTeamMembers = await prisma.teamMember.findMany({
        where: {
          teamId: { in: teamIds },
          userId: { notIn: [...existingMemberIds, user.id] }, // Exclude existing members and self
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Get pending invites
      const pendingInvites = await prisma.boardInvite.findMany({
        where: {
          boardId,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: {
          inviter: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        availableTeamMembers: availableTeamMembers.map(tm => ({
          teamMemberId: tm.id,
          userId: tm.user.id,
          name: tm.user.name,
          email: tm.user.email,
          image: tm.user.image,
          teamName: tm.team.name,
          role: tm.role, // Team role (ADMIN, OWNER, MEMBER)
        })),
        pendingInvites,
      });
    } catch (error) {
      console.error('Error fetching team members:', error);
      return res.status(500).json({ error: 'Failed to fetch team members' });
    }
  }

  // POST: Invite team member to board
  if (req.method === 'POST') {
    try {
      const { teamMemberId, role = 'MEMBER' } = req.body;

      if (!teamMemberId) {
        return res.status(400).json({ error: 'Team member ID is required' });
      }

      // Get the team member to invite
      const teamMember = await prisma.teamMember.findUnique({
        where: { id: teamMemberId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: true,
        },
      });

      if (!teamMember) {
        return res.status(404).json({ error: 'Team member not found' });
      }

      // Verify the inviter and invitee are in the same team
      const inviterTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: user.id,
          teamId: teamMember.teamId,
        },
      });

      if (!inviterTeamMember) {
        return res.status(403).json({ error: 'You can only invite members from your own team' });
      }

      // Check if already a board member
      const existingMember = await prisma.boardMember.findFirst({
        where: {
          boardId,
          userId: teamMember.user.id,
        },
      });

      if (existingMember) {
        return res.status(400).json({ error: 'User is already a member of this board' });
      }

      // Check for existing pending invite
      const existingInvite = await prisma.boardInvite.findFirst({
        where: {
          boardId,
          email: teamMember.user.email,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvite) {
        return res.status(400).json({ error: 'Invite already pending for this user' });
      }

      // Create invite (using email for compatibility with existing schema)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const invite = await prisma.boardInvite.create({
        data: {
          email: teamMember.user.email, // Keep for compatibility
          role,
          token: crypto.randomUUID(), // Use UUID instead of randomBytes
          expiresAt,
          boardId,
          invitedBy: user.id,
        },
      });

      // Auto-accept if you want immediate addition (optional)
      // Or send notification to team member

      return res.status(201).json({
        invite: {
          id: invite.id,
          user: {
            id: teamMember.user.id,
            name: teamMember.user.name,
            email: teamMember.user.email,
          },
          teamName: teamMember.team.name,
          role,
          expiresAt,
          message: `Invite sent to ${teamMember.user.name}`,
        },
      });
    } catch (error) {
      console.error('Error creating invite:', error);
      return res.status(500).json({ error: 'Failed to create invite' });
    }
  }

  // Alternative: Direct add without invite (for same-team members)
  if (req.method === 'PUT') {
    try {
      const { teamMemberId, role = 'MEMBER' } = req.body;

      if (!teamMemberId) {
        return res.status(400).json({ error: 'Team member ID is required' });
      }

      // Get team member
      const teamMember = await prisma.teamMember.findUnique({
        where: { id: teamMemberId },
        include: { user: true, team: true },
      });

      if (!teamMember) {
        return res.status(404).json({ error: 'Team member not found' });
      }

      // Verify same team
      const inviterTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: user.id,
          teamId: teamMember.teamId,
        },
      });

      if (!inviterTeamMember) {
        return res.status(403).json({ error: 'Not in same team' });
      }

      // Check if already member
      const existing = await prisma.boardMember.findFirst({
        where: {
          boardId,
          userId: teamMember.user.id,
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Already a member' });
      }

      // Directly add to board (no invite needed for team members)
      const boardMember = await prisma.boardMember.create({
        data: {
          boardId,
          userId: teamMember.user.id,
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return res.status(201).json({
        message: `${teamMember.user.name} added to board`,
        member: boardMember,
      });
    } catch (error) {
      console.error('Error adding member:', error);
      return res.status(500).json({ error: 'Failed to add member' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}