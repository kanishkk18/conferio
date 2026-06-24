// 'use client';
// import React, { useState, useRef, useEffect } from 'react';
// import { motion, useDragControls, AnimatePresence } from 'framer-motion';
// import {
//   PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
//   Maximize2, Minimize2, X, Users, Pause, Play, GitMerge,
//   PenLine, MoreHorizontal, UserPlus, Pencil
// } from 'lucide-react';
// import { useCall } from 'contexts/CallContext';
// import { ParticipantTile } from './ParticipantTile';
// import Whiteboard from './Whiteboard';
// import ScreenAnnotation from './ScreenAnnotation';

// interface AddParticipantModalProps {
//   onClose: () => void;
//   onAdd: (userId: string, name: string, image?: string) => void;
// }

// function AddParticipantModal({ onClose, onAdd }: AddParticipantModalProps) {
//   const [search, setSearch] = useState('');
//   const [members, setMembers] = useState<any[]>([]);

//   useEffect(() => {
//     fetch('/api/team/members?limit=20')
//       .then(r => r.json())
//       .then(d => setMembers(d.members || d || []))
//       .catch(() => {});
//   }, []);

//   const filtered = members.filter(m =>
//     m.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
//     m.user?.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl z-10 flex flex-col p-4">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-white font-semibold">Add Participant</h3>
//         <button type="button" onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
//           <X className="size-4" />
//         </button>
//       </div>
//       <input
//         type="text"
//         value={search}
//         onChange={e => setSearch(e.target.value)}
//         placeholder="Search members..."
//         className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm placeholder-neutral-500 outline-none focus:border-blue-500 mb-3"
//         
//       />
//       <div className="flex-1 overflow-y-auto gap-y-1">
//         {filtered.map(m => (
//           <button type="button"
//             key={m.id}
//             onClick={() => { onAdd(m.user.id, m.user.name, m.user.image); onClose(); }}
//             className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-800 transition-colors text-left"
//           >
//             <div className="size-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
//               {m.user.image
//                 ? <img src={m.user.image} alt="" className="w-full h-full object-cover" />
//                 : <span className="text-white text-xs font-bold">{m.user.name?.[0]}</span>
//               }
//             </div>
//             <div>
//               <p className="text-white text-sm font-medium">{m.user.name}</p>
//               <p className="text-neutral-500 text-xs">{m.user.email}</p>
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function DraggableCallCard() {
//   const {
//     currentCall, heldCalls, room, localParticipant, remoteParticipants,
//     isMuted, isVideoOn, isScreenSharing,
//     toggleMute, toggleVideo, startScreenShare, stopScreenShare,
//     endCall, holdCall, resumeCall, mergeCalls, addParticipant,
//     minimizeCall, maximizeCall, minimizedCalls,
//   } = useCall();

//   const dragControls = useDragControls();
//   const constraintsRef = useRef<HTMLDivElement>(null);

//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showWhiteboard, setShowWhiteboard] = useState(false);
//   const [showAnnotations, setShowAnnotations] = useState(false);
//   const [showAddParticipant, setShowAddParticipant] = useState(false);
//   const [showMoreMenu, setShowMoreMenu] = useState(false);
//   const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);
//   const [callDuration, setCallDuration] = useState(0);

//   useEffect(() => {
//     if (!currentCall) return;
//     const t = setInterval(() => setCallDuration(p => p + 1), 1000);
//     return () => clearInterval(t);
//   }, [currentCall?.id]);

//   if (!currentCall && heldCalls.length === 0) return null;

//   const isMinimized = currentCall && minimizedCalls.includes(currentCall.id);

//   const formatDuration = (s: number) => {
//     const m = Math.floor(s / 60);
//     const sec = s % 60;
//     return `${m}:${sec.toString().padStart(2, '0')}`;
//   };

//   const allParticipants = [
//     ...(localParticipant ? [{ p: localParticipant, isLocal: true }] : []),
//     ...remoteParticipants.map(p => ({ p, isLocal: false })),
//   ];

//   const isVoiceOnly = currentCall?.type === 'AUDIO';

//   // ── Minimized bubble ───────────────────────────────────────────────────

//   if (isMinimized && currentCall) {
//     return (
//       <motion.div
//         drag dragMomentum={false}
//         className="fixed bottom-6 right-6 z-[8000] cursor-grab active:cursor-grabbing"
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//       >
//         <button type="button"
//           onClick={() => maximizeCall(currentCall.id)}
//           className="flex items-center gap-3 bg-neutral-900/95 border border-neutral-700 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-xl hover:bg-neutral-800 transition-colors"
//         >
//           <div className="relative size-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
//             <Video className="size-5 text-white" />
//             <span className="absolute -top-1 -right-1 size-3.5 emerald-500 rounded-full border-2 border-neutral-900 animate-pulse" />
//           </div>
//           <div>
//             <p className="text-white text-sm font-semibold">
//               {isVoiceOnly ? 'Voice Call' : 'Video Call'}
//             </p>
//             <p className="text-neutral-400 text-xs">{formatDuration(callDuration)}</p>
//           </div>
//         </button>
//       </motion.div>
//     );
//   }

//   // ── Fullscreen mode ────────────────────────────────────────────────────

//   if (isFullscreen && currentCall) {
//     return (
//       <div className="fixed inset-0 z-[8000] bg-neutral-950 flex flex-col">
//         {showWhiteboard && (
//           <Whiteboard onClose={() => setShowWhiteboard(false)} />
//         )}

//         {/* Header */}
//         <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
//               <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
//               <span className="text-white font-mono font-medium">{formatDuration(callDuration)}</span>
//             </div>
//             <span className="bg-black/50 backdrop-blur-md text-neutral-300 text-sm rounded-full px-4 py-2">
//               {allParticipants.length} participant{allParticipants.length !== 1 ? 's' : ''}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <button type="button"
//               onClick={() => setIsFullscreen(false)}
//               className="p-2 bg-black/50 backdrop-blur-md text-white hover:bg-white/10 rounded-xl transition-colors"
//             >
//               <Minimize2 className="size-5" />
//             </button>
//           </div>
//         </div>

//         {/* Participants grid */}
//         <div className="flex-1 p-4 pt-16 pb-24 relative">
//           {showAnnotations && isScreenSharing && (
//             <ScreenAnnotation onClose={() => setShowAnnotations(false)} />
//           )}

//           {allParticipants.length === 1 ? (
//             <ParticipantTile
//               participant={allParticipants[0].p}
//               isLocal={allParticipants[0].isLocal}
//               showVideo={!isVoiceOnly}
//               isPinned={false}
//             />
//           ) : (
//             <div className={`h-full grid gap-2 ${
//               allParticipants.length === 2 ? 'grid-cols-2' :
//               allParticipants.length <= 4 ? 'grid-cols-2' :
//               allParticipants.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'
//             }`}>
//               {allParticipants.map(({ p, isLocal }) => (
//                 <ParticipantTile
//                   key={p.identity}
//                   participant={p}
//                   isLocal={isLocal}
//                   showVideo={!isVoiceOnly}
//                   isPinned={pinnedParticipant === p.identity}
//                   onPin={() => setPinnedParticipant(
//                     pinnedParticipant === p.identity ? null : p.identity
//                   )}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Controls bar */}
//         <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 pb-6 pt-8">
//           <ControlsBar
//             isVoiceOnly={isVoiceOnly}
//             isMuted={isMuted}
//             isVideoOn={isVideoOn}
//             isScreenSharing={isScreenSharing}
//             showWhiteboard={showWhiteboard}
//             showAnnotations={showAnnotations}
//             heldCalls={heldCalls}
//             currentCall={currentCall}
//             onToggleMute={toggleMute}
//             onToggleVideo={toggleVideo}
//             onToggleScreen={() => isScreenSharing ? stopScreenShare() : startScreenShare()}
//             onToggleWhiteboard={() => setShowWhiteboard(v => !v)}
//             onToggleAnnotations={() => setShowAnnotations(v => !v)}
//             onAddParticipant={() => setShowAddParticipant(true)}
//             onHold={() => holdCall(currentCall.id)}
//             onResume={() => heldCalls[0] && resumeCall(heldCalls[0].id)}
//             onMerge={mergeCalls}
//             onEnd={() => endCall()}
//             onMinimize={() => minimizeCall(currentCall.id)}
//             onMaximize={() => setIsFullscreen(false)}
//             isFullscreen
//           />

//           {heldCalls.length > 0 && (
//             <div className="mt-3 flex justify-center">
//               <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1.5 flex items-center gap-2">
//                 <Pause className="size-3.5  text-yellow-400" />
//                 <span className="text-yellow-400 text-sm">{heldCalls.length} call on hold</span>
//                 <button type="button"
//                   onClick={() => resumeCall(heldCalls[0].id)}
//                   className="text-yellow-300 text-sm font-semibold hover:text-yellow-200 ml-1"
//                 >
//                   Resume →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // ── Draggable card (default) ───────────────────────────────────────────

//   return (
//     <>
//       <div ref={constraintsRef} className="fixed inset-0 z-[7999] pointer-events-none" />

//       <motion.div
//         drag
//         dragControls={dragControls}
//         dragMomentum={false}
//         dragConstraints={constraintsRef}
//         initial={{ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 0, y: 80 }}
//         className="fixed z-[8000] pointer-events-auto"
//         style={{ width: 380, cursor: 'default' }}
//       >
//         <div
//           className="rounded-3xl overflow-hidden shadow-2xl"
//           style={{
//             background: 'linear-gradient(145deg, rgba(10,10,15,0.98) 0%, rgba(15,15,25,0.98) 100%)',
//             border: '1px solid rgba(255,255,255,0.08)',
//             backdropFilter: 'blur(20px)',
//           }}
//         >
//           {/* Drag handle + header */}
//           <div
//             className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing bg-neutral-900/60"
//             onPointerDown={e => dragControls.start(e)}
//           >
//             <div className="flex items-center gap-2.5">
//               <div className="flex gap-1.5">
//                 <div className="size-3 rounded-full bg-red-500/80" />
//                 <div className="size-3 rounded-full bg-yellow-500/80" />
//                 <div className="size-3 rounded-full bg-emerald-500/80" />
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <div className="size-1.5  rounded-full bg-emerald-500 animate-pulse" />
//                 <span className="text-neutral-300 text-xs font-mono">{formatDuration(callDuration)}</span>
//               </div>
//               {currentCall && (
//                 <span className="text-neutral-500 text-xs">
//                   {isVoiceOnly ? '🎙 Voice' : '🎥 Video'} · {allParticipants.length}p
//                 </span>
//               )}
//             </div>
//             <div className="flex items-center gap-1">
//               <button type="button" onClick={() => currentCall && minimizeCall(currentCall.id)} className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors">
//                 <Minimize2 className="size-3.5 " />
//               </button>
//               <button type="button" onClick={() => setIsFullscreen(true)} className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors">
//                 <Maximize2 className="size-3.5 " />
//               </button>
//               <button type="button" onClick={() => endCall()} className="p-1 text-neutral-500 hover:text-red-400 transition-colors">
//                 <X className="size-3.5 " />
//               </button>
//             </div>
//           </div>

//           {/* Video / Avatar area */}
//           {currentCall && (
//             <div className="relative bg-neutral-950" style={{ height: isVoiceOnly ? 160 : 220 }}>
//               <AnimatePresence>
//                 {showAddParticipant && (
//                   <AddParticipantModal
//                     onClose={() => setShowAddParticipant(false)}
//                     onAdd={addParticipant}
//                   />
//                 )}
//               </AnimatePresence>

//               {isVoiceOnly ? (
//                 // Voice call: show avatars in a row
//                 <div className="w-full h-full flex items-center justify-center gap-3 px-4">
//                   {allParticipants.slice(0, 5).map(({ p, isLocal }) => {
//                     let pName = 'Unknown';
//                     try { const m = p.metadata ? JSON.parse(p.metadata) : {}; pName = m.name || p.name || 'Unknown'; } catch {}
//                     const initials = pName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
//                     return (
//                       <div key={p.identity} className="flex flex-col items-center gap-1">
//                         <motion.div
//                           animate={{ boxShadow: ['0 0 0 0 rgba(52,211,153,0)', '0 0 0 8px rgba(52,211,153,0.15)', '0 0 0 0 rgba(52,211,153,0)'] }}
//                           transition={{ repeat: Infinity, duration: 2 }}
//                           className=" size-14  rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border-2 border-neutral-700 overflow-hidden"
//                         >
//                           <span className="text-white font-bold">{initials}</span>
//                         </motion.div>
//                         <span className="text-neutral-400 text-xs">{isLocal ? 'You' : pName}</span>
//                       </div>
//                     );
//                   })}
//                   {allParticipants.length > 5 && (
//                     <div className=" size-14  rounded-full bg-neutral-800 flex items-center justify-center border-2 border-neutral-700">
//                       <span className="text-neutral-400 text-xs font-bold">+{allParticipants.length - 5}</span>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 // Video call: grid
//                 <div className={`h-full p-2 grid gap-1 ${
//                   allParticipants.length <= 1 ? 'grid-cols-1' :
//                   allParticipants.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'
//                 }`}>
//                   {allParticipants.slice(0, 4).map(({ p, isLocal }) => (
//                     <ParticipantTile
//                       key={p.identity}
//                       participant={p}
//                       isLocal={isLocal}
//                       compact
//                       showVideo={!isVoiceOnly}
//                     />
//                   ))}
//                   {allParticipants.length > 4 && (
//                     <div className="rounded-xl bg-neutral-800 flex items-center justify-center">
//                       <span className="text-neutral-400 text-sm font-bold">+{allParticipants.length - 4}</span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Held calls strip */}
//           {heldCalls.length > 0 && (
//             <div className="px-3 py-2 border-t border-neutral-800 flex items-center gap-2">
//               <Pause className="size-3.5  text-yellow-500 flex-shrink-0" />
//               <span className="text-yellow-500 text-xs">On hold</span>
//               <div className="flex gap-1.5 ml-auto flex-wrap">
//                 {heldCalls.map(hc => (
//                   <button type="button"
//                     key={hc.id}
//                     onClick={() => resumeCall(hc.id)}
//                     className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-full transition-colors"
//                   >
//                     Resume
//                   </button>
//                 ))}
//                 {heldCalls.length > 0 && currentCall && (
//                   <button type="button"
//                     onClick={mergeCalls}
//                     className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
//                   >
//                     <GitMerge className="size-3" /> Merge
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Controls */}
//           {currentCall && (
//             <div className="px-4 py-3 border-t border-neutral-800/60">
//               <div className="flex items-center justify-between">
//                 {/* Mute */}
//                 <SmallControlBtn
//                   onClick={toggleMute}
//                   active={!isMuted}
//                   danger={isMuted}
//                   icon={isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
//                   label={isMuted ? 'Unmute' : 'Mute'}
//                 />

