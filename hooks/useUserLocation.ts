// // hooks/useUserLocation.ts
// import { useState, useEffect, useRef } from 'react';

// export interface UserLocationData {
//   lat: number;
//   lng: number;
//   accuracy?: number;
//   updatedAt: string;
// }

// // ─── Broadcast YOUR OWN location ──────────────────────────────
// export function useBroadcastLocation() {
//   const watchRef = useRef<number | null>(null);

//   useEffect(() => {
//     if (!navigator.geolocation) return;

//     const broadcast = async (pos: GeolocationPosition) => {
//       await fetch('/api/location/update', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//           accuracy: pos.coords.accuracy,
//         }),
//       }).catch(() => {});
//     };

//     watchRef.current = navigator.geolocation.watchPosition(broadcast, () => {}, {
//       enableHighAccuracy: true,
//       maximumAge: 30000,
//       timeout: 10000,
//     });

//     return () => {
//       if (watchRef.current != null) {
//         navigator.geolocation.clearWatch(watchRef.current);
//       }
//     };
//   }, []);
// }

// // ─── Watch ANOTHER user's location ────────────────────────────
// export function useWatchLocation(targetUserId: string | null, enabled = false) {
//   const [location, setLocation] = useState<UserLocationData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   useEffect(() => {
//     if (!targetUserId || !enabled) {
//       setLocation(null);
//       return;
//     }

//     setIsLoading(true);

//     const fetch_ = async () => {
//       try {
//         const res = await fetch(`/api/location/get?userId=${targetUserId}`);
//         if (res.ok) {
//           const data = await res.json();
//           setLocation(data);
//         }
//       } catch (_) {} finally {
//         setIsLoading(false);
//       }
//     };

//     fetch_();
//     pollRef.current = setInterval(fetch_, 15000); // poll every 15 s

//     return () => {
//       if (pollRef.current) clearInterval(pollRef.current);
//     };
//   }, [targetUserId, enabled]);

//   return { location, isLoading };
// }

// hooks/useUserLocation.ts
import { useState, useEffect, useRef } from 'react';

export interface UserLocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: string;
}

// ─── Broadcast YOUR OWN location ──────────────────────────────
export function useBroadcastLocation() {
  const watchRef = useRef<number | null>(null);
  const lastBroadcast = useRef<number>(0);
  
  // CHANGE THIS: 60_000 = 1 minute, or 30 * 60_000 = 30 minutes
  const INTERVAL_MS = 60_000;

  useEffect(() => {
    if (!navigator.geolocation) return;

    const broadcast = async (pos: GeolocationPosition) => {
      const now = Date.now();
      
      // Skip if we already broadcasted within the interval
      if (now - lastBroadcast.current < INTERVAL_MS) return;
      lastBroadcast.current = now;

      await fetch('/api/location/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      }).catch(() => {});
    };

    watchRef.current = navigator.geolocation.watchPosition(broadcast, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 10000,
    });

    return () => {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);
}

// ─── Watch ANOTHER user's location ────────────────────────────
export function useWatchLocation(targetUserId: string | null, enabled = false) {
  const [location, setLocation] = useState<UserLocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!targetUserId || !enabled) {
      setLocation(null);
      return;
    }

    setIsLoading(true);

    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/location/get?userId=${targetUserId}`);
        if (res.ok) {
          const data = await res.json();
          setLocation(data);
        }
      } catch (_) {} finally {
        setIsLoading(false);
      }
    };

    fetch_();
    pollRef.current = setInterval(fetch_, 15000); // poll every 15 s

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [targetUserId, enabled]);

  return { location, isLoading };
}
