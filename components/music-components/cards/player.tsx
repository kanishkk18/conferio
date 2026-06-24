// "use client";
// import { useContext, useEffect, useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ExternalLink, Pause, Play, Repeat, Repeat1, X } from "lucide-react";
// import { Slider } from "@/components/ui/slider";
// import { getSongsById } from "@/lib/fetch";
// import Link from "next/link";
// import { MusicContext } from "../../../hooks/use-context";
// import { toast } from "sonner";
// import { Skeleton } from "@/components/ui/skeleton";
// import {  Heart, SkipBack, SkipForward, Shuffle, Volume2 } from "lucide-react"

// export default function Player() {
//     const [data, setData] = useState([]);
//     const [playing, setPlaying] = useState(false);
//     const audioRef = useRef(null);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [audioURL, setAudioURL] = useState("");
//     const [isLooping, setIsLooping] = useState(false);
//     const values = useContext(MusicContext);

//     const getSong = async () => {
//         const get = await getSongsById(values.music);
//         const data = await get.json();
//         setData(data.data[0]);
//         if (data?.data[0]?.downloadUrl[2]?.url) {
//             setAudioURL(data?.data[0]?.downloadUrl[2]?.url);
//         } else if (data?.data[0]?.downloadUrl[1]?.url) {
//             setAudioURL(data?.data[0]?.downloadUrl[1]?.url);
//         } else {
//             setAudioURL(data?.data[0]?.downloadUrl[0]?.url);
//         }
//     };

//     const formatTime = (time) => {
//         const minutes = Math.floor(time / 60);
//         const seconds = Math.floor(time % 60);
//         return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//     };

//     const togglePlayPause = () => {
//         if (playing) {
//             audioRef.current.pause();
//         } else {
//             audioRef.current.play();
//         }
//         setPlaying(!playing);
//     };

//     const handleSeek = (e) => {
//         const seekTime = e[0];
//         audioRef.current.currentTime = seekTime;
//         setCurrentTime(seekTime);
//     };

//     const loopSong = () => {
//         audioRef.current.loop = !audioRef.current.loop;
//         setIsLooping(!isLooping);
//         if (isLooping) {
//             toast.success('Removed from Loop!');
//         } else {
//             toast.success('Added to Loop!');
//         }
//     };

//     // useEffect(() => {
//     //     if (values?.music) {
//     //         getSong();
//     //         if (localStorage.getItem("c")) {
//     //             audioRef.current.currentTime = parseFloat(localStorage.getItem("c") + 1);
//     //             localStorage.removeItem("c");
//     //         }
//     //         setPlaying(localStorage.getItem("p") == "true" && true || !localStorage.getItem("p") && true);
//     //         const handleTimeUpdate = () => {
//     //             try {
//     //                 setCurrentTime(audioRef.current.currentTime);
//     //                 setDuration(audioRef.current.duration);
//     //             }
//     //             catch (e) {
//     //                 setPlaying(false);
//     //             }
//     //         };
//     //         audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
//     //         return () => {
//     //             if (audioRef.current) {
//     //                 audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
//     //             }
//     //         };
//     //     }
//     // }, [values?.music]);

//     useEffect(() => {
//     if (values?.music) {
//         getSong();
//         const storedTime = localStorage.getItem("c");

//         if (storedTime) {
//             const time = parseFloat(storedTime);
//             audioRef.current.currentTime = time + 1;
//             localStorage.removeItem("c");
//         }

//         setPlaying(localStorage.getItem("p") === "true" || !localStorage.getItem("p"));

//         const handleTimeUpdate = () => {
//             try {
//                 setCurrentTime(audioRef.current.currentTime);
//                 setDuration(audioRef.current.duration);
//                 localStorage.setItem("c", audioRef.current.currentTime); // <-- store current time
//             } catch (e) {
//                 setPlaying(false);
//             }
//         };

//         audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

//         return () => {
//             if (audioRef.current) {
//                 audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
//             }
//         };
//     }
// }, [values?.music]);