//                 {/* Video (only for video calls) */}
//                 {!isVoiceOnly && (
//                   <SmallControlBtn
//                     onClick={toggleVideo}
//                     active={isVideoOn}
//                     danger={!isVideoOn}
//                     icon={isVideoOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
//                     label="Video"
//                   />
//                 )}

//                 {/* Screen share (only video) */}
//                 {!isVoiceOnly && (
//                   <SmallControlBtn
//                     onClick={isScreenSharing ? stopScreenShare : startScreenShare}
//                     active={isScreenSharing}
//                     icon={isScreenSharing ? <MonitorOff className="size-4" /> : <Monitor className="size-4" />}
//                     label="Screen"
//                   />
//                 )}

//                 {/* Hold */}
//                 <SmallControlBtn
//                   onClick={() => holdCall(currentCall.id)}
//                   active={false}
//                   icon={<Pause className="size-4" />}
//                   label="Hold"
//                 />

//                 {/* Add participant */}
//                 <SmallControlBtn
//                   onClick={() => setShowAddParticipant(true)}
//                   active={false}
//                   icon={<UserPlus className="size-4" />}
//                   label="Add"
//                 />

//                 {/* Fullscreen */}
//                 <SmallControlBtn
//                   onClick={() => setIsFullscreen(true)}
//                   active={false}
//                   icon={<Maximize2 className="size-4" />}
//                   label="Expand"
//                 />

