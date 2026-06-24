// 'use client';
// import React, { useEffect, useRef, useState } from 'react';
// import { Participant, Track } from 'livekit-client';
// import { MicOff, VideoOff, Crown, Pin, Volume2, MoreVertical, VolumeX, UserX } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface Props {
//   participant: Participant;
//   isLocal: boolean;
//   isHost: boolean;
//   isSpeaking?: boolean;
//   compact?: boolean;
//   isPinned?: boolean;
//   onKick?: () => void;
//   onMute?: () => void;
//   onSpotlight?: () => void;
// }

// function getTrackPubs(participant: Participant): any[] {
//   try {
//     if ((participant as any).trackPublications instanceof Map)
//       return Array.from((participant as any).trackPublications.values());
//     const pubs: any[] = [];
//     const v = (participant as any).videoTracks;
//     const a = (participant as any).audioTracks;
//     if (v instanceof Map) pubs.push(...Array.from(v.values()));
//     if (a instanceof Map) pubs.push(...Array.from(a.values()));
//     return pubs;
//   } catch { return []; }
// }

// export default function MeetingParticipantTile({
//   participant, isLocal, isHost, isSpeaking, compact, isPinned, onKick, onMute, onSpotlight,
// }: Props) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [hasVideo, setHasVideo] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [name, setName] = useState('Guest');
//   const [image, setImage] = useState('');

//   useEffect(() => {
//     try {
//       const meta = participant.metadata ? JSON.parse(participant.metadata) : {};
//       setName(meta.name || participant.name || participant.identity || 'Guest');
//       setImage(meta.image || '');
//     } catch { setName(participant.name || 'Guest'); }

//     const sync = () => {
//       const pubs = getTrackPubs(participant);
//       const cam = pubs.find((p: any) => p.source === Track.Source.Camera);
//       const cameraOn = !!(cam?.track && !cam.isMuted);
//       setHasVideo(cameraOn);
//       if (cameraOn && videoRef.current) { try { (cam.track as any).attach(videoRef.current); } catch {} }
//       const mic = pubs.find((p: any) => p.source === Track.Source.Microphone);
//       setIsMuted(!mic?.track || mic.isMuted);
//       if (!isLocal && mic?.track && audioRef.current) { try { (mic.track as any).attach(audioRef.current); } catch {} }
//     };

//     sync();
//     ['trackPublished','trackUnpublished','trackMuted','trackUnmuted','trackSubscribed','trackUnsubscribed']
//       .forEach(e => participant.on(e, sync));
//     return () => {
//       ['trackPublished','trackUnpublished','trackMuted','trackUnmuted','trackSubscribed','trackUnsubscribed']
//         .forEach(e => participant.off(e, sync));
//     };
//   }, [participant, isLocal]);

//   const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

//   return (
//     <div
//       className={`relative rounded-2xl overflow-hidden bg-neutral-900 group h-full ${isSpeaking ? 'ring-2 ring-emerald-500' : ''} ${isPinned ? 'ring-2 ring-blue-500' : ''}`}
//       style={{ minHeight: compact ? 80 : 120 }}
//     >
//       <video ref={videoRef} autoPlay playsInline muted={isLocal}
//         className="absolute inset-0 w-full h-full object-cover"
//         style={{ display: hasVideo ? 'block' : 'none', transform: isLocal ? 'scaleX(-1)' : 'none' }} />

//       {!hasVideo && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950">
//           {image
//             ? <img src={image} alt="" className={`rounded-full object-cover border-2 border-neutral-700 ${compact ? 'size-10' : ' size-20'}`} />
//             : <div className={`rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border-2 border-neutral-700 ${compact ? 'size-10' : ' size-20'}`}>
//                 <span className={`text-white font-bold ${compact ? 'text-sm' : 'text-2xl'}`}>{initials}</span>
//               </div>
//           }
//           {isSpeaking && !compact && (
//             <div className="mt-3 flex items-end gap-0.5">
//               {[0,1,2,3].map(i => (
//                 <motion.div key={i} animate={{ scaleY: [0.3,1,0.3] }} transition={{ repeat: Infinity, duration: 0.7, delay: i*0.1 }}
//                   className="w-1 h-5 bg-emerald-500 rounded-full origin-bottom" />
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Host context menu */}
//       {isHost && !isLocal && (onKick || onMute || onSpotlight) && (
//         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
//           <button onClick={() => setShowMenu(v => !v)}
//             className="p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80">
//             <MoreVertical className="w-3.5 h-3.5" />
//           </button>
//           <AnimatePresence>
//             {showMenu && (
//               <motion.div initial={{ opacity:0, scale:0.9, y:-4 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:-4 }}
//                 className="absolute top-8 right-0 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl w-36">
//                 {onMute && <button onClick={() => { onMute(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800"><VolumeX className="w-3.5 h-3.5" /> Mute</button>}
//                 {onSpotlight && <button onClick={() => { onSpotlight(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800"><Pin className="w-3.5 h-3.5" /> Spotlight</button>}
//                 {onKick && <button onClick={() => { onKick(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-600/10 border-t border-neutral-800"><UserX className="w-3.5 h-3.5" /> Remove</button>}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {(!isHost || isLocal) && onSpotlight && (
//         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
//           <button onClick={onSpotlight} className="p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80"><Pin className="w-3.5 h-3.5" /></button>
//         </div>
//       )}

