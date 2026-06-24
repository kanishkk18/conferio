// 'use client';
// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { io, Socket } from 'socket.io-client';
// import {
//   Mic, MicOff, Video, VideoOff, Settings, Lock, Eye, EyeOff,
//   Loader2, ChevronDown, Monitor, Users, Shield, Sparkles, Clock,
//   XCircle,
// } from 'lucide-react';

// interface MeetingInfo {
//   id: string;
//   title: string;
//   requireApproval: boolean;
//   hasPassword: boolean;
//   status: string;
//   hostId: string;
//   isHost: boolean;
// }

// type UserInfo = {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
// } | null;

// interface LobbyProps {
//   roomId: string;
//   meeting: MeetingInfo;
//   user: UserInfo;
//   onJoin: (data: {
//     displayName: string;
//     audioOn: boolean;
//     videoOn: boolean;
//     background: string;
//     token: string;
//   }) => void;
// }

// const BACKGROUNDS = [
//   { id: 'none', label: 'None', preview: null },
//   { id: 'blur', label: 'Blur', preview: null },
//   { id: 'office', label: 'Office', preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200' },
//   { id: 'nature', label: 'Nature', preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200' },
//   { id: 'space', label: 'Space', preview: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200' },
//   { id: 'abstract', label: 'Abstract', preview: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200' },
//   { id: 'city', label: 'City', preview: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200' },
//   { id: 'minimal', label: 'Studio', preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200' },
// ];

// // Approval waiting states shown to the participant
// type WaitState = 'idle' | 'waiting' | 'rejected' | 'timed_out';

// export default function MeetingLobby({ roomId, meeting, user, onJoin }: LobbyProps) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const socketRef = useRef<Socket | null>(null);
//   const pollRef = useRef<NodeJS.Timeout | null>(null);
//   const waitingIdRef = useRef<string | null>(null);

//   const [displayName, setDisplayName] = useState(user?.name || '');
//   const [audioOn, setAudioOn] = useState(true);
//   const [videoOn, setVideoOn] = useState(true);
//   const [selectedBg, setSelectedBg] = useState('none');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isJoining, setIsJoining] = useState(false);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState<'preview' | 'settings' | 'background'>('preview');
//   const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
//   const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
//   const [selectedCamera, setSelectedCamera] = useState('');
//   const [selectedMic, setSelectedMic] = useState('');
//   const [waitState, setWaitState] = useState<WaitState>('idle');

//   // ── Camera preview ────────────────────────────────────────────────────

//   const startPreview = useCallback(async () => {
//     try {
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       if (!videoOn) return;

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: selectedCamera ? { deviceId: selectedCamera } : true,
//         audio: selectedMic ? { deviceId: selectedMic } : true,
//       });

//       streamRef.current = stream;
//       if (videoRef.current) videoRef.current.srcObject = stream;

//       const devices = await navigator.mediaDevices.enumerateDevices();
//       setCameras(devices.filter((d) => d.kind === 'videoinput'));
//       setMics(devices.filter((d) => d.kind === 'audioinput'));
//     } catch {
//       setVideoOn(false);
//     }
//   }, [videoOn, selectedCamera, selectedMic]);

//   useEffect(() => {
//     startPreview();
//     return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
//   }, [videoOn, selectedCamera, selectedMic]);

//   // ── Cleanup on unmount ────────────────────────────────────────────────

//   useEffect(() => {
//     return () => {
//       if (pollRef.current) clearInterval(pollRef.current);
//       socketRef.current?.close();
//     };
//   }, []);

//   // ── Core: fetch token and enter meeting ───────────────────────────────

//   const enterMeeting = useCallback(
//     (token: string) => {
//       // Stop preview before handing off to LiveKit
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       socketRef.current?.close();
//       if (pollRef.current) clearInterval(pollRef.current);

//       onJoin({
//         displayName: displayName.trim(),
//         audioOn,
//         videoOn,
//         background: selectedBg,
//         token,
//       });
//     },
//     [displayName, audioOn, videoOn, selectedBg, onJoin]
//   );

//   // Called once approval is confirmed — fetch the actual LiveKit token
//   const fetchTokenAndEnter = useCallback(
//     async (waitingId: string) => {
//       try {
//         const res = await fetch(`/api/video-meetings/${roomId}/join`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             displayName: displayName.trim(),
//             password: password || undefined,
//             background: selectedBg,
//             waitingId, // tells the API we're approved
//           }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           throw new Error(data.error || 'Failed to get token after approval');
//         }

//         if (!data.token) {
//           throw new Error('No token returned from server');
//         }

//         enterMeeting(data.token);
//       } catch (err: any) {
//         setError(err.message || 'Failed to enter meeting after approval');
//         setIsJoining(false);
//         setWaitState('idle');
//       }
//     },
//     [roomId, displayName, password, selectedBg, enterMeeting]
//   );

