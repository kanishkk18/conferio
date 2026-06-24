// // src/components/calls/IncomingCallModal.tsx
// import React from 'react';
// import { useCall } from 'contexts/CallContext';
// import { Phone, PhoneOff, Video } from 'lucide-react';

// export default function IncomingCallModal() {
//   const { incomingCall, answerCall, declineCall } = useCall();

//   if (!incomingCall) return null;

//   const caller = incomingCall.caller;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
//       <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 text-center shadow-2xl border border-gray-800">
//         <div className="mb-6">
//           {caller.image ? (
//             <img
//               src={caller.image}
//               alt={caller.name || 'Caller'}
//               className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-blue-500/30"
//             />
//           ) : (
//             <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
//               {caller.name?.charAt(0).toUpperCase() || '?'}
//             </div>
//           )}
//         </div>

//         <h2 className="mb-2 text-2xl font-bold text-white">
//           {caller.name || 'Unknown Caller'}
//         </h2>
//         <p className="mb-8 text-gray-400">
//           {incomingCall.type === 'VIDEO' ? 'Incoming video call...' : 'Incoming audio call...'}
//         </p>

//         <div className="flex justify-center gap-6">
//           <button type="button"
//             onClick={declineCall}
//             className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110 hover:bg-red-600"
//           >
//             <PhoneOff className="h-8 w-8" />
//           </button>

//           <button type="button"
//             onClick={answerCall}
//             className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white transition-transform hover:scale-110 hover:bg-green-600"
//           >
//             {incomingCall.type === 'VIDEO' ? (
//               <Video className="h-8 w-8" />
//             ) : (
//               <Phone className="h-8 w-8" />
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// import React from 'react';
// import { useCall } from 'contexts/CallContext';
// import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
// import { motion } from 'framer-motion';
// import Image from 'next/image';

// export default function IncomingCallModal() {
//   const { incomingCall, answerCall, declineCall } = useCall();

//   if (!incomingCall) return null;

//   const caller = (incomingCall as any).caller;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
//     >
//       <div className="text-center">
//         {/* Pulsing Avatar */}
//         <div className="relative mb-8">
//           <motion.div
//             animate={{ scale: [1, 1.1, 1] }}
//             transition={{ repeat: Infinity, duration: 1.5 }}
//             className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
//           >
//             {caller?.image ? (
//               <Image
//                 src={caller.image} 
//                 alt={caller.name}
//                 className="w-28 h-28 rounded-full object-cover"
//                 height={1000}
//                 width={1000}
//               />
//             ) : (
//               <span className="text-5xl font-bold text-white">
//                 {caller?.name?.charAt(0).toUpperCase()}
//               </span>
//             )}
//           </motion.div>

//           {/* Ripple effects */}
//           <motion.div
//             animate={{ scale: [1, 2], opacity: [0.5, 0] }}
//             transition={{ repeat: Infinity, duration: 1.5 }}
//             className="absolute inset-0 rounded-full border-4 border-blue-500"
//           />
//         </div>

//         <h2 className="text-3xl font-bold text-white mb-2">
//           {caller?.name || 'Unknown'}
//         </h2>
//         <p className="text-gray-400 mb-8 flex items-center justify-center gap-2">
//           {incomingCall.type === 'VIDEO' ? (
//             <><Video className="size-5" /> Incoming video call...</>
//           ) : (
//             <><Mic className="size-5" /> Incoming voice call...</>
//           )}
//         </p>

//         <div className="flex items-center justify-center gap-8">
//           <button type="button"
//             onClick={declineCall}
//             className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
//           >
//             <PhoneOff className="size-8" />
//           </button>

//           <button type="button"
//             onClick={answerCall}
//             className="p-6 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors animate-pulse"
//           >
//             <Phone className="size-8" />
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
// 'use client';
// import React, { useEffect, useState, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Phone, PhoneOff, Video, EyeOff, Mic } from 'lucide-react';
// import { useCall } from 'contexts/CallContext';

