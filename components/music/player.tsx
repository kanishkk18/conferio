// import { useEffect, useRef, useState, useCallback } from "react";
// import { useSession } from "next-auth/react";
// import {
//   Loader2,
//   Pause,
//   Play,
//   Repeat,
//   Repeat1,
//   Shuffle,
//   SkipBack,
//   SkipForward,
//   Volume,
//   Volume1,
//   Volume2,
//   VolumeX,
//   ListMusic,
// } from "lucide-react";
// import { useGlobalAudioPlayer } from "react-use-audio-player";

// import { getDownloadLink, getImageSrc } from "@/lib/music/jiosaavn";
// import {
//   useCurrentSongIndex,
//   useIsPlayerInit,
//   useQueue,
//   useStreamQuality,
// } from "hooks/use-music-store";
// import { Button } from "@/components/ui/button";
// import { Slider, SliderRange, SliderThumb, SliderTrack } from "./ui/slider";
// import { SongMoreMenu } from "./song-more-menu";
// import { Queue } from "./queue";

// function formatDuration(seconds: number) {
//   if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
//   const m = Math.floor(seconds / 60);
//   const s = Math.floor(seconds % 60);
//   return `${m}:${s.toString().padStart(2, "0")}`;
// }

// export function Player() {
//   const { data: session } = useSession();
//   const [queue] = useQueue();
//   const [streamQuality] = useStreamQuality();
//   const [currentIndex, setCurrentIndex] = useCurrentSongIndex();
//   const [isPlayerInit, setIsPlayerInit] = useIsPlayerInit();

//   const [isShuffle, setIsShuffle] = useState(false);
//   const [loopMode, setLoopMode] = useState<"off" | "all" | "one">("off");
//   const [pos, setPos] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [queueOpen, setQueueOpen] = useState(false);

//   const frameRef = useRef<number>(0);
//   const recordedRef = useRef<string | null>(null);

//   const {
//     load,
//     playing,
//     togglePlayPause,
//     getPosition,
//     isLoading,
//     duration,
//     mute,
//     muted,
//     volume,
//     setVolume,
//     seek,
//     isReady,
//   } = useGlobalAudioPlayer();

//   const currentSong = queue[currentIndex];

//   // ─── CRITICAL FIX: handleNext defined BEFORE useEffect with stable reference ─
//   const handleNext = useCallback(() => {
//     if (!queue.length) return;

//     if (loopMode === "one") {
//       seek(0);
//       return;
//     }

//     let nextIndex: number;
//     if (isShuffle) {
//       nextIndex = Math.floor(Math.random() * queue.length);
//     } else {
//       nextIndex = currentIndex + 1;
//     }

//     if (nextIndex >= queue.length) {
//       if (loopMode === "all") nextIndex = 0;
//       else return;
//     }
//     setCurrentIndex(nextIndex);
//   }, [queue.length, loopMode, isShuffle, currentIndex, seek, setCurrentIndex]);

//   // ─── CRITICAL FIX: Properly extract downloadUrl from API response ───────────
//   useEffect(() => {
//     if (!queue.length || !isPlayerInit || !currentSong) return;

//     // The API returns downloadUrl (camelCase, array), NOT download_url
//     const downloadUrlArray = currentSong.downloadUrl || currentSong.download_url;

//     if (!downloadUrlArray) {
//       console.error("No downloadUrl found for song:", currentSong.id, currentSong.name);
//       return;
//     }

//     const src = getDownloadLink(downloadUrlArray, streamQuality);

//     if (!src) {
//       console.error("getDownloadLink returned null for:", currentSong.id);
//       return;
//     }

//     console.log("Loading audio:", src.substring(0, 80) + "...");

//     load(src, {
//       html5: true,
//       autoplay: true,
//       initialMute: false,
//       onend: handleNext,
//     });

//     recordedRef.current = null;
//   }, [currentIndex, queue.length, isPlayerInit, streamQuality, currentSong, load, handleNext]);

//   // ─── CRITICAL FIX: Removed getPosition from deps (causes infinite re-renders) ─
//   useEffect(() => {
//     const animate = () => {
//       if (!isDragging) setPos(getPosition());
//       frameRef.current = requestAnimationFrame(animate);
//     };
//     frameRef.current = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(frameRef.current);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isDragging]);

//   // ─── Record recently played ─────────────────────────────────────────────────
//   useEffect(() => {
//     if (
//       session?.user &&
//       currentSong &&
//       pos > 10 &&
//       recordedRef.current !== currentSong.id
//     ) {
//       recordedRef.current = currentSong.id;
//       fetch("/api/music/recently-played", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           itemId: currentSong.id,
//           title: currentSong.name,
//           subtitle: currentSong.subtitle,
//           image: getImageSrc(currentSong.image, "medium"),
//           duration: currentSong.duration,
//         }),
//       }).catch(() => {});
//     }
//   }, [pos, currentSong, session]);

//   function handlePrev() {
//     if (!queue.length) return;
//     if (pos > 3) {
//       seek(0);
//       return;
//     }
//     let prevIndex = currentIndex - 1;
//     if (prevIndex < 0) {
//       prevIndex = loopMode === "all" ? queue.length - 1 : 0;
//     }
//     setCurrentIndex(prevIndex);
//   }

//   function cycleLoop() {
//     setLoopMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
//   }

//   // ─── CRITICAL FIX: Initialize player on first play click ────────────────────
//   function handlePlayPause() {
//     if (!isPlayerInit) {
//       setIsPlayerInit(true);
//     } else {
//       togglePlayPause();
//     }
//   }

//   const VolumeIcon = muted || volume === 0 
//     ? VolumeX 
//     : volume < 0.3 
//       ? Volume 
//       : volume < 0.7 
//         ? Volume1 
//         : Volume2;

//   if (!currentSong) return null;

//   return (
//     <>
//       <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//         <div className="flex items-center gap-4 px-4 py-2">
//           {/* Song info */}
//           <div className="flex items-center gap-3 min-w-0 w-1/4">
//             <img
//               src={getImageSrc(currentSong.image, "low")}
//               alt={currentSong.name}
//               className="h-12 w-12 rounded-md object-cover flex-shrink-0"
//             />
//             <div className="min-w-0">
//               <p className="truncate text-sm font-medium">{currentSong.name}</p>
//               <p className="truncate text-xs text-muted-foreground">{currentSong.subtitle}</p>
//             </div>
//             <SongMoreMenu song={currentSong} />
//           </div>

