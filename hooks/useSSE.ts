// import { useEffect, useRef, useCallback } from 'react';

// export function useSSE(onMessage: (data: any) => void) {
//   const eventSourceRef = useRef<EventSource | null>(null);
//   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastEventIdRef = useRef<string>('');

//   const connect = useCallback(() => {
//     if (eventSourceRef.current?.readyState === EventSource.OPEN) {
//       return;
//     }

//     console.log('[SSE Client] Connecting...');
//     const eventSource = new EventSource('/api/sse');

//     eventSource.onopen = () => {
//       console.log('[SSE Client] Connection opened');
//     };

//     eventSource.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
        
//         if (data.type === 'connected') {
//           console.log('[SSE Client] Connected, server timestamp:', data.timestamp);
//           return;
//         }
        
//         if (data.type === 'heartbeat') {
//           return;
//         }
        
//         console.log('[SSE Client] Received:', data.type);
//         onMessage(data);
//       } catch (e) {
//         console.error('[SSE Client] Parse error:', e, 'Raw:', event.data);
//       }
//     };

//     eventSource.onerror = (error) => {
//       console.error('[SSE Client] Error:', error);
//       eventSource.close();
//       eventSourceRef.current = null;
      
//       // Reconnect after 2 seconds
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//       reconnectTimeoutRef.current = setTimeout(() => {
//         console.log('[SSE Client] Reconnecting...');
//         connect();
//       }, 2000);
//     };

//     eventSourceRef.current = eventSource;
//   }, [onMessage]);

//   useEffect(() => {
//     connect();
    
//     return () => {
//       console.log('[SSE Client] Cleanup');
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//     };
//   }, [connect]);
// }

"use client";

import { useEffect, useRef, useCallback } from "react";

export function useSSE(onMessage: (data: any) => void) {
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const onMessageRef = useRef(onMessage);

  // Keep callback ref up to date
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (esRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    console.log("[SSE Client] Connecting...");
    const es = new EventSource("/api/sse");
    esRef.current = es;

    es.onopen = () => {
      console.log("[SSE Client] Connection opened");
    };

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === "connected") {
          console.log("[SSE Client] Connected, server PID:", data.pid);
          return;
        }

        // Skip heartbeat comments (lines starting with ":")
        if (e.data.startsWith(":")) {
          return;
        }

        console.log("[SSE Client] Received:", data.type, "for board:", data.boardId);
        onMessageRef.current(data);
      } catch (err) {
        // Ignore parse errors for heartbeat comments
        if (!e.data.startsWith(":")) {
          console.error("[SSE Client] Parse error:", err, "Raw:", e.data);
        }
      }
    };

    es.onerror = () => {
      console.error("[SSE Client] Connection error, closing...");
      es.close();
      esRef.current = null;

      // Reconnect after 2 seconds
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(() => {
        console.log("[SSE Client] Reconnecting...");
        connect();
      }, 2000);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      console.log("[SSE Client] Cleanup");
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [connect]);
}