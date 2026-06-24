// pages/api/livekit/token.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { AccessToken } from 'livekit-server-sdk';
import { authOptions } from 'lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { roomName, isCreator = false } = req.body;
  if (!roomName) return res.status(400).json({ error: 'roomName required' });

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'LiveKit not configured' });
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: session.user.id,
      name: session.user.name || 'Anonymous',
      metadata: JSON.stringify({
        userId: session.user.id,
        name: session.user.name,
        image: session.user.image,
        isCreator,
      }),
      ttl: '4h',
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isCreator,
      roomRecord: isCreator,
    });

    return res.status(200).json({ token: await at.toJwt(), roomName });
  } catch (err) {
    console.error('Token error:', err);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
}