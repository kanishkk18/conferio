// import { useEffect, useRef, useCallback } from 'react';
// import { useRouter } from 'next/router';

// const HEARTBEAT_INTERVAL = 30000; // 30 seconds
// const MINIMUM_TRACKING_TIME = 5000; // 5 seconds minimum

// // Routes to NOT track (auth pages, API routes, etc.)
// const EXCLUDED_ROUTES = [
//   '/login',
//   '/register',
//   '/api',
//   '/_next',
//   '/favicon',
//   '/404',
//   '/500',
// ];

// export function useScreenTime() {
//   const router = useRouter();
//   const sessionIdRef = useRef<string | null>(null);
//   const startTimeRef = useRef<number>(0);
//   const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
//   const isActiveRef = useRef(true);
//   const currentRouteRef = useRef<string>('');

//   const shouldTrack = useCallback((pathname: string): boolean => {
//     return !EXCLUDED_ROUTES.some(excluded => pathname.startsWith(excluded));
//   }, []);

//   const startTracking = useCallback(async (route: string) => {
//     if (!shouldTrack(route) || sessionIdRef.current) return;

//     try {
//       const res = await fetch('/api/screen-time/start', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ route })
//       });

//       if (res.ok) {
//         const data = await res.json();
//         sessionIdRef.current = data.sessionId;
//         startTimeRef.current = Date.now();
//         currentRouteRef.current = route;

//         // Start heartbeat
//         heartbeatRef.current = setInterval(async () => {
//           if (sessionIdRef.current && isActiveRef.current) {
//             await fetch('/api/screen-time/heartbeat', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ sessionId: sessionIdRef.current })
//             });
//           }
//         }, HEARTBEAT_INTERVAL);
//       }
//     } catch (error) {
//       console.error('Failed to start screen time tracking:', error);
//     }
//   }, [shouldTrack]);

//   const endTracking = useCallback(async () => {
//     const sessionId = sessionIdRef.current;
//     const startTime = startTimeRef.current;

//     if (!sessionId) return;

//     // Clear heartbeat
//     if (heartbeatRef.current) {
//       clearInterval(heartbeatRef.current);
//       heartbeatRef.current = null;
//     }

//     // Only track if minimum time spent
//     if (Date.now() - startTime < MINIMUM_TRACKING_TIME) {
//       sessionIdRef.current = null;
//       return;
//     }

//     try {
//       await fetch('/api/screen-time/end', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ sessionId })
//       });
//     } catch (error) {
//       console.error('Failed to end screen time tracking:', error);
//     } finally {
//       sessionIdRef.current = null;
//       startTimeRef.current = 0;
//     }
//   }, []);

//   useEffect(() => {
//     const route = router.pathname;
//     if (!route || route === currentRouteRef.current) return;

//     // End previous tracking before starting new
//     if (sessionIdRef.current) {
//       endTracking();
//     }

//     // Start tracking new route
//     startTracking(route);

//     // Handle visibility change (tab switching)
//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         isActiveRef.current = false;
//         endTracking();
//       } else {
//         isActiveRef.current = true;
//         startTracking(router.pathname);
//       }
//     };

//     // Handle page unload
//     const handleBeforeUnload = () => {
//       if (sessionIdRef.current) {
//         navigator.sendBeacon('/api/screen-time/end', 
//           JSON.stringify({ sessionId: sessionIdRef.current })
//         );
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     window.addEventListener('beforeunload', handleBeforeUnload);

//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       endTracking();
//     };
//   }, [router.pathname, startTracking, endTracking]);

//   // Handle route changes
//   useEffect(() => {
//     const handleRouteChangeStart = () => {
//       endTracking();
//     };

//     router.events.on('routeChangeStart', handleRouteChangeStart);

//     return () => {
//       router.events.off('routeChangeStart', handleRouteChangeStart);
//     };
//   }, [router, endTracking]);
// }

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

const MINIMUM_TRACKING_TIME = 5000; // 5 seconds minimum

const EXCLUDED_ROUTES = [
  '/login',
  '/register',
  '/api',
  '/_next',
  '/favicon',
  '/404',
  '/500',
];

export function useScreenTime() {
  const router = useRouter();
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const isActiveRef = useRef(true);

  const shouldTrack = useCallback((pathname: string): boolean => {
    return !EXCLUDED_ROUTES.some(excluded => pathname.startsWith(excluded));
  }, []);

  const startTracking = useCallback(async (route: string) => {
    if (!shouldTrack(route) || sessionIdRef.current) return;

    try {
      const res = await fetch('/api/screen-time/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route })
      });

      if (res.ok) {
        const data = await res.json();
        sessionIdRef.current = data.sessionId;
        startTimeRef.current = Date.now();
      }
    } catch (error) {
      // Silently fail — screen time is non-critical
    }
  }, [shouldTrack]);

  const endTracking = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    const startTime = startTimeRef.current;

    if (!sessionId) return;

    // Only track if minimum time spent
    if (Date.now() - startTime < MINIMUM_TRACKING_TIME) {
      sessionIdRef.current = null;
      return;
    }

    try {
      await fetch('/api/screen-time/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (error) {
      // Silently fail
    } finally {
      sessionIdRef.current = null;
      startTimeRef.current = 0;
    }
  }, []);

  useEffect(() => {
    const route = router.pathname;
    if (!route || !shouldTrack(route)) return;

    // Start tracking
    startTracking(route);

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
        endTracking();
      } else {
        isActiveRef.current = true;
        startTracking(router.pathname);
      }
    };

    // Handle page unload — use sendBeacon for reliability
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        navigator.sendBeacon('/api/screen-time/end', 
          JSON.stringify({ sessionId: sessionIdRef.current })
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endTracking();
    };
  }, [router.pathname, startTracking, endTracking, shouldTrack]);

  // Handle route changes
  useEffect(() => {
    const handleRouteChangeStart = () => {
      endTracking();
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, endTracking]);
}