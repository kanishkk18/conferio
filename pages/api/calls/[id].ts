// src/pages/api/calls/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  const userId = session.user.id;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid call ID' });
  }

  // Verify user is part of this call
  const existingCall = await prisma.call.findFirst({
    where: {
      id,
      OR: [
        { callerId: userId },
        { calleeId: userId }
      ]
    }
  });

  if (!existingCall) {
    return res.status(404).json({ error: 'Call not found' });
  }

  switch (req.method) {
    case 'GET':
      return getCall(req, res, id);
    case 'PATCH':
      return updateCall(req, res, id, userId);
    case 'DELETE':
      return deleteCall(req, res, id, userId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getCall(req: NextApiRequest, res: NextApiResponse, callId: string) {
  try {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        callee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        recordings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    return res.status(200).json(call);
  } catch (error) {
    console.error('Error fetching call:', error);
    return res.status(500).json({ error: 'Failed to fetch call' });
  }
}

async function updateCall(req: NextApiRequest, res: NextApiResponse, callId: string, userId: string) {
  try {
    const { 
      status, 
      startedAt, 
      endedAt, 
      duration, 
      notes, 
      endedReason,
      quality 
    } = req.body;

    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (startedAt) updateData.startedAt = new Date(startedAt);
    if (endedAt) updateData.endedAt = new Date(endedAt);
    if (duration !== undefined) updateData.duration = duration;
    if (notes !== undefined) updateData.notes = notes;
    if (endedReason) updateData.endedReason = endedReason;
    if (quality) updateData.quality = quality;

    // Auto-calculate duration if endedAt and startedAt provided
    if (endedAt && startedAt && !duration) {
      const start = new Date(startedAt);
      const end = new Date(endedAt);
      updateData.duration = Math.round((end.getTime() - start.getTime()) / 1000);
    }

    const call = await prisma.call.update({
      where: { id: callId },
      data: updateData,
      include: {
        caller: {
          select: { id: true, name: true, email: true, image: true }
        },
        callee: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    // TODO: Emit socket event for real-time updates
    // io.to(`call:${callId}`).emit('call-updated', call);

    return res.status(200).json(call);
  } catch (error) {
    console.error('Error updating call:', error);
    return res.status(500).json({ error: 'Failed to update call' });
  }
}

async function deleteCall(req: NextApiRequest, res: NextApiResponse, callId: string, userId: string) {
  try {
    // Only allow deletion of completed/failed calls, not active ones
    const call = await prisma.call.findUnique({
      where: { id: callId }
    });

    if (['PENDING', 'CONNECTING', 'ONGOING'].includes(call?.status || '')) {
      return res.status(400).json({ error: 'Cannot delete active call' });
    }

    await prisma.call.delete({
      where: { id: callId }
    });

    return res.status(200).json({ message: 'Call deleted successfully' });
  } catch (error) {
    console.error('Error deleting call:', error);
    return res.status(500).json({ error: 'Failed to delete call' });
  }
}