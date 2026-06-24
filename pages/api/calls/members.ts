// pages/api/calls/members.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUser } from 'models/user';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getCurrentUser(req, res);
    
    // Get user's team members from TeamMember table
    const userTeams = await prisma.teamMember.findMany({
      where: { userId: user.id },
      select: { teamId: true }
    });

    const teamIds = userTeams.map(t => t.teamId);

    // Get all members from those teams (excluding current user)
    const members = await prisma.teamMember.findMany({
      where: {
        teamId: { in: teamIds },
        userId: { not: user.id }
      },
      distinct: ['userId'], // Avoid duplicates if user is in multiple teams
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    // Format response
    const formattedMembers = members.map(m => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
    }));

    return res.status(200).json({ 
      data: formattedMembers 
    });

  } catch (error: any) {
    console.error('Error fetching call members:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch members' 
    });
  }
}