//                 {/* End */}
//                 <button type="button"
//                   onClick={() => endCall()}
//                   className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white transition-colors"
//                 >
//                   <PhoneOff className="size-4" />
//                   <span className="text-[10px] font-medium">End</span>
//                 </button>
//               </div>

//               {/* Whiteboard / Annotate buttons (video only) */}
//               {!isVoiceOnly && (
//                 <div className="flex gap-2 mt-2">
//                   <button type="button"
//                     onClick={() => setShowWhiteboard(true)}
//                     className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
//                       showWhiteboard ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
//                     }`}
//                   >
//                     <PenLine className="size-3.5 " /> Whiteboard
//                   </button>
//                   {isScreenSharing && (
//                     <button type="button"
//                       onClick={() => setShowAnnotations(v => !v)}
//                       className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
//                         showAnnotations ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
//                       }`}
//                     >
//                       <Pencil className="size-3.5 " /> Annotate
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Whiteboard modal (draggable context) */}
//         {showWhiteboard && (
//           <Whiteboard onClose={() => setShowWhiteboard(false)} />
//         )}
//       </motion.div>
//     </>
//   );
// }

// // ── Helper components ──────────────────────────────────────────────────────

// function SmallControlBtn({
//   onClick, active, danger = false, icon, label
// }: {
//   onClick: () => void;
//   active: boolean;
//   danger?: boolean;
//   icon: React.ReactNode;
//   label: string;
// }) {
//   return (
//     <button type="button"
//       onClick={onClick}
//       aria-label={label}
//       className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-2xl transition-all ${
//         danger
//           ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
//           : active
//             ? 'bg-neutral-700 text-white'
//             : 'bg-neutral-800/60 text-neutral-400 hover:bg-neutral-700 hover:text-white'
//       }`}
//     >
//       {icon}
//       <span className="text-[9px] font-medium">{label}</span>
//     </button>
//   );
// }

// function ControlsBar({
//   isVoiceOnly, isMuted, isVideoOn, isScreenSharing,
//   showWhiteboard, showAnnotations, heldCalls, currentCall,
//   onToggleMute, onToggleVideo, onToggleScreen, onToggleWhiteboard,
//   onToggleAnnotations, onAddParticipant, onHold, onResume, onMerge,
//   onEnd, onMinimize, isFullscreen,
// }: any) {
//   return (
//     <div className="flex flex-col items-center gap-4">
//       <div className="flex items-center gap-3 flex-wrap justify-center">
//         <ControlBtn onClick={onToggleMute} active={!isMuted} danger={isMuted}
//           icon={isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
//           label={isMuted ? 'Unmute' : 'Mute'} />

//         {!isVoiceOnly && (
//           <ControlBtn onClick={onToggleVideo} active={isVideoOn} danger={!isVideoOn}
//             icon={isVideoOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
//             label="Camera" />
//         )}

//         {!isVoiceOnly && (
//           <ControlBtn onClick={onToggleScreen} active={isScreenSharing}
//             icon={isScreenSharing ? <MonitorOff className="size-5" /> : <Monitor className="size-5" />}
//             label="Screen" />
//         )}

//         {!isVoiceOnly && (
//           <ControlBtn onClick={onToggleWhiteboard} active={showWhiteboard}
//             icon={<PenLine className="size-5" />} label="Board" />
//         )}

//         {isScreenSharing && !isVoiceOnly && (
//           <ControlBtn onClick={onToggleAnnotations} active={showAnnotations}
//             icon={<Pencil className="size-5" />} label="Annotate" />
//         )}

//         <ControlBtn onClick={onAddParticipant} active={false}
//           icon={<UserPlus className="size-5" />} label="Add" />

//         <ControlBtn onClick={onHold} active={false}
//           icon={<Pause className="size-5" />} label="Hold" />

//         {heldCalls.length > 0 && (
//           <ControlBtn onClick={onMerge} active={false}
//             icon={<GitMerge className="size-5" />} label="Merge" />
//         )}

//         <button type="button"
//           onClick={onEnd}
//           className="bg-red-600 hover:bg-red-500 text-white px-7 py-3.5 rounded-2xl flex items-center gap-2 font-semibold transition-all hover:scale-105 shadow-lg shadow-red-600/30"
//         >
//           <PhoneOff className="size-5" /> End
//         </button>
//       </div>
//     </div>
//   );
// }

// function ControlBtn({
//   onClick, active, danger = false, icon, label
// }: {
//   onClick: () => void;
//   active: boolean;
//   danger?: boolean;
//   icon: React.ReactNode;
//   label: string;
// }) {
//   return (
//     <button type="button"
//       onClick={onClick}
//       aria-label={label}
//       className={`flex flex-col items-center gap-1 p-3.5 rounded-2xl transition-all ${
//         danger
//           ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
//           : active
//             ? 'bg-neutral-700 text-white hover:bg-neutral-600'
//             : 'bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-white'
//       }`}
//     >
//       {icon}
//       <span className="text-xs font-medium">{label}</span>
//     </button>
//   );
// }

// 'use client';
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { motion, useDragControls, AnimatePresence } from 'framer-motion';
// import {
//   PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
//   Maximize2, Minimize2, X, Pause, GitMerge, UserPlus, PenLine, Pencil,
// } from 'lucide-react';
// import { useCall } from 'contexts/CallContext';
// import { ParticipantTile } from './ParticipantTile';
// import Whiteboard from './Whiteboard';
// import ScreenAnnotation from './ScreenAnnotation';

// // ── Add participant search modal ───────────────────────────────────────────

