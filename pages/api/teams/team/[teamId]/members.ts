// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { prisma } from '@/lib/prisma'
// import { authOptions } from 'lib/auth'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
  
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   const { teamId } = req.query

//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' })
//   }

//   try {
//     // Check if user is a member of this team
//     const membership = await prisma.teamMember.findFirst({
//       where: {
//         teamId: teamId as string,
//         userId: session.user.id,
//       },
//     })

//     if (!membership) {
//       return res.status(403).json({ error: 'Access denied' })
//     }

//     const members = await prisma.teamMember.findMany({
//       where: {
//         teamId: teamId as string,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           },
//         },
//       },
//     })

//     res.json(members)
//   } catch (error) {
//     console.error('Error fetching team members:', error)
//     res.status(500).json({ error: 'Failed to fetch team members' })
//   }
// }

// pages/api/teams/[teamId]/members.ts
/**
 * POST /api/teams/:teamId/members  → add member + notify existing team
 * DELETE /api/teams/:teamId/members → remove member + notify
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "lib/auth";
import { PrismaClient } from "@prisma/client";
import { notifyTeamMemberAdded } from "../../../../../lib/notifications/notification.triggers";
import { broadcastToUser } from "../../../notifications/stream";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { teamId } = req.query as { teamId: string };

  if (req.method === "POST") {
    const { userId: newUserId, role = "MEMBER" } = req.body as {
      userId: string;
      role?: string;
    };

    // Fetch team + new user info
    const [team, newUser] = await Promise.all([
      prisma.team.findUnique({
        where: { id: teamId },
        include: { members: { include: { user: true } } },
      }),
      prisma.user.findUnique({ where: { id: newUserId } }),
    ]);

    if (!team || !newUser) {
      return res.status(404).json({ error: "Team or user not found" });
    }

    // Add member
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId, userId: newUserId } },
      create: { teamId, userId: newUserId, role: role as "ADMIN" | "OWNER" | "MEMBER" },
      update: { role: role as "ADMIN" | "OWNER" | "MEMBER" },
    });

    // Get existing member IDs (excluding the new member)
    const existingMemberIds = team.members
      .map((m) => m.userId)
      .filter((id) => id !== newUserId);

    // Send notifications to existing members
    await notifyTeamMemberAdded({
      existingMemberIds,
      newMemberName: newUser.name,
      newMemberEmail: newUser.email,
      teamId,
      teamName: team.name,
      role,
    });

    // Broadcast to each
    for (const uid of existingMemberIds) {
      const notification = await prisma.notification.findFirst({
        where: { userId: uid, type: "TEAM_MEMBER_ADDED" },
        orderBy: { createdAt: "desc" },
      });
      if (notification) {
        broadcastToUser(uid, { type: "notification", notification });
      }
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}