//           {/* Controls */}
//           <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl mx-auto">
//             <div className="flex items-center gap-2">
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={() => setIsShuffle((s) => !s)}
//                 className={isShuffle ? "text-primary" : "text-muted-foreground"}
//               >
//                 <Shuffle className="h-4 w-4" />
//               </Button>
//               <Button size="icon" variant="ghost" onClick={handlePrev}>
//                 <SkipBack className="h-4 w-4" />
//               </Button>
//               <Button 
//                 size="icon" 
//                 onClick={handlePlayPause}
//                 disabled={!isReady && isPlayerInit}
//               >
//                 {isLoading ? (
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                 ) : playing ? (
//                   <Pause className="h-5 w-5" />
//                 ) : (
//                   <Play className="h-5 w-5" />
//                 )}
//               </Button>
//               <Button size="icon" variant="ghost" onClick={handleNext}>
//                 <SkipForward className="h-4 w-4" />
//               </Button>
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={cycleLoop}
//                 className={loopMode !== "off" ? "text-primary" : "text-muted-foreground"}
//               >
//                 {loopMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
//               </Button>
//             </div>

//             <div className="flex items-center gap-2 w-full">
//               <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
//                 {formatDuration(pos)}
//               </span>
//               <Slider
//                 value={[pos]}
//                 max={duration || currentSong.duration || 0}
//                 step={1}
//                 onValueChange={([v]) => {
//                   setIsDragging(true);
//                   setPos(v);
//                 }}
//                 onValueCommit={([v]) => {
//                   seek(v);
//                   setIsDragging(false);
//                 }}
//                 className="flex-1"
//               >
//                 <SliderTrack>
//                   <SliderRange />
//                 </SliderTrack>
//                 <SliderThumb />
//               </Slider>
//               <span className="text-xs text-muted-foreground tabular-nums w-10">
//                 {formatDuration(duration || currentSong.duration || 0)}
//               </span>
//             </div>
//           </div>

//           {/* Volume + queue */}
//           <div className="flex items-center gap-2 w-1/4 justify-end">
//             <Button size="icon" variant="ghost" onClick={() => setQueueOpen((o) => !o)}>
//               <ListMusic className="h-4 w-4" />
//             </Button>
//             <Button size="icon" variant="ghost" onClick={mute}>
//               <VolumeIcon className="h-4 w-4" />
//             </Button>
//             <Slider
//               value={[muted ? 0 : volume]}
//               max={1}
//               step={0.01}
//               onValueChange={([v]) => setVolume(v)}
//               className="w-24"
//             >
//               <SliderTrack>
//                 <SliderRange />
//               </SliderTrack>
//               <SliderThumb />
//             </Slider>
//           </div>
//         </div>
//       </div>

//       {queueOpen && <Queue onClose={() => setQueueOpen(false)} />}
//     </>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// // import { useSession } from "next-auth/react";
// // import {
// //   Loader2,
// //   Pause,
// //   Play,
// //   Repeat,
// //   Repeat1,
// //   Shuffle,
// //   SkipBack,
// //   SkipForward,
// //   Volume,
// //   Volume1,
// //   Volume2,
// //   VolumeX,
// //   ListMusic,
// // } from "lucide-react";
// // import { useAudioPlayer } from "react-use-audio-player";

// // import { getDownloadLink, getImageSrc } from "@/lib/music/jiosaavn";
// // import {
// //   useCurrentSongIndex,
// //   useIsPlayerInit,
// //   useQueue,
// //   useStreamQuality,
// // } from "hooks/use-music-store";
// // import { Button } from "@/components/ui/button";
// // import { Slider, SliderRange, SliderThumb, SliderTrack } from "./ui/slider";
// // import { SongMoreMenu } from "./song-more-menu";
// // import { Queue } from "./queue";

// // function formatDuration(seconds: number) {
// //   if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
// //   const m = Math.floor(seconds / 60);
// //   const s = Math.floor(seconds % 60);
// //   return `${m}:${s.toString().padStart(2, "0")}`;
// // }

// // export function Player() {
// //   const { data: session } = useSession();
// //   const [queue] = useQueue();
// //   const [streamQuality] = useStreamQuality();
// //   const [currentIndex, setCurrentIndex] = useCurrentSongIndex();
// //   const [isPlayerInit] = useIsPlayerInit();

// //   const [isShuffle, setIsShuffle] = useState(false);
// //   const [loopMode, setLoopMode] = useState<"off" | "all" | "one">("off");
// //   const [pos, setPos] = useState(0);
// //   const [isDragging, setIsDragging] = useState(false);
// //   const [queueOpen, setQueueOpen] = useState(false);

// //   const frameRef = useRef<number>(0);
// //   const recordedRef = useRef<string | null>(null);

// //   const {
// //     load,
// //     playing,
// //     togglePlayPause,
// //     getPosition,
// //     isLoading,
// //     duration,
// //     mute,
// //     muted,
// //     volume,
// //     setVolume,
// //     seek,
// //     isReady,
// //   } = useAudioPlayer();

// //   const currentSong = queue[currentIndex];

// //   // Load track when index/queue changes
// //   useEffect(() => {
// //     if (queue.length && isPlayerInit && currentSong) {
// //       const src = getDownloadLink(currentSong.download_url, streamQuality);

// //       load(src, {
// //         html5: true,
// //         autoplay: true,
// //         initialMute: false,
// //         onend: handleNext,
// //       });

// //       recordedRef.current = null;
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [currentIndex, queue.length, isPlayerInit]);

// //   // Position tracking
// //   useEffect(() => {
// //     const animate = () => {
// //       if (!isDragging) setPos(getPosition());
// //       frameRef.current = requestAnimationFrame(animate);
// //     };
// //     frameRef.current = requestAnimationFrame(animate);
// //     return () => cancelAnimationFrame(frameRef.current);
// //   }, [getPosition, isDragging]);

// //   // Record to "recently played" once 10s have played, if authenticated
// //   useEffect(() => {
// //     if (
// //       session?.user &&
// //       currentSong &&
// //       pos > 10 &&
// //       recordedRef.current !== currentSong.id
// //     ) {
// //       recordedRef.current = currentSong.id;

// //       fetch("/api/music/recently-played", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           itemId: currentSong.id,
// //           title: currentSong.name,
// //           subtitle: currentSong.subtitle,
// //           image: getImageSrc(currentSong.image, "medium"),
// //           duration: currentSong.duration,
// //         }),
// //       }).catch(() => {});
// //     }
// //   }, [pos, currentSong, session]);

// //   function handleNext() {
// //     if (!queue.length) return;

// //     if (loopMode === "one") {
// //       seek(0);
// //       return;
// //     }

// //     let nextIndex: number;

// //     if (isShuffle) {
// //       nextIndex = Math.floor(Math.random() * queue.length);
// //     } else {
// //       nextIndex = currentIndex + 1;
// //     }

// //     if (nextIndex >= queue.length) {
// //       if (loopMode === "all") {
// //         nextIndex = 0;
// //       } else {
// //         return; // stop at end
// //       }
// //     }

// //     setCurrentIndex(nextIndex);
// //   }

// //   function handlePrev() {
// //     if (!queue.length) return;

// //     if (pos > 3) {
// //       seek(0);
// //       return;
// //     }

// //     let prevIndex = currentIndex - 1;
// //     if (prevIndex < 0) {
// //       prevIndex = loopMode === "all" ? queue.length - 1 : 0;
// //     }
// //     setCurrentIndex(prevIndex);
// //   }

// //   function cycleLoop() {
// //     setLoopMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
// //   }

// //   const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.3 ? Volume : volume < 0.7 ? Volume1 : Volume2;

// //   if (!currentSong) {
// //     return null;
// //   }

// //   return (
// //     <>
// //       <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
// //         <div className="flex items-center gap-4 px-4 py-2">
// //           {/* Song info */}
// //           <div className="flex items-center gap-3 min-w-0 w-1/4">
// //             <img
// //               src={getImageSrc(currentSong.image, "low")}
// //               alt={currentSong.name}
// //               className="h-12 w-12 rounded-md object-cover flex-shrink-0"
// //             />
// //             <div className="min-w-0">
// //               <p className="truncate text-sm font-medium">{currentSong.name}</p>
// //               <p className="truncate text-xs text-muted-foreground">{currentSong.subtitle}</p>
// //             </div>
// //             <SongMoreMenu song={currentSong} />
// //           </div>