//     return (
//         <main className="">
//             <audio autoPlay={playing} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedData={() => setDuration(audioRef.current.duration)} src={audioURL} ref={audioRef}></audio>
//             {values?.music && <div className=" w-screen fixed flex items-center bottom-0 right-0 left-0 justify-center  border-border overflow-hidden z-999 px-2.5 py-0 gap-3">
//                 <div className="relative p-2">
//                     <img src={data.image ? data?.image[1]?.url : ""} alt={data?.name} className="rounded-md h-14 min-w-14 hover:opacity-85 transition" />
//                     <img src={data.image ? data?.image[1]?.url : ""} alt={data?.name} className="rounded-md h-[110%] min-w-[110%] opacity-40 hidden dark:block absolute top-0 left-0 right-0 blur-3xl -z-10" />
//                 </div>
//                 <div className=" justify-between min-w-[18%] flex items-center">
//                     <div className="flex it  ems-center justify-between w-full">
//                         <div className="gap-y-1">
//                             {!data?.name ? <Skeleton className="h-4 w-32" /> : (
//                                 <>
//                                     <Link href={`/music/(player)/${values.music}?c=${currentTime}`} className="text-base hover:opacity-85 transition font-medium flex md:hidden gap-2 items-center text-white">{data?.name?.slice(0, 10)}{data?.name?.length >= 11 ? ".." : ""}
//                                     <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
//                                     </Link>
//                                     <Link href={`/music/(player)/${values.music}?c=${currentTime}`} className="text-base hover:opacity-85 transition font-medium gap-2 items-center hidden md:flex text-white">{data?.name?.slice(0, 10)}
//                                     <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
//                                     </Link>
//                                 </>
//                             )}
//                             {!data?.artists?.primary[0]?.name ? <Skeleton className="h-3 w-14 mt-1" /> : (
//                                 <>
//                                     <h2 className="block md:hidden text-xs -mt-0.5 text-muted-foreground">{data?.artists?.primary[0]?.name.slice(0, 20)}{data?.artists?.primary[0]?.name.length > 20 ? ".." : ""}</h2>
//                                     <h2 className="hidden md:block text-xs -mt-0.5 text-muted-foreground">{data?.artists?.primary[0]?.name}</h2>
//                                 </>
//                             )}
//                         </div>
                       
//                     </div>
//                     <div className="flex items-center gap-4">
            
//             <Button variant="ghost" size="icon" className="rounded-full text-white">
//               <SkipBack className="h-5 w-5" />
//             </Button>
//             <Button size="icon" className="rounded-full h-10 w-10 p-[10px] bg-white/20 text-white hover:bg-gray-400" onClick={togglePlayPause}>
//             {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
//             </Button>
//             <Button variant="ghost" size="icon" className="rounded-full text-white">
//               <SkipForward className="h-5 w-5" />
//             </Button>
//           </div>  
          
//                 </div>
//                 <div className="w-full px-12 flex justify-center mt-3 flex-col gap-1 ">
//                         {!duration ? <Skeleton className="h-2 w-full " /> : (
//                             <Slider onValueChange={handleSeek} value={[currentTime]} max={duration} className="w-full bg-red-600" />
//                         )}
//                         <div className="flex items-center justify-between ">
//                             <span className="text-[10px] font-light text-muted-foreground ">{formatTime(currentTime)}</span>
//                             {!duration ? <Skeleton className="h-2 w-10 " /> : (
//                                 <span className="text-[10px] font-light text-muted-foreground">{formatTime(duration)}</span>
//                             )}
//                         </div>
//                     </div>
//                 <div className="flex items-center gap-4 ">
//         <Button variant="ghost" size="icon" className="rounded-full text-white">
//             <Heart className="h-5 w-5" />
//           </Button>
//         <Button variant="ghost" size="icon" className="rounded-full text-white">
//               <Shuffle className="h-5 w-5" />
//             </Button>
//             <Button size="icon" className="p-0 h-8 w-8 text-white" variant={!isLooping ? "ghost" : "secondary"} onClick={loopSong}>
//                                 {!isLooping ? <Repeat className="h-5 w-5" /> : <Repeat1 className="h-5 w-5" />}
//                             </Button>
//           <Volume2 className="h-5 w-5 text-white" />
//         </div>
       
       
//             </div>}
//         </main >
//     )
// }