//   // ── Approval waiting: Socket.IO push + polling fallback ───────────────

//   const startWaitingForApproval = useCallback(
//     (waitingId: string) => {
//       waitingIdRef.current = waitingId;
//       setWaitState('waiting');

//       // ── 1. Socket.IO push (fast path) ──
//       fetch('/api/socket/io').catch(() => {});

//       const sock = io({
//         path: '/api/socket/io',
//         transports: ['websocket', 'polling'],
//         reconnection: true,
//       });

//       sock.on('connect', () => {
//         // Join the per-waitingId room so the approve API can push to us
//         sock.emit('join_waiting', waitingId);
//       });

//       sock.on('approval_decision', (data: { waitingId: string; status: string }) => {
//         if (data.waitingId !== waitingId) return;

//         if (data.status === 'approved') {
//           if (pollRef.current) clearInterval(pollRef.current);
//           sock.close();
//           fetchTokenAndEnter(waitingId);
//         } else if (data.status === 'rejected') {
//           if (pollRef.current) clearInterval(pollRef.current);
//           sock.close();
//           setWaitState('rejected');
//           setError('The host denied your entry.');
//           setIsJoining(false);
//         }
//       });

//       socketRef.current = sock;

//       // ── 2. Polling fallback (slow path — catches socket misses) ──
//       pollRef.current = setInterval(async () => {
//         try {
//           const res = await fetch(
//             `/api/video-meetings/${roomId}/approval-status?waitingId=${waitingId}`
//           );
//           if (!res.ok) return;
//           const data = await res.json();

//           if (data.status === 'approved') {
//             clearInterval(pollRef.current!);
//             sock.close();
//             fetchTokenAndEnter(waitingId);
//           } else if (data.status === 'rejected') {
//             clearInterval(pollRef.current!);
//             sock.close();
//             setWaitState('rejected');
//             setError('The host denied your entry.');
//             setIsJoining(false);
//           }
//         } catch { /* network hiccup — keep polling */ }
//       }, 3000);

//       // ── 3. Global timeout: 2 minutes ──
//       setTimeout(() => {
//         if (waitingIdRef.current !== waitingId) return; // already resolved
//         if (pollRef.current) clearInterval(pollRef.current);
//         sock.close();
//         setWaitState('timed_out');
//         setError('Approval request timed out. Please try again.');
//         setIsJoining(false);
//       }, 120_000);
//     },
//     [roomId, fetchTokenAndEnter]
//   );

//   // ── Main join handler ─────────────────────────────────────────────────

//   const handleJoin = async () => {
//     if (!displayName.trim()) { setError('Please enter your name'); return; }
//     if (meeting.hasPassword && !password.trim()) { setError('This meeting requires a password'); return; }

//     setIsJoining(true);
//     setError('');
//     setWaitState('idle');

//     try {
//       const res = await fetch(`/api/video-meetings/${roomId}/join`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           displayName: displayName.trim(),
//           password: password || undefined,
//           background: selectedBg,
//           // No waitingId here — this is the first request
//         }),
//       });

//       const data = await res.json();

//       // ── Needs approval ──
//       if (res.status === 202 && data.error === 'WAITING_APPROVAL') {
//         startWaitingForApproval(data.waitingId);
//         return; // keep isJoining=true while waiting
//       }

//       // ── Other error ──
//       if (!res.ok) {
//         throw new Error(data.error || 'Failed to join meeting');
//       }

//       // ── Direct entry (no approval required) ──
//       if (!data.token) throw new Error('No token returned from server');
//       enterMeeting(data.token);

//     } catch (err: any) {
//       setError(err.message || 'Failed to join meeting');
//       setIsJoining(false);
//       setWaitState('idle');
//     }
//   };

//   const handleCancelWaiting = () => {
//     if (pollRef.current) clearInterval(pollRef.current);
//     socketRef.current?.close();
//     waitingIdRef.current = null;
//     setWaitState('idle');
//     setIsJoining(false);
//     setError('');
//   };

//   // ── Render ────────────────────────────────────────────────────────────

//   return (
//     <div
//       className="min-h-screen max-h-screen  !overflow-hidden flex items-center justify-start px-20 p-4"
//       style={{
//         background: 'radial-gradient(ellipse at 20% 20%, #0d1117 0%, #000000 60%, #0a0a1a 100%)',
//         fontFamily: "'DM Sans', sans-serif",
//       }}
//     >
//        <div
//   className="absolute w-screen !max-w-[100%] !h-screen !max-h-screen inset-0 bg-cover bg-center blur-0 scale-[1.2] animate-[morph_20s_ease-in-out_infinite]"
//   style={{
//     backgroundImage: 
//       "url('https://i.pinimg.com/1200x/6d/a6/43/6da64326bbd71d4552a2226b58259661.jpg')",
//   }}
// />