//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center justify-between">
//         <div className="flex items-center gap-1.5">
//           {isSpeaking && <Volume2 className="size-3 text-emerald-400 flex-shrink-0" />}
//           {isLocal && <Crown className="size-3 text-yellow-400 flex-shrink-0" />}
//           <span className="text-white text-xs font-medium truncate">{isLocal ? 'You' : name}</span>
//         </div>
//         <div className="flex items-center gap-1">
//           {isMuted && <div className="size-5 rounded-full bg-red-600/90 flex items-center justify-center"><MicOff className="w-2.5 h-2.5 text-white" /></div>}
//           {!hasVideo && <div className="size-5 rounded-full bg-neutral-700/90 flex items-center justify-center"><VideoOff className="w-2.5 h-2.5 text-white" /></div>}
//         </div>
//       </div>

//       {!isLocal && <audio ref={audioRef} autoPlay playsInline className="hidden" />}
//     </div>
//   );
// }
// 'use client';
// import React, { useEffect, useRef, useState } from 'react';
// import { Participant, Track } from 'livekit-client';
// import { MicOff, VideoOff, Crown, Pin, Volume2, MoreVertical, VolumeX, UserX } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface Props {
//   participant: Participant;
//   isLocal: boolean;
//   isHost: boolean;
//   isSpeaking?: boolean;
//   compact?: boolean;
//   isPinned?: boolean;
//   onKick?: () => void;
//   onMute?: () => void;
//   onSpotlight?: () => void;
// }

// function getTrackPubs(participant: Participant): any[] {
//   try {
//     if ((participant as any).trackPublications instanceof Map)
//       return Array.from((participant as any).trackPublications.values());
//     const pubs: any[] = [];
//     const v = (participant as any).videoTracks;
//     const a = (participant as any).audioTracks;
//     if (v instanceof Map) pubs.push(...Array.from(v.values()));
//     if (a instanceof Map) pubs.push(...Array.from(a.values()));
//     return pubs;
//   } catch { return []; }
// }

// export default function MeetingParticipantTile({
//   participant, isLocal, isHost, isSpeaking, compact, isPinned, onKick, onMute, onSpotlight,
// }: Props) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [hasVideo, setHasVideo] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [name, setName] = useState('Guest');
//   const [image, setImage] = useState('');

//   useEffect(() => {
//     try {
//       const meta = participant.metadata ? JSON.parse(participant.metadata) : {};
//       setName(meta.name || participant.name || participant.identity || 'Guest');
//       setImage(meta.image || '');
//     } catch { setName(participant.name || 'Guest'); }

//     const sync = () => {
//       const pubs = getTrackPubs(participant);
//       const cam = pubs.find((p: any) => p.source === Track.Source.Camera);
//       const cameraOn = !!(cam?.track && !cam.isMuted);
//       setHasVideo(cameraOn);
//       if (cameraOn && videoRef.current) { try { (cam.track as any).attach(videoRef.current); } catch {} }
//       const mic = pubs.find((p: any) => p.source === Track.Source.Microphone);
//       setIsMuted(!mic?.track || mic.isMuted);
//       if (!isLocal && mic?.track && audioRef.current) { try { (mic.track as any).attach(audioRef.current); } catch {} }
//     };

//     sync();
//     ['trackPublished','trackUnpublished','trackMuted','trackUnmuted','trackSubscribed','trackUnsubscribed']
//       .forEach(e => participant.on(e, sync));
//     return () => {
//       ['trackPublished','trackUnpublished','trackMuted','trackUnmuted','trackSubscribed','trackUnsubscribed']
//         .forEach(e => participant.off(e, sync));
//     };
//   }, [participant, isLocal]);

//   const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

