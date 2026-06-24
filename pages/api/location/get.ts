// pages/api/location/get.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).end();

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId required' });
  }

  // Requester must share a team with the target
  const sharedTeam = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      team: { members: { some: { userId } } },
    },
  });

  if (!sharedTeam) {
    return res.status(403).json({ error: 'Not in same team' });
  }

  const location = await prisma.userLocation.findUnique({ where: { userId } });

  if (!location) return res.status(404).json({ error: 'No location found' });

  return res.status(200).json({
    lat: location.lat,
    lng: location.lng,
    accuracy: location.accuracy,
    updatedAt: location.updatedAt,
  }); 
}

