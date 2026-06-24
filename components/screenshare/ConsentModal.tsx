// // components/screenshare/ConsentModal.tsx
// import { useEffect, useState, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Monitor, X, Shield, Eye } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { useScreenShare } from 'hooks/useMemberScreenShare';

// interface RequestPayload {
//   type: 'SCREEN_SHARE_REQUEST';
//   sessionId: string;
//   adminName: string;
//   adminEmail?: string;
//   adminImage?: string;
//   teamName?: string;
// }

// export function ScreenShareConsentModal() {
//   const [request, setRequest] = useState<RequestPayload | null>(null);
//   const [isSharing, setIsSharing] = useState(false);
//   const [shareSessionId, setShareSessionId] = useState<string | null>(null);
//   const esRef = useRef<EventSource | null>(null);

//   const { stream, status, startSharing, stopSharing } = useScreenShare(shareSessionId, 'employee');

//   useEffect(() => {
//     const connect = () => {
//       const es = new EventSource('/api/screenshare/events');
//       esRef.current = es;

//       es.onmessage = (e) => {
//         try {
//           const data = JSON.parse(e.data);
//           if (data.type === 'SCREEN_SHARE_REQUEST') {
//             setRequest(data as RequestPayload);
//           }
//           if (data.type === 'SCREEN_SHARE_ENDED') {
//             setIsSharing(false);
//             setShareSessionId(null);
//             stopSharing();
//           }
//         } catch (_) {}
//       };

//       es.onerror = () => {
//         es.close();
//         // Reconnect after 3 seconds
//         setTimeout(connect, 3000);
//       };
//     };

//     connect();
//     return () => esRef.current?.close();
//   }, []); // eslint-disable-line

//   const handleAccept = async () => {
//     if (!request) return;

//     // Notify server
//     await fetch('/api/screenshare/respond', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ sessionId: request.sessionId, accept: true }),
//     });

//     setShareSessionId(request.sessionId);
//     setRequest(null);
//     setIsSharing(true);
//   };

//   const handleDecline = async () => {
//     if (!request) return;
//     await fetch('/api/screenshare/respond', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ sessionId: request.sessionId, accept: false }),
//     });
//     setRequest(null);
//   };

//   const handleStopSharing = async () => {
//     await stopSharing();
//     setIsSharing(false);
//     setShareSessionId(null);
//   };

//   // Start sharing as soon as session ID is set
//   useEffect(() => {
//     if (shareSessionId && !stream) {
//       startSharing();
//     }
//   }, [shareSessionId]); // eslint-disable-line

//   return (
//     <>
//       {/* ── Consent Request Modal ──────────────────────── */}
//       <AnimatePresence>
//         {request && (
//           <motion.div
//             className="fixed inset-0 z-[9999] flex items-center justify-center"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             {/* Backdrop */}
//             <motion.div
//               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//             />

//             {/* Modal */}
//             <motion.div
//               className="relative z-10 w-[380px] rounded-3xl bg-[#0A0A0A] border border-neutral-800 shadow-2xl overflow-hidden"
//               initial={{ scale: 0.85, y: 20, opacity: 0 }}
//               animate={{ scale: 1, y: 0, opacity: 1 }}
//               exit={{ scale: 0.85, y: 20, opacity: 0 }}
//               transition={{ type: 'spring', stiffness: 400, damping: 30 }}
//             >
//               {/* Top accent */}
//               <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

//               <div className="p-6">
//                 {/* Icon */}
//                 <div className="flex justify-center mb-5">
//                   <div className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
//                     <Monitor className="size-8 text-blue-400" />
//                   </div>
//                 </div>

//                 {/* Admin info */}
//                 <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-white/5 border border-white/10">
//                   <Avatar className="size-10">
//                     <AvatarImage src={request.adminImage} />
//                     <AvatarFallback className="bg-indigo-600 text-white text-sm">
//                       {request.adminName.charAt(0).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="text-white text-sm font-semibold">{request.adminName}</p>
//                     {request.teamName && (
//                       <p className="text-gray-400 text-xs">{request.teamName}</p>
//                     )}
//                   </div>
//                 </div>

//                 <h2 className="text-white text-lg font-semibold text-center mb-2">
//                   Screen Share Request
//                 </h2>
//                 <p className="text-gray-400 text-sm text-center mb-1">
//                   <span className="text-white font-medium">{request.adminName}</span> wants to view your screen
//                 </p>
//                 <p className="text-gray-500 text-xs text-center mb-6">
//                   You can stop sharing at any time
//                 </p>

