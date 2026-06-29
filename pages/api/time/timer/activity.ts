// pages/api/time-tracking/timer/activity.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     const runningEntry = await prisma.timeEntry.findFirst({
//       where: {
//         userId: session.user.id,
//         isRunning: true,
//       },
//     });

//     if (!runningEntry) {
//       return res.status(404).json({ error: 'No running timer' });
//     }

//     // Update last active timestamp
//     await prisma.timeEntry.update({
//       where: { id: runningEntry.id },
//       data: {
//         lastActiveAt: new Date(),
//       },
//     });

//     return res.status(200).json({ success: true });
//   } catch (error) {
//     console.error('Activity ping error:', error);
//     return res.status(500).json({ error: 'Failed to update activity' });
//   }
// }

// pages/api/time-tracking/timer/activity.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const runningEntry = await prisma.timeEntry.findFirst({
        where: {
          userId: session.user.id,
          isRunning: true,
        },
      });
  
      // CHANGE THIS: Return 200 with no running timer instead of 404
      if (!runningEntry) {
        return res.status(200).json({ success: false, message: 'No running timer' });
      }
  
      // Update last active timestamp
      await prisma.timeEntry.update({
        where: { id: runningEntry.id },
        data: {
          lastActiveAt: new Date(),
        },
      });
  
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Activity ping error:', error);
      return res.status(500).json({ error: 'Failed to update activity' });
    }
  }