// function AddParticipantModal({
//   onClose,
//   onAdd,
// }: {
//   onClose: () => void;
//   onAdd: (userId: string, name: string, image?: string) => void;
// }) {
//   const [search, setSearch] = useState('');
//   const [members, setMembers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch('/api/team/members?limit=30')
//       .then((r) => r.json())
//       .then((d) => setMembers(d.members || d || []))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   const filtered = members.filter(
//     (m) =>
//       m.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
//       m.user?.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-sm rounded-3xl z-20 flex flex-col p-4">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-white font-semibold text-sm">Add to Call</h3>
//         <button type="button" onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
//           <X className="size-4" />
//         </button>
//       </div>
//       <input
//         type="text"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         placeholder="Search members..."
//         className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm placeholder-neutral-500 outline-none focus:border-blue-500 mb-3"
//         
//       />
//       <div className="flex-1 overflow-y-auto gap-y-1">
//         {loading && (
//           <p className="text-neutral-500 text-sm text-center py-4">Loading…</p>
//         )}
//         {!loading && filtered.length === 0 && (
//           <p className="text-neutral-500 text-sm text-center py-4">No members found</p>
//         )}
//         {filtered.map((m) => (
//           <button type="button"
//             key={m.id}
//             onClick={() => {
//               onAdd(m.user.id, m.user.name, m.user.image);
//               onClose();
//             }}
//             className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-800 transition-colors text-left"
//           >
//             <div className="size-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
//               {m.user.image ? (
//                 <img src={m.user.image} alt="" className="w-full h-full object-cover" />
//               ) : (
//                 <span className="text-white text-xs font-bold">{m.user.name?.[0]}</span>
//               )}
//             </div>
//             <div>
//               <p className="text-white text-sm font-medium">{m.user.name}</p>
//               <p className="text-neutral-500 text-xs">{m.user.email}</p>
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ── Control button ─────────────────────────────────────────────────────────

// function CtrlBtn({
//   onClick,
//   active = false,
//   danger = false,
//   icon: Icon,
//   label,
//   size = 'sm',
// }: {
//   onClick: () => void;
//   active?: boolean;
//   danger?: boolean;
//   icon: React.ElementType;
//   label: string;
//   size?: 'sm' | 'lg';
// }) {
//   const base =
//     size === 'lg'
//       ? 'flex flex-col items-center gap-1 p-3.5 rounded-2xl text-xs font-medium'
//       : 'flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-2xl text-[10px] font-medium';

//   const color = danger
//     ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
//     : active
//     ? 'bg-neutral-700 text-white hover:bg-neutral-600'
//     : 'bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700 hover:text-white';

//   return (
//     <button type="button" onClick={onClick} aria-label={label} className={`${base} ${color} transition-all`}>
//       <Icon className={size === 'lg' ? 'size-5' : 'size-4'} />
//       {label}
//     </button>
//   );
// }

// // ── Main component ─────────────────────────────────────────────────────────

// export default function DraggableCallCard() {
//   const {
//     currentCall,
//     heldCalls,
//     localParticipant,
//     remoteParticipants,
//     isMuted,
//     isVideoOn,
//     isScreenSharing,
//     minimizedCalls,
//     toggleMute,
//     toggleVideo,
//     startScreenShare,
//     stopScreenShare,
//     endCall,
//     holdCall,
//     resumeCall,
//     mergeCalls,
//     addParticipant,
//     minimizeCall,
//     maximizeCall,
//   } = useCall();

//   const dragControls = useDragControls();
//   const constraintsRef = useRef<HTMLDivElement>(null);

//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showWhiteboard, setShowWhiteboard] = useState(false);
//   const [showAnnotations, setShowAnnotations] = useState(false);
//   const [showAddParticipant, setShowAddParticipant] = useState(false);
//   const [pinnedId, setPinnedId] = useState<string | null>(null);
//   const [duration, setDuration] = useState(0);

//   // Duration timer
//   useEffect(() => {
//     if (!currentCall) { setDuration(0); return; }
//     const t = setInterval(() => setDuration((d) => d + 1), 1000);
//     return () => clearInterval(t);
//   }, [currentCall?.id]);

//   const fmt = (s: number) =>
//     `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

//   const hasActiveCall = !!currentCall || heldCalls.length > 0;
//   if (!hasActiveCall) return null;

//   const isMinimized = currentCall && minimizedCalls.includes(currentCall.id);
//   const isVoice = currentCall?.type === 'AUDIO';

//   const allParticipants: Array<{ p: any; isLocal: boolean }> = [
//     ...(localParticipant ? [{ p: localParticipant, isLocal: true }] : []),
//     ...remoteParticipants.map((p) => ({ p, isLocal: false })),
//   ];

//   // ── Minimized bubble ───────────────────────────────────────────────────

//   if (isMinimized && currentCall) {
//     return (
//       <motion.div
//         drag
//         dragMomentum={false}
//         initial={{ x: -20, y: -20 }}
//         className="fixed bottom-6 right-6 z-[8000] cursor-grab active:cursor-grabbing"
//         animate={{ scale: 1, opacity: 1 }}
//       >
//         <button type="button"
//           onClick={() => maximizeCall(currentCall.id)}
//           className="flex items-center gap-3 bg-neutral-900/95 border border-neutral-700 rounded-2xl px-4 py-3 shadow-2xl hover:bg-neutral-800 transition-colors"
//         >
//           <div className="relative size-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
//             {isVoice ? (
//               <Mic className="size-5 text-white" />
//             ) : (
//               <Video className="size-5 text-white" />
//             )}
//             <span className="absolute -top-1 -right-1 size-3 bg-emerald-500 rounded-full border-2 border-neutral-900 animate-pulse" />
//           </div>
//           <div className="text-left">
//             <p className="text-white text-sm font-semibold">
//               {isVoice ? 'Voice Call' : 'Video Call'}
//             </p>
//             <p className="text-neutral-400 text-xs font-mono">{fmt(duration)}</p>
//           </div>
//         </button>
//       </motion.div>
//     );
//   }

//   // ── Fullscreen ─────────────────────────────────────────────────────────

//   if (isFullscreen && currentCall) {
//     return (
//       <div className="fixed inset-0 z-[8000] bg-neutral-950 flex flex-col select-none">
//         {/* Whiteboard overlay */}
//         <AnimatePresence>
//           {showWhiteboard && (
//             <Whiteboard onClose={() => setShowWhiteboard(false)} />
//           )}
//         </AnimatePresence>

//         {/* Top bar */}
//         <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
//           <div className="flex items-center gap-3 pointer-events-auto">
//             <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-1.5">
//               <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
//               <span className="text-white font-mono text-sm font-medium">
//                 {fmt(duration)}
//               </span>
//             </div>
//             <span className="bg-black/50 backdrop-blur-md text-neutral-300 text-xs rounded-full px-3 py-1.5">
//               {allParticipants.length} participant
//               {allParticipants.length !== 1 ? 's' : ''}
//             </span>
//           </div>
//           <div className="flex items-center gap-2 pointer-events-auto">
//             <button type="button"
//               onClick={() => setIsFullscreen(false)}
//               className="p-2 bg-black/50 backdrop-blur-md text-white hover:bg-white/10 rounded-xl transition-colors"
//               title="Exit fullscreen"
//             >
//               <Minimize2 className="size-5" />
//             </button>
//             <button type="button"
//               onClick={() => currentCall && minimizeCall(currentCall.id)}
//               className="p-2 bg-black/50 backdrop-blur-md text-white hover:bg-white/10 rounded-xl transition-colors"
//               title="Minimize"
//             >
//               <X className="size-4" />
//             </button>
//           </div>
//         </div>

//         {/* Participant grid */}
//         <div className="flex-1 p-4 pt-16 pb-28 relative overflow-hidden">
//           {/* Screen annotation overlay */}
//           {showAnnotations && isScreenSharing && (
//             <ScreenAnnotation onClose={() => setShowAnnotations(false)} />
//           )}

