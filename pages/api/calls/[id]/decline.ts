// // src/pages/api/calls/[id]/decline.ts
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

//   try {
//     const call = await prisma.call.findFirst({
//       where: {
//         id: id as string,
//         calleeId: userId,
//         status: 'PENDING'
//       }
//     });

//     if (!call) {
//       return res.status(404).json({ error: 'Call not found' });
//     }

//     const updatedCall = await prisma.call.update({
//       where: { id: id as string },
//       data: {
//         status: 'DECLINED',
//         endedAt: new Date(),
//         endedReason: 'DECLINED_BY_CALLEE'
//       }
//     });

//     // TODO: Notify caller
//     // io.to(`user:${updatedCall.callerId}`).emit('call-declined', updatedCall);

//     return res.status(200).json(updatedCall);
//   } catch (error) {
//     console.error('Error declining call:', error);
//     return res.status(500).json({ error: 'Failed to decline call' });
//   }
// }

// ══════════════════════════════════════════════
// pages/api/calls/[id]/decline.ts
// ══════════════════════════════════════════════
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.query as { id: string };
  try {
    await prisma.call.update({ where: { id }, data: { status: 'DECLINED' } });
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed' });
  }
}