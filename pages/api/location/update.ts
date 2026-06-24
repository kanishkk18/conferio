// // pages/api/location/update.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     res.setHeader('Allow', 'POST');
//     return res.status(405).end();
//   }

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.id) return res.status(401).end();

//   const { lat, lng, accuracy } = req.body;

//   if (typeof lat !== 'number' || typeof lng !== 'number') {
//     return res.status(400).json({ error: 'lat and lng required' });
//   }

//   await prisma.userLocation.upsert({
//     where: { userId: session.user.id },
//     update: { lat, lng, accuracy },
//     create: { userId: session.user.id, lat, lng, accuracy },
//   });

//   return res.status(200).json({ ok: true });
// }


import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

// Round to 6 decimal places (~0.1m precision) reduces payload size
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

// Rough distance calculation in meters (good enough for "did we move?" check)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = Math.abs(lat1 - lat2);
  const dLng = Math.abs(lng1 - lng2);
  // 1 degree ≈ 111km at equator
  const latDist = dLat * 111320;
  const lngDist = dLng * 111320 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(latDist * latDist + lngDist * lngDist);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).end();

  const { lat, lng, accuracy } = req.body;

  // Stricter validation
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'lat and lng must be valid numbers' });
  }

  if (accuracy !== undefined && (typeof accuracy !== 'number' || isNaN(accuracy))) {
    return res.status(400).json({ error: 'accuracy must be a valid number' });
  }

  // Reduce precision to minimize data transfer/storage
  const roundedLat = round6(lat);
  const roundedLng = round6(lng);
  const roundedAcc = accuracy !== undefined ? round6(accuracy) : null;

  // QUOTA SAVER: Check existing location first to avoid unnecessary writes
  const existing = await prisma.userLocation.findUnique({
    where: { userId: session.user.id },
    select: { lat: true, lng: true, accuracy: true }, // Minimal select
  });

  if (existing) {
    const distance = calculateDistance(existing.lat, existing.lng, roundedLat, roundedLng);
    
    // Skip update if moved < 10 meters AND accuracy unchanged (prevents quota burn while stationary)
    if (distance < 10 && roundedAcc === existing.accuracy) {
      return res.status(200).json({ ok: true, cached: true });
    }
  }

  await prisma.userLocation.upsert({
    where: { userId: session.user.id },
    update: { 
      lat: roundedLat, 
      lng: roundedLng, 
      accuracy: roundedAcc,
      updatedAt: new Date(),
    },
    create: { 
      userId: session.user.id, 
      lat: roundedLat, 
      lng: roundedLng, 
      accuracy: roundedAcc,
    },
  });

  return res.status(200).json({ ok: true });
}

