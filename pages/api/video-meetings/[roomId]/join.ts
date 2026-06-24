// // pages/api/video-meetings/[roomId]/join.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';
// import { AccessToken } from 'livekit-server-sdk';
// import bcrypt from 'bcryptjs';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   const { roomId } = req.query as { roomId: string };
//   const {
//     displayName,
//     password,
//     background = 'none',
//     waitingId,
//     approved,
//   } = req.body;

//   if (!displayName) return res.status(400).json({ error: 'Display name required' });

//   try {
//     const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
//     if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
//     if (meeting.status === 'ENDED') return res.status(400).json({ error: 'Meeting has ended' });

//     const isHost = session?.user?.id === meeting.hostId;

//     // ── Password check ────────────────────────────────────────────────────
//     if (meeting.password && !isHost) {
//       if (!password) return res.status(403).json({ error: 'Password required' });
//       const valid = await bcrypt.compare(password, meeting.password);
//       if (!valid) return res.status(403).json({ error: 'Incorrect password' });
//     }

//     // ── Waiting room approval flow ────────────────────────────────────────
//     if (meeting.requireApproval && !isHost && !approved) {
//       // Add to waiting room
//       const entry = await prisma.vMWaitingEntry.create({
//         data: {
//           meetingId: meeting.id,
//           userId: session?.user?.id || null,
//           guestName: displayName,
//           guestEmail: session?.user?.email || null,
//           status: 'waiting',
//         },
//       });

//       return res.status(202).json({
//         error: 'WAITING_APPROVAL',
//         waitingId: entry.id,
//       });
//     }

//     // ── If re-joining after approval ─────────────────────────────────────
//     if (waitingId && approved) {
//       const entry = await prisma.vMWaitingEntry.findUnique({ where: { id: waitingId } });
//       if (!entry || entry.status !== 'approved') {
//         return res.status(403).json({ error: 'Not approved' });
//       }
//     }

//     // ── Activate meeting if host joining ─────────────────────────────────
//     if (isHost && meeting.status === 'WAITING') {
//       await prisma.videoConference.update({
//         where: { id: meeting.id },
//         data: { status: 'ACTIVE', startedAt: new Date() },
//       });
//     }

//     // ── Generate LiveKit token ────────────────────────────────────────────
//     const identity = session?.user?.id || `guest-${Date.now()}`;
//     const name = displayName;

//     const apiKey = process.env.LIVEKIT_API_KEY!;
//     const apiSecret = process.env.LIVEKIT_API_SECRET!;

//     const at = new AccessToken(apiKey, apiSecret, {
//       identity,
//       name,
//       metadata: JSON.stringify({
//         userId: session?.user?.id || null,
//         name: displayName,
//         image: session?.user?.image || null,
//         isHost,
//         background,
//       }),
//       ttl: '4h',
//     });

//     at.addGrant({
//       room: roomId,
//       roomJoin: true,
//       canPublish: true,
//       canSubscribe: true,
//       canPublishData: true,
//       roomAdmin: isHost,
//       roomRecord: isHost,
//     });

//     const token = await at.toJwt();

//     // ── Record participant ─────────────────────────────────────────────────
//     await prisma.vMParticipant.upsert({
//       where: {
//         meetingId_livekitIdentity: {
//           meetingId: meeting.id,
//           livekitIdentity: identity,
//         },
//       },
//       create: {
//         meetingId: meeting.id,
//         userId: session?.user?.id || null,
//         guestName: session?.user ? null : displayName,
//         role: isHost ? 'HOST' : 'PARTICIPANT',
//         livekitIdentity: identity,
//       },
//       update: { joinedAt: new Date(), leftAt: null },
//     });

//     return res.status(200).json({ token, identity, isHost });
//   } catch (err) {
//     console.error('[join meeting]', err);
//     return res.status(500).json({ error: 'Failed to join meeting' });
//   }
// }

