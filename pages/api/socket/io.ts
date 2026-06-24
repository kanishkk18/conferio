// import { Server as NetServer } from "http";
// import { NextApiRequest } from "next";
// import { Server as ServerIO } from "socket.io";

// import { NextApiResponseServerIo } from "types";

// export const config = {
//   api: {
//     bodyParser: false
//   }
// };

// const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
//   if (!res.socket.server.io) {
//     const path = "/api/socket/io";
//     const httpServer: NetServer = res.socket.server as any;
//     const io = new ServerIO(httpServer, {
//       path,
//       // @ts-ignore
//       addTrailingSlash: false
//     });
//     res.socket.server.io = io;
//   }

//   res.end();
// };

// export default ioHandler;

// import { Server as NetServer } from 'http';
// import { NextApiRequest } from 'next';
// import { Server as ServerIO } from 'socket.io';
// import { NextApiResponseServerIo } from 'types/socket';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
//   if (!res.socket.server.io) {
//     const path = '/api/socket/io';
//     const httpServer: NetServer = res.socket.server as any;
//     const io = new ServerIO(httpServer, {
//       path: path,
//       addTrailingSlash: false,
//     });

//     io.on('connection', (socket) => {
//       console.log('Socket connected:', socket.id);

//       socket.on('join_conversation', (conversationId: string) => {
//         socket.join(`conversation:${conversationId}`);
//         console.log(`Socket ${socket.id} joined conversation:${conversationId}`);
//       });

//       socket.on('leave_conversation', (conversationId: string) => {
//         socket.leave(`conversation:${conversationId}`);
//         console.log(`Socket ${socket.id} left conversation:${conversationId}`);
//       });

//       socket.on('send_message', (data) => {
//         socket.to(`conversation:${data.conversationId}`).emit('new_message', data);
//       });

//       socket.on('disconnect', () => {
//         console.log('Socket disconnected:', socket.id);
//       });
//     });

//     res.socket.server.io = io;
//   }

//   res.end();
// };

// export default ioHandler;

// import { Server as NetServer } from 'http';
// import { NextApiRequest } from 'next';
// import { Server as ServerIO } from 'socket.io';
// import { NextApiResponseServerIo } from 'types/socket';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
//   if (!res.socket.server.io) {
//     const path = '/api/socket/io';
//     const httpServer: NetServer = res.socket.server as any;
//     const io = new ServerIO(httpServer, {
//       path: path,
//       addTrailingSlash: false,
//       cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//       },
//       transports: ['websocket', 'polling']
//     });

//     io.on('connection', (socket) => {
//       console.log('[SOCKET] Connected:', socket.id);

//       // Join user-specific room for direct notifications
//       socket.on('join_user', (userId: string) => {
//         socket.join(`user:${userId}`);
//         console.log(`[SOCKET] User ${userId} joined their room`);
//       });

//       // Leave user room
//       socket.on('leave_user', (userId: string) => {
//         socket.leave(`user:${userId}`);
//       });

//       // Chat events
//       socket.on('join_conversation', (conversationId: string) => {
//         socket.join(`conversation:${conversationId}`);
//         console.log(`[SOCKET] Joined conversation:${conversationId}`);
//       });

//       socket.on('leave_conversation', (conversationId: string) => {
//         socket.leave(`conversation:${conversationId}`);
//         console.log(`[SOCKET] Left conversation:${conversationId}`);
//       });

//       // Call events
//       socket.on('join_call', (callId: string) => {
//         socket.join(`call:${callId}`);
//         console.log(`[SOCKET] Joined call:${callId}`);
//       });

//       socket.on('leave_call', (callId: string) => {
//         socket.leave(`call:${callId}`);
//         console.log(`[SOCKET] Left call:${callId}`);
//       });

//       // WebRTC signaling
//       socket.on('call-offer', (data: { callId: string; offer: any; to: string }) => {
//         io.to(`user:${data.to}`).emit('call-offer', {
//           callId: data.callId,
//           offer: data.offer,
//           from: socket.id
//         });
//       });

//       socket.on('call-answer', (data: { callId: string; answer: any; to: string }) => {
//         io.to(`user:${data.to}`).emit('call-answer', {
//           callId: data.callId,
//           answer: data.answer
//         });
//       });

//       socket.on('ice-candidate', (data: { callId: string; candidate: any; to: string }) => {
//         io.to(`user:${data.to}`).emit('ice-candidate', {
//           callId: data.callId,
//           candidate: data.candidate
//         });
//       });

//       socket.on('call-end', (data: { callId: string; to: string }) => {
//         io.to(`user:${data.to}`).emit('call-end', { callId: data.callId });
//       });

//       socket.on('disconnect', () => {
//         console.log('[SOCKET] Disconnected:', socket.id);
//       });
//     });

//     res.socket.server.io = io;
//   }

//   res.end();
// };

// export default ioHandler;

