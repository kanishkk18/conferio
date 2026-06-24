// // pages/api/video-meetings/[roomId]/approve.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { roomId } = req.query as { roomId: string };
//   const { waitingId, approved } = req.body;

//   const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
//   if (!meeting) return res.status(404).json({ error: 'Not found' });
//   if (meeting.hostId !== session.user.id)
//     return res.status(403).json({ error: 'Host only' });

//   await prisma.vMWaitingEntry.update({
//     where: { id: waitingId },
//     data: { status: approved ? 'approved' : 'rejected' },
//   });

//   return res.status(200).json({ success: true });
// }

// // pages/api/video-meetings/[roomId]/approve.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { roomId } = req.query as { roomId: string };
//   const { waitingId, approved } = req.body;

//   if (!waitingId) return res.status(400).json({ error: 'waitingId required' });

//   const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
//   if (!meeting) return res.status(404).json({ error: 'Not found' });
//   if (meeting.hostId !== session.user.id)
//     return res.status(403).json({ error: 'Host only' });

//   await prisma.vMWaitingEntry.update({
//     where: { id: waitingId },
//     data: { status: approved ? 'approved' : 'rejected' },
//   });

//   // ── Real-time notification via Socket.IO ──────────────────────────────
//   // The socket.io server instance is stored as a global during initialization
//   // (see pages/api/socket/io.ts — ensure it sets `(global as any).__socketIO = io`)
//   const io: any = (global as any).__socketIO;
//   if (io) {
//     // Participant joined room `waiting:${waitingId}` when they entered the queue
//     const eventName = approved ? 'approval_granted' : 'approval_rejected';
//     io.to(`waiting:${waitingId}`).emit(eventName, { waitingId });
//   }
//   // ─────────────────────────────────────────────────────────────────────

//   return res.status(200).json({ success: true });
// }


// pages/api/video-meetings/[roomId]/approve.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { roomId } = req.query as { roomId: string };
  const { waitingId, approved } = req.body;

  if (!waitingId) return res.status(400).json({ error: 'waitingId required' });

  const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
  if (!meeting) return res.status(404).json({ error: 'Not found' });
  if (meeting.hostId !== session.user.id) {
    return res.status(403).json({ error: 'Host only' });
  }

  const newStatus = approved ? 'approved' : 'rejected';

  await prisma.vMWaitingEntry.update({
    where: { id: waitingId },
    data: { status: newStatus },
  });

  // Notify the waiting participant immediately via Socket.IO
  // so they don't have to wait for the next poll cycle
  try {
    const { getIO } = await import('lib/socket-store');
    const io = getIO();
    if (io) {
      // Emit to the waiting participant's room
      io.to(`waiting:${waitingId}`).emit('approval_decision', {
        waitingId,
        status: newStatus,
      });
    }
  } catch {
    // Socket not available — participant's polling will catch it
  }

  return res.status(200).json({ success: true, status: newStatus });
}