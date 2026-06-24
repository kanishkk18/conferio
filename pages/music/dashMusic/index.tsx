'use client';

import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
// import {ElasticSlider} from '@/components/ui/musicslider'
import Image from 'next/image';
import MusicProvider from '@/components/music/music-provider';
// import Player from '../components/cards/player'
import { useContext, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Repeat, Repeat1, Share } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getSongsById } from '@/lib/fetch';
import { MusicContext } from 'hooks/use-context';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { SkipBack, SkipForward } from 'lucide-react';
import Link from 'next/link';
// import AdvanceSearch from "../../musics/(player)/_components/AdvanceSearch"

const DashMusic = () => {
  const [data, setData] = useState([]);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState('');
  const [isLooping, setIsLooping] = useState(false);
  const values = useContext(MusicContext);
  const displayName = typeof data?.name === 'string' ? data.name.slice(0, 12) : undefined;


  const getSong = async () => {
    const get = await getSongsById(values.music);
    const data = await get.json();
    setData(data.data[0]);
    if (data?.data[0]?.downloadUrl[2]?.url) {
      setAudioURL(data?.data[0]?.downloadUrl[2]?.url);
    } else if (data?.data[0]?.downloadUrl[1]?.url) {
      setAudioURL(data?.data[0]?.downloadUrl[1]?.url);
    } else {
      setAudioURL(data?.data[0]?.downloadUrl[0]?.url);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e) => {
    const seekTime = e[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const loopSong = () => {
    audioRef.current.loop = !audioRef.current.loop;
    setIsLooping(!isLooping);
    if (isLooping) {
      toast.success('Removed from Loop!');
    } else {
      toast.success('Added to Loop!');
    }
  };

  // useEffect(() => {
  //     if (values?.music) {
  //         getSong();
  //         if (localStorage.getItem("c")) {
  //             audioRef.current.currentTime = parseFloat(localStorage.getItem("c") + 1);
  //             localStorage.removeItem("c");
  //         }
  //         setPlaying(localStorage.getItem("p") == "true" && true || !localStorage.getItem("p") && true);
  //         const handleTimeUpdate = () => {
  //             try {
  //                 setCurrentTime(audioRef.current.currentTime);
  //                 setDuration(audioRef.current.duration);
  //             }
  //             catch (e) {
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

  useEffect(() => {
    if (values?.music) {
      getSong();
      const storedTime = localStorage.getItem('c');

      if (storedTime) {
        const time = parseFloat(storedTime);
        audioRef.current.currentTime = time + 1;
        localStorage.removeItem('c');
      }

      setPlaying(
        localStorage.getItem('p') === 'true' || !localStorage.getItem('p')
      );

      const handleTimeUpdate = () => {
        try {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration);
          localStorage.setItem('c', audioRef.current.currentTime); // <-- store current time
        } catch (e) {
          setPlaying(false);
        }
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    }
  }, [values?.music]);

  return (
    <div>
      <MusicProvider>
        <HoverCard>
          <HoverCardTrigger>
            {/*<div className="flex  justify-center items-start px-6 bg-gray-50 dark:bg-neutral-950 py-6 rounded-[14px] flex-col">
          <div className="flex gap-4">
            <img className='h-10 w-10 rounded-lg' src="https://i.scdn.co/image/ab67616d0000b27354e544672baa16145d67612b" alt="" />
            <div className="flex flex-col justify-center items-start text-start">
              <p className='text-[16px] font-bold'>Tum ho</p>
              <p className='text-[12px] font-bold'>mohit chauhan</p>
            </div>
            </div>
            <div className="flex my-4">
            <ElasticSlider
  leftIcon={<>-</>}
  rightIcon={<>+</>}
  startingValue={500}
  defaultValue={750}
  maxValue={1000}
  isStepped
/>
</div> */}
            <main className="">
              <audio
                aria-label='audio-player'
                autoPlay={playing}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onLoadedData={() => setDuration(audioRef.current.duration)}
                src={audioURL}
                ref={audioRef}
              />

              {/* {values?.music && */}

              {!values?.music ? (
                <div className="flex flex-col justify-between items-center gap-3 bg-gray-50 dark:bg-neutral-950 px-6 py-3 rounded-[14px] w-full max-w-xl mx-auto shadow-md">
                  <img
                    className="h-20 w-20 rounded-lg"
                    src="https://i.scdn.co/image/ab67616d0000b27354e544672baa16145d67612b"
                    alt="Default Music"
                  />
                  <div className="flex text-center flex-col flex-1">
                    <p className="text-[16px] font-bold">
                      No music playing
                    </p>
                  </div>
                  <Link
                    href="/music/page"
                    className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
                  >
                    Play Music
                  </Link>
                </div>
              ) : (
                <div className="flex justify-center items-start bg-gray-50 dark:bg-neutral-950 rounded-[14px] flex-col w-full max-w-xl mx-auto  shadow-md">
                  {/* <div className="flex w-[40%] items-center gap-4">
          <Image
            className="h-full w-full rounded-lg object-cover"
            src={data?.image?.[1]?.url || ""}
            alt={data?.name || "cover"}
            width={1000}
            height={1000}
          />
         
        </div> <div className="flex  flex-col">
            <p className="text-[16px] font-bold text-black dark:text-white">
              {data?.name || <Skeleton className="h-4 w-32" />}
            </p>
            <p className="text-[12px] text-muted-foreground font-medium">
              {data?.artists?.primary?.[0]?.name || (
                <Skeleton className="h-3 w-20" />
              )}
            </p>
          </div>

        <div className="flex w-full flex-col mt-4">
          {!duration ? (
            <Skeleton className="h-2 w-full rounded" />
          ) : (
            <Slider
              onValueChange={handleSeek}
              value={[currentTime]}
              max={duration}
              className="w-full"
            />
          )}
          <div className="flex items-center justify-between text-[12px] mt-1 text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 mt-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-black dark:text-white"
            onClick={() => (audioRef.current.currentTime -= 10)}
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            className="rounded-full h-10 w-10 p-[10px] bg-black dark:bg-white text-white dark:text-black"
            onClick={togglePlayPause}
          >
            {playing ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-black dark:text-white"
            onClick={() => (audioRef.current.currentTime += 10)}
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <Button
            variant={isLooping ? "secondary" : "ghost"}
            size="icon"
            className="rounded-full text-black dark:text-white"
            onClick={loopSong}
          >
            {isLooping ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
          </Button>
        </div> */}

                  <div className="group relative  flex justify-center items-center bg-gray-50 dark:bg-neutral-950 py-2.5 rounded-[14px] flex-col w-full dark:border-[#171717] border mx-auto transition">

                    <div className="h-full w-full px-6 py-2 flex flex-col items-center">
                      <div className="flex w-[40%] h-[50%] aspect-square items-center">
                        <Image
                          className="h-full w-full rounded-md object-cover"
                          src={data?.image?.[2]?.url || 'https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-500x500.jpg'}
                          alt={data?.name || 'cover'}
                          width={1000}
                          height={1000}
                        />
                      </div>

                      {/* Name + Artist (sliced) */}
                      <div className="flex w-full text-center mt-1 px-0 flex-col">
                        <p className="text-[22px] font-bold text-black dark:text-white">
                          {(data?.name?.slice(0, 12) || (
                            <Skeleton className="h-4 w-32" />
                          )) + (data?.name?.length > 25 ? '...' : '')}
                        </p>
                        <div className="flex justify-between items-center mt-1 w-full">
                          <span className='text-[12px] text-muted-foreground'>{formatTime(currentTime)}</span>
                          <p className="text-[12px] text-muted-foreground font-medium">
                            {(data?.artists?.primary?.[0]?.name?.slice(0, 12) || (
                              <Skeleton className="h-3 w-20" />
                            )) +
                              (data?.artists?.primary?.[0]?.name?.length > 18
                                ? '...'
                                : '')}
                          </p>
                          <span className='text-[12px] text-muted-foreground'>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute h-full w-full flex-col justify-end hidden group-hover:flex items-center gap-5 dark:bg-black/50 bg-gray-200/30 rounded-[14px] py-1 backdrop-blur-sm px-3  transition-all duration-300">
                      <div className="flex items-center gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-black/45 text-white"
                        >
                          <Share className="h-5 w-5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-black/45 text-white"
                          onClick={() => (audioRef.current.currentTime -= 10)}
                        >
                          <SkipBack className="h-5 w-5" />
                        </Button>

                        <Button
                          size="icon"
                          className="rounded-full h-10 w-10 p-[10px] bg-white text-black"
                          onClick={togglePlayPause}
                        >
                          {playing ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-black/45 text-white"
                          onClick={() => (audioRef.current.currentTime += 10)}
                        >
                          <SkipForward className="h-5 w-5" />
                        </Button>

                        <Button
                          variant={isLooping ? 'secondary' : 'ghost'}
                          size="icon"
                          className="rounded-full bg-black/45 text-white"
                          onClick={loopSong}
                        >
                          {isLooping ? (
                            <Repeat1 className="h-5 w-5" />
                          ) : (
                            <Repeat className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      <div className="flex w-full flex-col mt-4">
                        {!duration ? (
                          <Skeleton className="h-2 w-full rounded" />
                        ) : (
                          <Slider
                            onValueChange={handleSeek}
                            value={[currentTime]}
                            max={duration}
                            className="w-full "
                          />
                        )}
                        <div className="flex items-center justify-between text-[12px] mt-1 text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
            {/* <Player />  */}
            {/* </div> */}
          </HoverCardTrigger>
          <HoverCardContent className="relative dark:bg-neutral-950 -mt-[18%] border-none w-[40vw] -ml-[66.5%] shadow-xl rounded-2xl overflow-hidden">
            {/* Background Layers - Full Cover */}
            {/* Grid Background Layer */}
            <div
              className="absolute inset-0 z-10 pointer-events-none opacity-50"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)', // light grid
                backgroundSize: '4px 4px',
              }}
            >
              <div
                className="absolute inset-0 dark:hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)', // light grid
                  backgroundSize: '4px 4px',
                }}
              />
              <div
                className="absolute inset-0 hidden dark:block"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', // dark grid
                  backgroundSize: '4px 4px',
                }}
              />
            </div>

            {/* Radial Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div
                className="absolute inset-0 dark:hidden"
                style={{
                  background: 'radial-gradient(circle at center, #ffffff 0%, #e5e7eb 80%)',
                  opacity: 0.9,
                }}
              />
              <div
                className="absolute inset-0 hidden dark:block"
                style={{
                  background: 'radial-gradient(circle at center, #1e3a8a 0%, #000 80%)',
                  opacity: 0.9,
                }}
              />
            </div>


            {/* Actual Content */}
            <div className="relative flex min-w-full flex-col max-h-[48%] w-[40%] z-10 gap-5">
              {/* Header Section */}
              <div className="flex justify-between items-center w-full">
                {/* <AdvanceSearch /> */}
                {/* <span className="font-bold text-lg text-brand-on-background-medium">
                  {displayName || <Skeleton className="h-4 w-32" />}
                </span>
                 */}
              </div>

              {/* Main Section */}
              <div className="grid grid-cols-2">
                <div className="flex flex-col justify-center items-center w-full gap-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-blue-700">
                      {displayName || <Skeleton className="h-4 w-32" />}
                    </span>
                    <span className="block text-sm font-semibold text-brand-on-background-medium mb-4">
                      {data?.artists?.primary?.[0]?.name.slice(0, 20) || (
                        <Skeleton className="h-3 w-20" />
                      )}
                    </span>
                  </div>

                  <div className="flex gap-3 justify-center items-center">
                    <button type="button"
                      className="rounded-md p-2 text-inherit cursor-pointer"
                      aria-label="Previous"
                      onClick={() => (audioRef.current.currentTime -= 10)}
                    >
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7.712 4.818A1.5 1.5 0 0 1 10 6.095v2.972c.104-.13.234-.248.389-.343l6.323-3.906A1.5 1.5 0 0 1 19 6.095v7.81a1.5 1.5 0 0 1-2.288 1.276l-6.323-3.905a1.505 1.505 0 0 1-.389-.344v2.973a1.5 1.5 0 0 1-2.288 1.276l-6.323-3.905a1.5 1.5 0 0 1 0-2.552l6.323-3.906Z"></path>
                      </svg>
                    </button>
                    <button type="button"
                      className="rounded-full bg-primary text-white p-3 cursor-pointer"
                      aria-label="Pause"
                      onClick={togglePlayPause}
                    >
                      {playing ? (
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z"></path>
                        </svg>
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>
                    <button type="button"
                      className="rounded-md p-2 text-inherit cursor-pointer"
                      aria-label="Next"
                      onClick={() => (audioRef.current.currentTime += 10)}
                    >
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M3.288 4.818A1.5 1.5 0 0 0 1 6.095v7.81a1.5 1.5 0 0 0 2.288 1.276l6.323-3.905c.155-.096.285-.213.389-.344v2.973a1.5 1.5 0 0 0 2.288 1.276l6.323-3.905a1.5 1.5 0 0 0 0-2.552l-6.323-3.906A1.5 1.5 0 0 0 10 6.095v2.972a1.506 1.506 0 0 0-.389-.343L3.288 4.818Z"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Image Album Art */}
                <div className="relative w-full h-48 overflow-hidden rounded-xl">
                  <Image
                    src={data?.image?.[2]?.url || 'https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-500x500.jpg'}
                    alt={data?.name || 'cover'}
                    width={1000}
                    height={1000}
                    objectFit="cover"
                    priority
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex  flex-col gap-2 px-5 py-1 w-full">
                {!duration ? (
                  <Skeleton className="h-2 w-full rounded" />
                ) : (
                  <Slider
                    onValueChange={handleSeek}
                    value={[currentTime]}
                    max={duration}
                    className="w-full "
                  />
                )}
                <div className="flex justify-between text-sm text-neutral-on-background-weak">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </MusicProvider>
    </div>
  );
};

export default DashMusic;

// "use client";

// import React, { useContext, useEffect, useRef, useState } from "react";
// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from "@/components/ui/hover-card";
// import Image from "next/image";
// import MusicProvider from "@/components/music-components/music-provider";
// import { Button } from "@/components/ui/button";
// import {
//   Pause,
//   Play,
//   Repeat,
//   Repeat1,
//   Share,
//   SkipBack,
//   SkipForward,
// } from "lucide-react";
// import { Slider } from "@/components/ui/slider";
// import { getSongsById } from "@/lib/fetch";
// import { MusicContext } from "hooks/use-context";
// import { toast } from "sonner";
// import { Skeleton } from "@/components/ui/skeleton";
// import Link from "next/link";

// const DashMusic = () => {
//   const [data, setData] = useState([]);
//   const [playing, setPlaying] = useState(false);
//   const audioRef = useRef(null);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [audioURL, setAudioURL] = useState("");
//   const [isLooping, setIsLooping] = useState(false);
//   const values = useContext(MusicContext);

//   const getSong = async () => {
//     const get = await getSongsById(values.music);
//     const data = await get.json();
//     setData(data.data[0]);
//     const urls = data?.data[0]?.downloadUrl || [];
//     const fallbackURL = urls.find((u) => u?.url)?.url;
//     setAudioURL(fallbackURL);
//   };

//   const formatTime = (time) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
//   };

//   const togglePlayPause = () => {
//     if (playing) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play();
//     }
//     setPlaying(!playing);
//   };

//   const handleSeek = (e) => {
//     const seekTime = e[0];
//     audioRef.current.currentTime = seekTime;
//     setCurrentTime(seekTime);
//   };

//   const loopSong = () => {
//     audioRef.current.loop = !audioRef.current.loop;
//     setIsLooping(!isLooping);
//     toast.success(isLooping ? "Removed from Loop!" : "Added to Loop!");
//   };

//   useEffect(() => {
//     if (values?.music) {
//       getSong();
//       const storedTime = localStorage.getItem("c");
//       if (storedTime) {
//         const time = parseFloat(storedTime);
//         audioRef.current.currentTime = time + 1;
//         localStorage.removeItem("c");
//       }

//       setPlaying(localStorage.getItem("p") === "true" || !localStorage.getItem("p"));

//       const handleTimeUpdate = () => {
//         try {
//           setCurrentTime(audioRef.current.currentTime);
//           setDuration(audioRef.current.duration);
//           localStorage.setItem("c", audioRef.current.currentTime.toString());
//         } catch {
//           setPlaying(false);
//         }
//       };

//       audioRef.current.addEventListener("timeupdate", handleTimeUpdate);

//       return () => {
//         audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
//       };
//     }
//   }, [values?.music]);

//   return (
//     <div>
//       <MusicProvider>
//         {!values?.music ? (
//           <HoverCard>
//             <HoverCardTrigger asChild>
//               <div className="flex justify-between items-center gap-3 bg-gray-50 dark:bg-neutral-950 px-6 py-3 rounded-[14px] w-full max-w-xl mx-auto shadow-md">
//                 <img
//                   className="h-10 w-10 rounded-lg"
//                   src="https://i.scdn.co/image/ab67616d0000b27354e544672baa16145d67612b"
//                   alt="Default Music"
//                 />
//                 <div className="flex flex-col flex-1">
//                   <p className="text-[16px] font-bold">No music playing</p>
//                   <p className="text-[12px] text-muted-foreground">Start your vibe</p>
//                 </div>
//                 <Link
//                   href="/music/layout"
//                   className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
//                 >
//                   Music Page
//                 </Link>
//               </div>
//             </HoverCardTrigger>
//             <HoverCardContent className="bg-neutral-950 w-72 border-none shadow-xl rounded-2xl text-white text-center">
//               Go to the Music Page to select and start a song 🎶
//             </HoverCardContent>
//           </HoverCard>
//         ) : (
//           <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-950 rounded-2xl max-w-xl mx-auto shadow-md">
//             <audio
//               autoPlay={playing}
//               onPlay={() => setPlaying(true)}
//               onPause={() => setPlaying(false)}
//               onLoadedData={() => setDuration(audioRef.current.duration)}
//               src={audioURL}
//               ref={audioRef}
//             />
//             <div className="flex items-center gap-4">
//               <Image
//                 className="h-16 w-16 rounded-lg object-cover"
//                 src={data?.image?.[1]?.url || ""}
//                 alt={data?.name || "cover"}
//                 width={1000}
//                 height={1000}
//               />
//               <div className="flex-1">
//                 <p className="text-base font-bold text-black dark:text-white">
//                   {data?.name || <Skeleton className="h-4 w-32" />}
//                 </p>
//                 <p className="text-sm text-muted-foreground font-medium">
//                   {data?.artists?.primary?.[0]?.name || <Skeleton className="h-3 w-20" />}
//                 </p>
//               </div>
//             </div>
//             <div className="mt-3">
//               {!duration ? (
//                 <Skeleton className="h-2 w-full rounded" />
//               ) : (
//                 <Slider
//                   onValueChange={handleSeek}
//                   value={[currentTime]}
//                   max={duration}
//                   className="w-full"
//                 />
//               )}
//               <div className="flex justify-between text-xs mt-1 text-muted-foreground">
//                 <span>{formatTime(currentTime)}</span>
//                 <span>{formatTime(duration)}</span>
//               </div>
//             </div>
//             <div className="flex items-center justify-center gap-5 mt-4">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="rounded-full text-black dark:text-white"
//                 onClick={() => (audioRef.current.currentTime -= 10)}
//               >
//                 <SkipBack className="h-5 w-5" />
//               </Button>

//               <Button
//                 size="icon"
//                 className="rounded-full h-10 w-10 p-[10px] bg-black dark:bg-white text-white dark:text-black"
//                 onClick={togglePlayPause}
//               >
//                 {playing ? (
//                   <Pause className="h-6 w-6" />
//                 ) : (
//                   <Play className="h-6 w-6" />
//                 )}
//               </Button>

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="rounded-full text-black dark:text-white"
//                 onClick={() => (audioRef.current.currentTime += 10)}
//               >
//                 <SkipForward className="h-5 w-5" />
//               </Button>

//               <Button
//                 variant={isLooping ? "secondary" : "ghost"}
//                 size="icon"
//                 className="rounded-full text-black dark:text-white"
//                 onClick={loopSong}
//               >
//                 {isLooping ? (
//                   <Repeat1 className="h-5 w-5" />
//                 ) : (
//                   <Repeat className="h-5 w-5" />
//                 )}
//               </Button>
//             </div>
//           </div>
//         )}
//       </MusicProvider>
//     </div>
//   );
// };

// export default DashMusic;