// //           {/* Controls */}
// //           <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl mx-auto">
// //             <div className="flex items-center gap-2">
// //               <Button
// //                 size="icon"
// //                 variant="ghost"
// //                 onClick={() => setIsShuffle((s) => !s)}
// //                 className={isShuffle ? "text-primary" : "text-muted-foreground"}
// //               >
// //                 <Shuffle className="h-4 w-4" />
// //               </Button>
// //               <Button size="icon" variant="ghost" onClick={handlePrev}>
// //                 <SkipBack className="h-4 w-4" />
// //               </Button>
// //               <Button size="icon" onClick={togglePlayPause} disabled={!isReady}>
// //                 {isLoading ? (
// //                   <Loader2 className="h-5 w-5 animate-spin" />
// //                 ) : playing ? (
// //                   <Pause className="h-5 w-5" />
// //                 ) : (
// //                   <Play className="h-5 w-5" />
// //                 )}
// //               </Button>
// //               <Button size="icon" variant="ghost" onClick={handleNext}>
// //                 <SkipForward className="h-4 w-4" />
// //               </Button>
// //               <Button
// //                 size="icon"
// //                 variant="ghost"
// //                 onClick={cycleLoop}
// //                 className={loopMode !== "off" ? "text-primary" : "text-muted-foreground"}
// //               >
// //                 {loopMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
// //               </Button>
// //             </div>

// //             <div className="flex items-center gap-2 w-full">
// //               <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
// //                 {formatDuration(pos)}
// //               </span>
// //               <Slider
// //                 value={[pos]}
// //                 max={duration || currentSong.duration || 0}
// //                 step={1}
// //                 onValueChange={([v]) => {
// //                   setIsDragging(true);
// //                   setPos(v);
// //                 }}
// //                 onValueCommit={([v]) => {
// //                   seek(v);
// //                   setIsDragging(false);
// //                 }}
// //                 className="flex-1"
// //               >
// //                 <SliderTrack>
// //                   <SliderRange />
// //                 </SliderTrack>
// //                 <SliderThumb />
// //               </Slider>
// //               <span className="text-xs text-muted-foreground tabular-nums w-10">
// //                 {formatDuration(duration || currentSong.duration || 0)}
// //               </span>
// //             </div>
// //           </div>

// //           {/* Volume + queue */}
// //           <div className="flex items-center gap-2 w-1/4 justify-end">
// //             <Button size="icon" variant="ghost" onClick={() => setQueueOpen((o) => !o)}>
// //               <ListMusic className="h-4 w-4" />
// //             </Button>
// //             <Button size="icon" variant="ghost" onClick={mute}>
// //               <VolumeIcon className="h-4 w-4" />
// //             </Button>
// //             <Slider
// //               value={[muted ? 0 : volume]}
// //               max={1}
// //               step={0.01}
// //               onValueChange={([v]) => setVolume(v)}
// //               className="w-24"
// //             >
// //               <SliderTrack>
// //                 <SliderRange />
// //               </SliderTrack>
// //               <SliderThumb />
// //             </Slider>
// //           </div>
// //         </div>
// //       </div>

// //       {queueOpen && <Queue onClose={() => setQueueOpen(false)} />}
// //     </>
// //   );
// // }

// // import { useEffect, useRef, useState } from "react";
// // import { useSession } from "next-auth/react";
// // import {
// //   Loader2,
// //   Pause,
// //   Play,
// //   Repeat,
// //   Repeat1,
// //   Shuffle,
// //   SkipBack,
// //   SkipForward,
// //   Volume,
// //   Volume1,
// //   Volume2,
// //   VolumeX,
// //   ListMusic,
// // } from "lucide-react";

// // import { getDownloadLink, getImageSrc } from "@/lib/music/jiosaavn";
// // import {
// //   useCurrentSongIndex,
// //   useIsPlayerInit,
// //   useQueue,
// //   useStreamQuality,
// // } from "hooks/use-music-store";
// // import { Button } from "@/components/ui/button";
// // import { Slider } from "@/components/ui/slider";
// // import { SongMoreMenu } from "./song-more-menu";
// // import { Queue } from "./queue";
// // import { cn } from "@/lib/utils";

// // function formatTime(seconds: number) {
// //   if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
// //   const m = Math.floor(seconds / 60);
// //   const s = Math.floor(seconds % 60);
// //   return `${m}:${s.toString().padStart(2, "0")}`;
// // }

// // export function Player() {
// //   const { data: session } = useSession();
// //   const [queue] = useQueue();
// //   const [streamQuality] = useStreamQuality();
// //   const [currentIndex, setCurrentIndex] = useCurrentSongIndex();
// //   const [isPlayerInit] = useIsPlayerInit();

// //   const audioRef = useRef<HTMLAudioElement | null>(null);

// //   const [playing, setPlaying] = useState(false);
// //   const [currentTime, setCurrentTime] = useState(0);
// //   const [duration, setDuration] = useState(0);
// //   const [loading, setLoading] = useState(false);
// //   const [volume, setVolumeState] = useState(1);
// //   const [muted, setMuted] = useState(false);
// //   const [isShuffle, setIsShuffle] = useState(false);
// //   const [loopMode, setLoopMode] = useState<"off" | "all" | "one">("off");
// //   const [queueOpen, setQueueOpen] = useState(false);

// //   const recordedRef = useRef<string | null>(null);

// //   const currentSong = queue[currentIndex];

// //   // ─── load new track whenever song changes ─────────────────────────────────
// //   useEffect(() => {
// //     if (!isPlayerInit || !currentSong) return;

// //     const src = getDownloadLink(currentSong.download_url, streamQuality);
// //     if (!src) return; // no URL — skip silently

// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     setLoading(true);
// //     setCurrentTime(0);
// //     setDuration(0);
// //     recordedRef.current = null;

// //     audio.src = src;
// //     audio.load();
// //     audio.play().catch(() => {
// //       // autoplay blocked — user needs to tap play
// //       setPlaying(false);
// //     });
// //   }, [currentIndex, isPlayerInit]); // intentionally omit streamQuality — changing quality mid-song would restart

// //   // ─── audio element event handlers ─────────────────────────────────────────
// //   useEffect(() => {
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const onPlay = () => { setPlaying(true); setLoading(false); };
// //     const onPause = () => setPlaying(false);
// //     const onWaiting = () => setLoading(true);
// //     const onCanPlay = () => setLoading(false);
// //     const onLoaded = () => {
// //       setDuration(audio.duration);
// //       setLoading(false);
// //     };
// //     const onTimeUpdate = () => setCurrentTime(audio.currentTime);
// //     const onEnded = () => handleEnd();
// //     const onError = () => setLoading(false);

// //     audio.addEventListener("play", onPlay);
// //     audio.addEventListener("pause", onPause);
// //     audio.addEventListener("waiting", onWaiting);
// //     audio.addEventListener("canplay", onCanPlay);
// //     audio.addEventListener("loadeddata", onLoaded);
// //     audio.addEventListener("timeupdate", onTimeUpdate);
// //     audio.addEventListener("ended", onEnded);
// //     audio.addEventListener("error", onError);