//           {allParticipants.length === 0 ? (
//             <div className="h-full flex items-center justify-center">
//               <p className="text-neutral-500 text-sm animate-pulse">
//                 Connecting…
//               </p>
//             </div>
//           ) : allParticipants.length === 1 ? (
//             <div className="h-full max-w-3xl mx-auto">
//               <ParticipantTile
//                 participant={allParticipants[0].p}
//                 isLocal={allParticipants[0].isLocal}
//                 showVideo={!isVoice}
//               />
//             </div>
//           ) : (
//             <div
//               className={`h-full grid gap-3 ${
//                 allParticipants.length === 2
//                   ? 'grid-cols-2'
//                   : allParticipants.length <= 4
//                   ? 'grid-cols-2'
//                   : allParticipants.length <= 6
//                   ? 'grid-cols-3'
//                   : 'grid-cols-4'
//               }`}
//             >
//               {allParticipants.map(({ p, isLocal }) => (
//                 <ParticipantTile
//                   key={p.identity}
//                   participant={p}
//                   isLocal={isLocal}
//                   showVideo={!isVoice}
//                   isPinned={pinnedId === p.identity}
//                   onPin={() =>
//                     setPinnedId(
//                       pinnedId === p.identity ? null : p.identity
//                     )
//                   }
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Bottom controls */}
//         <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 pb-6 pt-10">
//           <div className="flex items-center justify-center gap-3 flex-wrap">
//             <CtrlBtn
//               onClick={toggleMute}
//               active={!isMuted}
//               danger={isMuted}
//               icon={isMuted ? MicOff : Mic}
//               label={isMuted ? 'Unmute' : 'Mute'}
//               size="lg"
//             />
//             {!isVoice && (
//               <CtrlBtn
//                 onClick={toggleVideo}
//                 active={isVideoOn}
//                 danger={!isVideoOn}
//                 icon={isVideoOn ? Video : VideoOff}
//                 label="Camera"
//                 size="lg"
//               />
//             )}
//             {!isVoice && (
//               <CtrlBtn
//                 onClick={isScreenSharing ? stopScreenShare : startScreenShare}
//                 active={isScreenSharing}
//                 icon={isScreenSharing ? MonitorOff : Monitor}
//                 label="Screen"
//                 size="lg"
//               />
//             )}
//             {!isVoice && (
//               <CtrlBtn
//                 onClick={() => setShowWhiteboard((v) => !v)}
//                 active={showWhiteboard}
//                 icon={PenLine}
//                 label="Board"
//                 size="lg"
//               />
//             )}
//             {isScreenSharing && !isVoice && (
//               <CtrlBtn
//                 onClick={() => setShowAnnotations((v) => !v)}
//                 active={showAnnotations}
//                 icon={Pencil}
//                 label="Annotate"
//                 size="lg"
//               />
//             )}
//             <CtrlBtn
//               onClick={() => setShowAddParticipant(true)}
//               icon={UserPlus}
//               label="Add"
//               size="lg"
//             />
//             <CtrlBtn
//               onClick={() => holdCall(currentCall.id)}
//               icon={Pause}
//               label="Hold"
//               size="lg"
//             />
//             {heldCalls.length > 0 && (
//               <CtrlBtn
//                 onClick={mergeCalls}
//                 icon={GitMerge}
//                 label="Merge"
//                 size="lg"
//               />
//             )}
//             <button type="button"
//               onClick={() => endCall()}
//               className="flex flex-col items-center gap-1 px-7 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all hover:scale-105 shadow-lg shadow-red-600/30"
//             >
//               <PhoneOff className="size-5" />
//               End
//             </button>
//           </div>

//           {heldCalls.length > 0 && (
//             <div className="mt-3 flex justify-center">
//               <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1.5 flex items-center gap-2">
//                 <Pause className="size-3.5  text-yellow-400" />
//                 <span className="text-yellow-400 text-sm">
//                   {heldCalls.length} on hold
//                 </span>
//                 <button type="button"
//                   onClick={() => resumeCall(heldCalls[0].id)}
//                   className="text-yellow-300 text-sm font-semibold hover:text-yellow-200 ml-1"
//                 >
//                   Resume →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Add participant panel */}
//         {showAddParticipant && (
//           <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
//             <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 w-full max-w-sm max-h-[70vh] flex flex-col">
//               <AddParticipantModal
//                 onClose={() => setShowAddParticipant(false)}
//                 onAdd={addParticipant}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // ── Draggable card (default view) ──────────────────────────────────────

//   return (
//     <>
//       {/* Drag constraints cover the full screen */}
//       <div
//         ref={constraintsRef}
//         className="fixed inset-0 z-[7999] pointer-events-none"
//       />

//       <motion.div
//         drag
//         dragControls={dragControls}
//         dragMomentum={false}
//         dragConstraints={constraintsRef}
//         initial={{
//           x:
//             typeof window !== 'undefined' ? window.innerWidth - 420 : 800,
//           y: 80,
//         }}
//         className="fixed z-[8000] pointer-events-auto"
//         style={{ width: 380, touchAction: 'none' }}
//       >
//         <div
//           className="rounded-3xl overflow-hidden shadow-2xl"
//           style={{
//             background:
//               'linear-gradient(145deg, rgba(10,10,15,0.98) 0%, rgba(15,15,25,0.98) 100%)',
//             border: '1px solid rgba(255,255,255,0.08)',
//             backdropFilter: 'blur(20px)',
//           }}
//         >
//           {/* ── Drag handle header ── */}
//           <div
//             className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing bg-neutral-900/60 select-none"
//             onPointerDown={(e) => dragControls.start(e)}
//           >
//             <div className="flex items-center gap-2.5">
//               {/* macOS-style dots */}
//               <div className="flex gap-1.5">
//                 <div className="size-3 rounded-full bg-red-500/80" />
//                 <div className="size-3 rounded-full bg-yellow-500/80" />
//                 <div className="size-3 rounded-full bg-emerald-500/80" />
//               </div>
//               <div className="flex items-center gap-1.5 ml-1">
//                 <span className="size-1.5  rounded-full bg-emerald-500 animate-pulse" />
//                 <span className="text-neutral-300 text-xs font-mono">
//                   {fmt(duration)}
//                 </span>
//               </div>
//               <span className="text-neutral-600 text-xs">
//                 {isVoice ? '🎙' : '🎥'}{' '}
//                 {allParticipants.length}p
//               </span>
//             </div>
//             <div className="flex items-center gap-1">
//               <button type="button"
//                 onClick={() => currentCall && minimizeCall(currentCall.id)}
//                 className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
//                 title="Minimize"
//               >
//                 <Minimize2 className="size-3.5 " />
//               </button>
//               <button type="button"
//                 onClick={() => setIsFullscreen(true)}
//                 className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
//                 title="Expand"
//               >
//                 <Maximize2 className="size-3.5 " />
//               </button>
//               <button type="button"
//                 onClick={() => endCall()}
//                 className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
//                 title="End call"
//               >
//                 <X className="size-3.5 " />
//               </button>
//             </div>
//           </div>

//           {/* ── Media area ── */}
//           {currentCall && (
//             <div
//               className="relative bg-neutral-950"
//               style={{ height: isVoice ? 148 : 212 }}
//             >
//               <AnimatePresence>
//                 {showAddParticipant && (
//                   <AddParticipantModal
//                     onClose={() => setShowAddParticipant(false)}
//                     onAdd={addParticipant}
//                   />
//                 )}
//               </AnimatePresence>

