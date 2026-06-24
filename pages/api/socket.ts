// // pages/api/socket.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { Server as SocketServer } from 'socket.io';
// import { createClient } from 'redis';
// import { createAdapter } from '@socket.io/redis-adapter';

// type NextApiResponseWithSocket = NextApiResponse & {
//   socket: {
//     server: any;
//   };
// };

// let isInitialized = false;

// export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
//   if (!res.socket.server.io) {
//     console.log('Initializing Socket.IO server...');

//     const io = new SocketServer(res.socket.server, {
//       path: '/api/socket',
//       addTrailingSlash: false,
//       cors: {
//         origin: process.env.NEXTAUTH_URL || 'http://localhost:4002',
//         methods: ['GET', 'POST'],
//         credentials: true,
//       },
//       transports: ['websocket', 'polling'],
//       pingTimeout: 60000,
//       pingInterval: 25000,
//     });

//     // Redis adapter for horizontal scaling
//     if (process.env.UPSTASH_REDIS_URL && !isInitialized) {
//       try {
//         const pubClient = createClient({ url: process.env.UPSTASH_REDIS_URL });
//         const subClient = pubClient.duplicate();
//         await Promise.all([pubClient.connect(), subClient.connect()]);
//         io.adapter(createAdapter(pubClient, subClient));
//         console.log('✅ Socket.IO using Redis adapter');
//       } catch (err) {
//         console.warn('⚠️ Redis adapter failed, using in-memory:', err);
//       }
//       isInitialized = true;
//     }

//     io.on('connection', (socket) => {
//       const userId = socket.handshake.query.userId as string;
//       if (!userId) { socket.disconnect(); return; }

//       socket.join(`user:${userId}`);
//       socket.data.userId = userId;

//       // ── Call signaling ──────────────────────────────────────────

//       socket.on('initiate-call', (data) => {
//         const targets: string[] = [];
//         if (data.participantIds?.length) targets.push(...data.participantIds);
//         else if (data.calleeId) targets.push(data.calleeId);

//         targets.forEach(tid => {
//           io.to(`user:${tid}`).emit('incoming-call', {
//             callId: data.callId,
//             roomName: data.roomName,
//             type: data.type,
//             isGroup: data.isGroup,
//             callerId: userId,
//             callerName: data.callerName,
//             callerImage: data.callerImage,
//           });
//         });
//       });

//       socket.on('accept-call', (data) => {
//         io.to(`user:${data.callerId}`).emit('call-accepted', {
//           callId: data.callId,
//           acceptedBy: userId,
//         });
//       });

//       socket.on('decline-call', (data) => {
//         io.to(`user:${data.callerId}`).emit('call-declined', {
//           callId: data.callId,
//           declinedBy: userId,
//         });
//       });

//       socket.on('end-call', (data) => {
//         (data.participantIds || []).forEach((pid: string) => {
//           io.to(`user:${pid}`).emit('call-ended', { callId: data.callId });
//         });
//       });

//       socket.on('invite-to-call', (data) => {
//         io.to(`user:${data.userId}`).emit('incoming-call', {
//           callId: data.callId,
//           roomName: data.roomName,
//           type: data.type,
//           isGroup: true,
//           callerId: userId,
//           callerName: data.inviterName,
//         });
//       });

//       socket.on('join-call-room', (callId: string) => socket.join(`call:${callId}`));
//       socket.on('leave-call-room', (callId: string) => socket.leave(`call:${callId}`));

//       socket.on('whiteboard-update', (data) => {
//         socket.to(`call:${data.callId}`).emit('whiteboard-sync', {
//           elements: data.elements,
//           updatedBy: userId,
//         });
//       });

//       socket.on('annotation-update', (data) => {
//         socket.to(`call:${data.callId}`).emit('annotation-sync', {
//           annotation: data.annotation,
//           updatedBy: userId,
//         });
//       });

//       socket.on('disconnect', () => {
//         console.log(`User ${userId} disconnected`);
//       });
//     });

//     res.socket.server.io = io;
//   }

//   res.end();
// }

// export const config = {
//   api: { bodyParser: false },
// };

// pages/api/socket.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

