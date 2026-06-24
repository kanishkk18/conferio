// // src/pages/api/calls/index.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const userId = session.user.id;

//   switch (req.method) {
//     case 'GET':
//       return getCalls(req, res, userId);
//     case 'POST':
//       return createCall(req, res, userId);
//     default:
//       return res.status(405).json({ error: 'Method not allowed' });
//   }
// }

// async function getCalls(req: NextApiRequest, res: NextApiResponse, userId: string) {
//   try {
//     const { type = 'all', limit = '50', offset = '0' } = req.query;
    
//     const whereClause: any = {
//       OR: [
//         { callerId: userId },
//         { calleeId: userId }
//       ]
//     };

//     if (type === 'outgoing') {
//       whereClause.OR = [{ callerId: userId }];
//     } else if (type === 'incoming') {
//       whereClause.OR = [{ calleeId: userId }];
//     } else if (type === 'missed') {
//       whereClause.OR = [{ calleeId: userId }];
//       whereClause.status = 'MISSED';
//     }

//     const calls = await prisma.call.findMany({
//       where: whereClause,
//       include: {
//         caller: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           }
//         },
//         callee: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           }
//         },
//         recordings: true,
//         _count: {
//           select: {
//             recordings: true,
//           }
//         }
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//       take: parseInt(limit as string),
//       skip: parseInt(offset as string),
//     });

//     const total = await prisma.call.count({
//       where: whereClause,
//     });

//     // Calculate statistics
//     const stats = await prisma.call.aggregate({
//       where: {
//         OR: [
//           { callerId: userId },
//           { calleeId: userId }
//         ],
//         status: 'COMPLETED',
//       },
//       _sum: {
//         duration: true,
//       },
//       _count: {
//         _all: true,
//       }
//     });

//     return res.status(200).json({
//       calls,
//       pagination: {
//         total,
//         limit: parseInt(limit as string),
//         offset: parseInt(offset as string),
//         hasMore: total > parseInt(offset as string) + parseInt(limit as string),
//       },
//       stats: {
//         totalCalls: stats._count._all,
//         totalDuration: stats._sum.duration || 0,
//         averageDuration: stats._count._all > 0 
//           ? Math.round((stats._sum.duration || 0) / stats._count._all) 
//           : 0,
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching calls:', error);
//     return res.status(500).json({ error: 'Failed to fetch calls' });
//   }
// }

// async function createCall(req: NextApiRequest, res: NextApiResponse, userId: string) {
//   try {
//     const { calleeId, type = 'AUDIO' } = req.body;

//     if (!calleeId) {
//       return res.status(400).json({ error: 'Callee ID is required' });
//     }

//     if (calleeId === userId) {
//       return res.status(400).json({ error: 'Cannot call yourself' });
//     }

//     // Check if callee exists
//     const callee = await prisma.user.findUnique({
//       where: { id: calleeId },
//       select: { id: true, name: true, email: true, image: true }
//     });

//     if (!callee) {
//       return res.status(404).json({ error: 'Callee not found' });
//     }

//     // Check for ongoing calls
//     const ongoingCall = await prisma.call.findFirst({
//       where: {
//         OR: [
//           { callerId: userId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
//           { calleeId: userId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
//           { callerId: calleeId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
//           { calleeId: calleeId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
//         ]
//       }
//     });

//     if (ongoingCall) {
//       return res.status(409).json({ 
//         error: 'Active call in progress',
//         existingCall: ongoingCall
//       });
//     }

//     const call = await prisma.call.create({
//       data: {
//         callerId: userId,
//         calleeId,
//         type,
//         status: 'PENDING',
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

//     // TODO: Trigger socket event to notify callee
//     // io.to(`user:${calleeId}`).emit('incoming-call', call);

//     return res.status(201).json(call);
//   } catch (error) {
//     console.error('Error creating call:', error);
//     return res.status(500).json({ error: 'Failed to create call' });
//   }
// }

// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
// import { Server as ServerIO } from 'socket.io';
// import { Server as NetServer } from 'http';

// interface NextApiResponseWithSocket extends NextApiResponse {
//   socket: {
//     server: NetServer & {
//       io?: ServerIO;
//     };
//   };
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponseWithSocket
// ) {
//   const session = await getServerSession(req, res, authOptions);
  
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const userId = session.user.id;

//   switch (req.method) {
//     case 'GET':
//       return getCalls(req, res, userId);
//     case 'POST':
//       return createCall(req, res, userId);
//     default:
//       return res.status(405).json({ error: 'Method not allowed' });
//   }
// }

// async function getCalls(req: NextApiRequest, res: NextApiResponseWithSocket, userId: string) {
//   try {
//     const { type = 'all', limit = '50', offset = '0' } = req.query;
    
//     const whereClause: any = {
//       OR: [
//         { callerId: userId },
//         { calleeId: userId }
//       ]
//     };