//   return (
//     <div
//       className={`relative rounded-2xl overflow-hidden bg-neutral-900 group h-full ${isSpeaking ? 'ring-2 ring-emerald-500' : ''} ${isPinned ? 'ring-2 ring-blue-500' : ''}`}
//       style={{ minHeight: compact ? 80 : 120 }}
//     >
//       <video ref={videoRef} autoPlay playsInline muted={isLocal}
//         className="absolute inset-0 w-full h-full object-cover"
//         style={{ display: hasVideo ? 'block' : 'none', transform: isLocal ? 'scaleX(-1)' : 'none' }} />

//       {!hasVideo && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950">
//           {image
//             ? <img src={image} alt="" className={`rounded-full object-cover border-2 border-neutral-700 ${compact ? 'size-10' : ' size-20'}`} />
//             : <div className={`rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border-2 border-neutral-700 ${compact ? 'size-10' : ' size-20'}`}>
//                 <span className={`text-white font-bold ${compact ? 'text-sm' : 'text-2xl'}`}>{initials}</span>
//               </div>
//           }
//           {isSpeaking && !compact && (
//             <div className="mt-3 flex items-end gap-0.5">
//               {[0,1,2,3].map(i => (
//                 <motion.div key={i} animate={{ scaleY: [0.3,1,0.3] }} transition={{ repeat: Infinity, duration: 0.7, delay: i*0.1 }}
//                   className="w-1 h-5 bg-emerald-500 rounded-full origin-bottom" />
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Host context menu */}
//       {isHost && !isLocal && (onKick || onMute || onSpotlight) && (
//         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
//           <button onClick={() => setShowMenu(v => !v)}
//             className="p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80">
//             <MoreVertical className="w-3.5 h-3.5" />
//           </button>
//           <AnimatePresence>
//             {showMenu && (
//               <motion.div initial={{ opacity:0, scale:0.9, y:-4 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:-4 }}
//                 className="absolute top-8 right-0 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl w-36">
//                 {onMute && <button onClick={() => { onMute(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800"><VolumeX className="w-3.5 h-3.5" /> Mute</button>}
//                 {onSpotlight && <button onClick={() => { onSpotlight(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800"><Pin className="w-3.5 h-3.5" /> Spotlight</button>}
//                 {onKick && <button onClick={() => { onKick(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-600/10 border-t border-neutral-800"><UserX className="w-3.5 h-3.5" /> Remove</button>}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {(!isHost || isLocal) && onSpotlight && (
//         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
//           <button onClick={onSpotlight} className="p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80"><Pin className="w-3.5 h-3.5" /></button>
//         </div>
//       )}

//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center justify-between">
//         <div className="flex items-center gap-1.5">
//           {isSpeaking && <Volume2 className="size-3 text-emerald-400 flex-shrink-0" />}
//           {isLocal && <Crown className="size-3 text-yellow-400 flex-shrink-0" />}
//           <span className="text-white text-xs font-medium truncate">{isLocal ? 'You' : name}</span>
//         </div>
//         <div className="flex items-center gap-1">
//           {isMuted && <div className="size-5 rounded-full bg-red-600/90 flex items-center justify-center"><MicOff className="w-2.5 h-2.5 text-white" /></div>}
//           {!hasVideo && <div className="size-5 rounded-full bg-neutral-700/90 flex items-center justify-center"><VideoOff className="w-2.5 h-2.5 text-white" /></div>}
//         </div>
//       </div>

//       {!isLocal && <audio ref={audioRef} autoPlay playsInline className="hidden" />}
//     </div>
//   );
// }

'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Participant, Track } from 'livekit-client';
import { MicOff, VideoOff, Crown, Pin, Volume2, MoreVertical, VolumeX, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  participant: Participant;
  isLocal: boolean;
  isHost: boolean;
  isSpeaking?: boolean;
  isHandRaised?: boolean;
  compact?: boolean;
  isPinned?: boolean;
  onKick?: () => void;
  onMute?: () => void;
  onSpotlight?: () => void;
}

function getTrackPubs(participant: Participant): any[] {
  try {
    if ((participant as any).trackPublications instanceof Map)
      return Array.from((participant as any).trackPublications.values());
    const pubs: any[] = [];
    const v = (participant as any).videoTracks;
    const a = (participant as any).audioTracks;
    if (v instanceof Map) pubs.push(...Array.from(v.values()));
    if (a instanceof Map) pubs.push(...Array.from(a.values()));
    return pubs;
  } catch { return []; }
}