// "use client";
// import { useContext, useEffect, useRef, useState, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { ExternalLink, Pause, Play, Repeat, Repeat1, Heart, SkipBack, SkipForward, Shuffle, Volume2 } from "lucide-react";
// import { Slider } from "@/components/ui/slider";
// import Link from "next/link";
// import { MusicContext } from "../../../hooks/use-context";
// import { toast } from "sonner";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useSession } from "next-auth/react";

// export default function Player() {
//     const { data: session } = useSession();
//     const [track, setTrack] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [playing, setPlaying] = useState(false);
//     const audioRef = useRef(null);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [isLooping, setIsLooping] = useState(false);
//     const [isFavourited, setIsFavourited] = useState(false);
//     const values = useContext(MusicContext);
//     const [music, setMusic] =useState(null);

//     const loadTrack = useCallback(async (id) => {
//         setLoading(true);
//         try {
//             const res = await fetch(`/api/music/tracks/${id}`, { credentials: "include" });
//             if (res.status === 404) {
//             console.warn("Track not found, clearing player");
//             setMusic(null); // clear so it stops trying
//             localStorage.removeItem("conferio-music-current");
//             return;
//         }
//             if (!res.ok) throw new Error("Failed to load track");
//             const data = await res.json();
//             setTrack(data);

//             // Check favourite status
//             if (session?.user?.id) {
//                 const favRes = await fetch(`/api/music/favourites/check?trackId=${id}`, { credentials: "include" });
//                 if (favRes.ok) {
//                     const favData = await favRes.json();
//                     setIsFavourited(favData.isFavourited);
//                 }
//             }
//         } catch (e) {
//             console.error(e);
//             toast.error("Failed to load track");
//         } finally {
//             setLoading(false);
//         }
//     }, [session, setMusic]);

// //     const loadTrack = useCallback(async (id) => {
// //     setLoading(true);
// //     try {
// //         const res = await fetch(`/api/music/tracks/${id}`, { credentials: "include" });
// //         if (res.status === 404) {
// //             console.warn("Track not found, clearing player");
// //             setMusic(null); // clear so it stops trying
// //             localStorage.removeItem("conferio-music-current");
// //             return;
// //         }
// //         if (!res.ok) throw new Error("Failed to load track");
// //         const data = await res.json();
// //         setTrack(data);
// //         // ... rest
// //     } catch (e) {
// //         console.error(e);
// //     } finally {
// //         setLoading(false);
// //     }
// // }, [session, setMusic]);

//     useEffect(() => {
//         if (!values?.music) {
//             setTrack(null);
//             return;
//         }

//         // If context already passes full track object (from your discovery grid)
//         if (typeof values.music === "object" && values.music?.id) {
//             setTrack(values.music);
//             if (session?.user?.id) {
//                 fetch(`/api/music/favourites/check?trackId=${values.music.id}`, { credentials: "include" })
//                     .then(r => r.ok ? r.json() : null)
//                     .then(d => d && setIsFavourited(d.isFavourited))
//                     .catch(() => {});
//             }
//         } 
//         // If context passes just an ID string
//         else if (typeof values.music === "string") {
//             loadTrack(values.music);
//         }
//     }, [values?.music, session, loadTrack]);

//     const toggleFavourite = async () => {
//         if (!session?.user?.id || !track?.id) {
//             toast.error("Please sign in to favourite");
//             return;
//         }
//         try {
//             const url = `/api/music/favourites${isFavourited ? `?trackId=${track.id}` : ""}`;
//             const res = await fetch(url, {
//                 method: isFavourited ? "DELETE" : "POST",
//                 credentials: "include",
//                 headers: { "Content-Type": "application/json" },
//                 body: isFavourited ? undefined : JSON.stringify({ trackId: track.id }),
//             });
//             if (!res.ok) throw new Error("Failed");
//             setIsFavourited(!isFavourited);
//             toast.success(isFavourited ? "Removed from favourites" : "Added to favourites");
//         } catch {
//             toast.error("Failed to update favourite");
//         }
//     };

