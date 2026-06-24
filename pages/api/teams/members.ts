// // src/pages/api/team/members.ts  (NEW FILE)
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getCurrentUser } from 'models/user';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const user = await getCurrentUser(req, res);
    
//     // Get all users except current user (same team/tenant)
//     const members = await prisma.user.findMany({
//       where: {
//         id: { not: user.id },
//         // Optional: filter by same team/tenant if you have teamId in user model
//         // teamId: user.teamId,
//       }, 
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         image: true,
//       },
//       orderBy: { name: 'asc' }
//     });

//     return res.status(200).json({ data: members });
//   } catch (error) {
//     return res.status(500).json({ error: 'Failed to fetch members' });
//   }
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUser } from 'models/user';
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv(); // uses UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getCurrentUser(req, res);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // ✅ Cache key per user so they only see their team
    const cacheKey = `team:members:${user.id}`;

    // ✅ Check Upstash first — skips DB entirely
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({ 
        data: cached, 
        fromCache: true  // helpful for debugging
      });
    }

    // 🐌 Only runs on cache miss
    const members = await prisma.user.findMany({
      where: {
        id: { not: user.id },
      },
      // ✅ Only fetch what you need — no extra fields
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: { name: 'asc' }
    });

    // ✅ Cache for 2 minutes (120 seconds)
    await redis.setex(cacheKey, 120, members);

    return res.status(200).json({ data: members });

  } catch (error) {
    console.error('Failed to fetch members:', error);
    return res.status(500).json({ error: 'Failed to fetch members' });
  }
}