//       <div className="relative w-full max-w-sm flex flex-col items-start">

//         {/* ── Left: camera preview ── */}
//         <div className="flex flex-col gap-4 w-full">
//           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
//             <p className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-1">
//               {meeting.status === 'ACTIVE' ? '● Live Now' : '○ Waiting Room'}
//             </p>
//             <h1 className="text-white text-2xl font-bold truncate">{meeting.title}</h1>
//             <p className="text-neutral-500 text-sm mt-0.5">Room · {roomId}</p>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, scale: 0.98 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative w-full rounded-2xl h-48 overflow-hidden bg-neutral-900"

//           >
//             <video
//               ref={videoRef}
//               autoPlay playsInline muted
//               className="w-full h-full object-cover"
//               style={{ display: videoOn ? 'block' : 'none', transform: 'scaleX(-1)' }}
//             />
//             {!videoOn && (
//               <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900">
//                 <div className=" size-20 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
//                   {user?.image
//                     ? <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
//                     : <span className="text-white text-3xl font-bold">{displayName?.[0]?.toUpperCase() || '?'}</span>
//                   }
//                 </div>
//                 <p className="text-neutral-400 text-sm">Camera is off</p>
//               </div>
//             )}
//             {selectedBg !== 'none' && videoOn && (
//               <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
//                 <Sparkles className="size-3 inline mr-1" />
//                 {BACKGROUNDS.find((b) => b.id === selectedBg)?.label}
//               </div>
//             )}

//             {/* Camera/mic controls */}
//             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center justify-center gap-3">
//               <button
//                 onClick={() => setAudioOn((v) => !v)}
//                 className={`p-3 rounded-full transition-all ${audioOn ? 'bg-neutral-700/80 text-white hover:bg-neutral-600' : 'bg-red-600 text-white hover:bg-red-500'}`}
//               >
//                 {audioOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
//               </button>
//               <button
//                 onClick={() => setVideoOn((v) => !v)}
//                 className={`p-3 rounded-full transition-all ${videoOn ? 'bg-neutral-700/80 text-white hover:bg-neutral-600' : 'bg-red-600 text-white hover:bg-red-500'}`}
//               >
//                 {videoOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
//               </button>
//               <button
//                 onClick={() => setActiveTab((t) => (t === 'background' ? 'preview' : 'background'))}
//                 className={`p-3 rounded-full transition-all ${activeTab === 'background' ? 'bg-blue-600 text-white' : 'bg-neutral-700/80 text-white hover:bg-neutral-600'}`}
//               >
//                 <Monitor className="size-5" />
//               </button>
//               <button
//                 onClick={() => setActiveTab((t) => (t === 'settings' ? 'preview' : 'settings'))}
//                 className={`p-3 rounded-full transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-neutral-700/80 text-white hover:bg-neutral-600'}`}
//               >
//                 <Settings className="size-5" />
//               </button>
//             </div>
//           </motion.div>

//           {/* Status pills */}
//           <div className="flex items-center gap-3 flex-wrap">
//             <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${audioOn ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
//               {audioOn ? <Mic className="size-3" /> : <MicOff className="size-3" />}
//               {audioOn ? 'Mic on' : 'Mic off'}
//             </div>
//             <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${videoOn ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
//               {videoOn ? <Video className="size-3" /> : <VideoOff className="size-3" />}
//               {videoOn ? 'Camera on' : 'Camera off'}
//             </div>
//             {meeting.requireApproval && (
//               <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-yellow-500/10 border-yellow-500/30 text-yellow-400">
//                 <Shield className="size-3" /> Approval required
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Right: join form / waiting state ── */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.1 }}
//           className="flex flex-col gap-4"
//         >
//           <AnimatePresence mode="wait">

//             {/* ── Waiting for approval screen ── */}
//             {waitState === 'waiting' && (
//               <motion.div
//                 key="waiting"
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -8 }}
//                 className="flex flex-col items-center text-center gap-6 py-8"
//               >
//                 <div className="relative">
//                   <motion.div
//                     animate={{ rotate: 360 }}
//                     transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
//                     className=" size-20 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <Clock className="size-8 text-yellow-400" />
//                   </div>
//                 </div>

//                 <div>
//                   <h2 className="text-white text-xl font-bold mb-2">Waiting for Approval</h2>
//                   <p className="text-neutral-400 text-sm leading-relaxed">
//                     The host has been notified. You'll enter automatically once approved.
//                   </p>
//                   <p className="text-neutral-600 text-xs mt-2">
//                     Joining as <span className="text-neutral-400 font-medium">{displayName}</span>
//                   </p>
//                 </div>

