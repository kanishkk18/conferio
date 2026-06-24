// pages/api/calls/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuid } from 'uuid';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { calleeId, type = 'VIDEO', isGroupCall = false } = req.body;

//   try {
//     const roomName = `call-${uuid()}`;

//     const call = await prisma.call.create({
//       data: {
//         callerId: session.user.id,
//         calleeId: calleeId || null,
//         roomName,
//         type,
//         isGroupCall,
//         status: 'PENDING',
//       },
//     });

//     // Log participant for caller
//     await prisma.callParticipant.create({
//       data: {
//         callId: call.id,
//         userId: session.user.id,
//       },
//     });

//     return res.status(200).json(call);
//   } catch (err) {
//     console.error('Create call error:', err);
//     return res.status(500).json({ error: 'Failed to create call' });
//   }
// }



// pages/api/calls/[id]/join.ts
export default async function joinHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };

  try {
    const call = await prisma.call.update({
      where: { id },
      data: { status: 'ONGOING', startedAt: new Date() },
    });

    // Log participant
    await prisma.callParticipant.upsert({
      where: { callId_userId: { callId: id, userId: session.user.id } },
      create: { callId: id, userId: session.user.id },
      update: { joinedAt: new Date(), leftAt: null },
    });

    return res.status(200).json(call);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to join call' });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// // pages/api/calls/[id]/end.ts
// export async function endHandler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { id } = req.query as { id: string };

//   try {
//     const now = new Date();

//     const call = await prisma.call.findUnique({ where: { id } });
//     if (!call) return res.status(404).json({ error: 'Call not found' });

//     const duration = call.startedAt
//       ? Math.round((now.getTime() - call.startedAt.getTime()) / 1000)
//       : 0;

//     await prisma.call.update({
//       where: { id },
//       data: { status: 'COMPLETED', endedAt: now, duration },
//     });

//     // Update participant record
//     await prisma.callParticipant.updateMany({
//       where: { callId: id, userId: session.user.id, leftAt: null },
//       data: { leftAt: now },
//     });

//     return res.status(200).json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ error: 'Failed to end call' });
//   }
// }

// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// // pages/api/calls/[id]/decline.ts
// export async function declineHandler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { id } = req.query as { id: string };

//   try {
//     await prisma.call.update({
//       where: { id },
//       data: { status: 'DECLINED' },
//     });
//     return res.status(200).json({ success: true });
//   } catch {
//     return res.status(500).json({ error: 'Failed to decline' });
//   }
// }

// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// // pages/api/calls/[id]/hold.ts
// export async function holdHandler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { id } = req.query as { id: string };

//   try {
//     await prisma.call.update({ where: { id }, data: { status: 'ON_HOLD', isOnHold: true } });
//     return res.status(200).json({ success: true });
//   } catch {
//     return res.status(500).json({ error: 'Failed to hold' });
//   }
// }

// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// // pages/api/calls/[id]/invite.ts
// export async function inviteHandler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { id } = req.query as { id: string };
//   const { userId } = req.body;

//   try {
//     const call = await prisma.call.findUnique({ where: { id } });
//     if (!call) return res.status(404).json({ error: 'Call not found' });

//     await prisma.call.update({ where: { id }, data: { isGroupCall: true } });

//     await prisma.callParticipant.upsert({
//       where: { callId_userId: { callId: id, userId } },
//       create: { callId: id, userId },
//       update: {},
//     });

//     return res.status(200).json({ success: true });
//   } catch {
//     return res.status(500).json({ error: 'Failed to invite' });
//   }
// }

// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// // pages/api/calls/merge.ts
// export async function mergeHandler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

//   const { callId1, callId2 } = req.body;

//   try {
//     // Link calls together
//     await prisma.call.update({
//       where: { id: callId2 },
//       data: { parentCallId: callId1, status: 'COMPLETED' },
//     });

//     await prisma.call.update({
//       where: { id: callId1 },
//       data: { isGroupCall: true },
//     });

//     // Move participants from callId2 to callId1
//     const participants2 = await prisma.callParticipant.findMany({ where: { callId: callId2 } });

//     for (const p of participants2) {
//       await prisma.callParticipant.upsert({
//         where: { callId_userId: { callId: callId1, userId: p.userId } },
//         create: { callId: callId1, userId: p.userId },
//         update: {},
//       });
//     }

//     return res.status(200).json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ error: 'Failed to merge' });
//   }
// }