//     const formatTime = (time) => {
//         if (!isFinite(time)) return "00:00";
//         const minutes = Math.floor(time / 60);
//         const seconds = Math.floor(time % 60);
//         return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//     };

//     const togglePlayPause = () => {
//         if (!audioRef.current) return;
//         if (playing) {
//             audioRef.current.pause();
//         } else {
//             audioRef.current.play().catch(() => {});
//         }
//         setPlaying(!playing);
//     };

//     const handleSeek = (e) => {
//         if (!audioRef.current) return;
//         const seekTime = e[0];
//         audioRef.current.currentTime = seekTime;
//         setCurrentTime(seekTime);
//     };

//     const loopSong = () => {
//         if (!audioRef.current) return;
//         audioRef.current.loop = !audioRef.current.loop;
//         setIsLooping(!isLooping);
//         toast.success(isLooping ? 'Removed from Loop!' : 'Added to Loop!');
//     };

//     // Handle audio events & localStorage persistence
//     useEffect(() => {
//         if (!track?.audioUrl || !audioRef.current) return;

//         const storedTime = localStorage.getItem("c");
//         if (storedTime) {
//             const time = parseFloat(storedTime);
//             if (isFinite(time)) audioRef.current.currentTime = time + 1;
//             localStorage.removeItem("c");
//         }

//         setPlaying(localStorage.getItem("p") === "true" || !localStorage.getItem("p"));

//         const handleTimeUpdate = () => {
//             if (!audioRef.current) return;
//             try {
//                 setCurrentTime(audioRef.current.currentTime);
//                 setDuration(audioRef.current.duration || track.duration || 0);
//                 localStorage.setItem("c", String(audioRef.current.currentTime));
//             } catch (e) {
//                 setPlaying(false);
//             }
//         };

//         const handleEnded = () => setPlaying(false);

//         const audio = audioRef.current;
//         audio.addEventListener('timeupdate', handleTimeUpdate);
//         audio.addEventListener('ended', handleEnded);

//         return () => {
//             audio.removeEventListener('timeupdate', handleTimeUpdate);
//             audio.removeEventListener('ended', handleEnded);
//         };
//     }, [track?.audioUrl, track?.duration]);

//     if (!values?.music) return null;

//     const coverImage = track?.coverImage || "";
//     const title = track?.title || "";
//     const artist = track?.artist || "";