// //     return () => {
// //       audio.removeEventListener("play", onPlay);
// //       audio.removeEventListener("pause", onPause);
// //       audio.removeEventListener("waiting", onWaiting);
// //       audio.removeEventListener("canplay", onCanPlay);
// //       audio.removeEventListener("loadeddata", onLoaded);
// //       audio.removeEventListener("timeupdate", onTimeUpdate);
// //       audio.removeEventListener("ended", onEnded);
// //       audio.removeEventListener("error", onError);
// //     };
// //   }, []); // attach once — handlers close over state setters which are stable

// //   // ─── record recently played after 10s ────────────────────────────────────
// //   useEffect(() => {
// //     if (
// //       session?.user &&
// //       currentSong &&
// //       currentTime > 10 &&
// //       recordedRef.current !== currentSong.id
// //     ) {
// //       recordedRef.current = currentSong.id;
// //       fetch("/api/music/recently-played", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           itemId: currentSong.id,
// //           title: currentSong.name,
// //           subtitle: currentSong.subtitle,
// //           image: getImageSrc(currentSong.image, "medium"),
// //           duration: currentSong.duration,
// //         }),
// //       }).catch(() => {});
// //     }
// //   }, [currentTime, currentSong, session]);

// //   // ─── sync volume/mute to audio element ───────────────────────────────────
// //   useEffect(() => {
// //     const audio = audioRef.current;
// //     if (!audio) return;
// //     audio.volume = volume;
// //     audio.muted = muted;
// //   }, [volume, muted]);

// //   // ─── handlers ─────────────────────────────────────────────────────────────
// //   function handleEnd() {
// //     if (loopMode === "one") {
// //       audioRef.current?.play();
// //       return;
// //     }
// //     let next: number;
// //     if (isShuffle) {
// //       next = Math.floor(Math.random() * queue.length);
// //     } else {
// //       next = currentIndex + 1;
// //     }
// //     if (next >= queue.length) {
// //       if (loopMode === "all") next = 0;
// //       else return;
// //     }
// //     setCurrentIndex(next);
// //   }

// //   function handlePrev() {
// //     if (currentTime > 3) {
// //       // restart current song
// //       if (audioRef.current) audioRef.current.currentTime = 0;
// //       return;
// //     }
// //     let prev = isShuffle
// //       ? Math.floor(Math.random() * queue.length)
// //       : currentIndex - 1;
// //     if (prev < 0) prev = loopMode === "all" ? queue.length - 1 : 0;
// //     setCurrentIndex(prev);
// //   }

// //   function handleNext() {
// //     let next = isShuffle
// //       ? Math.floor(Math.random() * queue.length)
// //       : currentIndex + 1;
// //     if (next >= queue.length) {
// //       if (loopMode === "all") next = 0;
// //       else return;
// //     }
// //     setCurrentIndex(next);
// //   }

// //   function togglePlayPause() {
// //     const audio = audioRef.current;
// //     if (!audio) return;
// //     if (playing) {
// //       audio.pause();
// //     } else {
// //       audio.play().catch(() => {});
// //     }
// //   }

// //   function handleSeek(value: number[]) {
// //     const audio = audioRef.current;
// //     if (!audio) return;
// //     audio.currentTime = value[0];
// //     setCurrentTime(value[0]);
// //   }

// //   function cycleLoop() {
// //     setLoopMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
// //   }

// //   const VolumeIcon =
// //     muted || volume === 0
// //       ? VolumeX
// //       : volume < 0.33
// //         ? Volume
// //         : volume < 0.66
// //           ? Volume1
// //           : Volume2;

// //   // Don't render player bar until a song is loaded
// //   if (!currentSong) return null;

// //   return (
// //     <>
// //       {/* Hidden native audio element — single source of truth */}
// //       <audio ref={audioRef} preload="auto" />

// //       <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
// //         {/* Seek bar pinned to very top of player */}
// //         <Slider
// //           value={[currentTime]}
// //           max={duration || currentSong.duration || 0}
// //           step={1}
// //           onValueChange={handleSeek}
// //           className="h-1 w-full rounded-none"
// //         />

// //         <div className="flex items-center gap-4 px-4 py-2">
// //           {/* ── Song info ── */}
// //           <div className="flex items-center gap-3 min-w-0 w-1/4">
// //             <img
// //               src={getImageSrc(currentSong.image, "low")}
// //               alt={currentSong.name}
// //               className="h-12 w-12 rounded-md object-cover flex-shrink-0"
// //             />
// //             <div className="min-w-0">
// //               <p className="truncate text-sm font-medium">{currentSong.name}</p>
// //               <p className="truncate text-xs text-muted-foreground">
// //                 {currentSong.subtitle}
// //               </p>
// //             </div>
// //             <SongMoreMenu song={currentSong} />
// //           </div>

// //           {/* ── Transport controls ── */}
// //           <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl mx-auto">
// //             <div className="flex items-center gap-2">
// //               <Button
// //                 size="icon"
// //                 variant="ghost"
// //                 onClick={() => setIsShuffle((s) => !s)}
// //                 className={isShuffle ? "text-primary" : "text-muted-foreground"}
// //               >
// //                 <Shuffle className="h-4 w-4" />
// //               </Button>

// //               <Button size="icon" variant="ghost" onClick={handlePrev}>
// //                 <SkipBack className="h-4 w-4" />
// //               </Button>

// //               <Button size="icon" onClick={togglePlayPause}>
// //                 {loading ? (
// //                   <Loader2 className="h-5 w-5 animate-spin" />
// //                 ) : playing ? (
// //                   <Pause className="h-5 w-5" />
// //                 ) : (
// //                   <Play className="h-5 w-5" />
// //                 )}
// //               </Button>

// //               <Button size="icon" variant="ghost" onClick={handleNext}>
// //                 <SkipForward className="h-4 w-4" />
// //               </Button>

// //               <Button
// //                 size="icon"
// //                 variant="ghost"
// //                 onClick={cycleLoop}
// //                 className={
// //                   loopMode !== "off" ? "text-primary" : "text-muted-foreground"
// //                 }
// //               >
// //                 {loopMode === "one" ? (
// //                   <Repeat1 className="h-4 w-4" />
// //                 ) : (
// //                   <Repeat className="h-4 w-4" />
// //                 )}
// //               </Button>
// //             </div>

// //             {/* Time display */}
// //             <div className="flex items-center gap-2 w-full">
// //               <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
// //                 {formatTime(currentTime)}
// //               </span>
// //               <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
// //                 <div
// //                   className="h-full bg-primary transition-all"
// //                   style={{
// //                     width: duration
// //                       ? `${(currentTime / duration) * 100}%`
// //                       : "0%",
// //                   }}
// //                 />
// //               </div>
// //               <span className="text-xs text-muted-foreground tabular-nums w-10">
// //                 {formatTime(duration || currentSong.duration || 0)}
// //               </span>
// //             </div>
// //           </div>