//     if (type === 'outgoing') {
//       whereClause.OR = [{ callerId: userId }];
//     } else if (type === 'incoming') {
//       whereClause.OR = [{ calleeId: userId }];
//     } else if (type === 'missed') {
//       whereClause.OR = [{ calleeId: userId }];
//       whereClause.status = 'MISSED';
//     }

//     const calls = await prisma.call.findMany({
//       where: whereClause,
//       include: {
//         caller: {
//           select: { id: true, name: true, email: true, image: true }
//         },
//         callee: {
//           select: { id: true, name: true, email: true, image: true }
//         },
//         recordings: true,
//         _count: { select: { recordings: true } }
//       },
//       orderBy: { createdAt: 'desc' },
//       take: parseInt(limit as string),
//       skip: parseInt(offset as string),
//     });

//     const total = await prisma.call.count({ where: whereClause });

//     const stats = await prisma.call.aggregate({
//       where: {
//         OR: [{ callerId: userId }, { calleeId: userId }],
//         status: 'COMPLETED',
//       },
//       _sum: { duration: true },
//       _count: { _all: true }
//     });

//     return res.status(200).json({
//       calls,
//       pagination: {
//         total,
//         limit: parseInt(limit as string),
//         offset: parseInt(offset as string),
//         hasMore: total > parseInt(offset as string) + parseInt(limit as string),
//       },
//       stats: {
//         totalCalls: stats._count._all,
//         totalDuration: stats._sum.duration || 0,
//         averageDuration: stats._count._all > 0 
//           ? Math.round((stats._sum.duration || 0) / stats._count._all) 
//           : 0,
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching calls:', error);
//     return res.status(500).json({ error: 'Failed to fetch calls' });
//   }
// }

// async function createCall(
//   req: NextApiRequest, 
//   res: NextApiResponseWithSocket, 
//   userId: string
// ) {
//   try {
//     const { calleeId, type = 'AUDIO' } = req.body;

//     if (!calleeId) {
//       return res.status(400).json({ error: 'Callee ID is required' });
//     }

//     if (calleeId === userId) {
//       return res.status(400).json({ error: 'Cannot call yourself' });
//     }

//     const callee = await prisma.user.findUnique({
//       where: { id: calleeId },
//       select: { id: true, name: true, email: true, image: true }
//     });

//     if (!callee) {
//       return res.status(404).json({ error: 'Callee not found' });
//     }

//     // Check for any active calls involving either party and end them
//     await prisma.call.updateMany({
//       where: {
//         OR: [
//           { callerId: userId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
//           { calleeId: userId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
//           { callerId: calleeId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
//           { calleeId: calleeId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
//         ]
//       },
//       data: {
//         status: 'FAILED',
//         endedAt: new Date(),
//         endedReason: 'SUPERSEDED_BY_NEW_CALL'
//       }
//     });

//     const call = await prisma.call.create({
//       data: {
//         callerId: userId,
//         calleeId,
//         type,
//         status: 'PENDING',
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

//     // Emit socket event to notify callee
//     const io = res.socket.server.io;
//     if (io) {
//       io.to(`user:${calleeId}`).emit('incoming-call', call);
//       console.log(`[SOCKET] Emitted incoming-call to user:${calleeId}`);
//     }

//     // Auto-decline after 30 seconds if not answered
//     setTimeout(async () => {
//       const currentCall = await prisma.call.findUnique({
//         where: { id: call.id }
//       });
      
//       if (currentCall?.status === 'PENDING') {
//         await prisma.call.update({
//           where: { id: call.id },
//           data: {
//             status: 'MISSED',
//             endedAt: new Date(),
//             endedReason: 'NO_ANSWER'
//           }
//         });
        
//         if (io) {
//           io.to(`user:${calleeId}`).emit('call-missed', { callId: call.id });
//           io.to(`user:${userId}`).emit('call-missed', { callId: call.id });
//         }
//       }
//     }, 30000);

//     return res.status(201).json(call);
//   } catch (error) {
//     console.error('Error creating call:', error);
//     return res.status(500).json({ error: 'Failed to create call' });
//   }
// }