// // Ripple animation for the avatar ring
// const RippleRing = () => (
//   <>
//     {[0, 1, 2].map(i => (
//       <motion.div
//         key={i}
//         className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
//         initial={{ scale: 1, opacity: 0.6 }}
//         animate={{ scale: 2.5, opacity: 0 }}
//         transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
//       />
//     ))}
//   </>
// );

// export default function IncomingCallModal() {
//   const { incomingCall, joinCall, declineCall } = useCall();
//   const [isHidden, setIsHidden] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const timerRef = useRef<NodeJS.Timeout>();

//   useEffect(() => {
//     if (!incomingCall) { setIsHidden(false); setTimeLeft(60); return; }

//     timerRef.current = setInterval(() => {
//       setTimeLeft(prev => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timerRef.current);
//   }, [incomingCall]);

//   if (!incomingCall) return null;

//   const handleAccept = () => {
//     joinCall(incomingCall.callId, incomingCall.roomName, incomingCall.type);
//   };

//   const handleDecline = () => {
//     declineCall(incomingCall.callId, incomingCall.callerId);
//   };

//   const handleHide = () => setIsHidden(true);

//   // Minimized floating indicator when hidden
//   if (isHidden) {
//     return (
//       <motion.div
//         initial={{ scale: 0, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         className="fixed bottom-6 right-6 z-[9999]"
//       >
//         <button type="button"
//           onClick={() => setIsHidden(false)}
//           className="relative flex items-center gap-3 bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 shadow-2xl hover:bg-neutral-800 transition-colors"
//         >
//           <div className="relative size-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
//             {incomingCall.callerImage
//               ? <img src={incomingCall.callerImage} alt="" className="w-full h-full object-cover" />
//               : <span className="text-white font-bold text-sm">{incomingCall.callerName?.[0]?.toUpperCase()}</span>
//             }
//             <span className="absolute -top-1 -right-1 size-4bg-emerald-500 rounded-full border-2 border-neutral-900 animate-pulse" />
//           </div>
//           <div className="text-left">
//             <p className="text-white text-sm font-semibold">{incomingCall.callerName}</p>
//             <p className="text-neutral-400 text-xs flex items-center gap-1">
//               {incomingCall.type === 'VIDEO' ? <Video className="size-3" /> : <Mic className="size-3" />}
//               Incoming {incomingCall.type === 'VIDEO' ? 'Video' : 'Voice'} · {timeLeft}s
//             </p>
//           </div>
//           <div className="flex gap-2 ml-2">
//             <button type="button" onClick={e => { e.stopPropagation(); handleDecline(); }} className="size-8 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700">
//               <PhoneOff className="size-3.5  text-white" />
//             </button>
//             <button type="button" onClick={e => { e.stopPropagation(); handleAccept(); }} className="size-8 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-700">
//               <Phone className="size-3.5  text-white" />
//             </button>
//           </div>
//         </button>
//       </motion.div>
//     );
//   }

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
//         {/* Backdrop */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//           style={{ pointerEvents: 'auto' }}
//         />

//         {/* Modal */}
//         <motion.div
//           initial={{ scale: 0.8, opacity: 0, y: 40 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.8, opacity: 0, y: 40 }}
//           transition={{ type: 'spring', damping: 20, stiffness: 300 }}
//           className="relative z-10 w-full max-w-sm"
//           style={{ pointerEvents: 'auto' }}
//         >
//           <div
//             className="relative rounded-3xl overflow-hidden shadow-2xl"
//             style={{
//               background: 'linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 50%, #0f1a0f 100%)',
//               border: '1px solid rgba(255,255,255,0.08)',
//             }}
//           >
//             {/* Animated top gradient bar */}
//             <div className="absolute top-0 left-0 right-0 h-1">
//               <motion.div
//                 className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500"
//                 animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
//                 transition={{ duration: 3, repeat: Infinity }}
//               />
//             </div>