export default function MeetingParticipantTile({
  participant, isLocal, isHost, isSpeaking, isHandRaised = false,
  compact, isPinned, onKick, onMute, onSpotlight,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [name, setName] = useState('Guest');
  const [image, setImage] = useState('');

  useEffect(() => {
    try {
      const meta = participant.metadata ? JSON.parse(participant.metadata) : {};
      setName(meta.name || participant.name || participant.identity || 'Guest');
      setImage(meta.image || '');
    } catch { setName(participant.name || 'Guest'); }

    const sync = () => {
      const pubs = getTrackPubs(participant);
      const cam = pubs.find((p: any) => p.source === Track.Source.Camera);
      const cameraOn = !!(cam?.track && !cam.isMuted);
      setHasVideo(cameraOn);
      if (cameraOn && videoRef.current) { try { (cam.track as any).attach(videoRef.current); } catch { } }
      const mic = pubs.find((p: any) => p.source === Track.Source.Microphone);
      setIsMuted(!mic?.track || mic.isMuted);
      if (!isLocal && mic?.track && audioRef.current) { try { (mic.track as any).attach(audioRef.current); } catch { } }
    };

    sync();
    const events = ['trackPublished', 'trackUnpublished', 'trackMuted', 'trackUnmuted', 'trackSubscribed', 'trackUnsubscribed'];
    events.forEach(e => participant.on(e, sync));
    return () => events.forEach(e => participant.off(e, sync));
  }, [participant, isLocal]);

  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-neutral-900 group h-full ${isSpeaking ? 'ring-2 ring-emerald-500' : ''} ${isPinned ? 'ring-2 ring-blue-500' : ''}`}
      style={{ minHeight: compact ? 80 : 120 }}
    >
      {/* Video */}
      <video aria-label="participant-video" ref={videoRef} autoPlay playsInline muted={isLocal}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: hasVideo ? 'block' : 'none', transform: isLocal ? 'scaleX(-1)' : 'none' }} />

      {/* Avatar fallback */}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950">
          {image
            ? <img src={image} alt="" className={`rounded-full object-cover border-2 border-neutral-700 ${compact ? 'size-10' : ' size-20'}`} />
            : <div className={`rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border-2 border-neutral-700 ${compact ? 'size-10' : ' size-20'}`}>
              <span className={`text-white font-bold ${compact ? 'text-sm' : 'text-2xl'}`}>{initials}</span>
            </div>
          }
          {isSpeaking && !compact && (
            <div className="mt-3 flex items-end gap-0.5">
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.1 }}
                  className="w-1 h-5 bg-emerald-500 rounded-full origin-bottom" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Hand raised badge — top-left ── */}
      <AnimatePresence>
        {isHandRaised && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="absolute top-2 left-2 z-10"
          >
            <motion.div
              animate={{ rotate: [0, 15, -5, 15, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-500/30"
            >
              <span className="text-base leading-none">✋</span>
              {!compact && <span className="font-semibold text-[10px]">Hand raised</span>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Host context menu */}
      {isHost && !isLocal && (onKick || onMute || onSpotlight) && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button type="button" onClick={() => setShowMenu(v => !v)}
            className="p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className="absolute top-8 right-0 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl w-36 z-20">
                {onMute && <button type="button" onClick={() => { onMute(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800"><VolumeX className="w-3.5 h-3.5" /> Mute</button>}
                {onSpotlight && <button type="button" onClick={() => { onSpotlight(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800"><Pin className="w-3.5 h-3.5" /> Spotlight</button>}
                {onKick && <button type="button" onClick={() => { onKick(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-600/10 border-t border-neutral-800"><UserX className="w-3.5 h-3.5" /> Remove</button>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Spotlight pin (non-host) */}
      {(!isHost || isLocal) && onSpotlight && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button type="button" onClick={onSpotlight} className="p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80"><Pin className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isSpeaking && <Volume2 className="size-3 text-emerald-400 flex-shrink-0" />}
          {isLocal && <Crown className="size-3 text-yellow-400 flex-shrink-0" />}
          <span className="text-white text-xs font-medium truncate">{isLocal ? 'You' : name}</span>
        </div>
        <div className="flex items-center gap-1">
          {isMuted && <div className="size-5 rounded-full bg-red-600/90 flex items-center justify-center"><MicOff className="w-2.5 h-2.5 text-white" /></div>}
          {!hasVideo && <div className="size-5 rounded-full bg-neutral-700/90 flex items-center justify-center"><VideoOff className="w-2.5 h-2.5 text-white" /></div>}
        </div>
      </div>

      {!isLocal && <audio aria-label="participant-audio" ref={audioRef} autoPlay className="hidden" />}
    </div>
  );
}