// //           {/* ── Volume + Queue ── */}
// //           <div className="flex items-center gap-2 w-1/4 justify-end">
// //             <Button
// //               size="icon"
// //               variant="ghost"
// //               onClick={() => setQueueOpen((o) => !o)}
// //             >
// //               <ListMusic className="h-4 w-4" />
// //             </Button>
// //             <Button
// //               size="icon"
// //               variant="ghost"
// //               onClick={() => setMuted((m) => !m)}
// //             >
// //               <VolumeIcon className="h-4 w-4" />
// //             </Button>
// //             <Slider
// //               value={[muted ? 0 : Math.round(volume * 100)]}
// //               min={0}
// //               max={100}
// //               step={1}
// //               onValueChange={([v]) => {
// //                 const newVol = v / 100;
// //                 setVolumeState(newVol);
// //                 if (newVol > 0 && muted) setMuted(false);
// //                 if (newVol === 0) setMuted(true);
// //               }}
// //               className="w-24"
// //             />
// //           </div>
// //         </div>
// //       </div>

// //       {queueOpen && <Queue onClose={() => setQueueOpen(false)} />}
// //     </>
// //   );
// // }


// import { useEffect, useRef, useState } from "react";
// import { useSession } from "next-auth/react";
// import {
//   Loader2, Pause, Play, Repeat, Repeat1,
//   Shuffle, SkipBack, SkipForward,
//   Volume, Volume1, Volume2, VolumeX, ListMusic,
// } from "lucide-react";

// import { getDownloadLink, getImageSrc } from "@/lib/music/jiosaavn";
// import {
//   useCurrentSongIndex,
//   useIsPlayerInit,
//   useQueue,
//   useStreamQuality,
// } from "hooks/use-music-store";
// import { Button } from "@/components/ui/button";
// import { Slider } from "@/components/ui/slider";
// import { SongMoreMenu } from "./song-more-menu";
// import { Queue } from "./queue";

// function fmtTime(seconds: number) {
//   if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
//   const m = Math.floor(seconds / 60);
//   const s = Math.floor(seconds % 60);
//   return `${m}:${s.toString().padStart(2, "0")}`;
// }

// export function Player() {
//   const { data: session } = useSession();
//   const [queue] = useQueue();
//   const [streamQuality] = useStreamQuality();
//   const [currentIndex, setCurrentIndex] = useCurrentSongIndex();
//   const [isPlayerInit] = useIsPlayerInit();

//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const loadedSrcRef = useRef<string>("");
//   const recordedRef = useRef<string | null>(null);

//   const [playing, setPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [volume, setVolumeState] = useState(1);
//   const [muted, setMuted] = useState(false);
//   const [isShuffle, setIsShuffle] = useState(false);
//   const [loopMode, setLoopMode] = useState<"off" | "all" | "one">("off");
//   const [queueOpen, setQueueOpen] = useState(false);

//   const currentSong = queue[currentIndex];

//   // ── Attach audio event listeners once ───────────────────────────────
//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     const onPlay = () => { setPlaying(true); setLoading(false); };
//     const onPause = () => setPlaying(false);
//     const onWaiting = () => setLoading(true);
//     const onCanPlay = () => setLoading(false);
//     const onLoaded = () => { setDuration(audio.duration || 0); setLoading(false); };
//     const onTimeUpdate = () => setCurrentTime(audio.currentTime);
//     const onEnded = () => handleEnd();
//     const onError = (e: Event) => {
//       console.error("Audio error:", (e.target as HTMLAudioElement).error);
//       setLoading(false);
//       setPlaying(false);
//     };

//     audio.addEventListener("play", onPlay);
//     audio.addEventListener("pause", onPause);
//     audio.addEventListener("waiting", onWaiting);
//     audio.addEventListener("canplay", onCanPlay);
//     audio.addEventListener("loadeddata", onLoaded);
//     audio.addEventListener("timeupdate", onTimeUpdate);
//     audio.addEventListener("ended", onEnded);
//     audio.addEventListener("error", onError);

//     return () => {
//       audio.removeEventListener("play", onPlay);
//       audio.removeEventListener("pause", onPause);
//       audio.removeEventListener("waiting", onWaiting);
//       audio.removeEventListener("canplay", onCanPlay);
//       audio.removeEventListener("loadeddata", onLoaded);
//       audio.removeEventListener("timeupdate", onTimeUpdate);
//       audio.removeEventListener("ended", onEnded);
//       audio.removeEventListener("error", onError);
//     };
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   // ── Load song when currentSong changes or download_url becomes available ─
//   useEffect(() => {
//     if (!isPlayerInit || !currentSong) return;

//     const src = getDownloadLink(currentSong.download_url, streamQuality);

//     // Only reload if src actually changed
//     if (!src || src === loadedSrcRef.current) return;

//     const audio = audioRef.current;
//     if (!audio) return;

//     console.log("Loading audio src:", src);

//     loadedSrcRef.current = src;
//     recordedRef.current = null;
//     setLoading(true);
//     setCurrentTime(0);
//     setDuration(0);

//     audio.src = src;
//     audio.load();
//     audio.play().catch((err) => {
//       console.warn("Autoplay blocked:", err);
//       setPlaying(false);
//     });
//   }, [currentSong?.download_url, currentIndex, isPlayerInit, streamQuality]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ── Record recently played after 10s ─────────────────────────────────
//   useEffect(() => {
//     if (session?.user && currentSong && currentTime > 10 && recordedRef.current !== currentSong.id) {
//       recordedRef.current = currentSong.id;
//       fetch("/api/music/recently-played", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           itemId: currentSong.id,
//           title: currentSong.name,
//           subtitle: currentSong.subtitle,
//           image: getImageSrc(currentSong.image, "medium"),
//           duration: currentSong.duration,
//         }),
//       }).catch(() => {});
//     }
//   }, [currentTime, currentSong, session]);

//   // ── Volume / mute sync ───────────────────────────────────────────────
//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;
//     audio.volume = volume;
//     audio.muted = muted;
//   }, [volume, muted]);

//   // ── Handlers ─────────────────────────────────────────────────────────

//   function handleEnd() {
//     if (loopMode === "one") { audioRef.current?.play(); return; }
//     let next = isShuffle ? Math.floor(Math.random() * queue.length) : currentIndex + 1;
//     if (next >= queue.length) {
//       if (loopMode === "all") next = 0;
//       else return;
//     }
//     setCurrentIndex(next);
//   }

//   function handlePrev() {
//     if (currentTime > 3) { if (audioRef.current) audioRef.current.currentTime = 0; return; }
//     let prev = isShuffle ? Math.floor(Math.random() * queue.length) : currentIndex - 1;
//     if (prev < 0) prev = loopMode === "all" ? queue.length - 1 : 0;
//     setCurrentIndex(prev);
//   }

//   function handleNext() {
//     let next = isShuffle ? Math.floor(Math.random() * queue.length) : currentIndex + 1;
//     if (next >= queue.length) { if (loopMode === "all") next = 0; else return; }
//     setCurrentIndex(next);
//   }

//   function togglePlayPause() {
//     const audio = audioRef.current;
//     if (!audio) return;
//     if (playing) audio.pause();
//     else audio.play().catch(() => {});
//   }

//   function handleSeek(value: number[]) {
//     const audio = audioRef.current;
//     if (!audio) return;
//     audio.currentTime = value[0];
//     setCurrentTime(value[0]);
//   }

//   function cycleLoop() {
//     setLoopMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
//   }

