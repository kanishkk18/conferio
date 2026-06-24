// "use client"
// import { Button } from "@/components/ui/button";
// import { getSongsById} from "../../../../lib/fetch";
// import { Download, Pause, Play, Repeat, Loader2,Repeat1, Share2 } from "lucide-react";
// import { useContext, useEffect, useRef, useState } from "react";
// import { Skeleton } from "../../../../components/ui/skeleton";
// import { Slider } from "../../../../components/ui/slider";
// import { toast } from "sonner";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { NextContext } from "../../../../hooks/use-context";
// import Next from "../../../../components/music-components/cards/next";

// export default function Player({ id }) {
//     const [data, setData] = useState([]);
//     const [playing, setPlaying] = useState(true);
//     const audioRef = useRef(null);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [isDownloading, setIsDownloading] = useState(false);
//     const [isLooping, setIsLooping] = useState(false);
//     const [audioURL, setAudioURL] = useState("");
//     const params = useSearchParams();
//     const next = useContext(NextContext);

//     const getSong = async () => {
//         const get = await getSongsById(id);
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
//             localStorage.setItem("p", "false");
//         } else {
//             audioRef.current.play();
//             localStorage.setItem("p", "true");
//         }
//         setPlaying(!playing);
//     };

//     const downloadSong = async () => {
//         setIsDownloading(true);
//         const response = await fetch(audioURL);
//         const datas = await response.blob();
//         const url = URL.createObjectURL(datas);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `${data.name}.mp3`;
//         a.click();
//         URL.revokeObjectURL(url);
//         toast.success('downloaded');
//         setIsDownloading(false);
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

//     const handleShare = () => {
//         try {
//             navigator.share({
//                 url: `https://${window.location.host}/${data.id}`
//             });
//         }
//         catch (e) {
//             toast.error('Something went wrong!');
//         }
//     }

   
//     // useEffect(() => {
//     //     getSong();
//     //     localStorage.setItem("last-played", id);
//     //     localStorage.removeItem("p");
//     //     if (params.get("c")) {
//     //         audioRef.current.currentTime = parseFloat(params.get("c") + 1);
//     //     }
//     //     const handleTimeUpdate = () => {
//     //         try {
//     //             setCurrentTime(audioRef.current.currentTime);
//     //             setDuration(audioRef.current.duration);
//     //             localStorage.setItem("c", audioRef.current.currentTime);
//     //         }
//     //         catch (e) {
//     //             setPlaying(false);
//     //         }
//     //     };
//     //     audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
//     //     return () => {
//     //         if (audioRef.current) {
//     //             audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
//     //         }
//     //     };
//     // }, []);


//     useEffect(() => {
//         getSong();
      
//         // store last played
//         localStorage.setItem("last-played", id);
      
//         // restore current time (priority: URL param → localStorage)
//         const paramTime = params.get("c");
//         const storedTime = localStorage.getItem("c");
      
//         if (paramTime) {
//           audioRef.current.currentTime = parseFloat(paramTime) + 1;
//         } else if (storedTime) {
//           audioRef.current.currentTime = parseFloat(storedTime) + 1;
//         }
      
//         // restore play state
//         setPlaying(
//           localStorage.getItem("p") === "true" || !localStorage.getItem("p")
//         );
      
//         const handleTimeUpdate = () => {
//           try {
//             setCurrentTime(audioRef.current.currentTime);
//             setDuration(audioRef.current.duration);
      
//             // persist current time
//             localStorage.setItem("c", audioRef.current.currentTime);
//           } catch (e) {
//             setPlaying(false);
//           }
//         };
      
//         audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      
//         return () => {
//           if (audioRef.current) {
//             audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
//           }
//         };
//       }, [id]);

      
//    useEffect(() => {
//   if (
//     currentTime === duration &&
//     !isLooping &&
//     duration !== 0 &&
//     next?.nextData?.id
//   ) {
//     window.location.href = `/music/(player)/${next.nextData.id}`;
//   }
// }, [currentTime, duration, isLooping, next?.nextData?.id]);


