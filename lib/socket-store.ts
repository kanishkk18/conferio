// Simple global store for socket instance
// // lib/socket-store.ts
// import { Server as ServerIO } from 'socket.io';

// let io: ServerIO | null = null;

// export const setIO = (serverIo: ServerIO) => {
//   io = serverIo;
// };

// export const getIO = () => io;

import { Server as SocketIOServer } from 'socket.io';

// The socket server attaches itself to the Node.js global so API routes
// running in the same process can retrieve it without re-importing the
// initialisation file (which would try to start a second server).
declare global {
  // eslint-disable-next-line no-var
  var __socketIO: SocketIOServer | undefined;
}

export function getIO(): SocketIOServer | null {
  return global.__socketIO ?? null;
}

export function setIO(io: SocketIOServer): void {
  global.__socketIO = io;
}