//               {isVoice ? (
//                 /* Voice: show avatars */
//                 <div className="w-full h-full flex items-center justify-center gap-4 px-4">
//                   {allParticipants.slice(0, 4).map(({ p, isLocal }) => {
//                     let n = 'Unknown';
//                     try {
//                       const m = p.metadata ? JSON.parse(p.metadata) : {};
//                       n = m.name || p.name || 'Unknown';
//                     } catch {}
//                     const initials = n
//                       .split(' ')
//                       .map((x: string) => x[0])
//                       .join('')
//                       .toUpperCase()
//                       .slice(0, 2);
//                     return (
//                       <div
//                         key={p.identity}
//                         className="flex flex-col items-center gap-1.5"
//                       >
//                         <motion.div
//                           animate={{
//                             boxShadow: [
//                               '0 0 0 0 rgba(52,211,153,0)',
//                               '0 0 0 8px rgba(52,211,153,0.15)',
//                               '0 0 0 0 rgba(52,211,153,0)',
//                             ],
//                           }}
//                           transition={{ repeat: Infinity, duration: 2 }}
//                           className=" size-14  rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border-2 border-neutral-700"
//                         >
//                           <span className="text-white font-bold">
//                             {initials}
//                           </span>
//                         </motion.div>
//                         <span className="text-neutral-400 text-xs">
//                           {isLocal ? 'You' : n}
//                         </span>
//                       </div>
//                     );
//                   })}
//                   {allParticipants.length > 4 && (
//                     <div className=" size-14  rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
//                       <span className="text-neutral-400 text-xs font-bold">
//                         +{allParticipants.length - 4}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 /* Video: compact grid */
//                 <div
//                   className={`h-full p-2 grid gap-1 ${
//                     allParticipants.length <= 1
//                       ? 'grid-cols-1'
//                       : 'grid-cols-2'
//                   }`}
//                 >
//                   {allParticipants.slice(0, 4).map(({ p, isLocal }) => (
//                     <ParticipantTile
//                       key={p.identity}
//                       participant={p}
//                       isLocal={isLocal}
//                       compact
//                       showVideo
//                     />
//                   ))}
//                   {allParticipants.length > 4 && (
//                     <div className="rounded-xl bg-neutral-800 flex items-center justify-center">
//                       <span className="text-neutral-400 text-sm font-bold">
//                         +{allParticipants.length - 4}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ── Held calls strip ── */}
//           {heldCalls.length > 0 && (
//             <div className="px-3 py-2 border-t border-neutral-800 flex items-center gap-2">
//               <Pause className="size-3.5  text-yellow-500 flex-shrink-0" />
//               <span className="text-yellow-500 text-xs">On hold</span>
//               <div className="flex gap-1.5 ml-auto flex-wrap">
//                 {heldCalls.map((hc) => (
//                   <button type="button"
//                     key={hc.id}
//                     onClick={() => resumeCall(hc.id)}
//                     className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-full transition-colors"
//                   >
//                     Resume
//                   </button>
//                 ))}
//                 {currentCall && (
//                   <button type="button"
//                     onClick={mergeCalls}
//                     className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
//                   >
//                     <GitMerge className="size-3" /> Merge
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ── Controls ── */}
//           {currentCall && (
//             <div className="  p-3  border-t border-neutral-800/60">
//               <div className="flex items-center justify-between gap-1">
//                 <CtrlBtn
//                   onClick={toggleMute}
//                   active={!isMuted}
//                   danger={isMuted}
//                   icon={isMuted ? MicOff : Mic}
//                   label={isMuted ? 'Unmute' : 'Mute'}
//                 />
//                 {!isVoice && (
//                   <CtrlBtn
//                     onClick={toggleVideo}
//                     active={isVideoOn}
//                     danger={!isVideoOn}
//                     icon={isVideoOn ? Video : VideoOff}
//                     label="Video"
//                   />
//                 )}
//                 {!isVoice && (
//                   <CtrlBtn
//                     onClick={
//                       isScreenSharing ? stopScreenShare : startScreenShare
//                     }
//                     active={isScreenSharing}
//                     icon={isScreenSharing ? MonitorOff : Monitor}
//                     label="Screen"
//                   />
//                 )}
//                 <CtrlBtn
//                   onClick={() => holdCall(currentCall.id)}
//                   icon={Pause}
//                   label="Hold"
//                 />
//                 <CtrlBtn
//                   onClick={() => setShowAddParticipant(true)}
//                   icon={UserPlus}
//                   label="Add"
//                 />
//                 <CtrlBtn
//                   onClick={() => setIsFullscreen(true)}
//                   icon={Maximize2}
//                   label="Expand"
//                 />
//                 <button type="button"
//                   onClick={() => endCall()}
//                   className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-medium transition-colors"
//                 >
//                   <PhoneOff className="size-4" />
//                   End
//                 </button>
//               </div>

//               {/* Whiteboard / annotate row (video only) */}
//               {!isVoice && (
//                 <div className="flex gap-2 mt-2">
//                   <button type="button"
//                     onClick={() => setShowWhiteboard(true)}
//                     className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
//                       showWhiteboard
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
//                     }`}
//                   >
//                     <PenLine className="size-3.5 " /> Whiteboard
//                   </button>
//                   {isScreenSharing && (
//                     <button type="button"
//                       onClick={() => setShowAnnotations((v) => !v)}
//                       className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
//                         showAnnotations
//                           ? 'bg-purple-600 text-white'
//                           : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
//                       }`}
//                     >
//                       <Pencil className="size-3.5 " /> Annotate
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Whiteboard floats above the card */}
//         <AnimatePresence>
//           {showWhiteboard && !isFullscreen && (
//             <Whiteboard onClose={() => setShowWhiteboard(false)} />
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </>
//   );
// }

'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import {
  PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Maximize2, Minimize2, X, Pause, GitMerge, UserPlus, PenLine, Pencil,
  Loader2,
} from 'lucide-react';
import { useCall } from 'contexts/CallContext';
import { ParticipantTile } from './ParticipantTile';
import Whiteboard from './Whiteboard';
import ScreenAnnotation from './ScreenAnnotation';
import Image from 'next/image';

// ── Team member fetching (tries multiple endpoints) ────────────────────────

// async function fetchTeamMembers(): Promise<any[]> {
//   // Try each endpoint your app uses
//   const endpoints = [
//     '/api/calls/members',
//     '/api/teams/members',
//   ];

//   for (const endpoint of endpoints) {
//     try {
//       const res = await fetch(endpoint);
//       if (!res.ok) continue;
//       const data = await res.json();

//       // Handle all possible response shapes:
//       // { members: [...] }, { data: [...] }, { data: { members: [...] } }, [...]
//       if (Array.isArray(data)) return data;
//       if (Array.isArray(data.members)) return data.members;
//       if (Array.isArray(data.data)) return data.data;
//       if (Array.isArray(data.data?.members)) return data.data.members;
//     } catch {
//       continue;
//     }
//   }

//   // Fallback: try slug-based endpoint by reading current team from URL
//   try {
//     const slug = window.location.pathname.split('/')[1];
//     if (slug) {
//       const res = await fetch(`/api/teams/${slug}/members`);
//       if (res.ok) {
//         const data = await res.json();
//         if (Array.isArray(data)) return data;
//         if (Array.isArray(data.members)) return data.members;
//         if (Array.isArray(data.data)) return data.data;
//       }
//     }
//   } catch { /* ignore */ }

//   return [];
// }

async function fetchTeamMembers(): Promise<any[]> {
  // Fire all requests at once, race to find valid data
  const endpoints = [
    '/api/calls/members',
    '/api/teams/members',
  ];

  // react-doctor-disable-next-line async-await-in-loop
  const promises = endpoints.map(async (endpoint) => {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) return null;
      const data = await res.json();

      // Extract members from any response shape
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.members)) return data.members;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.data?.members)) return data.data.members;
      return null;
    } catch {
      return null;
    }
  });

  // Wait for all to complete, take first valid result
  const results = await Promise.all(promises);
  const validResult = results.find(r => r !== null && r.length > 0);
  if (validResult) return validResult;

  // Fallback: try slug-based endpoint
  try {
    const slug = window.location.pathname.split('/')[1];
    if (slug) {
      const res = await fetch(`/api/teams/${slug}/members`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.members)) return data.members;
        if (Array.isArray(data.data)) return data.data;
      }
    }
  } catch { /* ignore */ }

  return [];
}

