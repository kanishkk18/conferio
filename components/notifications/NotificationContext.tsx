// // components/notifications/NotificationContext.tsx
// import React, {
//   createContext,
//   useContext,
//   useCallback,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import { useSession } from "next-auth/react";
// import type { AppNotification, ToastNotification } from "../../types/notifications";

// const TOAST_DURATION_MS = 7000; // 7 seconds (between 6–8)
// const MAX_TOASTS = 5;

// interface NotificationContextValue {
//   notifications: AppNotification[];
//   toasts: ToastNotification[];
//   unreadCount: number;
//   isLoading: boolean;
//   // Actions
//   markRead: (id: string) => Promise<void>;
//   markAllRead: () => Promise<void>;
//   dismiss: (id: string) => void;
//   dismissToast: (id: string) => void;
//   fetchMore: (page?: number) => Promise<void>;
// }

// const NotificationContext = createContext<NotificationContextValue | null>(null);

// export function NotificationProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [notifications, setNotifications] = useState<AppNotification[]>([]);
//   const [toasts, setToasts] = useState<ToastNotification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const eventSourceRef = useRef<EventSource | null>(null);
//   const toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
//   const { status } = useSession();
 
//   // ── SSE connection ─────────────────────────────────────────────────────
//   useEffect(() => {
//     const connect = () => {
//       const es = new EventSource("/api/notifications/stream");
//       eventSourceRef.current = es;

//       es.onmessage = (event) => {
//         try {
//           const payload = JSON.parse(event.data);

//           if (payload.type === "initial") {
//             // Initial unread dump on connect
//             const incoming: AppNotification[] = payload.notifications;
//             setNotifications((prev) => mergeNotifications(prev, incoming));
//             setUnreadCount(incoming.filter((n) => !n.read).length);
//             // Show toasts for the most recent 3 unread
//             incoming.slice(0, 3).forEach((n) => queueToast(n));
//           } else if (payload.type === "notification") {
//             // Single new notification pushed in real-time
//             const n: AppNotification = payload.notification;
//             setNotifications((prev) => [n, ...prev]);
//             setUnreadCount((c) => c + 1);
//             queueToast(n);
//           }
//         } catch (e) {
//           console.error("[SSE] parse error", e);
//         }
//       };

//       es.onerror = () => {
//         es.close();
//         // Reconnect after 5s
//         setTimeout(connect, 5000);
//       };
//     };

//     connect();

//     return () => {
//       eventSourceRef.current?.close();
//     };
//   }, []);

//   // ── Toast helpers ──────────────────────────────────────────────────────
//   const queueToast = useCallback((n: AppNotification) => {
//     setToasts((prev) => {
//       if (prev.length >= MAX_TOASTS) {
//         // Remove oldest
//         const [oldest, ...rest] = prev;
//         clearToastTimer(oldest.id);
//         return [...rest, { ...n, autoDismissMs: TOAST_DURATION_MS }];
//       }
//       return [...prev, { ...n, autoDismissMs: TOAST_DURATION_MS }];
//     });

//     // Auto-dismiss timer
//     const timer = setTimeout(() => {
//       dismissToast(n.id);
//     }, TOAST_DURATION_MS);
//     toastTimersRef.current.set(n.id, timer);
//   }, []);

//   const clearToastTimer = (id: string) => {
//     const timer = toastTimersRef.current.get(id);
//     if (timer) {
//       clearTimeout(timer);
//       toastTimersRef.current.delete(id);
//     }
//   };

//   const dismissToast = useCallback((id: string) => {
//     clearToastTimer(id);
//     setToasts((prev) => prev.filter((t) => t.id !== id));
//   }, []);

//   // ── Notification actions ───────────────────────────────────────────────
//   const markRead = useCallback(async (id: string) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//     );
//     setUnreadCount((c) => Math.max(0, c - 1));

//     await fetch(`/api/notifications/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ action: "read" }),
//     });
//   }, []);

//   const markAllRead = useCallback(async () => {
//     setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//     setUnreadCount(0);

//     await fetch("/api/notifications/mark-all-read", { method: "POST" });
//   }, []);

//   const dismiss = useCallback(async (id: string) => {
//     setNotifications((prev) => prev.filter((n) => n.id !== id));
//     setUnreadCount((c) => Math.max(0, c - 1));
//     dismissToast(id);

//     await fetch(`/api/notifications/${id}`, { method: "DELETE" });
//   }, [dismissToast]);

//   // ── Fetch more (pagination) ────────────────────────────────────────────
//   const fetchMore = useCallback(async (page = 1) => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`/api/notifications?page=${page}&pageSize=20`);
//       const data = await res.json();
//       const fetched: AppNotification[] = data.notifications;
//       setNotifications((prev) =>
//         page === 1 ? fetched : mergeNotifications(prev, fetched)
//       );
//       setUnreadCount(fetched.filter((n) => !n.read).length);
//     } catch (e) {
//       console.error("[Notifications] fetchMore error", e);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Initial fetch
//   // useEffect(() => {
//   //   fetchMore(1);
//   // }, [fetchMore]);

//    useEffect(() => {
//     if (status === "authenticated") {
//       fetchMore(1);
//     } else if (status === "unauthenticated") {
//       setNotifications([]);
//       setUnreadCount(0);
//       setIsLoading(false);
//     }
//   }, [status, fetchMore]);

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         toasts,
//         unreadCount,
//         isLoading,
//         markRead,
//         markAllRead,
//         dismiss,
//         dismissToast,
//         fetchMore,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// }

