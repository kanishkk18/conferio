// // ════════════════════════════════════════════════════════════════════════════
// // pages/api/video-meetings/[roomId]/waiting-room.ts
// // Returns the current waiting list (host only)
// // ════════════════════════════════════════════════════════════════════════════
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function waitingRoomHandler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'GET') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { roomId } = req.query as { roomId: string };

//   const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
//   if (!meeting) return res.status(404).json({ error: 'Not found' });
//   if (meeting.hostId !== session.user.id)
//     return res.status(403).json({ error: 'Host only' });

//   const waiting = await prisma.vMWaitingEntry.findMany({
//     where: { meetingId: meeting.id, status: 'waiting' },
//     include: { user: { select: { name: true, image: true, email: true } } },
//     orderBy: { requestedAt: 'asc' },
//   });

//   return res.status(200).json({ waiting });
// } 

// pages/api/video-meetings/[roomId]/waiting-room.ts
// Called ONCE on mount by the host to hydrate the waiting list.
// After that, Socket.IO pushes real-time updates — no polling needed.
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { roomId } = req.query as { roomId: string };

  const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
  if (!meeting) return res.status(404).json({ error: 'Not found' });
  if (meeting.hostId !== session.user.id) {
    return res.status(403).json({ error: 'Host only' });
  }

  const waiting = await prisma.vMWaitingEntry.findMany({
    where: { meetingId: meeting.id, status: 'waiting' },
    include: {
      user: { select: { name: true, image: true, email: true } },
    },
    orderBy: { requestedAt: 'asc' },
  });

  // Cache for 10s — it's just the initial hydration, socket handles updates
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
  return res.status(200).json({ waiting });
}