//     return (
//         <div className="" aria-label="Play">
//             <audio onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedData={() => setDuration(audioRef.current.duration)} autoPlay={playing} src={audioURL} ref={audioRef}></audio>
//             <div className=" w-full flex flex-col justify-center items-center h-screen " aria-label="Play">
           
//                 <>
//                         {data.length <= 0 ? (
//                             <Skeleton className="md:w-[130px] aspect-square rounded-2xl md:h-[150px]" />
//                         ) : (
//                             <img src={data.image[2].url} alt=""  className="h-screen w-screen object-cover left-0 inset-0 top-0 absolute -z-50  object-top"/>
//                         )}
//                         </>

//                 <div className=" px-6 md:px-20 lg:px-20 grid space-y-8 w-full" aria-label="Play">
//                     <div>
//                         {data.length <= 0 ? (
//                             <Skeleton className="md:w-[130px] rounded-2xl md:h-[5px]" />
//                         ) : (
//                             <div className="relative space-y-1" aria-label="Play">
//                                 <h1 className="text-5xl font-semibold md:max-w-lg max-w-[260px]">{data.name}</h1>
//                                 <p className="text-md text-muted-foreground"><Link href={"/search/" + `${encodeURI(data.artists.primary[0].name.toLowerCase().split(" ").join("+"))}`} className="text-foreground">{data.artists.primary[0]?.name || "unknown"}</Link></p>
//                                 </div>
//                         )}
//                     </div>


//                     <div>
//                         {data.length <= 0 ? (
//                             <Skeleton className="md:w-[110px] aspect-square rounded-2xl md:h-[130px]" />
//                         ) : (
//                             <div className="relative" aria-label="Play">
//                                 <img src={data.image[2].url} alt={"image of"+data.name} className="sm:h-[450px] h-full bg-secondary/50 rounded-2xl sm:w-[450px] w-full object-cover" />
//                                 <img src={data.image[2].url} alt={"image of"+data.name} className="hidden dark:block absolute top-0 left-0 w-[110%] h-[110%] blur-3xl -z-10 opacity-50" />
//                             </div>
//                         )}
//                     </div>
                    

//                     {data.length <= 0 ? (
//                         <div className="flex flex-col justify-between w-full" aria-label="Play">
//                             <div>
//                                 <Skeleton className="h-4 w-36 mb-2" />
//                                 <Skeleton className="h-3 w-16 mb-4" />
//                             </div>
//                             <div>
//                                 <Skeleton className="h-4 w-full rounded-full mb-2" />
//                                 <div className="w-full flex items-center justify-between" aria-label="Play">
//                                     <Skeleton className="h-[9px] w-6" />
//                                     <Skeleton className="h-[9px] w-6" />
//                                 </div>
//                                 <div className="flex items-center gap-3 mt-3" aria-label="Play">
//                                     <Skeleton className="h-10 w-10" />
//                                     <Skeleton className="h-10 w-10" />
//                                     <Skeleton className="h-10 w-10" />
//                                 </div>
//                             </div>
//                         </div>


//                     ) : (
//                         <div className="flex flex-col justify-between w-full z-50" aria-label="Play">
                           
//                             <div className="grid gap-2 w-full sm:mt-0" aria-label="Play">
//                                 <Slider onValueChange={handleSeek} value={[currentTime]} max={duration} className="w-full" />
//                                 <div className="w-full flex items-center justify-between" aria-label="Play">
//                                     <span className="text-xs" aria-label="Play">{formatTime(currentTime)}</span>
//                                     <span className="text-xs" aria-label="Play">{formatTime(duration)}</span>
//                                 </div>
//                                 <div className="flex items-center justify-center  " aria-label="Play">
//                                     <div className="flex items-center gap-3 sm:mt-0" aria-label="Play">
//                                         <Button size="icon" variant="ghost" onClick={loopSong}>
//                                             {!isLooping ? <Repeat className="h-4 w-4" /> : <Repeat1 className="h-4 w-4" />}
//                                         </Button>
//                                         <Button size="icon" variant={playing ? "gooeyRight" : "gooeyLeft"} onClick={togglePlayPause}>
//                                             {playing ? (
//                                                 <Pause className="h-4 w-4" />
//                                             ) : (
//                                                 <Play className="h-4 w-4" />
//                                             )}
//                                         </Button>
//                                         <Button size="icon" variant="ghost" onClick={downloadSong}>
//                                             {isDownloading ? (
//                                                 <Loader2 className="h-4 w-4 animate-spin" />
//                                             ) : (
//                                                 <Download className="h-4 w-4" />
//                                             )}
//                                         </Button>
                                    