type NextApiResponseIO = NextApiResponse & {
  socket: {
    server: any;
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponseIO) {
  // Only initialize once per process
  if (res.socket.server.io) {
    res.end();
    return;
  }

  console.log('[Socket] Initializing Socket.IO server...');

  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  // Optional: Redis adapter for horizontal scaling
  // (add @socket.io/redis-adapter and ioredis / @upstash/redis)
  // const { createAdapter } = require('@socket.io/redis-adapter');
  // const { createClient } = require('redis');
  // const pub = createClient({ url: process.env.UPSTASH_REDIS_URL });
  // const sub = pub.duplicate();
  // Promise.all([pub.connect(), sub.connect()]).then(() => {
  //   io.adapter(createAdapter(pub, sub));
  // });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;

    if (!userId) {
      socket.disconnect();
      return;
    }

    // Each user joins their own private room so we can target them directly
    socket.join(`user:${userId}`);
    socket.data.userId = userId;

    console.log(`[Socket] User ${userId} connected (socket: ${socket.id})`);

    // ── Call signaling ────────────────────────────────────────────────────

    /**
     * Caller emits this to notify one or more callees.
     * We use `io.to()` (not `socket.to()`) so the sender's OWN sockets
     * in that room also receive the event — important when the same user
     * has multiple browser tabs open.
     */
    socket.on(
      'initiate-call',
      (data: {
        callId: string;
        roomName: string;
        calleeId?: string;
        participantIds?: string[];
        type: 'AUDIO' | 'VIDEO';
        isGroup: boolean;
        callerName: string;
        callerImage?: string;
      }) => {
        console.log('[Socket] initiate-call from', userId, '→', data);

        const targets: string[] = [];
        if (data.participantIds?.length) targets.push(...data.participantIds);
        else if (data.calleeId) targets.push(data.calleeId);

        targets.forEach((tid) => {
          console.log(`[Socket] Emitting incoming-call to user:${tid}`);
          io.to(`user:${tid}`).emit('incoming-call', {
            callId: data.callId,
            roomName: data.roomName,
            type: data.type,
            isGroup: data.isGroup,
            callerId: userId,
            callerName: data.callerName,
            callerImage: data.callerImage,
          });
        });
      }
    );

    socket.on(
      'accept-call',
      (data: { callId: string; callerId: string }) => {
        console.log('[Socket] accept-call from', userId, '→ caller', data.callerId);
        io.to(`user:${data.callerId}`).emit('call-accepted', {
          callId: data.callId,
          acceptedBy: userId,
        });
      }
    );

    socket.on(
      'decline-call',
      (data: { callId: string; callerId: string }) => {
        console.log('[Socket] decline-call from', userId);
        io.to(`user:${data.callerId}`).emit('call-declined', {
          callId: data.callId,
          declinedBy: userId,
        });
      }
    );

    socket.on(
      'end-call',
      (data: { callId: string; participantIds: string[] }) => {
        console.log('[Socket] end-call', data.callId);
        (data.participantIds || []).forEach((pid) => {
          if (pid !== userId) {
            io.to(`user:${pid}`).emit('call-ended', { callId: data.callId });
          }
        });
      }
    );

    socket.on(
      'invite-to-call',
      (data: {
        callId: string;
        userId: string;
        roomName: string;
        type: 'AUDIO' | 'VIDEO';
        inviterName: string;
      }) => {
        console.log('[Socket] invite-to-call to', data.userId);
        io.to(`user:${data.userId}`).emit('incoming-call', {
          callId: data.callId,
          roomName: data.roomName,
          type: data.type,
          isGroup: true,
          callerId: userId,
          callerName: data.inviterName,
        });
      }
    );

    // ── Shared call room (for whiteboard / annotation sync) ───────────────

    socket.on('join-call-room', (callId: string) => {
      socket.join(`call:${callId}`);
    });

    socket.on('leave-call-room', (callId: string) => {
      socket.leave(`call:${callId}`);
    });

    socket.on(
      'whiteboard-update',
      (data: { callId: string; elements: any[] }) => {
        // Broadcast to everyone else in the call room
        socket.to(`call:${data.callId}`).emit('whiteboard-sync', {
          elements: data.elements,
          updatedBy: userId,
        });
      }
    );

    socket.on(
      'annotation-update',
      (data: { callId: string; annotation: any }) => {
        socket.to(`call:${data.callId}`).emit('annotation-sync', {
          annotation: data.annotation,
          updatedBy: userId,
        });
      }
    );

        // ── Meeting Room Events ───────────────────────────────────────────────

    socket.on('join-meeting-room', (data: { roomName: string; userId: string; name: string }) => {
      socket.join(`meeting:${data.roomName}`);
      socket.data.meetingRoom = data.roomName;
      socket.to(`meeting:${data.roomName}`).emit('participant-joined', {
        userId: data.userId,
        name: data.name,
        socketId: socket.id,
      });
    });

    socket.on('leave-meeting-room', (roomName: string) => {
      socket.leave(`meeting:${roomName}`);
      socket.to(`meeting:${roomName}`).emit('participant-left', { socketId: socket.id });
    });

    socket.on('meeting-speaking-changed', (data: { roomName: string; userId: string; isSpeaking: boolean }) => {
      socket.to(`meeting:${data.roomName}`).emit('speaking-changed', data);
    });

    socket.on('meeting-reaction', (data: { roomName: string; userId: string; name: string; emoji: string }) => {
      io.to(`meeting:${data.roomName}`).emit('reaction-received', data);
    });

    socket.on('meeting-raise-hand', (data: { roomName: string; userId: string; name: string; raised: boolean }) => {
      io.to(`meeting:${data.roomName}`).emit('hand-raised', data);
    });

    socket.on('meeting-chat', (data: { roomName: string; message: any }) => {
      io.to(`meeting:${data.roomName}`).emit('chat-received', data.message);
    });

    socket.on('meeting-screen-share', (data: { roomName: string; userId: string; active: boolean }) => {
      socket.to(`meeting:${data.roomName}`).emit('screen-share-changed', data);
    });

    socket.on('meeting-kick', (data: { roomName: string; targetUserId: string }) => {
      io.to(`meeting:${data.roomName}`).emit('participant-kicked', { targetUserId: data.targetUserId });
    });

    socket.on('meeting-mute-request', (data: { roomName: string; targetUserId: string }) => {
      io.to(`meeting:${data.roomName}`).emit('force-mute', { targetUserId: data.targetUserId });
    });

    socket.on('approval-request', (data: { roomName: string; participant: any }) => {
      io.to(`meeting:${data.roomName}`).emit('approval-needed', data.participant);
    });

    socket.on('approval-response', (data: { roomName: string; participantId: string; approved: boolean }) => {
      io.to(`meeting:${data.roomName}`).emit('approval-result', data);
    });

     socket.on('join_meeting_host', (roomId: string) => {
        socket.join(`host:${roomId}`);
      });
 
      // ── Waiting-room participant joins their private approval room ──
      socket.on('join_waiting_room', (waitingId: string) => {
        socket.join(`waiting:${waitingId}`);
      });
 
      socket.on('leave_waiting_room', (waitingId: string) => {
        socket.leave(`waiting:${waitingId}`);
      });
 
      // Host: notify others when someone enters the waiting room
      // (call this from your join API after creating the vMWaitingEntry)
      socket.on('notify_waiting_entry', ({ roomId, entry }: { roomId: string; entry: any }) => {
        io.to(`host:${roomId}`).emit('waiting_room_entry', entry);
      });

    // ── Invite team member to meeting via incoming call modal ────────────

    socket.on('invite-to-meeting', (data: {
      roomName: string;
      roomTitle: string;
      targetUserId: string;
      inviterId: string;
      inviterName: string;
      inviterImage?: string;
      type: 'AUDIO' | 'VIDEO';
    }) => {
      console.log('[Socket] invite-to-meeting from', data.inviterId, 'to', data.targetUserId);
      io.to(`user:${data.targetUserId}`).emit('incoming-meeting-invite', {
        callId: data.roomName,
        roomName: data.roomName,
        roomTitle: data.roomTitle,
        type: data.type,
        isGroup: true,
        callerId: data.inviterId,
        callerName: data.inviterName,
        callerImage: data.inviterImage,
        isMeetingInvite: true, // Flag to distinguish from regular call
      });
    });

    socket.on('meeting-invite-accepted', (data: { roomName: string; userId: string; callerId: string }) => {
      io.to(`user:${data.callerId}`).emit('meeting-invite-accepted', {
        roomName: data.roomName,
        acceptedBy: data.userId,
      });
    });

    socket.on('meeting-invite-declined', (data: { roomName: string; userId: string; callerId: string }) => {
      io.to(`user:${data.callerId}`).emit('meeting-invite-declined', {
        roomName: data.roomName,
        declinedBy: data.userId,
      });
    });

    // On disconnect, notify meeting room
    socket.on('disconnect', () => {
      if (socket.data.meetingRoom) {
        socket.to(`meeting:${socket.data.meetingRoom}`).emit('participant-left', { socketId: socket.id });
      }
      // ... existing disconnect logic
    }); 

    // ── Disconnect ────────────────────────────────────────────────────────

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User ${userId} disconnected: ${reason}`);
    });
  });

  res.socket.server.io = io;
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};