//             <div className="p-8 flex flex-col items-center text-center">
//               {/* Call type badge */}
//               <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
//                 incomingCall.type === 'VIDEO'
//                   ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
//                   : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
//               }`}>
//                 {incomingCall.type === 'VIDEO' ? <Video className="size-3" /> : <Mic className="size-3" />}
//                 Incoming {incomingCall.type === 'VIDEO' ? 'Video' : 'Voice'} Call
//               </div>

//               {/* Avatar with ripple */}
//               <div className="relative mb-6 w-28 h-28 flex items-center justify-center">
//                 <RippleRing />
//                 <div className="relative z-10  size-24  rounded-full overflow-hidden border-3 border-emerald-500/50 shadow-xl shadow-emerald-500/20">
//                   {incomingCall.callerImage
//                     ? <img src={incomingCall.callerImage} alt="" className="w-full h-full object-cover" />
//                     : (
//                       <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
//                         <span className="text-white font-bold text-3xl">
//                           {incomingCall.callerName?.[0]?.toUpperCase()}
//                         </span>
//                       </div>
//                     )
//                   }
//                 </div>
//               </div>

//               {/* Caller info */}
//               <h2 className="text-white text-2xl font-bold mb-1 tracking-tight">{incomingCall.callerName}</h2>
//               <p className="text-neutral-400 text-sm mb-1">
//                 {incomingCall.isGroup ? 'Group ' : ''}{incomingCall.type === 'VIDEO' ? 'Video' : 'Voice'} Call
//               </p>

//               {/* Timer bar */}
//               <div className="w-full mt-4 mb-8">
//                 <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
//                   <motion.div
//                     className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
//                     initial={{ width: '100%' }}
//                     animate={{ width: `${(timeLeft / 60) * 100}%` }}
//                     transition={{ duration: 0.5 }}
//                   />
//                 </div>
//                 <p className="text-neutral-500 text-xs mt-1.5 text-center">Auto-declines in {timeLeft}s</p>
//               </div>

//               {/* Action buttons */}
//               <div className="flex items-center justify-center gap-6 w-full">
//                 {/* Decline */}
//                 <div className="flex flex-col items-center gap-2">
//                   <motion.button
//                     whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
//                     onClick={handleDecline}
//                     className="size-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-lg shadow-red-600/30 transition-colors"
//                   >
//                     <PhoneOff className="size-8 text-white" />
//                   </motion.button>
//                   <span className="text-neutral-400 text-xs">Decline</span>
//                 </div>

//                 {/* Hide */}
//                 <div className="flex flex-col items-center gap-2">
//                   <motion.button
//                     whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
//                     onClick={handleHide}
//                     className="size-12 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors"
//                   >
//                     <EyeOff className="size-5 text-neutral-300" />
//                   </motion.button>
//                   <span className="text-neutral-500 text-xs">Hide</span>
//                 </div>

//                 {/* Accept */}
//                 <div className="flex flex-col items-center gap-2">
//                   <motion.button
//                     whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
//                     onClick={handleAccept}
//                     className="size-16 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-colors"
//                   >
//                     {incomingCall.type === 'VIDEO'
//                       ? <Video className="size-8 text-white" />
//                       : <Phone className="size-8 text-white" />
//                     }
//                   </motion.button>
//                   <span className="text-neutral-400 text-xs">Accept</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// }

'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, Mic, EyeOff } from 'lucide-react';
import { useCall } from 'contexts/CallContext';
import Image from 'next/image';

const RippleRing = () => (
  <>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.65,
          ease: 'easeOut',
        }}
      />
    ))}
  </>
);

