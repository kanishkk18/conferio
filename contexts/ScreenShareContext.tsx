// contexts/ScreenShareContext.tsx
// Single SSE connection shared across the whole app.

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';

// ── Types ──────────────────────────────────────────────────────
export interface ScreenShareRequest {
  sessionId: string;
  adminName: string;
  adminEmail?: string;
  adminImage?: string;
  teamName?: string;
}

type SSEEvent =
  | { type: 'SCREEN_SHARE_REQUEST'; sessionId: string; adminName: string; adminEmail?: string; adminImage?: string; teamName?: string }
  | { type: 'SCREEN_SHARE_ACCEPTED'; sessionId: string }
  | { type: 'SCREEN_SHARE_REJECTED'; sessionId: string }
  | { type: 'SCREEN_SHARE_STARTED'; sessionId: string }
  | { type: 'SCREEN_SHARE_ENDED'; sessionId: string };

type Listener = (event: SSEEvent) => void;

interface ScreenShareContextValue {
  // Incoming request (for employee consent modal)
  incomingRequest: ScreenShareRequest | null;
  clearIncomingRequest: () => void;

  // Subscribe to any SSE event (for ProfileSidebar admin side)
  subscribe: (listener: Listener) => () => void;

  // Active sessions the current admin is viewing
  activeSessions: Record<string, 'waiting' | 'accepted' | 'viewing' | 'ended'>;
  setSessionState: (id: string, state: 'waiting' | 'accepted' | 'viewing' | 'ended') => void;
  clearSession: (id: string) => void;
}

const ScreenShareContext = createContext<ScreenShareContextValue | null>(null);

export function ScreenShareProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [incomingRequest, setIncomingRequest] = useState<ScreenShareRequest | null>(null);
  const [activeSessions, setActiveSessions] = useState<Record<string, 'waiting' | 'accepted' | 'viewing' | 'ended'>>({});
  const listenersRef = useRef<Set<Listener>>(new Set());
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const broadcast = useCallback((event: SSEEvent) => {
    listenersRef.current.forEach((fn) => fn(event));
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    const connect = () => {
      if (esRef.current) {
        esRef.current.close();
      }

      const es = new EventSource('/api/screenshare/events');
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const data: SSEEvent = JSON.parse(e.data);

          // Incoming request → show consent modal for employee
          if (data.type === 'SCREEN_SHARE_REQUEST') {
            setIncomingRequest({
              sessionId: data.sessionId,
              adminName: data.adminName,
              adminEmail: data.adminEmail,
              adminImage: data.adminImage,
              teamName: data.teamName,
            });
          }

          // Broadcast to all subscribers (admin sidebar, etc.)
          broadcast(data);

          // Mirror into activeSessions for admin
          if (data.type === 'SCREEN_SHARE_ACCEPTED') {
            setActiveSessions((prev) => ({ ...prev, [data.sessionId]: 'accepted' }));
          }
          if (data.type === 'SCREEN_SHARE_STARTED') {
            setActiveSessions((prev) => ({ ...prev, [data.sessionId]: 'viewing' }));
          }
          if (data.type === 'SCREEN_SHARE_REJECTED' || data.type === 'SCREEN_SHARE_ENDED') {
            setActiveSessions((prev) => ({ ...prev, [data.sessionId]: 'ended' }));
            // Auto-clear after 3 s
            setTimeout(() => {
              setActiveSessions((prev) => {
                const next = { ...prev };
                delete next[data.sessionId];
                return next;
              });
            }, 3000);
          }
        } catch (_) {}
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        // Exponential backoff up to 30 s
        const delay = Math.min(30000, 3000);
        reconnectTimer.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [status, session?.user?.id, broadcast]);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const clearIncomingRequest = useCallback(() => setIncomingRequest(null), []);

  const setSessionState = useCallback((id: string, state: 'waiting' | 'accepted' | 'viewing' | 'ended') => {
    setActiveSessions((prev) => ({ ...prev, [id]: state }));
  }, []);

  const clearSession = useCallback((id: string) => {
    setActiveSessions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return (
    <ScreenShareContext.Provider
      value={{
        incomingRequest,
        clearIncomingRequest,
        subscribe,
        activeSessions,
        setSessionState,
        clearSession,
      }}
    >
      {children}
    </ScreenShareContext.Provider>
  );
}

export function useScreenShareContext() {
  const ctx = useContext(ScreenShareContext);
  if (!ctx) throw new Error('useScreenShareContext must be used inside <ScreenShareProvider>');
  return ctx;
}
