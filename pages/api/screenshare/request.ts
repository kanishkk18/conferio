// pages/api/screenshare/request.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { pushSSEEvent } from './events';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { employeeId, teamId } = req.body;
  if (!employeeId || !teamId) {
    return res.status(400).json({ error: 'employeeId and teamId required' });
  }

  // Verify requester is ADMIN or OWNER of this team
  const membership = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      teamId,
      role: { in: ['ADMIN', 'OWNER'] },
    },
  });

  if (!membership) {
    return res.status(403).json({ error: 'Only admins can request screen access' });
  }

  // Get the target employee's userId from their TeamMember id
  const targetMember = await prisma.teamMember.findFirst({
    where: { id: employeeId, teamId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!targetMember) {
    return res.status(404).json({ error: 'Employee not found in team' });
  }

  const targetUserId = targetMember.userId;

  // Can't screen-share yourself
  if (targetUserId === session.user.id) {
    return res.status(400).json({ error: 'Cannot request your own screen' });
  }

  // Cancel any existing pending requests for this employee
  await prisma.screenShareSession.updateMany({
    where: { employeeId: targetUserId, status: 'PENDING' },
    data: { status: 'ENDED' },
  });

  const shareSession = await prisma.screenShareSession.create({
    data: {
      teamId,
      adminId: session.user.id,
      employeeId: targetUserId,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    },
    include: { team: { select: { name: true } } },
  });

  // Push SSE notification to the target employee
  pushSSEEvent(targetUserId, {
    type: 'SCREEN_SHARE_REQUEST',
    sessionId: shareSession.id,
    adminName: session.user.name ?? 'Your admin',
    adminEmail: session.user.email,
    adminImage: session.user.image,
    teamName: shareSession.team.name,
  });

  return res.status(200).json({ sessionId: shareSession.id });
}