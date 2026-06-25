// // import { EventEmitter } from 'events';

// // const emitter = new EventEmitter();
// // emitter.setMaxListeners(0);

// // export const SSE_EVENTS = {
// //   NEW_CLIP: 'new-clip',
// //   CLIP_DELETED: 'clip-deleted',
// //   // Kanban events
// //   TASK_CREATED: 'task:created',
// //   TASK_UPDATED: 'task:updated',
// //   TASK_MOVED: 'task:moved',
// //   TASK_DELETED: 'task:deleted',
// // } as const;

// // export function broadcastClipEvent(event: string, data: any) {
// //   emitter.emit(event, data);
// // }

// // export function subscribeToClipEvent(event: string, callback: (data: any) => void) {
// //   emitter.on(event, callback);
// //   return () => emitter.off(event, callback);
// // }

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


// import fs from 'fs';
// import path from 'path';
// import { EventEmitter } from 'events';

// const BROADCAST_FILE = path.join(process.cwd(), '.sse-broadcast.json');
// const localEmitter = new EventEmitter();
// localEmitter.setMaxListeners(0);

// // Ensure broadcast file exists
// if (!fs.existsSync(BROADCAST_FILE)) {
//   fs.writeFileSync(BROADCAST_FILE, JSON.stringify([]));
// }

// function readBroadcasts(): any[] {
//   try {
//     const data = fs.readFileSync(BROADCAST_FILE, 'utf-8');
//     return JSON.parse(data);
//   } catch {
//     return [];
//   }
// }

// function writeBroadcasts(broadcasts: any[]) {
//   fs.writeFileSync(BROADCAST_FILE, JSON.stringify(broadcasts.slice(-50))); // Keep last 50
// }

// export const SSE_EVENTS = {
//   NEW_CLIP: 'new-clip',
//   CLIP_DELETED: 'clip-deleted',
//   TASK_CREATED: 'task:created',
//   TASK_UPDATED: 'task:updated',
//   TASK_MOVED: 'task:moved',
//   TASK_DELETED: 'task:deleted',
// } as const;

// let lastCheckTime = Date.now();

// export function broadcastClipEvent(event: string, data: any) {
//   console.log(`[SSE-SHARED] Broadcasting ${event} to board:${data.boardId}`);
  
//   // Write to shared file
//   const broadcasts = readBroadcasts();
//   broadcasts.push({
//     event,
//     data,
//     timestamp: Date.now(),
//     processId: process.pid,
//   });
//   writeBroadcasts(broadcasts);
  
//   // Also emit locally for same-process listeners
//   localEmitter.emit(event, data);
// }

// export function subscribeToClipEvent(event: string, callback: (data: any) => void) {
//   localEmitter.on(event, callback);
  
//   // Check for missed events from other processes
//   const checkInterval = setInterval(() => {
//     const broadcasts = readBroadcasts();
//     const newBroadcasts = broadcasts.filter(b => 
//       b.event === event && 
//       b.timestamp > lastCheckTime &&
//       b.processId !== process.pid
//     );
    
//     if (newBroadcasts.length > 0) {
//       console.log(`[SSE-SHARED] Replaying ${newBroadcasts.length} missed events`);
//       newBroadcasts.forEach(b => callback(b.data));
//     }
    
//     lastCheckTime = Date.now();
//   }, 500); // Check every 500ms
  
//   return () => {
//     localEmitter.off(event, callback);
//     clearInterval(checkInterval);
//   };
// }

// lib/sse.ts
import { EventEmitter } from 'events';
import IORedis from 'ioredis';

const localEmitter = new EventEmitter();
localEmitter.setMaxListeners(0);

export const SSE_EVENTS = {
  NEW_CLIP: 'new-clip',
  CLIP_DELETED: 'clip-deleted',
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_MOVED: 'task:moved',
  TASK_DELETED: 'task:deleted',
} as const;

// ─── Redis clients ────────────────────────────────────────────────────────────
// Pub/Sub requires dedicated connections — they can't be reused for commands.
// We lazy-init them so the module is safe to import on the edge/client side.

let publisher: IORedis | null = null;
let subscriber: IORedis | null = null;

function getPublisher(): IORedis {
  if (!publisher) {
    publisher = new IORedis(process.env.UPSTASH_REDIS_URL!, {
      maxRetriesPerRequest: 3,
      tls: {}, // required for rediss:// on Upstash
    });
    publisher.on('error', (err) => console.warn('[SSE:pub] Redis error:', err.message));
  }
  return publisher;
}

function getSubscriber(): IORedis {
  if (!subscriber) {
    subscriber = new IORedis(process.env.UPSTASH_REDIS_URL!, {
      maxRetriesPerRequest: 3,
      tls: {},
    });
    subscriber.on('error', (err) => console.warn('[SSE:sub] Redis error:', err.message));
  }
  return subscriber;
}

// ─── Broadcast ────────────────────────────────────────────────────────────────

export async function broadcastClipEvent(event: string, data: any) {
  console.log(`[SSE] Broadcasting "${event}"`);

  const payload = JSON.stringify({ event, data });

  try {
    await getPublisher().publish('sse:channel', payload);
  } catch (err) {
    console.warn('[SSE] Redis publish failed, local-only:', err);
  }

  // Fast path: same-instance listeners get it immediately without round-trip
  localEmitter.emit(event, data);
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

let redisSubscribed = false;

function ensureRedisSubscription() {
  if (redisSubscribed) return;
  redisSubscribed = true;

  const sub = getSubscriber();

  sub.subscribe('sse:channel', (err) => {
    if (err) console.warn('[SSE] subscribe error:', err.message);
  });

  sub.on('message', (_channel: string, raw: string) => {
    try {
      const { event, data } = JSON.parse(raw);
      // Re-emit on localEmitter so all subscribeToClipEvent callbacks fire
      localEmitter.emit(`redis:${event}`, data);
    } catch {
      // malformed payload — ignore
    }
  });
}

export function subscribeToClipEvent(
  event: string,
  callback: (data: any) => void
): () => void {
  // Local listener — catches same-instance broadcasts immediately (no Redis round-trip)
  localEmitter.on(event, callback);

  // Cross-instance listener — fired when Redis delivers a message from another instance
  const redisEventKey = `redis:${event}`;
  localEmitter.on(redisEventKey, callback);

  // Ensure we're subscribed to Redis (idempotent)
  try {
    ensureRedisSubscription();
  } catch (err) {
    console.warn('[SSE] Could not set up Redis subscription:', err);
  }

  return () => {
    localEmitter.off(event, callback);
    localEmitter.off(redisEventKey, callback);
  };
}