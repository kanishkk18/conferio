import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  const team = await prisma.team.findUnique({
    where: { slug: slug as string }
  });

  if (!team) return res.status(404).json({ error: 'Team not found' });

  const membership = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      teamId: team.id
    }
  });

  if (!membership) return res.status(403).json({ error: 'Not a member' });

  return res.status(200).json({ role: membership.role });
}