import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIo } from 'types/socket';
import { setIO } from '@/lib/socket-store';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = '/api/socket/io';
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    (global as any).__socketIO = io;

    io.on('connection', (socket) => {
      console.log('[SOCKET] Connected:', socket.id);

      // socket.on('join_channel', (channelId: string) => {
      //   socket.join(`channel:${channelId}`);
      //   console.log(`[SOCKET] Joined channel: ${channelId}`);
      // });

      // socket.on('leave_channel', (channelId: string) => {
      //   socket.leave(`channel:${channelId}`);
      // });

      socket.on('disconnect', (reason) => {
        console.log('[SOCKET] Disconnected:', socket.id, reason);
      });


      socket.on('join_user', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`[SOCKET] User ${userId} joined room`);
      });

      socket.on('leave_user', (userId: string) => {
        socket.leave(`user:${userId}`);
      });

      socket.on('join_channel', (channelId: string) => {
        socket.join(`channel:${channelId}`);
        console.log(`[SOCKET] Joined channel: ${channelId}`);
      });

      socket.on('leave_channel', (channelId: string) => {
        socket.leave(`channel:${channelId}`);
      });

      // Thread room
      socket.on('join_thread', (messageId: string) => {
        socket.join(`thread:${messageId}`);
      });

      // Chat events
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
      });

      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
      });

      // Call events
      socket.on('join_call', (callId: string) => {
        socket.join(`call:${callId}`);
        console.log(`[SOCKET] Joined call room: ${callId}`);
      });

      socket.on('leave_call', (callId: string) => {
        socket.leave(`call:${callId}`);
        console.log(`[SOCKET] Left call room: ${callId}`);
      });

      // CRITICAL: Handle call-initiated event
      socket.on('call-initiated', (data: { call: any; to: string }) => {
        console.log('[SOCKET] Call initiated to:', data.to);
        io.to(`user:${data.to}`).emit('incoming-call', data.call);
      });

      // Handle call-answered event
      socket.on('call-answered', (data: { call: any; to: string }) => {
        console.log('[SOCKET] Call answered, notifying:', data.to);
        io.to(`user:${data.to}`).emit('call-answered', data);
      });

      // Handle call-declined event
      socket.on('call-declined', (data: { call: any; to: string }) => {
        console.log('[SOCKET] Call declined, notifying:', data.to);
        io.to(`user:${data.to}`).emit('call-declined', data);
      });

      // Handle call-end event
      socket.on('call-end', (data: { callId: string; to: string }) => {
        console.log('[SOCKET] Call ended, notifying:', data.to);
        io.to(`user:${data.to}`).emit('call-ended', { call: { id: data.callId } });
      });

      // WebRTC signaling
      socket.on('call-offer', (data: { callId: string; offer: any; to: string }) => {
        console.log('[SOCKET] Forwarding offer to:', data.to);
        io.to(`user:${data.to}`).emit('call-offer', {
          callId: data.callId,
          offer: data.offer,
          from: socket.id
        });
      });

      socket.on('call-answer', (data: { callId: string; answer: any; to: string }) => {
        console.log('[SOCKET] Forwarding answer to:', data.to);
        io.to(`user:${data.to}`).emit('call-answer', {
          callId: data.callId,
          answer: data.answer
        });
      });

      socket.on('ice-candidate', (data: { callId: string; candidate: any; to: string }) => {
        io.to(`user:${data.to}`).emit('ice-candidate', {
          callId: data.callId,
          candidate: data.candidate
        });
      })

      // video-meeting 

      socket.on('join_meeting_host', (roomId: string) => {
        socket.join(`meeting_host:${roomId}`);
        console.log(`[SOCKET] Host joined meeting room: ${roomId}`);
      });

      socket.on('leave_meeting_host', (roomId: string) => {
        socket.leave(`meeting_host:${roomId}`);
      });

      /**
       * Participant joins this room while waiting for approval.
       * The approve API emits 'approval_decision' to this room.
       * waitingId is the DB VMWaitingEntry id.
       */
      socket.on('join_waiting', (waitingId: string) => {
        socket.join(`waiting:${waitingId}`);
        console.log(`[SOCKET] Participant joined waiting room: ${waitingId}`);
      });

      socket.on('leave_waiting', (waitingId: string) => {
        socket.leave(`waiting:${waitingId}`);
      });

      // Host joins a room for their meeting
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

      socket.on('join-whiteboard', (roomId: string) => {
        socket.join(`wb:${roomId}`);
        console.log(`[SOCKET] ${socket.id} joined whiteboard wb:${roomId}`);
      });

      socket.on('leave-whiteboard', (roomId: string) => {
        socket.leave(`wb:${roomId}`);
      });

      socket.on('wb-action', (data: { roomId: string; action: any }) => {
        // Broadcast to everyone else in the whiteboard room
        socket.to(`wb:${data.roomId}`).emit('wb-action', data.action);
      });

    });

    res.socket.server.io = io;
    setIO(io); // Store globally
    console.log('[SOCKET] Server initialized');
  }

  res.end();
};

export default ioHandler;

