// import { EventEmitter } from 'events';

// const emitter = new EventEmitter();
// emitter.setMaxListeners(0);

// export const SSE_EVENTS = {
//   NEW_CLIP: 'new-clip',
//   CLIP_DELETED: 'clip-deleted',
//   // Kanban events
//   TASK_CREATED: 'task:created',
//   TASK_UPDATED: 'task:updated',
//   TASK_MOVED: 'task:moved',
//   TASK_DELETED: 'task:deleted',
// } as const;

// export function broadcastClipEvent(event: string, data: any) {
//   emitter.emit(event, data);
// }

// export function subscribeToClipEvent(event: string, callback: (data: any) => void) {
//   emitter.on(event, callback);
//   return () => emitter.off(event, callback);
// }

// import { EventEmitter } from 'events';

// const emitter = new EventEmitter();
// emitter.setMaxListeners(0);

// // Track active SSE connections per board
// const activeConnections = new Map<string, number>();

// export const SSE_EVENTS = {
//   NEW_CLIP: 'new-clip',
//   CLIP_DELETED: 'clip-deleted',
//   TASK_CREATED: 'task:created',
//   TASK_UPDATED: 'task:updated',
//   TASK_MOVED: 'task:moved',
//   TASK_DELETED: 'task:deleted',
// } as const;

// export function broadcastClipEvent(event: string, data: any) {
//   const listenerCount = emitter.listenerCount(event);
//   console.log(`[SSE] Broadcasting ${event} | Listeners: ${listenerCount} | Board: ${data.boardId}`);
  
//   if (listenerCount === 0) {
//     console.warn(`[SSE] NO LISTENERS for ${event}! Event lost.`);
//   }
  
//   emitter.emit(event, data);
// }

// export function subscribeToClipEvent(event: string, callback: (data: any) => void) {
//   emitter.on(event, callback);
//   console.log(`[SSE] Listener added for ${event}. Total: ${emitter.listenerCount(event)}`);
  
//   return () => {
//     emitter.off(event, callback);
//     console.log(`[SSE] Listener removed for ${event}. Total: ${emitter.listenerCount(event)}`);
//   };
// }

// export function getActiveListenerCount(event: string): number {
//   return emitter.listenerCount(event);
// }


import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

const BROADCAST_FILE = path.join(process.cwd(), '.sse-broadcast.json');
const localEmitter = new EventEmitter();
localEmitter.setMaxListeners(0);

// Ensure broadcast file exists
if (!fs.existsSync(BROADCAST_FILE)) {
  fs.writeFileSync(BROADCAST_FILE, JSON.stringify([]));
}

function readBroadcasts(): any[] {
  try {
    const data = fs.readFileSync(BROADCAST_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeBroadcasts(broadcasts: any[]) {
  fs.writeFileSync(BROADCAST_FILE, JSON.stringify(broadcasts.slice(-50))); // Keep last 50
}

export const SSE_EVENTS = {
  NEW_CLIP: 'new-clip',
  CLIP_DELETED: 'clip-deleted',
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_MOVED: 'task:moved',
  TASK_DELETED: 'task:deleted',
} as const;

let lastCheckTime = Date.now();

export function broadcastClipEvent(event: string, data: any) {
  console.log(`[SSE-SHARED] Broadcasting ${event} to board:${data.boardId}`);
  
  // Write to shared file
  const broadcasts = readBroadcasts();
  broadcasts.push({
    event,
    data,
    timestamp: Date.now(),
    processId: process.pid,
  });
  writeBroadcasts(broadcasts);
  
  // Also emit locally for same-process listeners
  localEmitter.emit(event, data);
}

export function subscribeToClipEvent(event: string, callback: (data: any) => void) {
  localEmitter.on(event, callback);
  
  // Check for missed events from other processes
  const checkInterval = setInterval(() => {
    const broadcasts = readBroadcasts();
    const newBroadcasts = broadcasts.filter(b => 
      b.event === event && 
      b.timestamp > lastCheckTime &&
      b.processId !== process.pid
    );
    
    if (newBroadcasts.length > 0) {
      console.log(`[SSE-SHARED] Replaying ${newBroadcasts.length} missed events`);
      newBroadcasts.forEach(b => callback(b.data));
    }
    
    lastCheckTime = Date.now();
  }, 500); // Check every 500ms
  
  return () => {
    localEmitter.off(event, callback);
    clearInterval(checkInterval);
  };
}