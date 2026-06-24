import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });
  
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { calleeId, type = 'AUDIO', isGroupCall = false } = req.body;
    
    const roomName = `call-${randomUUID()}`;
    
    const call = await prisma.call.create({
      data: {
        callerId: session.user.id,
        calleeId,
        roomName,
        type,
        isGroupCall,
        status: 'PENDING',
        participants: {
          create: {
            userId: session.user.id,
            joinedAt: new Date(),
          }
        }
      },
      include: {
        participants: true,
        caller: {
          select: { id: true, name: true, image: true }
        }
      }
    });
    
    return res.status(200).json(call);
  } catch (error) {
    console.error('Create call error:', error);
    return res.status(500).json({ error: 'Failed to create call' });
  }
}