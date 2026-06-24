// import { NextApiRequest, NextApiResponse } from 'next';
// import { subscribeToClipEvent, SSE_EVENTS } from '@/lib/sse';

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(405).end();
//   }

//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache, no-store, no-transform');
//   res.setHeader('Connection', 'keep-alive');
//   res.setHeader('X-Accel-Buffering', 'no');

//   res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

//   const heartbeat = setInterval(() => {
//     res.write(':heartbeat\n\n');
//   }, 30000);

//   const handler = (data: any) => {
//     res.write(`data: ${JSON.stringify(data)}\n\n`);
//   };

//   const unsub1 = subscribeToClipEvent(SSE_EVENTS.NEW_CLIP, handler);
//   const unsub2 = subscribeToClipEvent(SSE_EVENTS.CLIP_DELETED, handler);
//   const unsub3 = subscribeToClipEvent(SSE_EVENTS.CLIP_UPDATED, handler);

//   req.on('close', () => {
//     clearInterval(heartbeat);
//     unsub1();
//     unsub2();
//     unsub3();
//   });
// }

// import { NextApiRequest, NextApiResponse } from 'next';
// import { subscribeToClipEvent, SSE_EVENTS } from '@/lib/sse';

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(405).end();
//   }

//   console.log(`[SSE] Client connected from ${req.socket.remoteAddress}`);

//   // Critical: Disable response buffering/compression for SSE
//   req.socket.setTimeout(0);
//   req.socket.setNoDelay(true);
//   req.socket.setKeepAlive(true);

//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache, no-store, no-transform');
//   res.setHeader('Connection', 'keep-alive');
//   res.setHeader('X-Accel-Buffering', 'no');
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Send initial connection event with timestamp for sync
//   res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

//   // Heartbeat every 15 seconds (more frequent to prevent timeout)
//   const heartbeat = setInterval(() => {
//     try {
//       res.write(`:heartbeat\n\n`);
//     } catch (err) {
//       console.error('[SSE] Heartbeat failed, cleaning up');
//       cleanup();
//     }
//   }, 15000);

//   const sendEvent = (data: any) => {
//     try {
//       res.write(`data: ${JSON.stringify(data)}\n\n`);
//       console.log(`[SSE] Event sent: ${data.type}`);
//     } catch (err) {
//       console.error('[SSE] Send failed:', err);
//       cleanup();
//     }
//   };

//   const unsub1 = subscribeToClipEvent(SSE_EVENTS.TASK_CREATED, sendEvent);
//   const unsub2 = subscribeToClipEvent(SSE_EVENTS.TASK_UPDATED, sendEvent);
//   const unsub3 = subscribeToClipEvent(SSE_EVENTS.TASK_MOVED, sendEvent);
//   const unsub4 = subscribeToClipEvent(SSE_EVENTS.TASK_DELETED, sendEvent);
//   const unsub5 = subscribeToClipEvent(SSE_EVENTS.NEW_CLIP, sendEvent);
//   const unsub6 = subscribeToClipEvent(SSE_EVENTS.CLIP_DELETED, sendEvent);

//   const cleanup = () => {
//     console.log('[SSE] Cleaning up connection');
//     clearInterval(heartbeat);
//     unsub1();
//     unsub2();
//     unsub3();
//     unsub4();
//     unsub5();
//     unsub6();
//     try {
//       res.end();
//     } catch (e) {}
//   };

//   req.on('close', cleanup);
//   req.on('error', cleanup);
//   req.on('timeout', cleanup);
  
//   // Handle client disconnect detection
//   res.on('error', cleanup);
// }

import { NextApiRequest, NextApiResponse } from 'next';
import { subscribeToClipEvent, SSE_EVENTS } from '@/lib/sse';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  console.log(`[SSE] Client connected (PID: ${process.pid})`);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-store, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  res.write(`data: ${JSON.stringify({ type: 'connected', pid: process.pid })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(`:heartbeat\n\n`);
    } catch {
      cleanup();
    }
  }, 15000);

  const sendEvent = (data: any) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      console.log(`[SSE] Sent: ${data.type}`);
    } catch {
      cleanup();
    }
  };

  const unsub1 = subscribeToClipEvent(SSE_EVENTS.TASK_CREATED, sendEvent);
  const unsub2 = subscribeToClipEvent(SSE_EVENTS.TASK_UPDATED, sendEvent);
  const unsub3 = subscribeToClipEvent(SSE_EVENTS.TASK_MOVED, sendEvent);
  const unsub4 = subscribeToClipEvent(SSE_EVENTS.TASK_DELETED, sendEvent);
  const unsub5 = subscribeToClipEvent(SSE_EVENTS.NEW_CLIP, sendEvent);
  const unsub6 = subscribeToClipEvent(SSE_EVENTS.CLIP_DELETED, sendEvent);

  const cleanup = () => {
    console.log(`[SSE] Client disconnected (PID: ${process.pid})`);
    clearInterval(heartbeat);
    unsub1();
    unsub2();
    unsub3();
    unsub4();
    unsub5();
    unsub6();
    try { res.end(); } catch {}
  };

  req.on('close', cleanup);
  req.on('error', cleanup);
}