//                 {/* Pulsing dots */}
//                 <div className="flex gap-2">
//                   {[0, 1, 2].map((i) => (
//                     <motion.div
//                       key={i}
//                       animate={{ opacity: [0.3, 1, 0.3] }}
//                       transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
//                       className="size-2 rounded-full bg-yellow-500"
//                     />
//                   ))}
//                 </div>

//                 <button
//                   onClick={handleCancelWaiting}
//                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors"
//                 >
//                   <XCircle className="size-4 /> Cancel request
//                 </button>
//               </motion.div>
//             )}

//             {/* ── Rejected ── */}
//             {waitState === 'rejected' && (
//               <motion.div
//                 key="rejected"
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -8 }}
//                 className="flex flex-col items-center text-center gap-4 py-8"
//               >
//                 <div className=" size-20 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center">
//                   <XCircle className="size-10 text-red-400" />
//                 </div>
//                 <div>
//                   <h2 className="text-white text-xl font-bold mb-2">Entry Denied</h2>
//                   <p className="text-neutral-400 text-sm">The host declined your request to join.</p>
//                 </div>
//                 <button
//                   onClick={() => { setWaitState('idle'); setError(''); }}
//                   className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors"
//                 >
//                   Back to lobby
//                 </button>
//               </motion.div>
//             )}

//             {/* ── Background picker ── */}
//             {waitState === 'idle' && activeTab === 'background' && (
//               <motion.div key="bg" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
//                 <h2 className="text-white font-semibold mb-3">Virtual Background</h2>
//                 <div className="grid grid-cols-4 gap-2">
//                   {BACKGROUNDS.map((bg) => (
//                     <button
//                       key={bg.id}
//                       onClick={() => setSelectedBg(bg.id)}
//                       className={`relative rounded-xl overflow-hidden border-2 transition-all ${selectedBg === bg.id ? 'border-blue-500 scale-95' : 'border-neutral-800 hover:border-neutral-600'}`}
//                       style={{ aspectRatio: '16/9' }}
//                     >
//                       {bg.preview
//                         ? <img src={bg.preview} alt={bg.label} className="w-full h-full object-cover" />
//                         : <div className={`w-full h-full flex items-center justify-center text-xs text-neutral-400 ${bg.id === 'blur' ? 'bg-neutral-700/50' : 'bg-neutral-900'}`}>{bg.label}</div>
//                       }
//                       <div className="absolute inset-0 bg-black/30 flex items-end p-1">
//                         <span className="text-white text-[10px] font-medium">{bg.label}</span>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//                 <button onClick={() => setActiveTab('preview')} className="mt-3 text-blue-400 text-sm hover:text-blue-300 transition-colors">← Back</button>
//               </motion.div>
//             )}

//             {/* ── Device settings ── */}
//             {waitState === 'idle' && activeTab === 'settings' && (
//               <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
//                 <h2 className="text-white font-semibold mb-4">Device Settings</h2>
//                 <div className="gap-y-4">
//                   <div>
//                     <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2 block">Camera</label>
//                     <div className="relative">
//                       <select value={selectedCamera} onChange={(e) => setSelectedCamera(e.target.value)}
//                         className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-blue-500 pr-8">
//                         {cameras.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>)}
//                       </select>
//                       <ChevronDown className="absolute right-3 top-3 size-4text-neutral-500 pointer-events-none" />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2 block">Microphone</label>
//                     <div className="relative">
//                       <select value={selectedMic} onChange={(e) => setSelectedMic(e.target.value)}
//                         className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-blue-500 pr-8">
//                         {mics.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
//                       </select>
//                       <ChevronDown className="absolute right-3 top-3 size-4text-neutral-500 pointer-events-none" />
//                     </div>
//                   </div>
//                 </div>
//                 <button onClick={() => setActiveTab('preview')} className="mt-4 text-blue-400 text-sm hover:text-blue-300 transition-colors">← Back</button>
//               </motion.div>
//             )}

//             {/* ── Normal join form ── */}
//             {waitState === 'idle' && activeTab === 'preview' && (
//               <motion.div className="w-full" key="join" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
//                 <h2 className="text-white font-semibold text-xl mb-6">Ready to join?</h2>

//                 <div className="gap-y-4">
//                   {/* Name */}
//                   <div>
//                     <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2 block">Your name</label>
//                     <input
//                       type="text"
//                       value={displayName}
//                       onChange={(e) => setDisplayName(e.target.value)}
//                       onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
//                       placeholder="Enter your display name"
//                       className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-colors"
//                       autoFocus={!user}
//                     />
//                   </div>