// export function useNotifications() {
//   const ctx = useContext(NotificationContext);
//   if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
//   return ctx;
// }

// // ── Helpers ──────────────────────────────────────────────────────────────
// function mergeNotifications(
//   existing: AppNotification[],
//   incoming: AppNotification[]
// ): AppNotification[] {
//   const map = new Map(existing.map((n) => [n.id, n]));
//   for (const n of incoming) {
//     if (!map.has(n.id)) map.set(n.id, n);
//   }
//   return Array.from(map.values()).sort(
//     (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//   );
// }


// components/notifications/NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppNotification, ToastNotification } from "../../types/notifications";

const TOAST_DURATION_MS = 7000;
const MAX_TOASTS = 5;

interface NotificationContextValue {
  notifications: AppNotification[];
  toasts: ToastNotification[];
  unreadCount: number;
  isLoading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => void;
  dismissToast: (id: string) => void;
  fetchMore: (page?: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ── Fetcher ───────────────────────────────────────────────────────────────
async function fetchNotifications(page: number): Promise<AppNotification[]> {
  const res = await fetch(`/api/notifications?page=${page}&pageSize=20`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const data = await res.json();
  return data.notifications;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const queryClient = useQueryClient();

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pageRef = useRef(1);

  // ── React Query for initial + paginated fetch ─────────────────────────
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", pageRef.current],
    queryFn: () => fetchNotifications(pageRef.current),
    enabled: isAuthenticated,           // ✅ Never runs when not authed
    staleTime: 30_000,
    onSuccess: (data) => {
      setUnreadCount(data.filter((n) => !n.read).length);
    },
  });

  // ── SSE — only connect when authenticated ─────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up any lingering connection if session expires
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      return;
    }

    let retryTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      const es = new EventSource("/api/notifications/stream");
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === "initial") {
            const incoming: AppNotification[] = payload.notifications;
            // Merge into React Query cache
            queryClient.setQueryData<AppNotification[]>(
              ["notifications", 1],
              (prev = []) => mergeNotifications(prev, incoming)
            );
            setUnreadCount(incoming.filter((n) => !n.read).length);
            incoming.slice(0, 3).forEach((n) => queueToast(n));
          } else if (payload.type === "notification") {
            const n: AppNotification = payload.notification;
            // Prepend to cache
            queryClient.setQueryData<AppNotification[]>(
              ["notifications", 1],
              (prev = []) => [n, ...prev]
            );
            setUnreadCount((c) => c + 1);
            queueToast(n);
          }
        } catch (e) {
          console.error("[SSE] parse error", e);
        }
      };

      es.onerror = (e) => {
        es.close();
        eventSourceRef.current = null;

        // ✅ Don't retry if user became unauthenticated
        if (status !== "authenticated") return;

        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimeout);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [isAuthenticated]); // ✅ Re-runs only when auth status changes

  // ── Toast helpers ─────────────────────────────────────────────────────
  const clearToastTimer = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    clearToastTimer(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, [clearToastTimer]);

  const queueToast = useCallback((n: AppNotification) => {
    setToasts((prev) => {
      if (prev.length >= MAX_TOASTS) {
        const [oldest, ...rest] = prev;
        clearToastTimer(oldest.id);
        return [...rest, { ...n, autoDismissMs: TOAST_DURATION_MS }];
      }
      return [...prev, { ...n, autoDismissMs: TOAST_DURATION_MS }];
    });

    const timer = setTimeout(() => dismissToast(n.id), TOAST_DURATION_MS);
    toastTimersRef.current.set(n.id, timer);
  }, [clearToastTimer, dismissToast]);

  // ── Notification actions ──────────────────────────────────────────────
  const markRead = useCallback(async (id: string) => {
    queryClient.setQueryData<AppNotification[]>(
      ["notifications", pageRef.current],
      (prev = []) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read" }),
    });
  }, [queryClient]);

  const markAllRead = useCallback(async () => {
    queryClient.setQueryData<AppNotification[]>(
      ["notifications", pageRef.current],
      (prev = []) => prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
  }, [queryClient]);

  const dismiss = useCallback(async (id: string) => {
    queryClient.setQueryData<AppNotification[]>(
      ["notifications", pageRef.current],
      (prev = []) => prev.filter((n) => n.id !== id)
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    dismissToast(id);
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  }, [queryClient, dismissToast]);

  const fetchMore = useCallback(async (page = 1) => {
    pageRef.current = page;
    await queryClient.fetchQuery({
      queryKey: ["notifications", page],
      queryFn: () => fetchNotifications(page),
    });
  }, [queryClient]);

  // ── Clear state on logout ─────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      queryClient.removeQueries({ queryKey: ["notifications"] });
      setToasts([]);
      setUnreadCount(0);
    }
  }, [status, queryClient]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        isLoading,
        markRead,
        markAllRead,
        dismiss,
        dismissToast,
        fetchMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}

function mergeNotifications(
  existing: AppNotification[],
  incoming: AppNotification[]
): AppNotification[] {
  const map = new Map(existing.map((n) => [n.id, n]));
  for (const n of incoming) {
    if (!map.has(n.id)) map.set(n.id, n);
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}