//   const VolumeIcon = muted || volume === 0
//     ? VolumeX : volume < 0.33 ? Volume : volume < 0.66 ? Volume1 : Volume2;

//   if (!currentSong) return null;

//   return (
//     <>
//       <audio ref={audioRef} preload="auto" />

//       <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
//         {/* Seek bar */}
//         <Slider
//           value={[currentTime]}
//           max={duration || currentSong.duration || 1}
//           step={1}
//           onValueChange={handleSeek}
//           className="h-1 rounded-none"
//         />

//         <div className="flex items-center gap-4 px-4 py-2">
//           {/* Song info */}
//           <div className="flex items-center gap-3 min-w-0 w-1/4">
//             <img
//               src={getImageSrc(currentSong.image, "low")}
//               alt={currentSong.name}
//               className="h-12 w-12 rounded-md object-cover flex-shrink-0"
//             />
//             <div className="min-w-0">
//               <p className="truncate text-sm font-medium">{currentSong.name}</p>
//               <p className="truncate text-xs text-muted-foreground">{currentSong.subtitle}</p>
//             </div>
//             <SongMoreMenu song={currentSong} />
//           </div>

//           {/* Controls */}
//           <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl mx-auto">
//             <div className="flex items-center gap-2">
//               <Button size="icon" variant="ghost"
//                 onClick={() => setIsShuffle((s) => !s)}
//                 className={isShuffle ? "text-primary" : "text-muted-foreground"}>
//                 <Shuffle className="h-4 w-4" />
//               </Button>
//               <Button size="icon" variant="ghost" onClick={handlePrev}>
//                 <SkipBack className="h-4 w-4" />
//               </Button>
//               <Button size="icon" onClick={togglePlayPause}>
//                 {loading
//                   ? <Loader2 className="h-5 w-5 animate-spin" />
//                   : playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
//               </Button>
//               <Button size="icon" variant="ghost" onClick={handleNext}>
//                 <SkipForward className="h-4 w-4" />
//               </Button>
//               <Button size="icon" variant="ghost" onClick={cycleLoop}
//                 className={loopMode !== "off" ? "text-primary" : "text-muted-foreground"}>
//                 {loopMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
//               </Button>
//             </div>

//             <div className="flex items-center gap-2 w-full text-xs text-muted-foreground tabular-nums">
//               <span className="w-10 text-right">{fmtTime(currentTime)}</span>
//               <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-primary"
//                   style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
//                 />
//               </div>
//               <span className="w-10">{fmtTime(duration || currentSong.duration || 0)}</span>
//             </div>
//           </div>

//           {/* Volume + Queue */}
//           <div className="flex items-center gap-2 w-1/4 justify-end">
//             <Button size="icon" variant="ghost" onClick={() => setQueueOpen((o) => !o)}>
//               <ListMusic className="h-4 w-4" />
//             </Button>
//             <Button size="icon" variant="ghost" onClick={() => setMuted((m) => !m)}>
//               <VolumeIcon className="h-4 w-4" />
//             </Button>
//             <Slider
//               value={[muted ? 0 : Math.round(volume * 100)]}
//               min={0} max={100} step={1}
//               onValueChange={([v]) => {
//                 const vol = v / 100;
//                 setVolumeState(vol);
//                 if (vol > 0 && muted) setMuted(false);
//                 if (vol === 0) setMuted(true);
//               }}
//               className="w-24"
//             />
//           </div>
//         </div>
//       </div>

//       {queueOpen && <Queue onClose={() => setQueueOpen(false)} />}
//     </>
//   );
// }

// components/player.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  ListMusic,
  ChevronUp,
  X,
  Share,
} from "lucide-react";
import { useGlobalAudioPlayer } from "react-use-audio-player";

import { getDownloadLink, getImageSrc } from "@/lib/music/jiosaavn";
import {
  useCurrentSongIndex,
  useIsPlayerInit,
  useQueue,
  useStreamQuality,
} from "hooks/use-music-store";
import { Button } from "@/components/ui/button";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "./ui/slider";
import { SongMoreMenu } from "./song-more-menu";
import { Queue } from "./queue";
import { Skeleton } from "../ui/skeleton";

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STORAGE_KEYS = {
  POSITION: "music_player_position",
  SONG_ID: "music_player_song_id",
  PLAYING: "music_player_playing",
  VOLUME: "music_player_volume",
  MUTED: "music_player_muted",
};

interface RestoreInfo {
  songId: string;
  position: number;
  playing: boolean;
}