export default function IncomingCallModal() {
  const { incomingCall, joinCall, declineCall } = useCall();
  const [isHidden, setIsHidden] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!incomingCall) {
      setIsHidden(false);
      setTimeLeft(60);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [incomingCall?.callId]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    joinCall(incomingCall.callId, incomingCall.roomName, incomingCall.type);
  };

  const handleDecline = () => {
    declineCall(incomingCall.callId, incomingCall.callerId);
  };

  // ── Minimized floating chip ────────────────────────────────────────────

  if (isHidden) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-[9999]"
      >
        <button type="button"
          onClick={() => setIsHidden(false)}
          className="flex items-center gap-3 bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 shadow-2xl hover:bg-neutral-800 transition-colors"
        >
          <div className="relative size-10 rounded-full overflow-hidden flex-shrink-0">
            {incomingCall.callerImage ? (
              <Image
                src={incomingCall.callerImage}
                alt="caller"
                className="w-full h-full object-cover"
                width={400}
                height={400}
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {incomingCall.callerName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <span className="absolute -top-0.5 -right-0.5 size-3.5  bg-emerald-500 rounded-full border-2 border-neutral-900 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">
              {incomingCall.callerName}
            </p>
            <p className="text-neutral-400 text-xs flex items-center gap-1">
              {incomingCall.type === 'VIDEO' ? (
                <Video className="size-3" />
              ) : (
                <Mic className="size-3" />
              )}
              Incoming · {timeLeft}s
            </p>
          </div>
          <div className="flex gap-2 ml-1">
            <button type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDecline();
              }}
              className="size-8 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-colors"
            >
              <PhoneOff className="size-3.5  text-white" />
            </button>
            <button type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAccept();
              }}
              className="size-8 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-500 transition-colors"
            >
              <Phone className="size-3.5  text-white" />
            </button>
          </div>
        </button>
      </motion.div>
    );
  }

  // ── Full modal ─────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="relative z-10 w-full max-w-sm"
        >
          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background:
                'linear-gradient(145deg, #0c0c18 0%, #111827 50%, #0c180c 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Animated accent bar */}
            <motion.div
              className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="px-8 pt-8 pb-10 flex flex-col items-center text-center">
              {/* Call type badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${incomingCall.type === 'VIDEO'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
              >
                {incomingCall.type === 'VIDEO' ? (
                  <Video className="size-3" />
                ) : (
                  <Mic className="size-3" />
                )}
                Incoming {incomingCall.type === 'VIDEO' ? 'Video' : 'Voice'} Call
              </div>

              {/* Avatar with ripple */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-5">
                <RippleRing />
                <div className="relative z-10  size-24  rounded-full overflow-hidden border-4 border-emerald-500/40 shadow-xl">
                  {incomingCall.callerImage ? (
                    <Image
                      src={incomingCall.callerImage}
                      alt="caller"
                      className="w-full h-full object-cover"
                      width={400}
                      height={400}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                      <span className="text-white font-bold text-4xl">
                        {incomingCall.callerName?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <h2 className="text-white text-2xl font-semibold tracking-tight mb-1">
                {incomingCall.callerName || 'Unknown'}
              </h2>
              <p className="text-neutral-400 text-sm mb-1">
                {incomingCall.isGroup ? 'Group ' : ''}
                {incomingCall.type === 'VIDEO' ? 'Video' : 'Voice'} Call
              </p>

              {/* Timer bar */}
              <div className="w-full mt-4 mb-8">
                <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 60) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-neutral-600 text-xs mt-1.5">
                  Auto-declines in {timeLeft}s
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-end justify-center gap-8 w-full">
                {/* Decline */}
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDecline}
                    className="size-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-lg shadow-red-600/30 transition-colors"
                  >
                    <PhoneOff className="size-8 text-white" />
                  </motion.button>
                  <span className="text-neutral-400 text-xs">Decline</span>
                </div>

                {/* Hide */}
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsHidden(true)}
                    className=" size-11  rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors"
                  >
                    <EyeOff className="size-5 text-neutral-300" />
                  </motion.button>
                  <span className="text-neutral-500 text-xs">Hide</span>
                </div>

                {/* Accept */}
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAccept}
                    className="size-16 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-colors"
                  >
                    {incomingCall.type === 'VIDEO' ? (
                      <Video className="size-8 text-white" />
                    ) : (
                      <Phone className="size-8 text-white" />
                    )}
                  </motion.button>
                  <span className="text-neutral-400 text-xs">Accept</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
