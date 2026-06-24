// // pages/api/calls/clear.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const result = await prisma.call.updateMany({
//       where: {
//         status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] }
//       },
//       data: {
//         status: 'FAILED',
//         endedAt: new Date(),
//         endedReason: 'CLEARED_BY_ADMIN'
//       }
//     });

//     res.json({ 
//       message: 'Stuck calls cleared',
//       count: result.count 
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to clear calls' });
//   }
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 30 * 1000);

    // Find and update stuck calls
    const result = await prisma.call.updateMany({
      where: {
        AND: [
          { status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
          {
            OR: [
              { createdAt: { lt: fiveMinutesAgo } },
              { startedAt: { lt: fiveMinutesAgo } }
            ]
          }
        ]
      },
      data: {
        status: 'FAILED',
        endedAt: new Date(),
        endedReason: 'CLEANUP_TIMEOUT'
      }
    });

    // Also clean up very recent pending calls (orphaned)
    const recentResult = await prisma.call.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: new Date(Date.now() - 60000) } // 1 minute
      },
      data: {
        status: 'MISSED',
        endedAt: new Date(),
        endedReason: 'NO_ANSWER_TIMEOUT'
      }
    });

    return res.json({ 
      message: 'Stuck calls cleaned up',
      stuckCalls: result.count,
      missedCalls: recentResult.count
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({ error: 'Cleanup failed' });
  }
}