export function Player() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [queue] = useQueue();
  const [streamQuality] = useStreamQuality();
  const [currentIndex, setCurrentIndex] = useCurrentSongIndex();
  const [isPlayerInit, setIsPlayerInit] = useIsPlayerInit();

  const [isShuffle, setIsShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState<"off" | "all" | "one">("off");
  const [pos, setPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const frameRef = useRef<number>(0);
  const recordedRef = useRef<string | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ─── CRITICAL REFS ─────────────────────────────────────────────────────────
  const lastLoadedSongIdRef = useRef<string | null>(null);
  const pendingRestoreRef = useRef<RestoreInfo | null>(null);
  const hasCheckedRestoreOnMount = useRef(false);

  const {
    load,
    playing,
    togglePlayPause,
    getPosition,
    isLoading,
    duration,
    mute,
    muted,
    volume,
    setVolume,
    seek,
    isReady,
  } = useGlobalAudioPlayer();

  const currentSong = queue[currentIndex];
  const isMusicPage = pathname?.startsWith("/music");
  const isDashboard = pathname === "/dashboard";
  const isOtherPage = !isMusicPage && !isDashboard;

  // ─── STEP 1: On mount, read localStorage ONCE ─────────────────────────────
  useEffect(() => {
    if (hasCheckedRestoreOnMount.current) return;
    hasCheckedRestoreOnMount.current = true;

    const storedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
    const storedMuted = localStorage.getItem(STORAGE_KEYS.MUTED);

    if (storedVolume !== null) {
      const vol = parseFloat(storedVolume);
      if (!isNaN(vol)) setVolume(vol);
    }
    if (storedMuted === "true") {
      mute();
    }

    const storedSongId = localStorage.getItem(STORAGE_KEYS.SONG_ID);
    const storedPosition = localStorage.getItem(STORAGE_KEYS.POSITION);
    const storedPlaying = localStorage.getItem(STORAGE_KEYS.PLAYING);

    if (storedSongId && storedPosition) {
      const position = parseFloat(storedPosition);
      if (position > 0 && isFinite(position)) {
        pendingRestoreRef.current = {
          songId: storedSongId,
          position: position,
          playing: storedPlaying === null ? true : storedPlaying === "true",
        };
      }
    }
  }, [setVolume, mute]);

  // ─── STEP 2: Spacebar control ──────────────────────────────────────────────
  const handlePlayPause = useCallback(() => {
    if (!isPlayerInit) {
      setIsPlayerInit(true);
    } else {
      togglePlayPause();
    }
  }, [isPlayerInit, setIsPlayerInit, togglePlayPause]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.code === "Space" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        e.preventDefault();
        handlePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause]);

  // ─── STEP 3: handleNext ────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (!queue.length) return;
    if (loopMode === "one") {
      seek(0);
      return;
    }
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
    }
    if (nextIndex >= queue.length) {
      if (loopMode === "all") nextIndex = 0;
      else return;
    }
    setCurrentIndex(nextIndex);
  }, [queue.length, loopMode, isShuffle, currentIndex, seek, setCurrentIndex]);

  // ─── STEP 4: THE BULLETPROOF LOAD & RESTORE LOGIC ─────────────────────────
  useEffect(() => {
    if (!queue.length || !isPlayerInit || !currentSong) return;

    // ═══ PREVENTS RESTART ON ROUTE CHANGES! ═══
    if (lastLoadedSongIdRef.current === currentSong.id) {
      return;
    }

    const downloadUrlArray = currentSong.downloadUrl || currentSong.download_url;
    if (!downloadUrlArray) return;
    const src = getDownloadLink(downloadUrlArray, streamQuality);
    if (!src) return;

    const restoreInfo = pendingRestoreRef.current;
    const shouldRestore = restoreInfo?.songId === currentSong.id;

    load(src, {
      html5: true,
      autoplay: false, // NEVER autoplay. We control it 100% in onload.
      initialMute: false,
      onend: handleNext,
      onload: () => {
        // 'onload' fires at the EXACT millisecond the browser has buffered enough to play.
        // This completely eliminates the race condition where React state was too slow.

        if (shouldRestore && restoreInfo) {
          // 1. Seek FIRST
          seek(restoreInfo.position);
          setPos(restoreInfo.position);

          // 2. If it was playing, wait a tiny fraction for seek to register in browser, then play
          if (restoreInfo.playing) {
            setTimeout(() => {
              togglePlayPause();
            }, 150);
          }
        } else {
          // Normal flow: New song selected, just start playing
          togglePlayPause();
        }

        // Clear restore data so it doesn't interfere with future songs
        pendingRestoreRef.current = null;
      }
    });

    // Mark this song as loaded so route changes don't reload it
    lastLoadedSongIdRef.current = currentSong.id;
    recordedRef.current = null;

  }, [currentIndex, queue.length, isPlayerInit, streamQuality, currentSong, load, handleNext, seek, togglePlayPause]);

  // ─── STEP 5: Aggressive Saving (every 1s + tab switch + page close) ───────
  useEffect(() => {
    if (!currentSong || !isReady) return;

    const savePosition = () => {
      try {
        if (!isDragging) {
          const currentPosition = getPosition();
          localStorage.setItem(STORAGE_KEYS.POSITION, currentPosition.toString());
          localStorage.setItem(STORAGE_KEYS.SONG_ID, currentSong.id);
          localStorage.setItem(STORAGE_KEYS.PLAYING, playing.toString());
          localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
          localStorage.setItem(STORAGE_KEYS.MUTED, muted.toString());
        }
      } catch (e) { }
    };

    // Save every second
    saveIntervalRef.current = setInterval(savePosition, 1000);

    const handleBeforeUnload = () => savePosition();
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Save when user switches browser tabs
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        savePosition();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      savePosition(); // Save on cleanup
    };
  }, [currentSong, isReady, isDragging, getPosition, playing, volume, muted]);

  // ─── STEP 6: Animation frame for UI updates ───────────────────────────────
  useEffect(() => {
    const animate = () => {
      if (!isDragging) setPos(getPosition());
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── STEP 7: Record recently played ────────────────────────────────────────
  useEffect(() => {
    if (session?.user && currentSong && pos > 10 && recordedRef.current !== currentSong.id) {
      recordedRef.current = currentSong.id;
      fetch("/api/music/recently-played", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: currentSong.id,
          title: currentSong.name,
          subtitle: currentSong.subtitle,
          image: getImageSrc(currentSong.image, "medium"),
          duration: currentSong.duration,
          type: currentSong.type ?? "song",
        }),
      }).catch(() => { });
    }
  }, [pos, currentSong, session]);

  function handlePrev() {
    if (!queue.length) return;
    if (pos > 3) {
      seek(0);
      return;
    }
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = loopMode === "all" ? queue.length - 1 : 0;
    }
    setCurrentIndex(prevIndex);
  }

  function cycleLoop() {
    setLoopMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.3 ? Volume : volume < 0.7 ? Volume1 : Volume2;

  if (!currentSong) return null;

  // ═══════════════════════════════════════════════════════════════════════════════
  // DASHBOARD VIEW
  // ═══════════════════════════════════════════════════════════════════════════════
  if (isDashboard) {
    return (
      <div className="w-full max-w-[21rem]">
        <div className="group relative flex justify-center items-center shadow-md bg-gray-50 dark:bg-neutral-950 py-2.5 rounded-[14px] flex-col w-full dark:border-[#171717] border transition">
          <div className="h-full w-full px-6 py-2 flex flex-col items-center">
            <div className="flex w-[40%] h-[50%] aspect-square items-center">
              <img className="h-full w-full rounded-md object-cover" src={getImageSrc(currentSong.image, "medium")} alt={currentSong.name} />
            </div>
            <div className="flex w-full text-center mt-1 px-0 flex-col">
              <p className="text-[18px] font-bold text-black dark:text-white truncate px-4">{currentSong.name.slice(0,15)}</p>
              <div className="flex justify-between items-center mt-1 w-full px-4">
                <span className="text-[12px] text-muted-foreground tabular-nums">{formatDuration(pos)}</span>
                <p className="text-[12px] text-muted-foreground font-medium truncate mx-4">{currentSong.subtitle}</p>
                <span className="text-[12px] text-muted-foreground tabular-nums">{formatDuration(duration || currentSong.duration || 0)}</span>
              </div>
            </div>
          </div>
          <div className="absolute h-full w-full flex-col justify-end hidden group-hover:flex items-center gap-5 dark:bg-black/50 bg-gray-200/30 rounded-[14px] py-1 backdrop-blur-sm px-3 transition-all duration-300">
            <div className="flex items-center gap-2 justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/45 text-white"
              >
                <Share className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-black/45 text-white" onClick={handlePrev}><SkipBack className="h-5 w-5" /></Button>
              <Button size="icon" className="rounded-full h-10 w-10 p-[10px] bg-white text-black" onClick={handlePlayPause}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-black/45 text-white" onClick={handleNext}><SkipForward className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-black/45 text-white" onClick={cycleLoop}>
                {loopMode === "one" ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex w-full flex-col mt-4">
              {!duration ? (
                <Skeleton className="h-2 w-full rounded" />
              ) : (
                <Slider onValueChange={([v]) => { setIsDragging(true); setPos(v); }} onValueCommit={([v]) => { seek(v); setIsDragging(false); }} value={[pos]} max={duration || currentSong.duration || 0} className="w-full !h-[2px] bg-red-500">
                  <SliderTrack><SliderRange /></SliderTrack><SliderThumb />
                </Slider>
              )}
              <div className="flex items-center justify-between text-[12px] mt-1 text-muted-foreground">
                <span>{formatDuration(pos)}</span>
                <span>{formatDuration(duration || currentSong.duration || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        {queueOpen && <Queue onClose={() => setQueueOpen(false)} />}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXPANDED VIEW
  // ═══════════════════════════════════════════════════════════════════════════════
  if (isExpanded) {
    return (
      <div className="rounded-3xl z-[100] max-w-sm flex items-center justify-center p-3">
        <div className="absolute inset-0 bg-[#222] rounded-3xl " onClick={() => setIsExpanded(false)} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
          <img src={getImageSrc(currentSong.image, "high")} alt="" className="w-full h-full object-cover opacity-40 blur-3xl scale-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
        </div>
        <div className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 aspect-square w-full">
            <img src={getImageSrc(currentSong.image, "high")} alt={currentSong.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
         <Button size="icon" variant="ghost" onClick={() => setIsShuffle((s) => !s)} className={`h-8 w-8 bg-white/15 absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/20 rounded-full ${isShuffle ? "text-white" : "text-white"}`}>
                <Shuffle className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={cycleLoop} className={`h-8 w-8 ${loopMode !== "off" ? "text-white" : "text-white/40"}`}>
                {loopMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </Button>
          </div>
          <div className="  px-5 py-4 relative z-10">
            <div className="py-2 mb-3">
              <h3 className="text-sm font-bold text-white truncate">{currentSong.name}</h3>
              <p className="text-xs text-white/60 truncate">{currentSong.subtitle}</p>
            </div>
            <div className="mb-1">
              
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-white/50 tabular-nums">{formatDuration(pos)}</span>
                <span className="text-[11px] text-white/50 tabular-nums">{formatDuration(duration || currentSong.duration || 0)}</span>
              </div>
              <Slider value={[pos]} max={duration || currentSong.duration || 0} step={1} onValueChange={([v]) => { setIsDragging(true); setPos(v); }} onValueCommit={([v]) => { seek(v); setIsDragging(false); }} className="w-full">
                <SliderTrack className="bg-white/20"><SliderRange className="bg-white" /></SliderTrack><SliderThumb className="bg-white border-0 h-3 w-3" />
              </Slider>
            </div>
            <div className="flex items-center justify-center gap-8">
              
              <Button size="icon" variant="ghost" onClick={handlePrev} className="text-white hover:text-white/80 h-10 w-10">
              <SkipBack className="h-6 w-6" fill="currentColor" /></Button>
              <Button size="icon" onClick={handlePlayPause} disabled={!isReady && isPlayerInit} className="h-12 w-12 rounded-full bg-white text-black hover:bg-white/90">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : playing ? 
                <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6 ml-0.5" fill="currentColor" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={handleNext} className="text-white hover:text-white/80 h-10 w-10">
              <SkipForward className="h-6 w-6" fill="currentColor" /></Button>
              
            </div>
           {/* <div className="flex items-center justify-between mt-4">
               <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={mute} className="text-white/40 hover:text-white h-7 w-7"><VolumeIcon className="h-4 w-4" /></Button>
                <Slider value={[muted ? 0 : volume]} max={1} step={0.01} onValueChange={([v]) => setVolume(v)} className="w-20">
                  <SliderTrack className="bg-white/20"><SliderRange className="bg-white" /></SliderTrack><SliderThumb className="bg-white border-0 h-2.5 w-2.5" />
                </Slider>
              </div> 
              <div className="flex items-center gap-0.5">
                <SongMoreMenu song={currentSong} />
                <Button size="icon" variant="ghost" onClick={() => setQueueOpen((o) => !o)} className="text-white/40 hover:text-white h-7 w-7"><ListMusic className="h-4 w-4" /></Button>
              </div>
            </div> */}
          </div>
        </div>
        {queueOpen && <Queue onClose={() => setQueueOpen(false)} />}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // COMPACT MINI PLAYER (Other Pages)
  // ═══════════════════════════════════════════════════════════════════════════════
  if (isOtherPage) {
    const songName = currentSong.name?.length > 25 ? currentSong.name.slice(0, 12) + "..." : currentSong.name?.slice(0, 12) || "";
    const artistName = currentSong.subtitle?.length > 18 ? currentSong.subtitle.slice(0, 12) + "..." : currentSong.subtitle?.slice(0, 12) || "";

    return (
      <>
        <div className="w-72 flex !rounded-full items-center bg-white dark:bg-[#111]  hover:bg-black/90">
          <div className="text-foreground flex items-center gap-3 overflow-hidden mt-0.5 px-2.5 py-1.5 backdrop-blur-md rounded-full shadow-xl cursor-pointer transition-colors" onClick={() => setIsExpanded(true)}>
            <img className="h-8 w-8 rounded-full object-cover flex-shrink-0" src={getImageSrc(currentSong.image, "low")} alt={currentSong.name} />
            <div className="min-w-0 flex-1">
              <p className="pointer-events-none truncate text-sm font-medium text-white">{songName}</p>
              <p className="pointer-events-none truncate text-xs text-white opacity-70">{artistName}</p>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="rounded-full p-1 hover:bg-white/30 transition-colors"><SkipBack className="h-4 w-4 text-white" /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} className="rounded-full p-1 hover:bg-white/30 transition-colors">
              {isLoading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" />}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleNext(); }} className="rounded-full p-1 hover:bg-white/30 transition-colors"><SkipForward className="h-4 w-4 text-white" /></button>
          </div>
        </div>
        {queueOpen && <Queue onClose={() => setQueueOpen(false)} />}
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FULL BOTTOM BAR (/music pages)
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center gap-4 px-6 py-1">
        <div className="flex items-center gap-3 min-w-0 w-1/4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsExpanded(true)}>
          <img src={getImageSrc(currentSong.image, "low")} alt={currentSong.name} className="h-12 w-12 rounded-md object-cover flex-shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{currentSong.name}</p>
            <p className="truncate text-xs text-muted-foreground">{currentSong.subtitle}</p>
          </div>
          <SongMoreMenu song={currentSong} />
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => setIsShuffle((s) => !s)} className={isShuffle ? "text-primary" : "text-muted-foreground"}><Shuffle className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={handlePrev}><SkipBack className="h-4 w-4" /></Button>
            <Button size="icon" className="rounded-full dark:bg-white" onClick={handlePlayPause} disabled={!isReady && isPlayerInit}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={handleNext}><SkipForward className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={cycleLoop} className={loopMode !== "off" ? "text-primary" : "text-muted-foreground"}>
              {loopMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{formatDuration(pos)}</span>
            <Slider value={[pos]} max={duration || currentSong.duration || 0} step={1} onValueChange={([v]) => { setIsDragging(true); setPos(v); }} onValueCommit={([v]) => { seek(v); setIsDragging(false); }} className="flex-1">
              <SliderTrack><SliderRange /></SliderTrack><SliderThumb />
            </Slider>
            <span className="text-xs text-muted-foreground tabular-nums w-10">{formatDuration(duration || currentSong.duration || 0)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-1/4 justify-end">
          <Button size="icon" variant="ghost" onClick={() => setQueueOpen((o) => !o)}><ListMusic className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" onClick={mute}><VolumeIcon className="h-4 w-4" /></Button>
          <Slider value={[muted ? 0 : volume]} max={1} step={0.01} onValueChange={([v]) => setVolume(v)} className="w-24">
            <SliderTrack><SliderRange /></SliderTrack><SliderThumb />
          </Slider>
          <Button size="icon" variant="ghost" onClick={() => setIsExpanded(true)}><ChevronUp className="h-4 w-4" /></Button>
        </div>
      </div>
      {queueOpen && <Queue onClose={() => setQueueOpen(false)} />}
    </div>
  );
}