//                                     <Button size="icon" variant="ghost" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
//                                </div> </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* {next.nextData && (
//                 <Next name={next.nextData.name} artist={next.nextData.artist} image={next.nextData.image} />
//             )} */}
//         </div>
//     )
// }

"use client"

import { Button } from "@/components/ui/button";
import { getSongsById } from "../../../../lib/fetch";
import { Download, Pause, Play, Repeat, Loader2, Repeat1, Share2 } from "lucide-react";
import { Suspense, useContext, useEffect, useRef, useState } from "react";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Slider } from "../../../../components/ui/slider";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NextContext } from "../../../../hooks/use-context";

// ─── PlayerControls ───────────────────────────────────────────────────────────
// Extracted to reduce JSX nesting depth on the controls section

function PlayerControls({ playing, isLooping, isDownloading, onPlayPause, onLoop, onDownload, onShare }) {
  return (
    <div className="flex items-center gap-3 sm:mt-0">
      <Button size="icon" variant="ghost" onClick={onLoop}>
        {isLooping ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
      </Button>
      <Button size="icon" variant={playing ? "gooeyRight" : "gooeyLeft"} onClick={onPlayPause}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button size="icon" variant="ghost" onClick={onDownload}>
        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      </Button>
      <Button size="icon" variant="ghost" onClick={onShare}>
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── PlayerInner ──────────────────────────────────────────────────────────────
// Isolated here because useSearchParams() must live inside a <Suspense> boundary.
// The outer Player component wraps this in <Suspense> below.

function PlayerInner({ id }) {
  const [data, setData]               = useState([]);
  const [playing, setPlaying]         = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLooping, setIsLooping]     = useState(false);
  const [audioURL, setAudioURL]       = useState("");

  const audioRef = useRef(null);
  const params   = useSearchParams();          // ← requires Suspense boundary
  const next     = useContext(NextContext);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const getSong = async () => {
    const get  = await getSongsById(id);
    const json = await get.json();
    setData(json.data[0]);
    const urls = json?.data[0]?.downloadUrl;
    setAudioURL(urls?.[2]?.url ?? urls?.[1]?.url ?? urls?.[0]?.url ?? "");
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const togglePlayPause = () => {
    if (playing) {
      audioRef.current.pause();
      localStorage.setItem("p", "false");
    } else {
      audioRef.current.play();
      localStorage.setItem("p", "true");
    }
    setPlaying(!playing);
  };

  const downloadSong = async () => {
    setIsDownloading(true);
    const response = await fetch(audioURL);
    const blob     = await response.blob();
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = `${data.name}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('downloaded');
    setIsDownloading(false);
  };

  const handleSeek = (e) => {
    const seekTime = e[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const loopSong = () => {
    audioRef.current.loop = !audioRef.current.loop;
    setIsLooping(!isLooping);
    toast.success(isLooping ? 'Removed from Loop!' : 'Added to Loop!');
  };

  const handleShare = () => {
    try {
      navigator.share({ url: `https://${window.location.host}/${data.id}` });
    } catch {
      toast.error('Something went wrong!');
    }
  };

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    getSong();
    localStorage.setItem("last-played", id);

    const paramTime  = params.get("c");
    const storedTime = localStorage.getItem("c");

    if (paramTime) {
      audioRef.current.currentTime = parseFloat(paramTime) + 1;
    } else if (storedTime) {
      audioRef.current.currentTime = parseFloat(storedTime) + 1;
    }

    setPlaying(
      localStorage.getItem("p") === "true" || !localStorage.getItem("p")
    );

    const handleTimeUpdate = () => {
      try {
        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration);
        localStorage.setItem("c", audioRef.current.currentTime);
      } catch {
        setPlaying(false);
      }
    };

    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [id]);

  useEffect(() => {
    if (currentTime === duration && !isLooping && duration !== 0 && next?.nextData?.id) {
      window.location.href = `/music/(player)/${next.nextData.id}`;
    }
  }, [currentTime, duration, isLooping, next?.nextData?.id]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const isLoaded = data.length > 0;

  return (
    <div aria-label="Play">
      <audio
        aria-label='audio-player'
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedData={() => setDuration(audioRef.current.duration)}
        autoPlay={playing}
        src={audioURL}
        ref={audioRef}
      />

      <div className="w-full flex flex-col justify-center items-center h-screen" aria-label="Play">

        {/* Background image */}
        {isLoaded
          ? <img src={data.image[2].url} alt="" className="h-screen w-screen object-cover left-0 inset-0 top-0 absolute -z-50 object-top" />
          : <Skeleton className="md:w-[130px] aspect-square rounded-2xl md:h-[150px]" />
        }

        <div className="px-6 md:px-20 lg:px-20 grid space-y-8 w-full" aria-label="Play">

          {/* Title + artist */}
          {!isLoaded ? (
            <Skeleton className="md:w-[130px] rounded-2xl md:h-[5px]" />
          ) : (
            <div className="relative space-y-1">
              <h1 className="text-5xl font-semibold md:max-w-lg max-w-[260px]">{data.name}</h1>
              <p className="text-md text-muted-foreground">
                <Link
                  href={"/search/" + encodeURI(data.artists.primary[0].name.toLowerCase().split(" ").join("+"))}
                  className="text-foreground"
                >
                  {data.artists.primary[0]?.name || "unknown"}
                </Link>
              </p>
            </div>
          )}

          {/* Album art */}
          {!isLoaded ? (
            <Skeleton className="md:w-[110px] aspect-square rounded-2xl md:h-[130px]" />
          ) : (
            <div className="relative">
              <img src={data.image[2].url} alt={"image of " + data.name} className="sm:h-[450px] h-full bg-secondary/50 rounded-2xl sm:w-[450px] w-full object-cover" />
              <img src={data.image[2].url} alt={"image of " + data.name} className="hidden dark:block absolute top-0 left-0 w-[110%] h-[110%] blur-3xl -z-10 opacity-50" />
            </div>
          )}

          {/* Playback controls */}
          {!isLoaded ? (
            <div className="flex flex-col justify-between w-full">
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-3 w-16 mb-4" />
              </div>
              <div>
                <Skeleton className="h-4 w-full rounded-full mb-2" />
                <div className="w-full flex items-center justify-between">
                  <Skeleton className="h-[9px] w-6" />
                  <Skeleton className="h-[9px] w-6" />
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between w-full z-50">
              <div className="grid gap-2 w-full sm:mt-0">
                <Slider onValueChange={handleSeek} value={[currentTime]} max={duration} className="w-full" />
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs">{formatTime(currentTime)}</span>
                  <span className="text-xs">{formatTime(duration)}</span>
                </div>
                <div className="flex items-center justify-center">
                  <PlayerControls
                    playing={playing}
                    isLooping={isLooping}
                    isDownloading={isDownloading}
                    onPlayPause={togglePlayPause}
                    onLoop={loopSong}
                    onDownload={downloadSong}
                    onShare={handleShare}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Player (exported) ────────────────────────────────────────────────────────
// Wraps PlayerInner in <Suspense> so useSearchParams() has a boundary.
// This satisfies the react-doctor/nextjs-no-use-search-params-without-suspense rule.

export default function Player({ id }) {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <Skeleton className="h-[450px] w-[450px] rounded-2xl" />
      </div>
    }>
      <PlayerInner id={id} />
    </Suspense>
  );
}