// pages/api/calls/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { notifyIncomingCall, notifyCallMissed } from '@/lib/notifications/notification.triggers';
import { broadcastToUser } from '../notifications/stream';

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: {
    server: NetServer & {
      io?: ServerIO;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      return getCalls(req, res, userId);
    case 'POST':
      return createCall(req, res, userId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getCalls(req: NextApiRequest, res: NextApiResponseWithSocket, userId: string) {
  try {
    const { type = 'all', limit = '50', offset = '0' } = req.query;
    
    const whereClause: any = {
      OR: [
        { callerId: userId },
        { calleeId: userId }
      ]
    };

    if (type === 'outgoing') {
      whereClause.OR = [{ callerId: userId }];
    } else if (type === 'incoming') {
      whereClause.OR = [{ calleeId: userId }];
    } else if (type === 'missed') {
      whereClause.OR = [{ calleeId: userId }];
      whereClause.status = 'MISSED';
    }

    const calls = await prisma.call.findMany({
      where: whereClause,
      include: {
        caller: {
          select: { id: true, name: true, email: true, image: true }
        },
        callee: {
          select: { id: true, name: true, email: true, image: true }
        },
        recordings: true,
        _count: { select: { recordings: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.call.count({ where: whereClause });

    const stats = await prisma.call.aggregate({
      where: {
        OR: [{ callerId: userId }, { calleeId: userId }],
        status: 'COMPLETED',
      },
      _sum: { duration: true },
      _count: { _all: true }
    });

    return res.status(200).json({
      calls,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: total > parseInt(offset as string) + parseInt(limit as string),
      },
      stats: {
        totalCalls: stats._count._all,
        totalDuration: stats._sum.duration || 0,
        averageDuration: stats._count._all > 0 
          ? Math.round((stats._sum.duration || 0) / stats._count._all) 
          : 0,
      }
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return res.status(500).json({ error: 'Failed to fetch calls' });
  }
}

async function createCall(
  req: NextApiRequest, 
  res: NextApiResponseWithSocket, 
  userId: string
) {
  try {
    const { calleeId, type = 'AUDIO' } = req.body;

    if (!calleeId) {
      return res.status(400).json({ error: 'Callee ID is required' });
    }

    if (calleeId === userId) {
      return res.status(400).json({ error: 'Cannot call yourself' });
    }

    const callee = await prisma.user.findUnique({
      where: { id: calleeId },
      select: { id: true, name: true, email: true, image: true }
    });

    if (!callee) {
      return res.status(404).json({ error: 'Callee not found' });
    }

    // End any active calls involving either party
    await prisma.call.updateMany({
      where: {
        OR: [
          { callerId: userId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
          { calleeId: userId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
          { callerId: calleeId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
          { calleeId: calleeId, status: { in: ['PENDING', 'CONNECTING', 'ONGOING'] } },
        ]
      },
      data: {
        status: 'FAILED',
        endedAt: new Date(),
        endedReason: 'SUPERSEDED_BY_NEW_CALL'
      }
    });

    const call = await prisma.call.create({
      data: {
        callerId: userId,
        calleeId,
        type,
        status: 'PENDING',
      },
      include: {
        caller: {
          select: { id: true, name: true, email: true, image: true }
        },
        callee: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    // ── Socket.IO: real-time ring on callee's screen ──────────────────
    const io = res.socket.server.io;
    if (io) {
      io.to(`user:${calleeId}`).emit('incoming-call', call);
      console.log(`[SOCKET] Emitted incoming-call to user:${calleeId}`);
    }

    // ── In-app notification: toast with Accept / Decline buttons ──────
    await notifyIncomingCall({
      calleeUserId: calleeId,
      callerName: call.caller.name ?? 'Someone',
      callerAvatarUrl: call.caller.image ?? undefined,
      callId: call.id,
      callType: type as 'AUDIO' | 'VIDEO',
    });

    const incomingNotif = await prisma.notification.findFirst({
      where: { userId: calleeId, callId: call.id, type: 'CALL_INCOMING' },
      orderBy: { createdAt: 'desc' },
    });
    if (incomingNotif) {
      broadcastToUser(calleeId, { type: 'notification', notification: incomingNotif });
    }
    // ─────────────────────────────────────────────────────────────────

    // Auto-mark missed after 30s if still PENDING
    setTimeout(async () => {
      const currentCall = await prisma.call.findUnique({ where: { id: call.id } });
      
      if (currentCall?.status === 'PENDING') {
        await prisma.call.update({
          where: { id: call.id },
          data: {
            status: 'MISSED',
            endedAt: new Date(),
            endedReason: 'NO_ANSWER'
          }
        });
        
        // Socket.IO missed event
        if (io) {
          io.to(`user:${calleeId}`).emit('call-missed', { callId: call.id });
          io.to(`user:${userId}`).emit('call-missed', { callId: call.id });
        }

        // ── In-app missed call notification to callee ─────────────────
        await notifyCallMissed({
          missedUserId: calleeId,
          callerName: call.caller.name ?? 'Someone',
          callId: call.id,
          callType: type as 'AUDIO' | 'VIDEO',
        });

        const missedNotif = await prisma.notification.findFirst({
          where: { userId: calleeId, callId: call.id, type: 'CALL_MISSED' },
          orderBy: { createdAt: 'desc' },
        });
        if (missedNotif) {
          broadcastToUser(calleeId, { type: 'notification', notification: missedNotif });
        }
        // ─────────────────────────────────────────────────────────────
      }
    }, 30000);

    return res.status(201).json(call);
  } catch (error) {
    console.error('Error creating call:', error);
    return res.status(500).json({ error: 'Failed to create call' });
  }
}