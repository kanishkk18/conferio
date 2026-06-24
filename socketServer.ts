import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

let io: SocketServer;

export const initializeSocket = async (server: HTTPServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:4002',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Redis adapter for horizontal scaling
  if (process.env.UPSTASH_REDIS_URL) {
    const pubClient = createClient({ url: process.env.UPSTASH_REDIS_URL });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.IO using Redis adapter for horizontal scaling');
  }

  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    if (!userId) { socket.disconnect(); return; }

    socket.join(`user:${userId}`);
    socket.data.userId = userId;
    console.log(`User ${userId} connected via socket`);

    // ── CALL SIGNALING ──────────────────────────────────────────────

    socket.on('initiate-call', (data: {
      callId: string; roomName: string; calleeId?: string;
      type: 'AUDIO' | 'VIDEO'; isGroup: boolean; participantIds?: string[];
      callerName: string; callerImage?: string;
    }) => {
      const targets = data.participantIds?.length
        ? data.participantIds
        : data.calleeId ? [data.calleeId] : [];

      targets.forEach(tid => {
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
    });

    socket.on('accept-call', (data: { callId: string; callerId: string }) => {
      io.to(`user:${data.callerId}`).emit('call-accepted', {
        callId: data.callId,
        acceptedBy: userId,
      });
    });

    socket.on('decline-call', (data: { callId: string; callerId: string }) => {
      io.to(`user:${data.callerId}`).emit('call-declined', {
        callId: data.callId,
        declinedBy: userId,
      });
    });

    socket.on('end-call', (data: { callId: string; participantIds: string[] }) => {
      data.participantIds.forEach(pid => {
        io.to(`user:${pid}`).emit('call-ended', { callId: data.callId });
      });
    });

    socket.on('invite-to-call', (data: {
      callId: string; userId: string; roomName: string;
      type: 'AUDIO' | 'VIDEO'; inviterName: string;
    }) => {
      io.to(`user:${data.userId}`).emit('incoming-call', {
        callId: data.callId,
        roomName: data.roomName,
        type: data.type,
        isGroup: true,
        callerId: userId,
        callerName: data.inviterName,
      });
    });

    socket.on('whiteboard-update', (data: { callId: string; elements: any[] }) => {
      socket.to(`call:${data.callId}`).emit('whiteboard-sync', {
        elements: data.elements,
        updatedBy: userId,
      });
    });

    socket.on('annotation-update', (data: { callId: string; annotation: any }) => {
      socket.to(`call:${data.callId}`).emit('annotation-sync', {
        annotation: data.annotation,
        updatedBy: userId,
      });
    });

    socket.on('join-call-room', (callId: string) => {
      socket.join(`call:${callId}`);
    });

    socket.on('leave-call-room', (callId: string) => {
      socket.leave(`call:${callId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

export const getIO = () => io;