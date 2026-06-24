// // src/pages/api/calls/[id]/end.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id } = req.query;
//   const userId = session.user.id;
//   const { reason = 'USER_HUNG_UP' } = req.body;

//   try {
//     const call = await prisma.call.findFirst({
//       where: {
//         id: id as string,
//         OR: [
//           { callerId: userId },
//           { calleeId: userId }
//         ],
//         status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] }
//       }
//     });

//     if (!call) {
//       return res.status(404).json({ error: 'Active call not found' });
//     }

//     const now = new Date();
//     const startedAt = call.startedAt;
//     const duration = startedAt 
//       ? Math.round((now.getTime() - startedAt.getTime()) / 1000)
//       : 0;

//     const updatedCall = await prisma.call.update({
//       where: { id: id as string },
//       data: {
//         status: call.status === 'PENDING' ? 'MISSED' : 'COMPLETED',
//         endedAt: now,
//         duration,
//         endedReason: reason
//       },
//       include: {
//         caller: {
//           select: { id: true, name: true, email: true, image: true }
//         },
//         callee: {
//           select: { id: true, name: true, email: true, image: true }
//         }
//       }
//     });

//     // TODO: Notify other party
//     // const otherPartyId = call.callerId === userId ? call.calleeId : call.callerId;
//     // io.to(`user:${otherPartyId}`).emit('call-ended', updatedCall);

//     return res.status(200).json(updatedCall);
//   } catch (error) {
//     console.error('Error ending call:', error);
//     return res.status(500).json({ error: 'Failed to end call' });
//   }
// }


import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function endHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };

  try {
    const now = new Date();

    const call = await prisma.call.findUnique({ where: { id } });
    if (!call) return res.status(404).json({ error: 'Call not found' });

    const duration = call.startedAt
      ? Math.round((now.getTime() - call.startedAt.getTime()) / 1000)
      : 0;

    await prisma.call.update({
      where: { id },
      data: { status: 'COMPLETED', endedAt: now, duration },
    });

    // Update participant record
    await prisma.callParticipant.updateMany({
      where: { callId: id, userId: session.user.id, leftAt: null },
      data: { leftAt: now },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to end call' });
  }
}