//     return (
//         <main>
//             {/* key={track?.id} forces remount when track changes so src reloads */}
//             <audio
//                 key={track?.id || "empty"}
//                 autoPlay={playing}
//                 onPlay={() => setPlaying(true)}
//                 onPause={() => setPlaying(false)}
//                 onLoadedMetadata={(e) => setDuration((e.target).duration || track?.duration || 0)}
//                 src={track?.audioUrl || ""}
//                 ref={audioRef}
//             />
//             <div className="w-screen fixed flex items-center bottom-0 right-0 left-0 justify-center border-border overflow-hidden z-50 px-2.5 py-0 gap-3 bg-background/95 backdrop-blur">
//                 <div className="relative p-2">
//                     {coverImage ? (
//                         <>
//                             <img src={coverImage} alt={title} className="rounded-md h-14 w-14 object-cover hover:opacity-85 transition" />
//                             <img src={coverImage} alt={title} className="rounded-md h-[110%] w-[110%] opacity-40 hidden dark:block absolute top-0 left-0 right-0 blur-3xl -z-10" />
//                         </>
//                     ) : (
//                         <div className="rounded-md h-14 w-14 bg-muted flex items-center justify-center">
//                             <Play className="h-6 w-6 text-muted-foreground" />
//                         </div>
//                     )}
//                 </div>
//                 <div className="justify-between min-w-[18%] flex items-center">
//                     <div className="flex items-center justify-between w-full">
//                         <div className="gap-y-1">
//                             {loading || !title ? <Skeleton className="h-4 w-32" /> : (
//                                 <>
//                                     <Link href={`/music/player/${track.id}?c=${currentTime}`} className="text-base hover:opacity-85 transition font-medium flex md:hidden gap-2 items-center text-white">
//                                         {title.slice(0, 10)}{title.length >= 11 ? ".." : ""}
//                                         <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
//                                     </Link>
//                                     <Link href={`/music/player/${track.id}?c=${currentTime}`} className="text-base hover:opacity-85 transition font-medium gap-2 items-center hidden md:flex text-white">
//                                         {title.slice(0, 10)}
//                                         <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
//                                     </Link>
//                                 </>
//                             )}
//                             {loading || !artist ? <Skeleton className="h-3 w-14 mt-1" /> : (
//                                 <>
//                                     <h2 className="block md:hidden text-xs -mt-0.5 text-muted-foreground">{artist.slice(0, 20)}{artist.length > 20 ? ".." : ""}</h2>
//                                     <h2 className="hidden md:block text-xs -mt-0.5 text-muted-foreground">{artist}</h2>
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-4">
//                         <Button variant="ghost" size="icon" className="rounded-full text-white">
//                             <SkipBack className="h-5 w-5" />
//                         </Button>
//                         <Button size="icon" className="rounded-full h-10 w-10 p-[10px] bg-white/20 text-white hover:bg-gray-400" onClick={togglePlayPause}>
//                             {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
//                         </Button>
//                         <Button variant="ghost" size="icon" className="rounded-full text-white">
//                             <SkipForward className="h-5 w-5" />
//                         </Button>
//                     </div>
//                 </div>
//                 <div className="w-full px-12 flex justify-center mt-3 flex-col gap-1">
//                     {!duration ? <Skeleton className="h-2 w-full" /> : (
//                         <Slider onValueChange={handleSeek} value={[currentTime]} max={duration} className="w-full bg-red-600" />
//                     )}
//                     <div className="flex items-center justify-between">
//                         <span className="text-[10px] font-light text-muted-foreground">{formatTime(currentTime)}</span>
//                         {!duration ? <Skeleton className="h-2 w-10" /> : (
//                             <span className="text-[10px] font-light text-muted-foreground">{formatTime(duration)}</span>
//                         )}
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                     <Button
//                         variant="ghost"
//                         size="icon"
//                         className={`rounded-full ${isFavourited ? "text-red-500" : "text-white"}`}
//                         onClick={toggleFavourite}
//                     >
//                         <Heart className={`h-5 w-5 ${isFavourited ? "fill-red-500" : ""}`} />
//                     </Button>
//                     <Button variant="ghost" size="icon" className="rounded-full text-white">
//                         <Shuffle className="h-5 w-5" />
//                     </Button>
//                     <Button size="icon" className="p-0 h-8 w-8 text-white" variant={!isLooping ? "ghost" : "secondary"} onClick={loopSong}>
//                         {!isLooping ? <Repeat className="h-5 w-5" /> : <Repeat1 className="h-5 w-5" />}
//                     </Button>
//                     <Volume2 className="h-5 w-5 text-white" />
//                 </div>
//             </div>
//         </main>
//     )
// }


"use client";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pause, Play, Repeat, Repeat1, Heart, SkipBack, SkipForward, Shuffle, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { MusicContext } from "../../../hooks/use-context";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { getSongsById } from "@/lib/fetch";

function isNewTrackId(id: string): boolean {
    // CUIDs are ~25 chars with hyphens; old IDs are short like K7pHpFNL
    return id.length > 15 || id.includes("-");
}