// Normalize a member record to { id, name, email, image }
function normalizeMember(m: any): { id: string; name: string; email: string; image?: string } {
  // Shape from /api/teams/[slug]/members: { id, role, user: { id, name, email, image } }
  if (m.user) {
    return {
      id: m.user.id,
      name: m.user.name || 'Unknown',
      email: m.user.email || '',
      image: m.user.image,
    };
  }
  // Shape from /api/calls/members: { id, name, email, image }
  return {
    id: m.id,
    name: m.name || 'Unknown',
    email: m.email || '',
    image: m.image,
  };
}

// ── Add participant modal ──────────────────────────────────────────────────

function AddParticipantModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (userId: string, name: string, image?: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<ReturnType<typeof normalizeMember>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamMembers()
      .then((raw) => setMembers(raw.map(normalizeMember)))
      .catch(() => setError('Failed to load members'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-neutral-950/97 backdrop-blur-sm rounded-3xl z-20 flex flex-col p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Add to Call</h3>
        <button type="button"
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <input
        type="text"
        aria-label="Search team members"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search team members..."
        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm placeholder-neutral-500 outline-none focus:border-blue-500 mb-3"

      />

      <div className="flex-1 overflow-y-auto gap-y-1 min-h-0">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 text-neutral-500 animate-spin" />
          </div>
        )}
        {!loading && error && (
          <p className="text-red-400 text-xs text-center py-4">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-neutral-500 text-sm text-center py-4">
            {members.length === 0 ? 'No team members found' : 'No results'}
          </p>
        )}
        {filtered.map((m) => (
          <button type="button"
            key={m.id}
            onClick={() => {
              onAdd(m.id, m.name, m.image);
              onClose();
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-800 transition-colors text-left"
          >
            <div className="size-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-700">
              {m.image ? (
                <Image
                  src={m.image}
                  alt=""
                  className="w-full h-full object-cover"
                  width={24}
                  height={24}
                />
              ) : (
                <span className="text-white text-xs font-bold">
                  {m.name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{m.name}</p>
              <p className="text-neutral-500 text-xs truncate">{m.email}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Small control button ───────────────────────────────────────────────────

function CtrlBtn({
  onClick,
  active = false,
  danger = false,
  icon: Icon,
  label,
  size = 'sm',
}: {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  icon: React.ElementType;
  label: string;
  size?: 'sm' | 'lg';
}) {
  const pad = size === 'lg' ? 'p-3.5' : 'px-2.5 py-2';
  const text = size === 'lg' ? 'text-xs' : 'text-[10px]';
  const iconSize = size === 'lg' ? 'size-5' : 'size-4';

  const bg = danger
    ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
    : active
      ? 'bg-neutral-700 text-white hover:bg-neutral-600'
      : 'bg-neutral-800/70 text-neutral-400 hover:bg-neutral-700 hover:text-white';

  return (
    <button type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 ${pad} rounded-2xl ${bg} ${text} font-medium transition-all`}
    >
      <Icon className={iconSize} />
      {label}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DraggableCallCard() {
  const {
    currentCall,
    heldCalls,
    localParticipant,
    remoteParticipants,
    isMuted,
    isVideoOn,
    isScreenSharing,
    minimizedCalls,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    endCall,
    holdCall,
    resumeCall,
    mergeCalls,
    addParticipant,
    minimizeCall,
    maximizeCall,
  } = useCall();

  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!currentCall) { setDuration(0); return; }
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [currentCall?.id]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const hasActiveCall = !!currentCall || heldCalls.length > 0;
  if (!hasActiveCall) return null;

  const isMinimized = currentCall && minimizedCalls.includes(currentCall.id);
  const isVoice = currentCall?.type === 'AUDIO';

  const allParticipants: Array<{ p: any; isLocal: boolean }> = [
    ...(localParticipant ? [{ p: localParticipant, isLocal: true }] : []),
    ...remoteParticipants.map((p) => ({ p, isLocal: false })),
  ];

  // ── Minimized bubble ───────────────────────────────────────────────────

  if (isMinimized && currentCall) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        className="fixed bottom-6 right-6 z-[8000] cursor-grab active:cursor-grabbing"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <button type="button"
          onClick={() => maximizeCall(currentCall.id)}
          className="flex items-center gap-3 bg-neutral-900/95 border border-neutral-700 rounded-2xl px-4 py-3 shadow-2xl hover:bg-neutral-800 transition-colors"
        >
          <div className="relative size-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
            {isVoice ? (
              <Mic className="size-5 text-white" />
            ) : (
              <Video className="size-5 text-white" />
            )}
            <span className="absolute -top-1 -right-1 size-3 bg-emerald-500 rounded-full border-2 border-neutral-900 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">
              {isVoice ? 'Voice Call' : 'Video Call'}
            </p>
            <p className="text-neutral-400 text-xs font-mono">{fmt(duration)}</p>
          </div>
        </button>
      </motion.div>
    );
  }

  // ── Fullscreen ─────────────────────────────────────────────────────────

  if (isFullscreen && currentCall) {
    return (
      <div className="fixed inset-0 z-[8000] bg-neutral-950 flex flex-col select-none">
        <AnimatePresence>
          {showWhiteboard && (
            <Whiteboard onClose={() => setShowWhiteboard(false)} />
          )}
        </AnimatePresence>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-1.5">
              <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-white font-mono text-sm">{fmt(duration)}</span>
            </div>
            <span className="bg-black/50 backdrop-blur-md text-neutral-300 text-xs rounded-full px-3 py-1.5">
              {allParticipants.length} participant
              {allParticipants.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-2 bg-black/50 backdrop-blur-md text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <Minimize2 className="size-5" />
            </button>
            <button type="button"
              onClick={() => currentCall && minimizeCall(currentCall.id)}
              className="p-2 bg-black/50 backdrop-blur-md text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="flex-1 p-4 pt-16 pb-28 relative overflow-hidden">
          {showAnnotations && isScreenSharing && (
            <ScreenAnnotation onClose={() => setShowAnnotations(false)} />
          )}

          {allParticipants.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-neutral-500 text-sm animate-pulse">Connecting…</p>
            </div>
          ) : allParticipants.length === 1 ? (
            <div className="h-full max-w-3xl mx-auto">
              <ParticipantTile
                participant={allParticipants[0].p}
                isLocal={allParticipants[0].isLocal}
                showVideo={!isVoice}
              />
            </div>
          ) : (
            <div
              className={`h-full grid gap-3 ${allParticipants.length <= 2
                ? 'grid-cols-2'
                : allParticipants.length <= 4
                  ? 'grid-cols-2'
                  : allParticipants.length <= 6
                    ? 'grid-cols-3'
                    : 'grid-cols-4'
                }`}
            >
              {allParticipants.map(({ p, isLocal }) => (
                <ParticipantTile
                  key={p.identity}
                  participant={p}
                  isLocal={isLocal}
                  showVideo={!isVoice}
                  isPinned={pinnedId === p.identity}
                  onPin={() =>
                    setPinnedId(pinnedId === p.identity ? null : p.identity)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 pb-6 pt-10">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <CtrlBtn onClick={toggleMute} active={!isMuted} danger={isMuted} icon={isMuted ? MicOff : Mic} label={isMuted ? 'Unmute' : 'Mute'} size="lg" />
            {!isVoice && <CtrlBtn onClick={toggleVideo} active={isVideoOn} danger={!isVideoOn} icon={isVideoOn ? Video : VideoOff} label="Camera" size="lg" />}
            {!isVoice && <CtrlBtn onClick={isScreenSharing ? stopScreenShare : startScreenShare} active={isScreenSharing} icon={isScreenSharing ? MonitorOff : Monitor} label="Screen" size="lg" />}
            {!isVoice && <CtrlBtn onClick={() => setShowWhiteboard((v) => !v)} active={showWhiteboard} icon={PenLine} label="Board" size="lg" />}
            {isScreenSharing && !isVoice && <CtrlBtn onClick={() => setShowAnnotations((v) => !v)} active={showAnnotations} icon={Pencil} label="Annotate" size="lg" />}
            <CtrlBtn onClick={() => setShowAddParticipant(true)} icon={UserPlus} label="Add" size="lg" />
            <CtrlBtn onClick={() => holdCall(currentCall.id)} icon={Pause} label="Hold" size="lg" />
            {heldCalls.length > 0 && <CtrlBtn onClick={mergeCalls} icon={GitMerge} label="Merge" size="lg" />}
            <button type="button"
              onClick={() => endCall()}
              className="flex flex-col items-center gap-1 px-7 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all hover:scale-105 shadow-lg shadow-red-600/30"
            >
              <PhoneOff className="size-5" />
              End
            </button>
          </div>

          {heldCalls.length > 0 && (
            <div className="mt-3 flex justify-center">
              <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1.5 flex items-center gap-2">
                <Pause className="size-3.5  text-yellow-400" />
                <span className="text-yellow-400 text-sm">{heldCalls.length} on hold</span>
                <button type="button" onClick={() => resumeCall(heldCalls[0].id)} className="text-yellow-300 text-sm font-semibold hover:text-yellow-200 ml-1">
                  Resume →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add participant panel */}
        <AnimatePresence>
          {showAddParticipant && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-sm h-96 relative overflow-hidden">
                <AddParticipantModal
                  onClose={() => setShowAddParticipant(false)}
                  onAdd={addParticipant}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Draggable card ─────────────────────────────────────────────────────

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 z-[7999] pointer-events-none" />

      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragConstraints={constraintsRef}
        initial={{
          x: typeof window !== 'undefined' ? window.innerWidth - 420 : 800,
          y: 80,
        }}
        className="fixed z-[8000] pointer-events-auto"
        style={{ width: 380, touchAction: 'none' }}
      >
        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(10,10,15,0.98) 0%, rgba(15,15,25,0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* ── Drag header ── */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing bg-neutral-900/60 select-none"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-1.5 ml-1">
                <span className="size-1.5  rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-neutral-300 text-xs font-mono">{fmt(duration)}</span>
              </div>
              <span className="text-neutral-600 text-xs">
                {isVoice ? '🎙' : '🎥'} {allParticipants.length}p
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => currentCall && minimizeCall(currentCall.id)} className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors" title="Minimize">
                <Minimize2 className="size-3.5 " />
              </button>
              <button type="button" onClick={() => setIsFullscreen(true)} className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors" title="Expand">
                <Maximize2 className="size-3.5 " />
              </button>
              <button type="button" onClick={() => endCall()} className="p-1 text-neutral-500 hover:text-red-400 transition-colors" title="End call">
                <X className="size-3.5 " />
              </button>
            </div>
          </div>

          {/* ── Media area ── */}
          {currentCall && (
            <div className="relative bg-neutral-950" style={{ height: isVoice ? 148 : 212 }}>
              <AnimatePresence>
                {showAddParticipant && (
                  <AddParticipantModal
                    onClose={() => setShowAddParticipant(false)}
                    onAdd={addParticipant}
                  />
                )}
              </AnimatePresence>

              {isVoice ? (
                <div className="w-full h-full flex items-center justify-center gap-4 px-4">
                  {allParticipants.slice(0, 4).map(({ p, isLocal }) => {
                    let n = 'Unknown';
                    try {
                      const m = p.metadata ? JSON.parse(p.metadata) : {};
                      n = m.name || p.name || 'Unknown';
                    } catch { }
                    const initials = n.split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <div key={p.identity} className="flex flex-col items-center gap-1.5">
                        <motion.div
                          animate={{ boxShadow: ['0 0 0 0 rgba(52,211,153,0)', '0 0 0 8px rgba(52,211,153,0.15)', '0 0 0 0 rgba(52,211,153,0)'] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className=" size-14  rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border-2 border-neutral-700"
                        >
                          <span className="text-white font-bold">{initials}</span>
                        </motion.div>
                        <span className="text-neutral-400 text-xs">{isLocal ? 'You' : n}</span>
                      </div>
                    );
                  })}
                  {allParticipants.length > 4 && (
                    <div className=" size-14  rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
                      <span className="text-neutral-400 text-xs font-bold">+{allParticipants.length - 4}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`h-full p-2 grid gap-1 ${allParticipants.length <= 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {allParticipants.slice(0, 4).map(({ p, isLocal }) => (
                    <ParticipantTile key={p.identity} participant={p} isLocal={isLocal} compact showVideo />
                  ))}
                  {allParticipants.length > 4 && (
                    <div className="rounded-xl bg-neutral-800 flex items-center justify-center">
                      <span className="text-neutral-400 text-sm font-bold">+{allParticipants.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Held strip ── */}
          {heldCalls.length > 0 && (
            <div className="px-3 py-2 border-t border-neutral-800 flex items-center gap-2">
              <Pause className="size-3.5  text-yellow-500 flex-shrink-0" />
              <span className="text-yellow-500 text-xs">On hold</span>
              <div className="flex gap-1.5 ml-auto flex-wrap">
                {heldCalls.map((hc) => (
                  <button type="button" key={hc.id} onClick={() => resumeCall(hc.id)} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-full transition-colors">
                    Resume
                  </button>
                ))}
                {currentCall && (
                  <button type="button" onClick={mergeCalls} className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1">
                    <GitMerge className="size-3" /> Merge
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Controls ── */}
          {currentCall && (
            <div className="  p-3  border-t border-neutral-800/60">
              <div className="flex items-center justify-between gap-1">
                <CtrlBtn onClick={toggleMute} active={!isMuted} danger={isMuted} icon={isMuted ? MicOff : Mic} label={isMuted ? 'Unmute' : 'Mute'} />
                {!isVoice && <CtrlBtn onClick={toggleVideo} active={isVideoOn} danger={!isVideoOn} icon={isVideoOn ? Video : VideoOff} label="Video" />}
                {!isVoice && <CtrlBtn onClick={isScreenSharing ? stopScreenShare : startScreenShare} active={isScreenSharing} icon={isScreenSharing ? MonitorOff : Monitor} label="Screen" />}
                <CtrlBtn onClick={() => holdCall(currentCall.id)} icon={Pause} label="Hold" />
                <CtrlBtn onClick={() => setShowAddParticipant(true)} icon={UserPlus} label="Add" />
                <CtrlBtn onClick={() => setIsFullscreen(true)} icon={Maximize2} label="Expand" />
                <button type="button"
                  onClick={() => endCall()}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-medium transition-colors"
                >
                  <PhoneOff className="size-4" />
                  End
                </button>
              </div>

              {!isVoice && (
                <div className="flex gap-2 mt-2">
                  <button type="button"
                    onClick={() => setShowWhiteboard(true)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${showWhiteboard ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
                  >
                    <PenLine className="size-3.5 " /> Whiteboard
                  </button>
                  {isScreenSharing && (
                    <button type="button"
                      onClick={() => setShowAnnotations((v) => !v)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${showAnnotations ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
                    >
                      <Pencil className="size-3.5 " /> Annotate
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showWhiteboard && !isFullscreen && (
            <Whiteboard onClose={() => setShowWhiteboard(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
