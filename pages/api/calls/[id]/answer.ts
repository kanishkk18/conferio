// // src/pages/api/calls/[id]/answer.ts
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
//       return res.status(404).json({ error: 'Call not found or not pending' });
//     }

//     const updatedCall = await prisma.call.update({
//       where: { id: id as string },
//       data: {
//         status: 'ONGOING',
//         startedAt: new Date(),
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

//     // TODO: Notify caller via socket
//     // io.to(`user:${updatedCall.callerId}`).emit('call-answered', updatedCall);

//     return res.status(200).json(updatedCall);
//   } catch (error) {
//     console.error('Error answering call:', error);
//     return res.status(500).json({ error: 'Failed to answer call' });
//   }
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  const userId = session.user.id;

  try {
    const call = await prisma.call.findFirst({
      where: {
        id: id as string,
        calleeId: userId,
        status: 'PENDING'
      }
    });

    if (!call) {
      return res.status(404).json({ error: 'Call not found or not pending' });
    }

    const updatedCall = await prisma.call.update({
      where: { id: id as string },
      data: {
        status: 'ONGOING',
        startedAt: new Date(),
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

    // CRITICAL: Emit to caller's room
    const io = res.socket.server.io;
    if (io) {
      const callerRoom = `user:${updatedCall.callerId}`;
      console.log(`[SOCKET] Emitting call-answered to room: ${callerRoom}`);
      
      // Emit to the caller's user room
      io.to(callerRoom).emit('call-answered', { call: updatedCall });
      
      // Also emit to the call room for anyone already joined
      io.to(`call:${id}`).emit('call-answered', { call: updatedCall });
      
      console.log(`[SOCKET] Emitted call-answered for call ${id}`);
    }

    return res.status(200).json(updatedCall);
  } catch (error) {
    console.error('Error answering call:', error);
    return res.status(500).json({ error: 'Failed to answer call' });
  }
}