export default function Player() {
    const { data: session } = useSession();
    const { music, setMusic } = useContext(MusicContext);
    const [track, setTrack] = useState<any>(null);
    const [isOldTrack, setIsOldTrack] = useState(false);
    const [loading, setLoading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [isFavourited, setIsFavourited] = useState(false);

    const loadNewTrack = useCallback(async (id: string) => {
        setLoading(true);
        setIsOldTrack(false);
        try {
            const res = await fetch(`/api/music/tracks/${id}`, { credentials: "include" });
            if (res.status === 404) {
                toast.error("Track not found");
                setMusic(null);
                return;
            }
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setTrack({
                id: data.id,
                title: data.title,
                artist: data.artist,
                coverImage: data.coverImage,
                audioUrl: data.audioUrl,
                duration: data.duration,
            });

            if (session?.user?.id) {
                const favRes = await fetch(`/api/music/favourites/check?trackId=${id}`, { credentials: "include" });
                if (favRes.ok) {
                    const favData = await favRes.json();
                    setIsFavourited(favData.isFavourited);
                }
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load track");
        } finally {
            setLoading(false);
        }
    }, [session, setMusic]);

    const loadOldTrack = useCallback(async (id: string) => {
        setLoading(true);
        setIsOldTrack(true);
        try {
            const res = await getSongsById(id);
            const json = await res.json();
            const song = json?.data?.[0];
            if (!song) throw new Error("No data");

            let audioUrl = "";
            if (song.downloadUrl?.[2]?.url) audioUrl = song.downloadUrl[2].url;
            else if (song.downloadUrl?.[1]?.url) audioUrl = song.downloadUrl[1].url;
            else if (song.downloadUrl?.[0]?.url) audioUrl = song.downloadUrl[0].url;

            setTrack({
                id: song.id,
                title: song.name,
                artist: song.artists?.primary?.[0]?.name || "Unknown",
                coverImage: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url || "",
                audioUrl,
                duration: song.duration ? parseInt(song.duration) : 0,
            });
            setIsFavourited(false);
        } catch (e) {
            console.error("Old track load failed:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!music) {
            setTrack(null);
            return;
        }
        const id = typeof music === "string" ? music : music?.id;
        if (!id) return;

        if (isNewTrackId(id)) loadNewTrack(id);
        else loadOldTrack(id);
    }, [music, loadNewTrack, loadOldTrack]);

    const toggleFavourite = async () => {
        if (isOldTrack || !session?.user?.id || !track?.id) {
            if (isOldTrack) toast.info("Only uploaded tracks can be favourited");
            return;
        }
        try {
            const url = `/api/music/favourites${isFavourited ? `?trackId=${track.id}` : ""}`;
            const res = await fetch(url, {
                method: isFavourited ? "DELETE" : "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: isFavourited ? undefined : JSON.stringify({ trackId: track.id }),
            });
            if (!res.ok) throw new Error("Failed");
            setIsFavourited(!isFavourited);
            toast.success(isFavourited ? "Removed from favourites" : "Added to favourites");
        } catch {
            toast.error("Failed to update favourite");
        }
    };

    const formatTime = (time: number) => {
        if (!isFinite(time)) return "00:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (playing) audioRef.current.pause();
        else audioRef.current.play().catch(() => {});
        setPlaying(!playing);
    };

    const handleSeek = (e: number[]) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = e[0];
        setCurrentTime(e[0]);
    };

    const loopSong = () => {
        if (!audioRef.current) return;
        audioRef.current.loop = !audioRef.current.loop;
        setIsLooping(!isLooping);
        toast.success(isLooping ? 'Removed from Loop!' : 'Added to Loop!');
    };

    useEffect(() => {
        if (!track?.audioUrl || !audioRef.current) return;
        const stored = localStorage.getItem("c");
        if (stored) {
            const t = parseFloat(stored);
            if (isFinite(t)) audioRef.current.currentTime = t + 1;
            localStorage.removeItem("c");
        }
        setPlaying(localStorage.getItem("p") === "true" || !localStorage.getItem("p"));

        const onTime = () => {
            if (!audioRef.current) return;
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || track.duration || 0);
            localStorage.setItem("c", String(audioRef.current.currentTime));
        };
        const onEnd = () => setPlaying(false);
        const a = audioRef.current;
        a.addEventListener('timeupdate', onTime);
        a.addEventListener('ended', onEnd);
        return () => {
            a.removeEventListener('timeupdate', onTime);
            a.removeEventListener('ended', onEnd);
        };
    }, [track?.audioUrl, track?.duration]);

    if (!music) return null;

    const title = track?.title || "";
    const artist = track?.artist || "";
    const cover = track?.coverImage || "";

    return (
        <main>
            <audio
             aria-label="music player"
                key={track?.id || "empty"}
                autoPlay={playing}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration || track?.duration || 0)}
                src={track?.audioUrl || ""}
                ref={audioRef}
            />
            <div className="w-screen fixed flex items-center bottom-0 right-0 left-0 justify-center border-border overflow-hidden z-50 px-2.5 py-0 gap-3 bg-tranparent backdrop-blur">
                <div className="relative p-2">
                    {cover ? (
                        <>
                            <img src={cover} alt={title} className="rounded-md h-14 w-14 object-cover hover:opacity-85 transition" />
                            <img src={cover} alt="" className="rounded-md h-[110%] w-[110%] opacity-40 hidden dark:block absolute top-0 left-0 right-0 blur-3xl -z-10" />
                        </>
                    ) : (
                        <div className="rounded-md h-14 w-14 bg-muted flex items-center justify-center">
                            <Play className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div className="justify-between min-w-[18%] flex items-center">
                    <div className="flex items-center justify-between w-full">
                        <div className="gap-y-1">
                            {loading || !title ? <Skeleton className="h-4 w-32" /> : (
                                <>
                                    <Link href={isOldTrack ? `/music/(player)/${track.id}?c=${currentTime}` : `/music/player/${track.id}?c=${currentTime}`}
                                        className="text-base hover:opacity-85 transition font-medium flex md:hidden gap-2 items-center text-white">
                                        {title.slice(0, 10)}{title.length >= 11 ? ".." : ""}
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Link>
                                    <Link href={isOldTrack ? `/music/(player)/${track.id}?c=${currentTime}` : `/music/player/${track.id}?c=${currentTime}`}
                                        className="text-base hover:opacity-85 transition font-medium gap-2 items-center hidden md:flex text-white">
                                        {title.slice(0, 10)}
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Link>
                                </>
                            )}
                            {loading || !artist ? <Skeleton className="h-3 w-14 mt-1" /> : (
                                <>
                                    <h2 className="block md:hidden text-xs -mt-0.5 text-muted-foreground">{artist.slice(0, 20)}{artist.length > 20 ? ".." : ""}</h2>
                                    <h2 className="hidden md:block text-xs -mt-0.5 text-muted-foreground">{artist}</h2>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full text-white"><SkipBack className="h-5 w-5" /></Button>
                        <Button size="icon" className="rounded-full h-10 w-10 p-[10px] bg-white/20 text-white hover:bg-gray-400" onClick={togglePlayPause}>
                            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full text-white"><SkipForward className="h-5 w-5" /></Button>
                    </div>
                </div>
                <div className="w-full px-12 flex justify-center mt-3 flex-col gap-1">
                    {!duration ? <Skeleton className="h-2 w-full" /> : (
                        <Slider onValueChange={handleSeek} value={[currentTime]} max={duration} className="w-full bg-red-600" />
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-light text-muted-foreground">{formatTime(currentTime)}</span>
                        {!duration ? <Skeleton className="h-2 w-10" /> : (
                            <span className="text-[10px] font-light text-muted-foreground">{formatTime(duration)}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className={`rounded-full ${isFavourited ? "text-red-500" : "text-white"}`} onClick={toggleFavourite}>
                        <Heart className={`h-5 w-5 ${isFavourited ? "fill-red-500" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-white"><Shuffle className="h-5 w-5" /></Button>
                    <Button size="icon" className="p-0 h-8 w-8 text-white" variant={!isLooping ? "ghost" : "secondary"} onClick={loopSong}>
                        {!isLooping ? <Repeat className="h-5 w-5" /> : <Repeat1 className="h-5 w-5" />}
                    </Button>
                    <Volume2 className="h-5 w-5 text-white" />
                </div>
            </div>
        </main>
    );
}