// pages/api/video-meetings/[roomId]/join.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { AccessToken } from 'livekit-server-sdk';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  const { roomId } = req.query as { roomId: string };
  const { displayName, password, background = 'none', waitingId } = req.body;

  if (!displayName?.trim()) {
    return res.status(400).json({ error: 'Display name required' });
  }

  try {
    const meeting = await prisma.videoConference.findUnique({ where: { roomId } });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.status === 'ENDED') return res.status(400).json({ error: 'Meeting has ended' });

    const isHost = session?.user?.id === meeting.hostId;

    // ── Password check (skip for host) ───────────────────────────────────
    if (meeting.password && !isHost) {
      if (!password) return res.status(403).json({ error: 'Password required' });
      const valid = await bcrypt.compare(password, meeting.password);
      if (!valid) return res.status(403).json({ error: 'Incorrect password' });
    }

    // ── Approval flow ─────────────────────────────────────────────────────
    if (meeting.requireApproval && !isHost) {
      if (waitingId) {
        // Participant is re-joining after receiving approval signal — verify it
        const entry = await prisma.vMWaitingEntry.findUnique({
          where: { id: waitingId },
        });

        if (!entry) return res.status(404).json({ error: 'Waiting entry not found' });

        if (entry.status === 'rejected') {
          return res.status(403).json({ error: 'Entry denied by host' });
        }

        if (entry.status !== 'approved') {
          // Still waiting — shouldn't normally happen but guard it
          return res.status(202).json({ error: 'STILL_WAITING', waitingId });
        }

        // Approved — fall through to token generation below
      } else {
        // First-time request — add to waiting room and notify host via socket
        const entry = await prisma.vMWaitingEntry.create({
          data: {
            meetingId: meeting.id,
            userId: session?.user?.id ?? null,
            guestName: displayName.trim(),
            guestEmail: session?.user?.email ?? null,
            status: 'waiting',
          },
          include: {
            user: { select: { name: true, image: true, email: true } },
          },
        });

        // Notify host via Socket.IO (fire-and-forget)
        try {
          const { getIO } = await import('lib/socket-store');
          const io = getIO();
          if (io) {
            io.to(`meeting_host:${roomId}`).emit('waiting_room_entry', {
              id: entry.id,
              guestName: entry.guestName,
              userId: entry.userId,
              requestedAt: entry.requestedAt,
              user: entry.user,
            });
          }
        } catch {
          // Socket not available — host will see it on next panel open
        }

        return res.status(202).json({
          error: 'WAITING_APPROVAL',
          waitingId: entry.id,
        });
      }
    }

    // ── Activate meeting if host is first to join ─────────────────────────
    if (isHost && meeting.status === 'WAITING') {
      await prisma.videoConference.update({
        where: { id: meeting.id },
        data: { status: 'ACTIVE', startedAt: new Date() },
      });
    }

    // ── Generate LiveKit token ────────────────────────────────────────────
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return res.status(500).json({ error: 'LiveKit not configured' });
    }

    const identity = session?.user?.id
      ? session.user.id
      : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: displayName.trim(),
      metadata: JSON.stringify({
        userId: session?.user?.id ?? null,
        name: displayName.trim(),
        image: session?.user?.image ?? null,
        isHost,
        background,
      }),
      ttl: '4h',
    });

    at.addGrant({
      room: roomId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isHost,
      roomRecord: isHost,
    });

    const token = await at.toJwt();

    // ── Record participant ─────────────────────────────────────────────────
    await prisma.vMParticipant.upsert({
      where: {
        meetingId_livekitIdentity: {
          meetingId: meeting.id,
          livekitIdentity: identity,
        },
      },
      create: {
        meetingId: meeting.id,
        userId: session?.user?.id ?? null,
        guestName: session?.user ? null : displayName.trim(),
        role: isHost ? 'HOST' : 'PARTICIPANT',
        livekitIdentity: identity,
      },
      update: { joinedAt: new Date(), leftAt: null },
    });

    return res.status(200).json({ token, identity, isHost });
  } catch (err) {
    console.error('[join meeting]', err);
    return res.status(500).json({ error: 'Failed to join meeting' });
  }
}