//                 {/* Privacy note */}
//                 <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-6">
//                   <Shield className="size-4text-emerald-400 flex-shrink-0 mt-0.5" />
//                   <p className="text-xs text-emerald-300/80">
//                     Only your screen is shared. Your camera and microphone remain private.
//                   </p>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex gap-3">
//                   <Button
//                     variant="outline"
//                     className="flex-1 rounded-xl bg-transparent border-neutral-700 text-white hover:bg-red-600 hover:border-red-600"
//                     onClick={handleDecline}
//                   >
//                     Decline
//                   </Button>
//                   <Button
//                     className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
//                     onClick={handleAccept}
//                   >
//                     <Eye className="size-4mr-2" />
//                     Allow
//                   </Button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Active Sharing Banner ──────────────────────── */}
//       <AnimatePresence>
//         {isSharing && (
//           <motion.div
//             className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998]"
//             initial={{ y: 80, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 80, opacity: 0 }}
//             transition={{ type: 'spring', stiffness: 400, damping: 30 }}
//           >
//             <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0A0A0A] border border-red-500/30 shadow-2xl shadow-red-500/10">
//               <div className="flex items-center gap-2">
//                 <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
//                 <Monitor className="size-4text-red-400" />
//                 <span className="text-white text-sm font-medium">
//                   {status === 'sharing' ? 'Your screen is being shared' : 'Connecting…'}
//                 </span>
//               </div>
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 className="h-8 px-3 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl"
//                 onClick={handleStopSharing}
//               >
//                 <X className="w-3.5 h-3.5 mr-1" />
//                 Stop
//               </Button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// components/screenshare/ConsentModal.tsx  (v2 — uses ScreenShareContext)
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, X, Shield, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useScreenShareContext } from 'contexts/ScreenShareContext';
import { useScreenShare } from 'hooks/useMemberScreenShare';

export function ScreenShareConsentModal() {
  const { incomingRequest, clearIncomingRequest } = useScreenShareContext();
  const [shareSessionId, setShareSessionId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const { stream, status, startSharing, stopSharing } = useScreenShare(shareSessionId, 'employee');

  // Start sharing as soon as sessionId is wired up
  useEffect(() => {
    if (shareSessionId && !stream) {
      startSharing();
    }
  }, [shareSessionId]); // eslint-disable-line

  const handleAccept = async () => {
    if (!incomingRequest) return;

    await fetch('/api/screenshare/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: incomingRequest.sessionId, accept: true }),
    });

    setShareSessionId(incomingRequest.sessionId);
    setIsSharing(true);
    clearIncomingRequest();
  };

  const handleDecline = async () => {
    if (!incomingRequest) return;
    await fetch('/api/screenshare/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: incomingRequest.sessionId, accept: false }),
    });
    clearIncomingRequest();
  };

  const handleStopSharing = async () => {
    await stopSharing();
    setIsSharing(false);
    setShareSessionId(null);
  };

  return (
    <>
      {/* ── Consent Request Modal ────────────────────────── */}
      <AnimatePresence>
        {incomingRequest && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />

            <motion.div
              className="relative z-10 w-[390px] rounded-3xl bg-[#0A0A0A] border border-neutral-800 shadow-2xl overflow-hidden"
              initial={{ scale: 0.88, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              {/* Top gradient bar */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              <div className="p-7">
                {/* Monitor icon */}
                <div className="flex justify-center mb-5">
                  <motion.div
                    className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
                    animate={{ boxShadow: ['0 0 0 0 rgba(59,130,246,0)', '0 0 0 12px rgba(59,130,246,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Monitor className="size-8 text-blue-400" />
                  </motion.div>
                </div>

                {/* Admin info chip */}
                <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Avatar className="size-10">
                    <AvatarImage src={incomingRequest.adminImage} />
                    <AvatarFallback className="bg-indigo-600 text-white text-sm">
                      {incomingRequest.adminName}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{incomingRequest.adminName}</p>
                    {incomingRequest.teamName && (
                      <p className="text-gray-400 text-xs truncate">{incomingRequest.teamName}</p>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                    <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] text-amber-400 font-medium">Requesting</span>
                  </div>
                </div>

                <h2 className="text-white text-lg font-semibold text-center mb-2">
                  Screen Share Request
                </h2>
                <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
                  <span className="text-white font-medium">{incomingRequest.adminName}</span> wants to view your screen.
                  You can stop sharing at any time.
                </p>

                {/* Privacy note */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-6">
                  <Shield className="size-4text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300/80 leading-relaxed">
                    Only your screen contents are shared. Camera, microphone, and audio remain private.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-xl bg-transparent border-neutral-700 text-white hover:bg-red-600/10 hover:border-red-500 hover:text-red-300 transition-all"
                    onClick={handleDecline}
                  >
                    <X className="size-4mr-2" />
                    Decline
                  </Button>
                  <Button
                    className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all"
                    onClick={handleAccept}
                  >
                    <Eye className="size-4mr-2" />
                    Allow Sharing
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Sharing Banner (bottom of screen) ──── */}
      <AnimatePresence>
        {isSharing && (
          <motion.div
            className="fixed bottom-5 left-1/2 z-[9998]"
            style={{ x: '-50%' }}
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <div className="flex items-center gap-4 pl-4 pr-3 py-3 rounded-2xl bg-[#0f0f0f] border border-red-500/25 shadow-2xl shadow-red-500/10">
              {/* Pulsing dot */}
              <div className="relative flex items-center">
                <div className="absolute size-4rounded-full bg-red-500/30 animate-ping" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 relative" />
              </div>

              <div className="flex items-center gap-2">
                <Monitor className="size-4text-red-400" />
                <span className="text-white text-sm font-medium whitespace-nowrap">
                  {status === 'sharing' ? 'Your screen is being shared' : 'Connecting…'}
                </span>
              </div>

              <div className="w-px h-5 bg-neutral-700" />

              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl whitespace-nowrap"
                onClick={handleStopSharing}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Stop Sharing
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