//                   {/* Password */}
//                   {meeting.hasPassword && (
//                     <div>
//                       <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2 block flex items-center gap-1.5">
//                         <Lock className="size-3" /> Meeting Password
//                       </label>
//                       <div className="relative">
//                         <input
//                           type={showPassword ? 'text' : 'password'}
//                           value={password}
//                           onChange={(e) => setPassword(e.target.value)}
//                           placeholder="Enter meeting password"
//                           className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-blue-500 pr-10"
//                         />
//                         <button type="button" onClick={() => setShowPassword((v) => !v)}
//                           className="absolute right-3 top-3.5 text-neutral-500 hover:text-neutral-300">
//                           {showPassword ? <EyeOff className="size-4 /> : <Eye className="ssize-4/>}
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                   {/* Approval notice */}
//                   {meeting.requireApproval && !meeting.isHost && (
//                     <div className="flex items-start gap-3 p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
//                       <Shield className="size-4text-yellow-400 flex-shrink-0 mt-0.5" />
//                       <p className="text-yellow-300 text-sm">
//                         This meeting requires host approval. You'll wait briefly before entering.
//                       </p>
//                     </div>
//                   )}

//                   {/* Error */}
//                   {error && (
//                     <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
//                       {error}
//                     </div>
//                   )}

//                   {/* Join button */}
//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={handleJoin}
//                     disabled={isJoining}
//                     className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                     style={{
//                       background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
//                       boxShadow: '0 4px 24px rgba(79,70,229,0.3)',
//                     }}
//                   >
//                     {isJoining
//                       ? <><Loader2 className="size-4animate-spin" /> Joining…</>
//                       : <><Users className="size-4 />{meeting.isHost ? 'Start Meeting' : 'Join Meeting'}</>
//                     }
//                   </motion.button>


//                 </div>
//               </motion.div>
//             )}

//           </AnimatePresence>
//         </motion.div>
//       </div>
//     </div>
//   );
// }


'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  Mic, MicOff, Video, VideoOff, Settings, Lock, Eye, EyeOff,
  Loader2, ChevronDown, Monitor, Users, Shield, Sparkles, Clock,
  XCircle, LogOut, User
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';

interface MeetingInfo {
  id: string;
  title: string;
  requireApproval: boolean;
  hasPassword: boolean;
  status: string;
  hostId: string;
  isHost: boolean;
}

type UserInfo = {
  id: string;
  name: string;
  email: string;
  image?: string;
} | null;

interface LobbyProps {
  roomId: string;
  meeting: MeetingInfo;
  user: UserInfo;
  onJoin: (data: {
    displayName: string;
    audioOn: boolean;
    videoOn: boolean;
    background: string;
    token: string;
  }) => void;
}

const BACKGROUNDS = [
  { id: 'none', label: 'None', preview: null },
  { id: 'blur', label: 'Blur', preview: null },
  { id: 'office', label: 'Office', preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200' },
  { id: 'nature', label: 'Nature', preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200' },
  { id: 'space', label: 'Space', preview: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200' },
  { id: 'abstract', label: 'Abstract', preview: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200' },
  { id: 'city', label: 'City', preview: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200' },
  { id: 'minimal', label: 'Studio', preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200' },
];

type WaitState = 'idle' | 'waiting' | 'rejected' | 'timed_out';

export default function MeetingLobby({ roomId, meeting, user, onJoin }: LobbyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const waitingIdRef = useRef<string | null>(null);
  const session = useSession()
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [selectedBg, setSelectedBg] = useState('none');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'settings' | 'background'>('preview');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [waitState, setWaitState] = useState<WaitState>('idle');
  const router = useRouter()

  // Redirect guests (unauthenticated or no team memberships) to home
  useEffect(() => {
    if (session.status === 'loading') return; // wait for session to resolve
    const isGuest =
      session.status === 'unauthenticated' ||
      !session.data?.user.roles ||
      session.data.user.roles.length === 0;
    // if (isGuest) {
    //   router.replace('/');
    // }
  }, [session.status, session.data, router]);

  const startPreview = useCallback(async () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (!videoOn) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedCamera ? { deviceId: selectedCamera } : true,
        audio: selectedMic ? { deviceId: selectedMic } : true,
      });

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === 'videoinput'));
      setMics(devices.filter((d) => d.kind === 'audioinput'));
    } catch {
      setVideoOn(false);
    }
  }, [videoOn, selectedCamera, selectedMic]);

  useEffect(() => {
    startPreview();
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [videoOn, selectedCamera, selectedMic]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      socketRef.current?.close();
    };
  }, []);

  const enterMeeting = useCallback(
    (token: string) => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      socketRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);

      onJoin({
        displayName: displayName.trim(),
        audioOn,
        videoOn,
        background: selectedBg,
        token,
      });
    },
    [displayName, audioOn, videoOn, selectedBg, onJoin]
  );

  const fetchTokenAndEnter = useCallback(
    async (waitingId: string) => {
      try {
        const res = await fetch(`/api/video-meetings/${roomId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: displayName.trim(),
            password: password || undefined,
            background: selectedBg,
            waitingId,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to get token after approval');
        }

        if (!data.token) {
          throw new Error('No token returned from server');
        }

        enterMeeting(data.token);
      } catch (err: any) {
        setError(err.message || 'Failed to enter meeting after approval');
        setIsJoining(false);
        setWaitState('idle');
      }
    },
    [roomId, displayName, password, selectedBg, enterMeeting]
  );

  const startWaitingForApproval = useCallback(
    (waitingId: string) => {
      waitingIdRef.current = waitingId;
      setWaitState('waiting');

      fetch('/api/socket/io').catch(() => { });

      const sock = io({
        path: '/api/socket/io',
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      sock.on('connect', () => {
        sock.emit('join_waiting', waitingId);
      });

      sock.on('approval_decision', (data: { waitingId: string; status: string }) => {
        if (data.waitingId !== waitingId) return;

        if (data.status === 'approved') {
          if (pollRef.current) clearInterval(pollRef.current);
          sock.close();
          fetchTokenAndEnter(waitingId);
        } else if (data.status === 'rejected') {
          if (pollRef.current) clearInterval(pollRef.current);
          sock.close();
          setWaitState('rejected');
          setError('The host denied your entry.');
          setIsJoining(false);
        }
      });

      socketRef.current = sock;

      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/video-meetings/${roomId}/approval-status?waitingId=${waitingId}`
          );
          if (!res.ok) return;
          const data = await res.json();

          if (data.status === 'approved') {
            clearInterval(pollRef.current!);
            sock.close();
            fetchTokenAndEnter(waitingId);
          } else if (data.status === 'rejected') {
            clearInterval(pollRef.current!);
            sock.close();
            setWaitState('rejected');
            setError('The host denied your entry.');
            setIsJoining(false);
          }
        } catch { /* network hiccup */ }
      }, 3000);

      setTimeout(() => {
        if (waitingIdRef.current !== waitingId) return;
        if (pollRef.current) clearInterval(pollRef.current);
        sock.close();
        setWaitState('timed_out');
        setError('Approval request timed out. Please try again.');
        setIsJoining(false);
      }, 120_000);
    },
    [roomId, fetchTokenAndEnter]
  );

  const handleJoin = async () => {
    if (!displayName.trim()) { setError('Please enter your name'); return; }
    if (meeting.hasPassword && !password.trim()) { setError('This meeting requires a password'); return; }

    setIsJoining(true);
    setError('');
    setWaitState('idle');

    try {
      const res = await fetch(`/api/video-meetings/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          password: password || undefined,
          background: selectedBg,
        }),
      });

      const data = await res.json();

      if (res.status === 202 && data.error === 'WAITING_APPROVAL') {
        startWaitingForApproval(data.waitingId);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join meeting');
      }

      if (!data.token) throw new Error('No token returned from server');
      enterMeeting(data.token);

    } catch (err: any) {
      setError(err.message || 'Failed to join meeting');
      setIsJoining(false);
      setWaitState('idle');
    }
  };

  const handleCancelWaiting = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    socketRef.current?.close();
    waitingIdRef.current = null;
    setWaitState('idle');
    setIsJoining(false);
    setError('');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen background image - fixed and contained */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center opacity-100 bg-no-repeat"
        style={{
          backgroundImage: "url('https://i.pinimg.com/1200x/6d/a6/43/6da64326bbd71d4552a2226b58259661.jpg')",
          //  backgroundImage: "url('https://pub-08af51b0459743828032880ad678a4cf.r2.dev/uploads/be00fcb6-99c1-479e-9b3f-f0ad9a193959-astronaut.jpg')",
          //  backgroundImage: "url('https://images.unsplash.com/photo-1620539369497-87f166305d12?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",

        }}
      />

      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-black/20" />


      <div className="relative  flex items-center justify-between mt-3 mb-2 px-8 py-0">
        {/* Logo - REPLACE THIS SRC WITH YOUR ACTUAL LOGO PATH */}
        <div className="flex justify-center items-center gap-0"><img
          src="/logo-transparent.png"
          alt="Logo"
          className="h-10 w-auto object-cover"
        />
        </div>

        {/* User info top-right */}
        <div className="px-4 py-2 flex flex-col justify-end items-end rounded-lg bg-gray-500 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 -mb-2 border border-white/10">
          <div className="flex items-center justify-end gap-1.5">
            <div className="flex items-center gap-1">
              {session.data?.user.image && session.data.user.image.length ? (
                <img src={session.data?.user.image} alt="" className="size-6 rounded-full object-cover" />
              ) : (
                <User className="size-4text-white/70" />
              )}
              <span className="text-white/90 text-xs font-medium">{user?.email || 'Guest'}</span>
            </div>
            <Separator orientation='vertical' className='dark:bg-white/60 h-3 !w-[0.5px]' />
            <button type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Logout"
              className="text-xs underline"
            >
              Log out
            </button>
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            {session.data?.user.roles && session.data.user.roles.length > 0 && (
              <div className="">
                {session.data.user.roles.map((r) => (
                  <span
                    key={r.teamId}
                    className="flex items-center gap-1   p-0.5 rounded-full text-xs font-semibold text-white/70"
                  >
                    <span className="Capitalize tracking-wider text-[10px] text-white/30 font-semibold">{r.role || "guest"}</span>
                    <span className="text-white/30 font-semibold">of</span>
                    <span className=" uppercase tracking-wider text-[10px] font-semibold">{r.team.name}'s Workspace</span>
                  </span>
                ))}


              </div>
            )}
            <Separator orientation='vertical' className='dark:bg-white/60 h-3 !w-[0.5px]' />
            <div
              onClick={() =>
                router.push(
                  session.data?.user.roles && session.data.user.roles.length > 0
                    ? '/meetings/page'
                    : '/'
                )
              }
              className="flex justify-center items-center gap-1.5 text-center text-[#989797] font-semibold cursor-pointer"
            >
              <LogOut className='h-3 w-3 rotate-180' /> <p className='text-xs -pt-1'>Leave room</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Centered layout */}
      <div className="relative z-50 px-20 flex flex-col items-start justify-center h-[calc(100vh-100px)]">

        <AnimatePresence mode="wait">
          {/* Waiting state */}
          {waitState === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center gap-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className=" size-24  rounded-full border-2 border-white/20 border-t-white"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="size-10 text-white/80" />
                </div>
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold mb-2">Waiting for Approval</h2>
                <p className="text-white/50 text-sm">The host has been notified. You'll enter automatically once approved.</p>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
                    className="size-2 rounded-full bg-white/60"
                  />
                ))}
              </div>
              <button type="button"
                onClick={handleCancelWaiting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-colors backdrop-blur-sm"
              >
                <XCircle className="size-4" /> Cancel request
              </button>
            </motion.div>
          )}

          {/* Rejected state */}
          {waitState === 'rejected' && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center gap-6"
            >
              <div className=" size-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="size-10 text-red-400" />
              </div>
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">Entry Denied</h2>
                <p className="text-white/50 text-sm">The host declined your request to join.</p>
              </div>
              <button type="button"
                onClick={() => { setWaitState('idle'); setError(''); }}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
              >
                Back to lobby
              </button>
            </motion.div>
          )}

          {/* Background picker */}
          {waitState === 'idle' && activeTab === 'background' && (
            <motion.div
              key="bg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <h2 className="text-white font-semibold mb-4 text-center">Virtual Background</h2>
              <div className="grid grid-cols-4 gap-3">
                {BACKGROUNDS.map((bg) => (
                  <button type="button"
                    key={bg.id}
                    onClick={() => setSelectedBg(bg.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-video ${selectedBg === bg.id ? 'border-white scale-95' : 'border-white/20 hover:border-white/40'
                      }`}
                  >
                    {bg.preview ? (
                      <img src={bg.preview} alt={bg.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-xs text-white/60 ${bg.id === 'blur' ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/5'
                        }`}>
                        {bg.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button type="button"
                onClick={() => setActiveTab('preview')}
                className="mt-6 mx-auto block text-white/60 hover:text-white text-sm transition-colors"
              >
                ← Back to lobby
              </button>
            </motion.div>
          )}

          {/* Device settings */}
          {waitState === 'idle' && activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              <h2 className="text-white font-semibold text-center">Device Settings</h2>
              <div className="gap-y-4">
                <div>
                  <label htmlFor="meeting-lobby-camera" className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Camera</label>
                  <div className="relative">
                    <select
                      id="meeting-lobby-camera"
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:outline-none focus:border-white/40"
                    >
                      {cameras.map((d) => (
                        <option key={d.deviceId} value={d.deviceId} className="bg-neutral-900">
                          {d.label || 'Camera'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 size-4text-white/50 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="meeting-lobby-mic" className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Microphone</label>
                  <div className="relative">
                    <select
                      id="meeting-lobby-mic"
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:outline-none focus:border-white/40"
                    >
                      {mics.map((d) => (
                        <option key={d.deviceId} value={d.deviceId} className="bg-neutral-900 rounded-md">
                          {d.label || 'Microphone'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 size-4text-white/50 pointer-events-none" />
                  </div>
                </div>
              </div>
              <button type="button"
                onClick={() => setActiveTab('preview')}
                className="mx-auto block text-white/60 hover:text-white text-sm transition-colors"
              >
                ← Back to lobby
              </button>
            </motion.div>
          )}

          {/* Main lobby - Preview + Join form */}
          {waitState === 'idle' && activeTab === 'preview' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-3 w-full max-w-sm"
            >
              {/* Meeting info header */}
              <div className="text-center gap-y-1">
                {/* <p className="text-white/40 text-xs font-medium tracking-widest uppercase">
                  {meeting.status === 'ACTIVE' ? '● Live Now' : '○ Waiting Room'}
                </p> */}
                <h1 className="text-white text-2xl font-semibold">{meeting.title}</h1>
                <p className="text-white/30 text-xs">Room · {roomId}</p>
              </div>

              {/* Video preview frame - around.co style floating card */}
              <div className="relative group w-full aspect-video rounded-2xl overflow-hidden bg-neutral-900/80 backdrop-blur-sm border border-white/10 shadow-2xl shadow-black/50">
                <video
                aria-label='meeting-lobby'
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: videoOn ? 'block' : 'none', transform: 'scaleX(-1)' }}
                />
                <div className=" absolute right-2 left-auto inset-0 bottom-2 top-auto flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs px-1.5 py-1.5 rounded-full backdrop-blur-md border ${audioOn
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                    {audioOn ? <Mic className="size-3" /> : <MicOff className="size-3" />}
                    {/* {audioOn ? 'Mic on' : 'Mic off'} */}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs px-1.5 py-1.5 rounded-full backdrop-blur-md border ${videoOn
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                    {videoOn ? <Video className="size-3" /> : <VideoOff className="size-3" />}
                    {/* {videoOn ? 'Camera on' : 'Camera off'} */}
                  </div>
                </div>
                {!videoOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90">
                    <div className=" size-20 rounded-full bg-white/10 flex items-center justify-center mb-3">
                      {user?.image ? (
                        <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-2xl font-semibold">
                          {displayName?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-sm">Camera is off</p>

                  </div>
                )}

                {/* Background badge */}
                {selectedBg !== 'none' && videoOn && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Sparkles className="size-3" />
                    {BACKGROUNDS.find((b) => b.id === selectedBg)?.label}
                  </div>
                )}
              </div>

              {/* Floating control buttons - around.co style */}
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setAudioOn((v) => !v)}
                  className={`size-12 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${audioOn
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    : 'bg-red-500/80 border-red-400/50 text-white hover:bg-red-500'
                    }`}
                >
                  {audioOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
                </button>

                <button type="button"
                  onClick={() => setVideoOn((v) => !v)}
                  className={`size-12 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${videoOn
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    : 'bg-red-500/80 border-red-400/50 text-white hover:bg-red-500'
                    }`}
                >
                  {videoOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
                </button>

                <button type="button"
                  onClick={() => setActiveTab((t) => (t === 'background' ? 'preview' : 'background'))}
                  className={`size-12 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${activeTab === 'background'
                    ? 'bg-blue-500/80 border-blue-400/50 text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                >
                  <Monitor className="size-5" />
                </button>

                <button type="button"
                  onClick={() => setActiveTab((t) => (t === 'settings' ? 'preview' : 'settings'))}
                  className={`size-12 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${activeTab === 'settings'
                    ? 'bg-blue-500/80 border-blue-400/50 text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                >
                  <Settings className="size-5" />
                </button>
              </div>


              {/* Join form */}
              <div className="w-full space-y-4">
                {/* Name input */}
                <div>
                  <label htmlFor="meeting-lobby-name" className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Your name</label>
                  <input
                    aria-label='display-name-input'
                    id="meeting-lobby-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    placeholder="Enter your display name"
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors"
                    // autoFocus={!user}
                  />
                </div>

                {/* Password */}
                {meeting.hasPassword && (
                  <div>
                    <label htmlFor="meeting-lobby-password" className="text-white/40 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Lock className="size-3" /> Meeting Password
                    </label>
                    <div className="relative">
                      <input
                        aria-label='meeting-password'
                        id="meeting-lobby-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter meeting password"
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/40 pr-10 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-3.5 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Approval notice */}
                {meeting.requireApproval && !meeting.isHost && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                    <Shield className="size-4text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-300/80 text-sm">
                      This meeting requires host approval. You'll wait briefly before entering.
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {/* Join button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="w-full py-2 rounded-lg font-semibold text-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-white hover:bg-white/80 backdrop-blur-md border border-white/20"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Joining…</>
                  ) : (
                    <>
                      <Users className="size-4" />{meeting.isHost ? 'Start Meeting' : 'Join Meeting'}</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
