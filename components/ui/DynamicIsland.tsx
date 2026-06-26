// "use client"

// import { ReactNode, useMemo } from "react"
// import {
//   Bell,
//   CloudLightning,
//   Music2,
//   Pause,
//   Phone,
//   Play,
//   SkipBack,
//   SkipForward,
//   Thermometer,
//   Timer as TimerIcon,
// } from "lucide-react"
// import { AnimatePresence, motion } from "motion/react"
// import { useRouter } from 'next/navigation'
// import { X, Maximize2, Minimize2 } from 'lucide-react'
// import { ChannelType } from "@prisma/client"
// import { ChatHeader } from "@/components/chat-components/chat/chat-header"
// import { ChatInput } from "@/components/chat-components/chat/chat-input"
// import { ChatMessages } from "@/components/chat-components/chat/chat-messages"
// // import { MediaRoom } from "@/components/chat-components/media-room"
// import Image from 'next/image';
// import MusicProvider from '@/components/music-components/music-provider';
// // import Player from '../components/cards/player'
// import { useContext, useEffect, useRef, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Slider } from '@/components/ui/slider';
// import { getSongsById } from '@/lib/fetch';
// import { MusicContext } from 'hooks/use-context';
// import { toast } from 'sonner';
// import { Skeleton } from '@/components/ui/skeleton';
// import Link from 'next/link';
// import {
//   FloatingPanelCloseButton,
//   FloatingPanelContent,
//   FloatingPanelFooter,
//   FloatingPanelForm,
//   FloatingPanelLabel,
//   FloatingPanelRoot,
//   FloatingPanelSubmitButton,
//   FloatingPanelTextarea,
//   FloatingPanelTrigger,
// } from "@/components/ui/floatingPanel"
// import { AnimateIcon } from "../animate-ui/icons/icon"
// import { Disc3 } from "../animate-ui/icons/disc-3"
// import { PhoneCall } from "../animate-ui/icons/phone-call"
// import { BellRing } from "../animate-ui/icons/bell-ring"
// import { Timer } from "../animate-ui/icons/timer"
// import { BotIcon } from "../animate-ui/icons/bot"
// import { MessageCircleMore } from "../animate-ui/icons/message-circle-more"
// import ClipButton from "../clips/clipButton"
// import { Clip } from '@prisma/client';
// import RecordingInterface from "../clips/RecordingInterface"
// import { AnimatedList } from "@/components/ui/animated-list";
// import { NotificationBell } from '@/components/notifications/NotificationBell';

// interface NotificationData {
//   id: number
//   name: string
//   message: string
//   timeAgo: string
//   icon: string
// }
// type NotificationProps = {
//   notification: NotificationData
// }


// interface Channel {
//   id: string;
//   name: string;
//   type: ChannelType;
//   serverId: string;
// }

// interface User {
//   id: string;
//   name: string;
//   imageUrl: string;
//   email: string;
// }

// interface Member {
//   id: string;
//   role: string;
//   userId: string;
//   serverId: string;
//   user: User;
// }

// interface DashboardProps {
//   initialClips: Clip[];
// }



// // Animation variants
// const ANIMATION_VARIANTS = {
//   "ring-idle": { scale: 0.9, scaleX: 0.9, bounce: 0.5 },
//   "timer-ring": { scale: 0.7, y: -7.5, bounce: 0.35 },
//   "ring-timer": { scale: 1.4, y: 7.5, bounce: 0.35 },
//   "timer-idle": { scale: 0.7, y: -7.5, bounce: 0.3 },
//   "idle-timer": { scale: 1.2, y: 5, bounce: 0.3 },
//   "idle-ring": { scale: 1.1, y: 3, bounce: 0.5 },
// } as const

// const BOUNCE_VARIANTS = {
//   idle: 0.5,
//   "ring-idle": 0.5,
//   "timer-ring": 0.35,
//   "ring-timer": 0.35,
//   "timer-idle": 0.3,
//   "idle-timer": 0.3,
//   "idle-ring": 0.5,
// } as const

// const variants = {
//   exit: (transition: any, custom: any) => {
//     // custom is the animation variant, e.g., ANIMATION_VARIANTS[variantKey]
//     // We'll pass the target view as custom.nextView
//     if (custom && custom.nextView === "idle") {
//       return {
//         opacity: [1, 0],
//         scale: 0.7,
//         filter: "blur(5px)",
//         transition: { duration: 0.18, ease: "ease-in" },
//       }
//     }
//     return {
//       ...transition,
//       opacity: [1, 0],
//       filter: "blur(5px)",
//     }
//   },
// }

// // Idle Component with Weather
// const DefaultIdle = () => {
//   const [showTemp, setShowTemp] = useState(false)

//   return (
//     <motion.div
//       className="flex items-center gap-2 px-3 py-2"
//       onHoverStart={() => setShowTemp(true)}
//       onHoverEnd={() => setShowTemp(false)}
//       layout
//     >
//       <AnimatePresence mode="wait">
//         <motion.div
//           key="storm"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.8 }}
//           className="text-foreground"
//         >
//           <CloudLightning className="h-5 w-5 text-white" />
//         </motion.div>
//       </AnimatePresence>

//       <AnimatePresence>
//         {showTemp && (
//           <motion.div
//             initial={{ opacity: 0, width: 0 }}
//             animate={{ opacity: 1, width: "auto" }}
//             exit={{ opacity: 0, width: 0 }}
//             className="flex items-center gap-1 overflow-hidden text-white"
//           >
//             <Thermometer className="h-3 w-3" />
//             <span className="pointer-events-none text-xs whitespace-nowrap text-white">
//               12°C
//             </span>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   )
// }

// // Ring Component
// const DefaultRing = () => {
//   return (
//     <div className="text-foreground flex w-64 items-center gap-3 overflow-hidden px-4 py-2">
//       <Phone className="h-5 w-5 text-green-500" />
//       <div className="flex-1">
//         <p className="pointer-events-none text-sm font-medium text-white">
//           Incoming Call
//         </p>
//         <p className="pointer-events-none text-xs text-white opacity-70">
//           Guillermo Rauch
//         </p>
//       </div>
//       <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
//     </div>
//   )
// }

// // Timer Component
// const Chat = () => {
//   const [time, setTime] = useState(60)
//    const [isOpen, setIsOpen] = useState(true)
//     const [isExpanded, setIsExpanded] = useState(false)
//     const [isLoading, setIsLoading] = useState(true)
//     const [channel, setChannel] = useState<Channel | null>(null)
//     const [member, setMember] = useState<Member | null>(null)
//     const [serverId, setServerId] = useState<string | null>(null)
//     const [channelId, setChannelId] = useState<string | null>(null)
//     const router = useRouter()

//   // useMemo(() => {
//   //   const timer = setInterval(() => {
//   //     setTime((t) => (t > 0 ? t - 1 : 0))
//   //   }, 1000)
//   //   return () => clearInterval(timer)
//   // }, [])

//   useEffect(() => {
//       const fetchDefaultChatData = async () => {
//         try {
//           setIsLoading(true)
//           const response = await fetch('/api/chat/default')

//           if (!response.ok) {
//             throw new Error('Failed to fetch chat data')
//           }

//           const data = await response.json()

//           if (data.serverId && data.channelId) {
//             setServerId(data.serverId)
//             setChannelId(data.channelId)

//             // Fetch channel details
//             const channelResponse = await fetch(`/api/channels/${data.channelId}`)
//             if (channelResponse.ok) {
//               const channelData = await channelResponse.json()
//               setChannel(channelData)
//             }

//             // Fetch member details
//             const memberResponse = await fetch(`/api/servers/${data.serverId}/member`)
//             if (memberResponse.ok) {
//               const memberData = await memberResponse.json()
//               setMember(memberData)
//             }
//           }
//         } catch (error) {
//           console.error('Error fetching chat data:', error)
//         } finally {
//           setIsLoading(false)
//         }
//       }

//       if (isOpen) {
//         fetchDefaultChatData()
//       }
//     }, [isOpen])

//     const handleOpenChatPage = () => {
//       if (serverId && channelId) {
//         router.push(`/servers/${serverId}/channels/${channelId}`)
//       }
//     }


//   return (
//     // <div className="text-foreground flex w-64 items-center gap-3 overflow-hidden px-4 py-2">
//     //   <TimerIcon className="h-5 w-5 text-amber-500" />
//     //   <div className="flex-1">
//     //     <p className="pointer-events-none text-sm font-medium text-white">
//     //       {time}s remaining
//     //     </p>
//     //   </div>
//     //   <div className="h-1 w-24 overflow-hidden rounded-full bg-white/20">
//     //     <motion.div
//     //       className="h-full bg-amber-500"
//     //       initial={{ width: "100%" }}
//     //       animate={{ width: "0%" }}
//     //       transition={{ duration: time, ease: "linear" }}
//     //     />
//     //   </div>
//     // </div>


//       // <FloatingPanelRoot>

//       //   <FloatingPanelTrigger >Add Note</FloatingPanelTrigger>
//       //   <FloatingPanelContent className="absolute mt-32 ml-14 px-6 min-w-2xl border top-5 w-[24.5rem] h-[610px] z-50">
//          <motion.div
//                     initial={{ opacity: 0, scale: 0.8, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.8, y: 20 }}
//                     transition={{ type: "spring", damping: 20, stiffness: 300 }}
//                     className={`bg-white dark:bg-gray-800 overflow-hidden shadow-xl flex flex-col ${
//                       isExpanded ? 'w-[24.5rem] h-[610px]' : 'w-[24.5rem] h-[610px]'
//                     }`}
//                   >
//                     {/* Header */}
//                     <div className="bg-blue-600 text-white p-2 px-3 flex justify-between items-center">
//                       <div>
//                         <h3 className="font-semibold">
//                           {isLoading ? 'Loading...' : (channel ? channel.name : 'Unknown Channel')}
//                         </h3>
//                         <p className="text-xs text-blue-100">
//                           {isLoading ? 'Connecting...' : 'Online'}
//                         </p>
//                       </div>
//                       <div className="flex gap-x-2">
//                         <button
//                           onClick={() => setIsOpen(false)}
//                           className="p-1 rounded-full hover:bg-blue-500 transition-colors"
//                         >
//                           <X size={16} />
//                         </button>
//                         <button
//                           onClick={handleOpenChatPage}
//                           className="p-1 rounded-full hover:bg-blue-500 transition-colors"
//                           title="Open in full page"
//                         >
//                           <Maximize2 size={16} />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Chat Content */}
//                     <div className="flex-1 overflow-hidden bg-white dark:bg-[#070709] flex flex-col">
//                       {isLoading ? (
//                         <div className="flex justify-center items-center h-full">
//                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                         </div>
//                       ) : channel && member ? (
//                         <>
//                           <ChatHeader
//                             name={channel.name}
//                             serverId={channel.serverId}
//                             type="channel"
//                           />
//                           {channel.type === ChannelType.TEXT && (
//                             <>
//                               <div className="flex-1 overflow-auto">
//                                 <ChatMessages
//                                   member={member}
//                                   name={channel.name}
//                                   chatId={channel.id}
//                                   type="channel"
//                                   apiUrl="/api/messages"
//                                   socketUrl="/api/socket/messages"
//                                   socketQuery={{
//                                     channelId: channel.id,
//                                     serverId: channel.serverId
//                                   }}
//                                   paramKey="channelId"
//                                   paramValue={channel.id}
//                                 />
//                               </div>
//                               <ChatInput
//                                 name={channel.name}
//                                 type="channel"
//                                 apiUrl="/api/socket/messages"
//                                 query={{
//                                   channelId: channel.id,
//                                   serverId: channel.serverId
//                                 }}
//                               />
//                             </>
//                           )}
//                           {/* {channel.type === ChannelType.AUDIO && (
//                             <MediaRoom chatId={channel.id} video={false} audio={true} />
//                           )}
//                           {channel.type === ChannelType.VIDEO && (
//                             <MediaRoom chatId={channel.id} video={true} audio={true} />
//                           )} */}
//                         </>
//                       ) : (
//                         <div className="flex justify-center items-center h-full">
//                           <p className="text-zinc-500">No channel selected</p>
//                         </div>
//                       )}
//                     </div>
//                   </motion.div>
//       //   {/* </FloatingPanelContent>
//       // </FloatingPanelRoot> */}


//   )
// }

// // Notification Component
// const AnimatedNotification = ({ notification }: NotificationProps) => (
//   // <div className="text-foreground flex w-64 items-center gap-3 overflow-hidden px-4 py-2">
//   //   <Bell className="h-5 w-5 text-yellow-400" />
//   //   <div className="flex-1">
//   //     <p className="pointer-events-none text-sm font-medium text-white">
//   //       New Message
//   //     </p>
//   //     <p className="pointer-events-none text-xs text-white opacity-70">
//   //       You have a new notification!
//   //     </p>
//   //   </div>
//   //   <span className="rounded-full bg-yellow-400/40 px-2 py-0.5 text-xs text-yellow-500">
//   //     1
//   //   </span>
//   // </div>
//    <div className="flex w-full max-w-[350px] items-center justify-between gap-4 rounded-2xl border border-neutral-50 bg-white p-3.5 shadow-xl shadow-neutral-200 dark:border-neutral-900 dark:bg-neutral-950 dark:shadow-neutral-950/70">
//       <img
//         src={notification.icon }
//         alt={notification.name}
//         className="h-10 w-10"
//       />
//       <div className="flex w-full flex-col">
//         <div className="flex w-full items-start justify-between">
//           <span className="text-sm font-medium">{notification.name}</span>
//           <span className="text-xs text-neutral-400">
//             {notification.timeAgo}
//           </span>
//         </div>
//         <span className="text-sm text-neutral-600 dark:text-neutral-400">
//           {notification.message}
//         </span>
//       </div>
//     </div>
// )




// const DefaultTimer = () => {
// const [time, setTime] = useState(60)


//   useMemo(() => {
//     const timer = setInterval(() => {
//       setTime((t) => (t > 0 ? t - 1 : 0))
//     }, 1000)
//     return () => clearInterval(timer)
//   }, [])

//   return (
//   <div className="text-foreground flex w-64 items-center gap-3 overflow-hidden px-4 py-2">
//       <TimerIcon className="h-5 w-5 text-amber-500" />
//       <div className="flex-1">
//         <p className="pointer-events-none text-sm font-medium text-white">
//           {time}s remaining
//         </p>
//       </div>
//       <div className="h-1 w-24 overflow-hidden rounded-full bg-white/20">
//         <motion.div
//           className="h-full bg-amber-500"
//           initial={{ width: "100%" }}
//           animate={{ width: "0%" }}
//           transition={{ duration: time, ease: "linear" }}
//         />
//       </div>
//     </div>
//   )
// }

// const Record = () => {
//  const [isRecording, setIsRecording] = useState(false);
//   const [clips, setClips] = useState<Clip[]>([]);


//   const handleRecordingComplete = async (blob: Blob, title: string) => {
//     const formData = new FormData();
//     formData.append('file', blob, `${title}.webm`);
//     formData.append('title', title);
//     formData.append('description', 'Screen recording');

//     try {
//       const response = await fetch('/api/clips/upload', {
//         method: 'POST',
//         body: formData,
//         // Don't set Content-Type header - let the browser set it with boundary
//       });

//       if (response.ok) {
//         const newClip = await response.json();
//         setClips((prev) => [newClip, ...prev]);
//       } else {
//         console.error('Upload failed:', await response.text());
//       }
//     } catch (error) {
//       console.error('Upload failed:', error);
//     }
//   };


//   return (
//   <div className="text-foreground flex w-64 !rounded-md items-center gap-3 overflow-hidden px-4 py-2 bg-red-500">
//        <RecordingInterface
//                    onRecordingComplete={handleRecordingComplete}
//                    onRecordingStateChange={setIsRecording}
//                  />
//     </div>
//   )
// }

// // Music Player Component
// const MusicPlayer = () => {
//   const [data, setData] = useState([]);
//     const [playing, setPlaying] = useState(false);
//     const audioRef = useRef(null);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [audioURL, setAudioURL] = useState('');
//     const [isLooping, setIsLooping] = useState(false);
//     const values = useContext(MusicContext);
//     const displayName = typeof data?.name === 'string' ? data.name.slice(0, 12) : undefined;    


//     const getSong = async () => {
//       const get = await getSongsById(values.music);
//       const data = await get.json();
//       setData(data.data[0]);
//       if (data?.data[0]?.downloadUrl[2]?.url) {
//         setAudioURL(data?.data[0]?.downloadUrl[2]?.url);
//       } else if (data?.data[0]?.downloadUrl[1]?.url) {
//         setAudioURL(data?.data[0]?.downloadUrl[1]?.url);
//       } else {
//         setAudioURL(data?.data[0]?.downloadUrl[0]?.url);
//       }
//     };


//     const togglePlayPause = () => {
//       if (playing) {
//         audioRef.current.pause();
//       } else {
//         audioRef.current.play();
//       }
//       setPlaying(!playing);
//     };

//     const handleSeek = (e) => {
//       const seekTime = e[0];
//       audioRef.current.currentTime = seekTime;
//       setCurrentTime(seekTime);
//     };


//   useEffect(() => {
//       if (values?.music) {
//         getSong();
//         const storedTime = localStorage.getItem('c');

//         if (storedTime) {
//           const time = parseFloat(storedTime);
//           audioRef.current.currentTime = time + 1;
//           localStorage.removeItem('c');
//         }

//         setPlaying(
//           localStorage.getItem('p') === 'true' || !localStorage.getItem('p')
//         );

//         const handleTimeUpdate = () => {
//           try {
//             setCurrentTime(audioRef.current.currentTime);
//             setDuration(audioRef.current.duration);
//             localStorage.setItem('c', audioRef.current.currentTime); // <-- store current time
//           } catch (e) {
//             setPlaying(false);
//           }
//         };

//         audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

//         return () => {
//           if (audioRef.current) {
//             audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
//           }
//         };
//       }
//     }, [values?.music]);

//   return (
//      <div>
//        <audio
//                 autoPlay={playing}
//                 onPlay={() => setPlaying(true)}
//                 onPause={() => setPlaying(false)}
//                 onLoadedData={() => setDuration(audioRef.current.duration)}
//                 src={audioURL}
//                 ref={audioRef}
//               />
//       {!values?.music ? (
//          <div className="flex flex-col justify-between items-center gap-3 bg-gray-50 dark:bg-neutral-950 px-6 py-3 rounded-[14px] w-full max-w-xl mx-auto shadow-md">
//                               <img
//                                 className="h-20 w-20 rounded-lg"
//                                 src="https://i.scdn.co/image/ab67616d0000b27354e544672baa16145d67612b"
//                                 alt="Default Music"
//                               />
//                               <div className="flex text-center flex-col flex-1">
//                                 <p className="text-[16px] font-bold">
//                                   No music playing
//                                 </p>
//                               </div>
//                               <Link
//                                 href="/music/layout"
//                                 className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
//                               >
//                                 Play Music
//                               </Link>
//                             </div>
//                       ) : (
//     <div className="text-foreground flex w-72 items-center gap-3 overflow-hidden px-3 py-2">
//       <Image
//                               className="h-8 w-8 rounded-full object-cover"
//                               src={data?.image?.[2]?.url || 'https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-500x500.jpg'}
//                               alt={data?.name || 'cover'}
//                               width={1000}
//                               height={1000}
//                             />
//       <div className="min-w-0 flex-1">
//         <p className="pointer-events-none truncate text-sm font-medium text-white">
//           {(data?.name?.slice(0, 12) || (
//                           <Skeleton className="h-4 w-32" />
//                         )) + (data?.name?.length > 25 ? '...' : '')}
//         </p>
//         <p className="pointer-events-none truncate text-xs text-white opacity-70">
//            {(data?.artists?.primary?.[0]?.name?.slice(0, 12) || (
//                                     <Skeleton className="h-3 w-20" />
//                                   )) +
//                                     (data?.artists?.primary?.[0]?.name?.length > 18
//                                       ? '...'
//                                       : '')}
//         </p>
//       </div>
//       <button
//         onClick={() => setPlaying(false)}
//         className="rounded-full p-1 hover:bg-white/30"
//       >
//         <SkipBack className="h-4 w-4 text-white" />
//       </button>
//       <button
//         onClick={togglePlayPause}
//         className="rounded-full p-1 hover:bg-white/30"
//       >
//         {playing ? (
//           <Pause className="h-4 w-4 text-white" />
//         ) : (
//           <Play className="h-4 w-4 text-white" />
//         )}
//       </button>
//       <button
//         onClick={() => setPlaying(true)}
//         className="rounded-full p-1 hover:bg-white/30"
//       >
//         <SkipForward className="h-4 w-4 text-white" />
//       </button>
//     </div>
//      )}
//     </div>
//   )
// }

// type View = "idle" | "ring" | "timer" | "notification" | "music" | "chat" | "ask" | "record" | "notification-bell"

// export interface DynamicIslandProps {
//   view?: View
//   onViewChange?: (view: View) => void
//   idleContent?: ReactNode
//   ringContent?: ReactNode
//   timerContent?: ReactNode
//   chatContent?: ReactNode
//   className?: string
// }

// export default function DynamicIsland({
//   view: controlledView,
//   onViewChange,
//   idleContent,
//   ringContent,
//   timerContent,
//   chatContent,
//   className = "",
// }: DynamicIslandProps) {
//   const [internalView, setInternalView] = useState<View>()
//   const [variantKey, setVariantKey] = useState<string>()

//   const view = controlledView ?? internalView

//   const content = useMemo(() => {
//     switch (view) {
//       case "ring":
//         return ringContent ?? <DefaultRing />
//       case "chat":
//         return chatContent ?? <Chat />
//       case "notification":
//         return <Notification />
//          case "timer":
//         return <DefaultTimer />
//       case "music":
//         return <MusicPlayer />
//         case "record":
//         return <Record />
//       //  case "notification-bell":
//       //   return <NotificationBell />
//       // default:
//       //   return idleContent ?? <MusicPlayer />
//     }
//   }, [view, idleContent, ringContent, timerContent, chatContent])

//   const handleViewChange = (newView: View) => {
//     if (view === newView) return
//     setVariantKey(`${view}-${newView}`)
//     if (onViewChange) onViewChange(newView)
//     else setInternalView(newView)
//   }

//   return (
//     <MusicProvider>
//     <div className={` h-full  ${className}`}>
//       <div className="relative flex h-full w-full flex-col justify-center">
//         <motion.div
//           layout
//           transition={{
//             type: "spring",
//             bounce:
//               BOUNCE_VARIANTS[variantKey as keyof typeof BOUNCE_VARIANTS] ??
//               0.5,
//           }}
//           style={{ borderRadius: 32 }}
//           className=" w-fit absolute top-10 !-right-5 z-50 overflow-hidden rounded-full bg-black"
//         >
//           <motion.div
//             transition={{
//               type: "spring",
//               bounce:
//                 BOUNCE_VARIANTS[variantKey as keyof typeof BOUNCE_VARIANTS] ??
//                 0.5,
//             }}
//             initial={{
//               scale: 0.9,
//               opacity: 0,
//               filter: "blur(5px)",
//               originX: 0.5,
//               originY: 0.5,
//             }}
//             animate={{
//               scale: 1,
//               opacity: 1,
//               filter: "blur(0px)",
//               originX: 0.5,
//               originY: 0.5,
//               transition: { delay: 0.05 },
//             }}
//             key={view}
//           >
//             {content}
//           </motion.div>
//         </motion.div>


//         <div className=" z-10 flex justify-center rounded-full  gap-0.5 px-0 text-[#B4B4B4]">
//           {[
//             { key: "record", icon: <Disc3 className="size-4" /> },
//             { key: "ring", icon: <PhoneCall className="size-4" /> },
//             { key: "timer", icon: <Timer className="size-4" /> },
//             { key: "chat", icon: <MessageCircleMore className="size-4" /> },
//              { key: "ask", icon: <BotIcon className="size-4" /> },
//             // { key: "notification", icon: <BellRing className="size-4" /> },
//             { key: "notification-bell", icon: <NotificationBell /> },
//             { key: "music", icon: <Music2 className="size-4" /> },
//           ].map(({ key, icon }) => (
//            <AnimateIcon animateOnHover>
//              <button 
//               type="button"
//               className=" flex size-6 px-0 cursor-pointer hover:dark:bg-[#000] hover:bg-[#fff] items-center justify-center rounded-full "
//               onClick={() => {
//                 if (view !== key) {
//                   setVariantKey(`${view}-${key}`)
//                   handleViewChange(key as View)
//                 }
//               }}
//               key={key}
//               aria-label={key}
//             >
//               {icon}
//             </button>
//             </AnimateIcon>
//           ))}
//         </div>

//       </div>
//     </div>
//     </MusicProvider>
//   )
// }


// export function Notification() {
//   const notifications: NotificationData[] = [
//     {
//       id: 1,
//       name: "Location",
//       message: "Thomas has arrived home",
//       timeAgo: "2h ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-1.png",
//     },
//     {
//       id: 2,
//       name: "Fitness Tracker",
//       message: "You've reached your daily step goal!",
//       timeAgo: "1h ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-2.png",
//     },
//     {
//       id: 3,
//       name: "Calendar",
//       message: "Meeting with team in 30 minutes",
//       timeAgo: "45m ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-3.png",
//     },
//     {
//       id: 4,
//       name: "Task Manager",
//       message: "3 tasks due today",
//       timeAgo: "1d ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-4.png",
//     },
//     {
//       id: 5,
//       name: "Health",
//       message: "Your heart rate is elevated.",
//       timeAgo: "3h ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-5.png",
//     },
//     {
//       id: 6,
//       name: "Email",
//       message: "New message from your manager",
//       timeAgo: "5m ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-6.png",
//     },
//     {
//       id: 7,
//       name: "TikTok",
//       message: "Your video got 1000 likes!",
//       timeAgo: "2d ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-7.png",
//     },
//     {
//       id: 8,
//       name: "Grandpa",
//       message: "How are you doing, my dear?",
//       timeAgo: "1w ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-8.png",
//     },
//     {
//       id: 9,
//       name: "Clara",
//       message: "Let's meet for coffee tomorrow!",
//       timeAgo: "2d ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-9.png",
//     },
//     {
//       id: 10,
//       name: "Sarah",
//       message: "Did you see the new movie?",
//       timeAgo: "4h ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-10.png",
//     },
//   ]
//   return (
//     <div className="h-[500px] text-foreground flex w-[500px] items-center gap-0 overflow-hidden px-6 py-2">
//       <AnimatedList
//         stackGap={20}
//         columnGap={85}
//         scaleFactor={0.05}
//         scrollDownDuration={5}
//         formationDuration={1}
//       >
//         {notifications.map((notification) => (
//           <AnimatedNotification key={notification.id} notification={notification} />
//         ))}
//       </AnimatedList>
//     </div>
//   )
// }

// "use client"

// import { ReactNode, useMemo } from "react"
// import {
//   Bell,
//   CloudLightning,
//   Music2,
//   Pause,
//   Phone,
//   Play,
//   Plus,
//   PlusCircleIcon,
//   SkipBack,
//   SkipForward,
//   Thermometer,
//   Timer as TimerIcon,
// } from "lucide-react"
// import { AnimatePresence, motion } from "motion/react"
// import { useRouter } from 'next/navigation'
// import { X, Maximize2, Minimize2 } from 'lucide-react'
// import { ChannelType } from "@prisma/client"
// import { ChatHeader } from "@/components/chat-components/chat/chat-header"
// // import { ChatInput } from "@/components/chat-components/chat/chat-input"
// import { ChatMessages } from "@/components/chat-components/chat/chat-messages"
// import Image from 'next/image';
// import MusicProvider from '@/components/music-components/music-provider';
// import { useContext, useEffect, useRef, useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { Slider } from '@/components/ui/slider';
// import { getSongsById } from '@/lib/fetch';
// import { MusicContext } from 'hooks/use-context';
// import { toast } from 'sonner';
// import { Skeleton } from '@/components/ui/skeleton';
// import Link from 'next/link';
// import {
//   FloatingPanelCloseButton,
//   FloatingPanelContent,
//   FloatingPanelFooter,
//   FloatingPanelForm,
//   FloatingPanelLabel,
//   FloatingPanelRoot,
//   FloatingPanelSubmitButton,
//   FloatingPanelTextarea,
//   FloatingPanelTrigger,
// } from "@/components/ui/floatingPanel"
// import { AnimateIcon } from "../animate-ui/icons/icon"
// import { Disc3 } from "../animate-ui/icons/disc-3"
// import { PhoneCall } from "../animate-ui/icons/phone-call"
// import { BellRing } from "../animate-ui/icons/bell-ring"
// import { Timer } from "../animate-ui/icons/timer"
// import { BotIcon } from "../animate-ui/icons/bot"
// import { MessageCircleMore } from "../animate-ui/icons/message-circle-more"
// import ClipButton from "../clips/clipButton"
// import { Clip } from '@prisma/client';
// import RecordingInterface from "../clips/RecordingInterface"
// import { AnimatedList } from "@/components/ui/animated-list";
// import { NotificationBell } from '@/components/notifications/NotificationBell';
// import { PlusIcon } from "../animate-ui/icons/plus"
// import { Label } from '../ui/label';
// import { Input } from '../ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// import { Textarea } from '../ui/textarea';
// import { Dayjs } from 'dayjs';
// import { RadioGroupDemo } from '../radio-group-demo';
// import { DropDownCategory } from '../categories/select-category';
// import Category from 'interfaces/category';
// import Loading from '../common/loading';
// import { redirect } from 'next/navigation';
// import {
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalTrigger,
// } from '../ui/animated-modal';
// import {
//   ArrowRight,
//   Calendar,
//   CloudUpload,
//   Disc2,
//   EllipsisIcon,
//   Flag,
//   PlusCircle,
// } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { RiGatsbyLine, RiNextjsLine, RiReactjsLine } from '@remixicon/react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import PopoverDatePicker from '../ui/popoverPicker';
// import { Separator } from '../ui/separator';
// // import { FileUploaderDialog } from '../file-manager/files/fileuploader-dialog';
// import { useCallback } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { Progress } from '@/components/ui/progress';
// import { Upload, File, ImageIcon, Video, Music } from 'lucide-react';
// import { formatBytes } from '@/lib/utils';
// import { FileUploadCard } from '../file-manager/components/FileUploadCard';
// import { ScrollArea } from '../ui/scroll-area';
// import CreateEvent from 'pages/events/create/page';
// import { useSession } from 'next-auth/react';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { Card, CardContent } from '@/components/ui/card';
// import LazyLoader from '../loader/lazyloader';

// interface FileWithPreview extends File {
//   preview?: string;
// }

// interface NotificationData {
//   id: number
//   name: string
//   message: string
//   timeAgo: string
//   icon: string
// }
// type NotificationProps = {
//   notification: NotificationData
// }

// interface Channel {
//   id: string;
//   name: string;
//   type: ChannelType;
//   serverId: string;
// }

// interface User {
//   id: string;
//   name: string;
//   imageUrl: string;
//   email: string;
// }

// interface Member {
//   id: string;
//   role: string;
//   userId: string;
//   serverId: string;
//   user: User;
// }

// interface DashboardProps {
//   initialClips: Clip[];
// }

// // Animation variants
// const ANIMATION_VARIANTS = {
//   "ring-idle": { scale: 0.9, scaleX: 0.9, bounce: 0.5 },
//   "timer-ring": { scale: 0.7, y: -7.5, bounce: 0.35 },
//   "ring-timer": { scale: 1.4, y: 7.5, bounce: 0.35 },
//   "timer-idle": { scale: 0.7, y: -7.5, bounce: 0.3 },
//   "idle-timer": { scale: 1.2, y: 5, bounce: 0.3 },
//   "idle-ring": { scale: 1.1, y: 3, bounce: 0.5 },
// } as const

// const BOUNCE_VARIANTS = {
//   idle: 0.5,
//   "ring-idle": 0.5,
//   "timer-ring": 0.35,
//   "ring-timer": 0.35,
//   "timer-idle": 0.3,
//   "idle-timer": 0.3,
//   "idle-ring": 0.5,
// } as const

// const variants = {
//   exit: (transition: any, custom: any) => {
//     if (custom && custom.nextView === "idle") {
//       return {
//         opacity: [1, 0],
//         scale: 0.7,
//         filter: "blur(5px)",
//         transition: { duration: 0.18, ease: "ease-in" },
//       }
//     }
//     return {
//       ...transition,
//       opacity: [1, 0],
//       filter: "blur(5px)",
//     }
//   },
// }

// // Idle Component with Weather
// const DefaultIdle = () => {
//   const [showTemp, setShowTemp] = useState(false)

//   return (
//     <motion.div
//       className="flex items-center gap-2 px-3 py-2"
//       onHoverStart={() => setShowTemp(true)}
//       onHoverEnd={() => setShowTemp(false)}
//       layout
//     >

//     </motion.div>
//   )
// }

// // Ring Component
// const DefaultRing = () => {
//   return (
//     <div className="text-foreground flex w-64 items-center gap-3 overflow-hidden px-4 py-2">
//       <Phone className="h-5 w-5 text-green-500" />
//       <div className="flex-1">
//         <p className="pointer-events-none text-sm font-medium text-white">
//           Incoming Call
//         </p>
//         <p className="pointer-events-none text-xs text-white opacity-70">
//           Guillermo Rauch
//         </p>
//       </div>
//       <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
//     </div>
//   )
// }

// // Chat Component
// const Chat = () => {
//   const [time, setTime] = useState(60)
//    const [isOpen, setIsOpen] = useState(true)
//     const [isExpanded, setIsExpanded] = useState(false)
//     // const [isLoading, setIsLoading] = useState(true)
//     const [channel, setChannel] = useState<Channel | null>(null)
//     const [member, setMember] = useState<Member | null>(null)
//     const [serverId, setServerId] = useState<string | null>(null)
//     const [channelId, setChannelId] = useState<string | null>(null)
//     const router = useRouter()

//     const { isLoading } = useQuery({
//       queryKey: ['defaultChatData', isOpen],
//       queryFn: async () => {
//         try {
//           const response = await fetch('/api/chat/default')

//           if (!response.ok) {
//             throw new Error('Failed to fetch chat data')
//           }

//           const data = await response.json()

//           if (data.serverId && data.channelId) {
//             setServerId(data.serverId)
//             setChannelId(data.channelId)

//             const channelResponse = await fetch(`/api/channels/${data.channelId}`)
//             if (channelResponse.ok) {
//               const channelData = await channelResponse.json()
//               setChannel(channelData)
//             }

//             const memberResponse = await fetch(`/api/servers/${data.serverId}/member`)
//             if (memberResponse.ok) {
//               const memberData = await memberResponse.json()
//               setMember(memberData)
//             }
//           }
//           return data;
//         } catch (error) {
//           console.error('Error fetching chat data:', error)
//           return null;
//         }
//       },
//       enabled: isOpen,
//     })

//     const handleOpenChatPage = () => {
//       if (serverId && channelId) {
//         router.push(`/servers/${serverId}/channels/${channelId}`)
//       }
//     }


//   return (
//          <motion.div
//                     initial={{ opacity: 0, scale: 0.8, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.8, y: 20 }}
//                     transition={{ type: "spring", damping: 20, stiffness: 300 }}
//                     className={`bg-white dark:bg-gray-800 overflow-hidden shadow-xl flex flex-col ${
//                       isExpanded ? 'w-[24.5rem] h-[610px]' : 'w-[24.5rem] h-[610px]'
//                     }`}
//                   >
//                     <div className="bg-blue-600 text-white p-2 px-3 flex justify-between items-center">
//                       <div>
//                         <h3 className="font-semibold">
//                           {isLoading ? 'Loading...' : (channel ? channel.name : 'Unknown Channel')}
//                         </h3>
//                         <p className="text-xs text-blue-100">
//                           {isLoading ? 'Connecting...' : 'Online'}
//                         </p>
//                       </div>
//                       <div className="flex gap-x-2">
//                         <button type="button"
//                           onClick={() => setIsOpen(false)}
//                           className="p-1 rounded-full hover:bg-blue-500 transition-colors"
//                         >
//                           <X size={16} />
//                         </button>
//                         <button type="button"
//                           onClick={handleOpenChatPage}
//                           className="p-1 rounded-full hover:bg-blue-500 transition-colors"
//                           title="Open in full page"
//                         >
//                           <Maximize2 size={16} />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="flex-1 overflow-hidden bg-white dark:bg-[#070709] flex flex-col">
//                       {isLoading ? (
//                         <div className="flex justify-center items-center h-full">
//                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                         </div>
//                       ) : channel && member ? (
//                         <>
//                           <ChatHeader
//                             name={channel.name}
//                             serverId={channel.serverId}
//                             type="channel"
//                           />
//                           {channel.type === ChannelType.TEXT && (
//                             <>
//                               <div className="flex-1 overflow-auto">
//                                 <ChatMessages
//                                   member={member}
//                                   name={channel.name}
//                                   chatId={channel.id}
//                                   type="channel"
//                                   apiUrl="/api/messages"
//                                   socketUrl="/api/socket/messages"
//                                   socketQuery={{
//                                     channelId: channel.id,
//                                     serverId: channel.serverId
//                                   }}
//                                   paramKey="channelId"
//                                   paramValue={channel.id}
//                                 />
//                               </div>
//                               {/* <ChatInput
//                                 name={channel.name}
//                                 type="channel"
//                                 apiUrl="/api/socket/messages"
//                                 query={{
//                                   channelId: channel.id,
//                                   serverId: channel.serverId
//                                 }}
//                               /> */}
//                             </>
//                           )}
//                         </>
//                       ) : (
//                         <div className="flex justify-center items-center h-full">
//                           <p className="text-zinc-500">No channel selected</p>
//                         </div>
//                       )}
//                     </div>
//                   </motion.div>
//   )
// }

// // Notification Component
// const AnimatedNotification = ({ notification }: NotificationProps) => (
//    <div className="flex w-full max-w-[350px] items-center justify-between gap-4 rounded-2xl border border-neutral-50 bg-white p-3.5 shadow-xl shadow-neutral-200 dark:border-neutral-900 dark:bg-neutral-950 dark:shadow-neutral-950/70">
//       <img
//         src={notification.icon }
//         alt={notification.name}
//         className="h-10 w-10"
//       />
//       <div className="flex w-full flex-col">
//         <div className="flex w-full items-start justify-between">
//           <span className="text-sm font-medium">{notification.name}</span>
//           <span className="text-xs text-neutral-400">
//             {notification.timeAgo}
//           </span>
//         </div>
//         <span className="text-sm text-neutral-600 dark:text-neutral-400">
//           {notification.message}
//         </span>
//       </div>
//     </div>
// )

// const DefaultTimer = () => {
// const [time, setTime] = useState(60)

//   useMemo(() => {
//     const timer = setInterval(() => {
//       setTime((t) => (t > 0 ? t - 1 : 0))
//     }, 1000)
//     return () => clearInterval(timer)
//   }, [])

//   return (
//   <div className="text-foreground flex w-64 items-center gap-3 overflow-hidden px-4 py-2">
//       <TimerIcon className="h-5 w-5 text-amber-500" />
//       <div className="flex-1">
//         <p className="pointer-events-none text-sm font-medium text-white">
//           {time}s remaining
//         </p>
//       </div>
//       <div className="h-1 w-24 overflow-hidden rounded-full bg-white/20">
//         <motion.div
//           className="h-full bg-amber-500"
//           initial={{ width: "100%" }}
//           animate={{ width: "0%" }}
//           transition={{ duration: time, ease: "linear" }}
//         />
//       </div>
//     </div>
//   )
// }

// const PlusOption = () => {
//   return (
//   <TaskForm />
//   ) 
// }

// const Record = () => {
//  const [isRecording, setIsRecording] = useState(false);
//   const [clips, setClips] = useState<Clip[]>([]);

//   const handleRecordingComplete = async (blob: Blob, title: string) => {
//     const formData = new FormData();
//     formData.append('file', blob, `${title}.webm`);
//     formData.append('title', title);
//     formData.append('description', 'Screen recording');

//     try {
//       const response = await fetch('/api/clips/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         const newClip = await response.json();
//         setClips((prev) => [newClip, ...prev]);
//       } else {
//         console.error('Upload failed:', await response.text());
//       }
//     } catch (error) {
//       console.error('Upload failed:', error);
//     }
//   };

//   return (
//   <div className="text-foreground flex w-64 !rounded-md items-center gap-3 overflow-hidden px-4 py-2 bg-red-500">
//        <RecordingInterface
//                    onRecordingComplete={handleRecordingComplete}
//                    onRecordingStateChange={setIsRecording}
//                  />
//     </div>
//   )
// }

// // Music Player Component
// const MusicPlayer = () => {
//   const [data, setData] = useState([]);
//     const [playing, setPlaying] = useState(false);
//     const audioRef = useRef(null);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [audioURL, setAudioURL] = useState('');
//     const [isLooping, setIsLooping] = useState(false);
//     const values = useContext(MusicContext);
//     const displayName = typeof data?.name === 'string' ? data.name.slice(0, 12) : undefined;    

//     const getSong = async () => {
//       const get = await getSongsById(values.music);
//       const data = await get.json();
//       setData(data.data[0]);
//       if (data?.data[0]?.downloadUrl[2]?.url) {
//         setAudioURL(data?.data[0]?.downloadUrl[2]?.url);
//       } else if (data?.data[0]?.downloadUrl[1]?.url) {
//         setAudioURL(data?.data[0]?.downloadUrl[1]?.url);
//       } else {
//         setAudioURL(data?.data[0]?.downloadUrl[0]?.url);
//       }
//     };

//     const togglePlayPause = () => {
//       if (playing) {
//         audioRef.current.pause();
//       } else {
//         audioRef.current.play();
//       }
//       setPlaying(!playing);
//     };

//     const handleSeek = (e) => {
//       const seekTime = e[0];
//       audioRef.current.currentTime = seekTime;
//       setCurrentTime(seekTime);
//     };


//   useEffect(() => {
//       if (values?.music) {
//         getSong();
//         const storedTime = localStorage.getItem('c');

//         if (storedTime) {
//           const time = parseFloat(storedTime);
//           audioRef.current.currentTime = time + 1;
//           localStorage.removeItem('c');
//         }

//         setPlaying(
//           localStorage.getItem('p') === 'true' || !localStorage.getItem('p')
//         );

//         const handleTimeUpdate = () => {
//           try {
//             setCurrentTime(audioRef.current.currentTime);
//             setDuration(audioRef.current.duration);
//             localStorage.setItem('c', audioRef.current.currentTime);
//           } catch (e) {
//             setPlaying(false);
//           }
//         };

//         audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

//         return () => {
//           if (audioRef.current) {
//             audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
//           }
//         };
//       }
//     }, [values?.music]);

//   return (
//      <div>
//        <audio
//        aria-label="audio-player"
//                 autoPlay={playing}
//                 onPlay={() => setPlaying(true)}
//                 onPause={() => setPlaying(false)}
//                 onLoadedData={() => setDuration(audioRef.current.duration)}
//                 src={audioURL}
//                 ref={audioRef}
//               />
//       {!values?.music ? (
//          <div className="flex flex-col justify-between items-center gap-3 bg-gray-50 dark:bg-neutral-950 px-6 py-3 rounded-[14px] w-full max-w-xl mx-auto shadow-md">
//                               <img
//                                 className="h-20 w-20 rounded-lg"
//                                 src="https://i.scdn.co/image/ab67616d0000b27354e544672baa16145d67612b"
//                                 alt="Default Music"
//                               />
//                               <div className="flex text-center flex-col flex-1">
//                                 <p className="text-[16px] font-bold">
//                                   No music playing
//                                 </p>
//                               </div>
//                               <Link
//                                 href="/music/layout"
//                                 className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
//                               >
//                                 Play Music
//                               </Link>
//                             </div>
//                       ) : (
//     <div className="text-foreground flex w-72 items-center gap-3 overflow-hidden px-3 py-2">
//       <Image
//                               className="h-8 w-8 rounded-full object-cover"
//                               src={data?.image?.[2]?.url || 'https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-500x500.jpg'}
//                               alt={data?.name || 'cover'}
//                               width={1000}
//                               height={1000}
//                             />
//       <div className="min-w-0 flex-1">
//         <p className="pointer-events-none truncate text-sm font-medium text-white">
//           {(data?.name?.slice(0, 12) || (
//                           <Skeleton className="h-4 w-32" />
//                         )) + (data?.name?.length > 25 ? '...' : '')}
//         </p>
//         <p className="pointer-events-none truncate text-xs text-white opacity-70">
//            {(data?.artists?.primary?.[0]?.name?.slice(0, 12) || (
//                                     <Skeleton className="h-3 w-20" />
//                                   )) +
//                                     (data?.artists?.primary?.[0]?.name?.length > 18
//                                       ? '...'
//                                       : '')}
//         </p>
//       </div>
//       <button type="button"
//         onClick={() => setPlaying(false)}
//         className="rounded-full p-1 hover:bg-white/30"
//       >
//         <SkipBack className="h-4 w-4 text-white" />
//       </button>
//       <button type="button"
//         onClick={togglePlayPause}
//         className="rounded-full p-1 hover:bg-white/30"
//       >
//         {playing ? (
//           <Pause className="h-4 w-4 text-white" />
//         ) : (
//           <Play className="h-4 w-4 text-white" />
//         )}
//       </button>
//       <button type="button"
//         onClick={() => setPlaying(true)}
//         className="rounded-full p-1 hover:bg-white/30"
//       >
//         <SkipForward className="h-4 w-4 text-white" />
//       </button>
//     </div>
//      )}
//     </div>
//   )
// }

// // ═══════════════════════════════════════════════════════════════
// // CONFIGURABLE OPTIONS FOR DYNAMIC ISLAND
// // ═══════════════════════════════════════════════════════════════

// export type IslandOption = "record" | "ring" | "timer" | "chat" | "ask" | "notification-bell" | "music" | "plus"

// export type View = "idle" | "ring" | "timer" | "notification" | "music" | "chat" | "ask" | "record" | "notification-bell" | "plus"

// export interface DynamicIslandProps {
//   view?: View
//   onViewChange?: (view: View) => void
//   idleContent?: ReactNode
//   ringContent?: ReactNode
//   timerContent?: ReactNode
//   chatContent?: ReactNode
//   className?: string
//   /** Which island options to show in the dock. Defaults to all. */
//   options?: IslandOption[]
// }

// // Map each option to its icon component
// const OPTION_CONFIG: Record<IslandOption, { icon: React.ReactNode }> = {
//   record: { icon: <Disc3 className="size-4" /> },
//   ring: { icon: <PhoneCall className="size-4" /> },
//   timer: { icon: <Timer className="size-4" /> },
//   chat: { icon: <MessageCircleMore className="size-4" /> },
//   ask: { icon: <BotIcon className="size-4" /> },
//   "notification-bell": { icon: <NotificationBell /> },
//   music: { icon: <Music2 className="size-4" /> },
//   plus: { icon: <PlusCircleIcon className="size-4"/> },
// }

// // ALL available options
// const ALL_OPTIONS: IslandOption[] = [
//   "record", "ring", "timer", "chat", "ask", "notification-bell", "music", "plus"
// ]

// export default function DynamicIsland({
//   view: controlledView,
//   onViewChange,
//   idleContent,
//   ringContent,
//   timerContent,
//   chatContent,
//   className = "",
//   options,
// }: DynamicIslandProps) {
//   const [internalView, setInternalView] = useState<View>()
//   const [variantKey, setVariantKey] = useState<string>()

//   const view = controlledView ?? internalView

//   // Resolve options - use provided or fall back to all
//   const resolvedOptions = options ?? ALL_OPTIONS

//   const content = useMemo(() => {
//     switch (view) {
//       case "ring":
//         return ringContent ?? <DefaultRing />
//       case "chat":
//         return chatContent ?? <Chat />
//       case "notification":
//         return <Notification />
//       case "timer":
//         return <DefaultTimer />
//       case "music":
//         return <MusicPlayer />
//       case "record":
//         return <Record />
//       case "plus":
//         return <PlusOption />
//     }
//   }, [view, idleContent, ringContent, timerContent, chatContent])

//   const handleViewChange = (newView: View) => {
//     if (view === newView) return
//     setVariantKey(`${view}-${newView}`)
//     if (onViewChange) onViewChange(newView)
//     else setInternalView(newView)
//   }

//   // Build the dock items from the resolved options
//   const dockItems = useMemo(() => {
//     return resolvedOptions.map((key) => ({
//       key,
//       icon: OPTION_CONFIG[key].icon,
//     }))
//   }, [resolvedOptions])

//   return (
//     <MusicProvider>
//     <div className={` h-full  ${className}`}>
//       <div className="relative flex h-full w-full flex-col justify-center">
//         <motion.div
//           layout
//           transition={{
//             type: "spring",
//             bounce:
//               BOUNCE_VARIANTS[variantKey as keyof typeof BOUNCE_VARIANTS] ??
//               0.5,
//           }}
//           style={{ borderRadius: 32 }}
//           className=" w-fit absolute top-10 !-right-5 z-50 overflow-hidden rounded-full bg-black"
//         >
//           <motion.div
//             transition={{
//               type: "spring",
//               bounce:
//                 BOUNCE_VARIANTS[variantKey as keyof typeof BOUNCE_VARIANTS] ??
//                 0.5,
//             }}
//             initial={{
//               scale: 0.9,
//               opacity: 0,
//               filter: "blur(5px)",
//               originX: 0.5,
//               originY: 0.5,
//             }}
//             animate={{
//               scale: 1,
//               opacity: 1,
//               filter: "blur(0px)",
//               originX: 0.5,
//               originY: 0.5,
//               transition: { delay: 0.05 },
//             }}
//             key={view}
//           >
//             {content}
//           </motion.div>
//         </motion.div>

//         <div className=" z-10 flex justify-center rounded-full  gap-0.5 px-0 text-[#B4B4B4]">
//           {dockItems.map(({ key, icon }) => (
//            <AnimateIcon animateOnHover key={key}>
//              <button 
//               type="button"
//               className=" flex size-6 px-0 cursor-pointer hover:dark:bg-[#000] hover:bg-[#fff] items-center justify-center rounded-full "
//               onClick={() => {
//                 if (view !== key) {
//                   setVariantKey(`${view}-${key}`)
//                   handleViewChange(key as View)
//                 }
//               }}
//               aria-label={key}
//             >
//               {icon}
//             </button>
//             </AnimateIcon>
//           ))}
//         </div>

//       </div>
//     </div>
//     </MusicProvider>
//   )
// }

// export function Notification() {
//   const notifications: NotificationData[] = [
//     {
//       id: 1,
//       name: "Location",
//       message: "Thomas has arrived home",
//       timeAgo: "2h ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-1.png",
//     },
//     {
//       id: 2,
//       name: "Fitness Tracker",
//       message: "You've reached your daily step goal!",
//       timeAgo: "1h ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-2.png",
//     },
//     {
//       id: 3,
//       name: "Calendar",
//       message: "Meeting with team in 30 minutes",
//       timeAgo: "45m ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-3.png",
//     },
//     {
//       id: 4,
//       name: "Task Manager",
//       message: "3 tasks due today",
//       timeAgo: "1d ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-4.png",
//     },
//     {
//       id: 5,
//       name: "Health",
//       message: "Your heart rate is elevated.",
//       timeAgo: "3h ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-5.png",
//     },
//     {
//       id: 6,
//       name: "Email",
//       message: "New message from your manager",
//       timeAgo: "5m ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-6.png",
//     },
//     {
//       id: 7,
//       name: "TikTok",
//       message: "Your video got 1000 likes!",
//       timeAgo: "2d ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-7.png",
//     },
//     {
//       id: 8,
//       name: "Grandpa",
//       message: "How are you doing, my dear?",
//       timeAgo: "1w ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-8.png",
//     },
//     {
//       id: 9,
//       name: "Clara",
//       message: "Let's meet for coffee tomorrow!",
//       timeAgo: "2d ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-9.png",
//     },
//     {
//       id: 10,
//       name: "Sarah",
//       message: "Did you see the new movie?",
//       timeAgo: "4h ago",
//       icon: "https://cdn.badtz-ui.com/components/notification-icons/icon-10.png",
//     },
//   ]
//   return (
//     <div className="">

//         {notifications.map((notification) => (
//           <AnimatedNotification key={notification.id} notification={notification} />
//         ))}

//     </div>
//   )
// }


// function TaskForm(props: { children?: React.ReactNode }) {
//   const { children } = props;
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [priority, setPriority] = useState('3');
//   const [createdAt, setCreatedAt] = useState<Dayjs | null>(null);
//   const [dueTime, setDueTime] = useState<Dayjs | null>(null);
//   const [category, setCategory] = useState<Category | null>(null);
//   const isFormValid = title.trim() !== '' && dueTime !== null;
//   const [isOpen, setIsOpen] = useState(false);
//   const [files, setFiles] = useState<FileWithPreview[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const Router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [showUpload, setShowUpload] = useState(true);
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const { data: session, status } = useSession();
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     duration: 30,
//     locationType: '',
//   });
//   const [error, setError] = useState<string | null>(null);

//   const handleNewTask = async () => {
//     if (!isFormValid) return;
//     setIsLoading(true);
//     const taskData = {
//       title,
//       description,
//       priority,
//       createdAt: createdAt ? createdAt.toISOString() : null,
//       dueTime: dueTime ? dueTime.toISOString() : null,
//       category: category ? category : null,
//     };

//     try {
//       const response = await fetch('/api/task', {
//         method: 'POST',
//         body: JSON.stringify(taskData),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       if (response.ok) {
//         router.refresh();
//       }
//     } catch (error) {
//       console.error('Error creating new task:', error);
//     }
//     setIsLoading(false);
//   };

//  if (status === 'unauthenticated') {
//      redirect('/auth/login');
//   }

//   const createEventMutation = useMutation({
//     mutationFn: async (data: typeof formData) => {
//       const response = await fetch('/api/event/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });
//       if (!response.ok) throw new Error('Failed to create event');
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['events'] });
//       router.refresh();
//       setIsOpen(false);
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     setError(null);
//     createEventMutation.mutate(formData);
//   };

//   const locationOptions = [
//     {
//       id: 'JITSI_MEET',
//       label: 'Conferio',
//       logo: 'https://res.cloudinary.com/kanishkkcloud18/image/upload/v1718475378/CONFERIO/gbkp0siuxyro0cgjq9rq.png',
//     },
//     {
//       id: 'GOOGLE_MEET_AND_CALENDAR',
//       label: 'Google ',
//       logo: 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_18_2x.png',
//     },
//     {
//       id: 'ZOOM_MEETING',
//       label: 'Zoom',
//       logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFrklEQVR4AaWXA5QjSxSG/6pgmGcsn23btm2tbdu2bdu2bdsaxUlV3VdzOpNNz3Q2iz7nOzcp/X/futVJcyS4ni1Jjsdr+d94ura/wTN1vWNfqO9d/WJDz6lXGrszXmvqlm82z5Fvt8zOeK919skP22at/qR95tjPOmbW/6Jz5htvNSY7ElxxDTxYk1z3Vww2cKcGDwvBloQkmgrJvg9L9qKOhTQ36nYeIfdz4bBgL4YF/17HZkJgSfp1WYe1kfrf9zibfkUGipQSn/s8YmdYsaZCsSJaDEIYhGOj1FEjJI9Elj8WFQLNAkHHzi86ZXx6WQZu/VdWEgqTtUixgmIJRE0mucZo1xSXik37otOFxpc04PqDaocE66wn8rBMLBoVy0OayG+QhSVv9FnHrBqWBlJ/Fp8rqVrEFRUWSM2VZUVHtP6oQ8YnJgO3/EMuxmRPkOIgCaVgKZYwKxZ1YmGKK8F7v6ULM2rA5/NVBsliGuRBpCAV4oteuig1zBpjbHF7jrOSYeAtsoNkKS0YEVcwGVEqMpFbi1kTNyvRG1C87LN9yMGTb816FSSLakARYGFGGUYsSZwVywIuknLO/SLnTLwBkiZBin4vaEYqxNxZVNSy8qXKJ5q/mEPsTc6Uejz2Tht878T2LqnY1iUF2zonaZzY1smhsWFLe44KHxFIGfXhdDC0/JnjYHcbjvW0YUoNG567x4bHinOMrODAzvZObGqVhKbfOZDqMETNBtnjnJS8M3qHkBi5JAAhCXffxiOwKPcWYqj2OQNIwsYUJlcHSr4HpCUBQgHP3sMwuhLHuCo2vHgfg1JAkgP49kUbhpR1AjBvRUjwOzlg7H8eB06F8FSlTBT+KwNF/8nSZOP3zn49CQCAXnMEQBI/vEx46QFgz0ng4UqEQv8BXWYCTjuQ7ACGLCHcV0ni2doCW48SHirC8P1LdlN9SMmKcpB0aQoUXY5XIMsj8PTdHH3LJsNhAzpODaL1xCBAEi/cZxjqOVvg2HmpF5RoMo6iRpuOB7wBhpMZDD3nEADgqTsLFK+LE8lUImVZdK89bMOYmulIcTJ0nR5AgxH+6DPCaTcWzfYqAMb4kFb3Bw0DGe6LQhkeBgB6ToFnRRrPEzabkFrcjol1b9D7q8Wn+VBnqNvUf/Eiy3alVEyxRUYSChxVzkj5oiYMtLgTE+vdbIhP9aDOkGyLZ0PeqgqUS2wbEB2nIsfWMFXgSHq5nuiOXfSFBxyY3PA2pCUzDJjrRpvx2bghjXBDKsGVHCtOJiEY5mPaZQyUlytTDYSIuTlInYgd/Pf7Lr3nhuN/P3DhxNCiODGkiKYQTg8rhFXtbkKhGygqdOC0MGXm4BkdAVPboTO55qAh02NdhnGCg8SR2MFD5mZiy8EADp0O64l5iCiuFIbvXknCyQsS9Ye7sXF/0FTA5fr4sGpPdDsNU9pk1SECR89R/sf6EU5KbgMuZmD1Lg9ernwQj5bcr8mNh/BoqcN4tPRRzTE8VuYEuk/LRvPRWeg0KafA8d18MIT3GuZASqMtrz76zQ2j9rCQabyQfBsH1FJY/xJatlEuicZbtJFFnw1iMQ/4vSuI5PF4Pz6A9eIU4RrMH3OfsK/hWPy2AIk+RqriLaCs2yBBCcbHN696YzETHAACjqSOIHk4TqoSLmppHpc0c9QnvV0v/imd9pyPIMuDpLrWfaa446NRMZKlMO42j+lfcXDOGzOYEnWudZ+RwDwjVcs77ubZlu8F/nlvtSVSlXNdmlNsgARmEpgnkGjiHX97+0u+GQXnvdlFT/wcJI9ZHqUrLDoyOMJIfOKbWDz+m5HZxDszA2F6BErWB6nj8Y9SQjPHiEQ9v8/9qHfS3bOv6O1YH09PYP7bLQIhdTdT8nWQbAClxkLJ1ZoTRDJTI0FKIzM1JzSrQGosETXQ8XV/zql7AlMebIm5T3oR5/ofW/oZFougXt8AAAAASUVORK5CYII=',
//     },
//   ];

//   useEffect(() => {
//     return () => {
//       files.forEach((file) => {
//         if (file.preview) URL.revokeObjectURL(file.preview);
//       });
//     };
//   }, [files]);

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     const filesWithPreview = acceptedFiles.map((file) => {
//       const fileWithPreview = file as FileWithPreview;
//       if (file.type.startsWith('image/')) {
//         fileWithPreview.preview = URL.createObjectURL(file);
//       }
//       return fileWithPreview;
//     });
//     setFiles((prev) => [...prev, ...filesWithPreview]);
//   }, []);

//   const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
//     onDrop,
//     multiple: true,
//     accept: {
//       'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
//       'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
//       'audio/*': ['.mp3', '.wav', '.ogg'],
//       'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
//     },
//   });

//   const removeFile = (index: number) => {
//     setFiles((prev) => {
//       const newFiles = [...prev];
//       if (newFiles[index].preview) {
//         URL.revokeObjectURL(newFiles[index].preview!);
//       }
//       newFiles.splice(index, 1);
//       return newFiles;
//     });
//   };

//   const getFileIcon = (mimeType: string) => {
//     if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
//     if (mimeType.startsWith('video/')) return <Video className="h-8 w-8" />;
//     if (mimeType.startsWith('audio/')) return <Music className="h-8 w-8" />;
//     return <File className="h-8 w-8" />;
//   };

//   const handleUpload = async () => {
//     if (files.length === 0) {
//       toast.error('Please select files to upload');
//       return;
//     }

//     setUploading(true);
//     setUploadProgress(0);

//     // Simulate progress (real implementation would use actual upload progress)
//     const interval = setInterval(() => {
//       setUploadProgress((prev) => {
//         if (prev >= 90) return prev;
//         return prev + 10;
//       });
//     }, 200);

//     try {
//       const formData = new FormData();
//       files.forEach((file) => {
//         formData.append('files', file);
//       });

//       const response = await fetch('/api/files/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       clearInterval(interval);
//       setUploadProgress(100);

//       const result = await response.json();

//       if (response.ok) {
//         toast.success(result.message || 'Upload successful!');
//         // Wait a moment to show 100% progress before closing
//         setTimeout(() => {
//           setFiles([]);
//           setIsOpen(false);
//           Router.refresh();
//         }, 500);
//       } else {
//         toast.error(result.message || 'Upload failed');
//       }
//     } catch (error) {
//       clearInterval(interval);
//       toast.error('Upload failed. Please try again.');
//     } finally {
//       setTimeout(() => {
//         setUploading(false);
//         setUploadProgress(0);
//       }, 500);
//     }
//   };

//   const totalSize = files.reduce((sum, file) => sum + file.size, 0);

//   if (status === 'loading') {
//     return (
//       <div className="h-full w-full flex items-center justify-center">
//         <LazyLoader/>
//       </div>
//     );
//   }

//   if (status === 'unauthenticated') {
//     return null;
//   }

//   return (
//     <Tabs defaultValue="reminder" className="">
//       <Loading isLoading={isLoading} />

//         <div className="!min-h-[65%] !h-[70%] !max-h-[90%] dark:bg-neutral-900 bg-white border border-transparent dark:border-neutral-800 md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden">
//           <TabsList className="h-auto gap-3 rounded-none bg-transparent p-0 pt-2 px-4">
//             <TabsTrigger
//               value="reminder"
//               className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
//             >
//               Reminder
//             </TabsTrigger>
//             <TabsTrigger
//               value="drive"
//               className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
//             >
//               Drive
//             </TabsTrigger>
//             <TabsTrigger
//               value="docs"
//               className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
//             >
//               Docs
//             </TabsTrigger>
//             <TabsTrigger
//               value="notes"
//               className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
//             >
//               Notes
//             </TabsTrigger>
//             <TabsTrigger
//               value="event"
//               className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
//             >
//               Events
//             </TabsTrigger>
//           </TabsList>
//           <Separator />
//           <TabsContent value="reminder" className=" flex flex-col ">
//             <ModalContent className="!px-6 gap-y-4 pb-0">
//               <div className="flex justify-start items-center gap-2">
//                 <DropDownCategory
//                   categoryToSend={category}
//                   setCategory={setCategory}
//                 />

//                 <Select>
//                   <SelectTrigger className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
//                     <Disc2 className="h-4 w-4 mr-1" />{' '}
//                     <SelectValue placeholder="Task" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="light">Light</SelectItem>
//                     <SelectItem value="dark">Dark</SelectItem>
//                     <SelectItem value="system">System</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="px-0 gap-y-2">
//                 <Input
//                   placeholder="Task Name"
//                   className="border-none font-semibold !text-xl hover:bg-muted"
//                   value={title}
//                   onChange={(e) => {
//                     setTitle(e.target.value);
//                   }}
//                 />
//                 <Textarea
//                   placeholder="Add Description"
//                   className="border-none text-xs hover:bg-muted h-fit"
//                   value={description}
//                   onChange={(e) => {
//                     setDescription(e.target.value);
//                   }}
//                 />
//               </div>

//               <div className="flex justify-start items-center gap-2 ">
//                 <Select defaultValue="3">
//                   <SelectTrigger className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
//                     <SelectItem value="1">
//                       <span className="flex items-center gap-2">
//                         <StatusDot className="text-emerald-600" />
//                         <span className="truncate">Completed</span>
//                       </span>
//                     </SelectItem>
//                     <SelectItem value="2">
//                       <span className="flex items-center gap-2">
//                         <StatusDot className="text-blue-500" />
//                         <span className="truncate">In Progress</span>
//                       </span>
//                     </SelectItem>
//                     <SelectItem value="3">
//                       <span className="flex items-center gap-2">
//                         <StatusDot className="text-amber-500" />
//                         <span className="truncate">To Do</span>
//                       </span>
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Select>
//                   <SelectTrigger className="w-fit !px-1.5 dark:!text-white !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] !text-black overflow-hidden text-xs">
//                     <SelectValue placeholder="Assignee" className='!text-white' />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       <SelectLabel className="text-xs py-1 font-normal text-muted-foreground ps-2">
//                         Select a user
//                       </SelectLabel>
//                       <SelectItem value="1">
//                         <span className="flex items-center gap-2">
//                           <Avatar className="size-6">
//                             <AvatarImage src="" alt="@reui" />
//                             <AvatarFallback>AB</AvatarFallback>
//                           </Avatar>
//                           <span>Alan Bold</span>
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="2">
//                         <span className="flex items-center gap-2">
//                           <Avatar className="size-6">
//                             <AvatarImage src="" alt="@reui" />
//                             <AvatarFallback>EJ</AvatarFallback>
//                           </Avatar>
//                           <span>Ethan James</span>
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="3">
//                         <span className="flex items-center gap-2">
//                           <Avatar className="size-6">
//                             <AvatarImage src="" alt="@reui" />
//                             <AvatarFallback>NK</AvatarFallback>
//                           </Avatar>
//                           <span>Nina Clark</span>
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="4">
//                         <span className="flex items-center gap-2">
//                           <Avatar className="size-6">
//                             <AvatarImage src="" alt="@reui" />
//                             <AvatarFallback>JA</AvatarFallback>
//                           </Avatar>
//                           <span>Sean Otto</span>
//                         </span>
//                       </SelectItem>
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>

//                 {/* <PopoverDatePicker date={createdAt} setDate={setCreatedAt} /> */}
//                 <PopoverDatePicker date={dueTime} setDate={setDueTime} />

//                 <Select value={priority} onValueChange={setPriority}>
//                   <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80 w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
//                     <Flag className="h-4 w-4 mr-1" />{' '}
//                     <SelectValue placeholder="Assignee" />
//                   </SelectTrigger>

//                   <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
//                     <SelectItem value="high">
//                       <RiReactjsLine size={16} aria-hidden="true" />
//                       <span className="truncate">High</span>
//                     </SelectItem>

//                     <SelectItem value="medium">
//                       <RiNextjsLine size={16} aria-hidden="true" />
//                       <span className="truncate">Medium</span>
//                     </SelectItem>

//                     <SelectItem value="low">
//                       <RiGatsbyLine size={16} aria-hidden="true" />
//                       <span className="truncate">Low</span>
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       size="icon"
//                       variant="outline"
//                       className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs"
//                       aria-label="Open edit menu"
//                     >
//                       <EllipsisIcon size={16} aria-hidden="true" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent>
//                     <DropdownMenuItem>Option 1</DropdownMenuItem>
//                     <DropdownMenuItem>Option 2</DropdownMenuItem>
//                     <DropdownMenuItem>Option 3</DropdownMenuItem>
//                     <DropdownMenuItem>Option 4</DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </ModalContent>
//             <ModalFooter className="dark:bg-neutral-950 mt-auto">
//               <div className="">
//                 <Button
//                   onClick={handleNewTask}
//                   disabled={!isFormValid}
//                   className={`font-semibold rounded-lg ${
//                     isFormValid
//                       ? 'text-white bg-[#6347EA] hover:text-white'
//                       : 'text-white bg-[#6347EA] cursor-not-allowed'
//                   }`}
//                 >
//                   Create Task
//                 </Button>
//               </div>
//             </ModalFooter>
//           </TabsContent>
//           {/* drive */}
//           <TabsContent value="drive" className="!h-full">
//             {/* <div className="gap-y-4 !h-full min-h-full">
//                     <Card
//                       {...getRootProps()}
//                       className={`border-2 border-dashed p-2 text-center cursor-pointer transition-colors ${
//                         isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
//                       }`}
//                     >
//                       <input {...getInputProps()} />
//                       <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
//                       {isDragActive ? (
//                         <p>Drop the files here...</p>
//                       ) : (
//                         <div>
//                           <p className="text-lg font-medium">Drop files here or click to browse</p>
//                           <p className="text-sm text-muted-foreground mt-2">
//                             Supports images, videos, audio, and documents
//                           </p>
//                           <Button 
//                             type="button"
//                             variant="outline"
//                             className="mt-4"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               open();
//                             }}
//                           >
//                             Select Files
//                           </Button>
//                         </div>
//                       )}
//                     </Card>

//                     {files.length > 0 && (
//                       <div className="gap-y-4">
//                         <div className="flex items-center justify-between">
//                           <h3 className="font-medium">Selected Files ({files.length})</h3>
//                           <p className="text-sm text-muted-foreground">
//                             Total: {formatBytes(totalSize)}
//                           </p>
//                         </div>

//                         <div className="gap-y-2 max-h-60 overflow-y-auto">
//                           {files.map((file, index) => (
//                             <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
//                               {file.preview ? (
//                                 <img
//                                   src={file.preview}
//                                   alt={file.name}
//                                   className="h-12 w-12 object-cover rounded"
//                                 />
//                               ) : (
//                                 <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
//                                   {getFileIcon(file.type)}
//                                 </div>
//                               )}
//                               <div className="flex-1 min-w-0">
//                                 <p className="font-medium truncate">{file.name}</p>
//                                 <p className="text-sm text-muted-foreground">
//                                   {formatBytes(file.size)}
//                                 </p>
//                               </div>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => removeFile(index)}
//                                 disabled={uploading}
//                               >
//                                 <X className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           ))}
//                         </div>

//                         {uploading && (
//                           <div className="gap-y-2">
//                             <div className="flex items-center justify-between text-sm">
//                               <span>Uploading...</span>
//                               <span>{uploadProgress}%</span>
//                             </div>
//                             <Progress value={uploadProgress} />
//                           </div>
//                         )}

//                         <div className="flex gap-2">
//                           <Button
//                             onClick={handleUpload}
//                             disabled={uploading}
//                             className="flex-1"
//                           >
//                             {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
//                           </Button>
//                           <Button
//                             variant="outline"
//                             onClick={() => setFiles([])}
//                             disabled={uploading}
//                           >
//                             Clear All
//                           </Button>
//                         </div>
//                       </div>
//                     )}
//                   </div> */}
//             <div className="relative h-screen w-full overflow-hidden bg-[#020208]">
//               <img
//                 src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon.png"
//                 alt=""
//                 className="absolute !-bottom-24 object-cover left-1/2 -translate-x-1/2 w-full h-full "
//               />

//               <div className="relative z-10 flex items-start justify-center h-full px-4">
//                 <FileUploadCard />
//               </div>
//             </div>
//           </TabsContent>

//           <TabsContent value="event" className="h-full w-full">
//             <ScrollArea className="min-h-screen !h-screen !overflow-y-auto w-full py-0">
//               <form
//                 onSubmit={handleSubmit}
//                 className="!w-full !px-0 flex flex-col justify-between min-h-full !h-full"
//               >
//                 <div className="space-y-6 !w-full py-6 !px-12 min-w-full">
//                   <div className="group relative">
//                     <label htmlFor="task-event-title" className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50">
//                       Event Title
//                     </label>
//                     <Input
//                       id="task-event-title"
//                       className="h-10"
//                       placeholder="e.g., 30 Minute Meeting"
//                       type="text"
//                       value={formData.title}
//                       onChange={(e) =>
//                         setFormData({ ...formData, title: e.target.value })
//                       }
//                       required
//                     />
//                   </div>

//                   <div className="group relative">
//                     <Label htmlFor="task-event-description" className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50">
//                       Description
//                     </Label>
//                     <Textarea
//                       id="task-event-description"
//                       rows={1}
//                       value={formData.description}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           description: e.target.value,
//                         })
//                       }
//                       placeholder="Description of the meeting"
//                     />
//                   </div>

//                    <div className="group relative">
//                     <label htmlFor="task-event-duration" className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50">
//                       Duration (min) *
//                     </label>
//                     <Input
//                       id="task-event-duration"
//                       className="h-10"
//                       type="number"
//                       value={formData.duration}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           duration: parseInt(e.target.value),
//                         })
//                       }
//                       min="1"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <div className="block text-sm font-medium text-gray-700 mb-2">
//                       Location Type *
//                     </div>
//                     <div className="flex justify-start items-center gap-4">
//                       {locationOptions.map((opt) => (
//                         <Card
//                           key={opt.id}
//                           onClick={() =>
//                             setFormData({ ...formData, locationType: opt.id })
//                           }
//                           className={`cursor-pointer w-24 h-20 p-0 flex justify-center items-center  transition-all ${
//                             formData.locationType === opt.id
//                               ? 'border border-blue-600 shadow-lg'
//                               : 'border'
//                           }`}
//                         >
//                           <CardContent className="flex bg-transparent flex-col items-center justify-center gap-y-1 p-0">
//                             <Image
//                               src={opt.logo}
//                               alt={opt.label}
//                               width={28}
//                               height={28}
//                             />
//                             <span className="text-sm font-medium">
//                               {opt.label}
//                             </span>
//                           </CardContent>
//                         </Card>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Error if Google not verified */}
//                   {error && (
//                     <div className="text-red-600 text-sm mt-2">
//                       {error}{' '}
//                       <Link
//                         href="/settings"
//                         className="underline text-blue-600"
//                       >
//                         Go to settings
//                       </Link>
//                     </div>
//                   )}
//                 </div>
//                 <div className="dark:bg-neutral-950 bg-gray-100 !mt-auto flex justify-end px-6 items-end h-full py-5">
//                   <Button
//                     type="submit"
//                     disabled={createEventMutation.isPending}
//                   >
//                     {createEventMutation.isPending ? 'Creating...' : 'Create'}
//                   </Button>
//                 </div>
//               </form>
//             </ScrollArea>
//           </TabsContent>
//         </div>
//     </Tabs>
//   );
// }

// function StatusDot({ className }: { className?: string }) {
//   return (
//     <svg
//       width="8"
//       height="8"
//       fill="currentColor"
//       viewBox="0 0 8 8"
//       xmlns="http://www.w3.org/2000/svg"
//       className={className}
//       aria-hidden="true"
//     >
//       <circle cx="4" cy="4" r="4" />
//     </svg>
//   );
// }


"use client"

import { ReactNode, useMemo, useLayoutEffect } from "react"
import {
  Bell,
  CloudLightning,
  Music2,
  Pause,
  Phone,
  Play,
  Plus,
  PlusCircleIcon,
  SkipBack,
  SkipForward,
  Thermometer,
  Timer as TimerIcon,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRouter } from 'next/navigation'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import { ChannelType } from "@prisma/client"
import { ChatHeader } from "@/components/chat-components/chat/chat-header"
// import { ChatInput } from "@/components/chat-components/chat/chat-input"
import { ChatMessages } from "@/components/chat-components/chat/chat-messages"
import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getSongsById } from '@/lib/fetch';
import { MusicContext } from 'hooks/use-context';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFooter,
  FloatingPanelForm,
  FloatingPanelLabel,
  FloatingPanelRoot,
  FloatingPanelSubmitButton,
  FloatingPanelTextarea,
  FloatingPanelTrigger,
  useFloatingPanel,
} from "@/components/ui/floatingPanel"
import { AnimateIcon } from "../animate-ui/icons/icon"
import { Disc3 } from "../animate-ui/icons/disc-3"
import { PhoneCall } from "../animate-ui/icons/phone-call"
import { BellRing } from "../animate-ui/icons/bell-ring"
import { Timer } from "../animate-ui/icons/timer"
import { BotIcon } from "../animate-ui/icons/bot"
import { MessageCircleMore } from "../animate-ui/icons/message-circle-more"
import { Clip } from '@prisma/client';
import RecordingInterface from "../clips/RecordingInterface"
import { AnimatedList } from "@/components/ui/animated-list";
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { PlusIcon } from "../animate-ui/icons/plus"
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Dayjs } from 'dayjs';
import { RadioGroupDemo } from '../radio-group-demo';
import { DropDownCategory } from '../categories/select-category';
import Category from 'interfaces/category';
import Loading from '../common/loading';
import { redirect } from 'next/navigation';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '../ui/animated-modal';
import {
  ArrowRight,
  Calendar,
  CloudUpload,
  Disc2,
  EllipsisIcon,
  Flag,
  PlusCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RiGatsbyLine, RiNextjsLine, RiReactjsLine } from '@remixicon/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PopoverDatePicker from '../ui/popoverPicker';
import { Separator } from '../ui/separator';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { Upload, File, ImageIcon, Video, Music } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { FileUploadCard } from '../file-manager/components/FileUploadCard';
import { ScrollArea } from '../ui/scroll-area';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import LazyLoader from '../loader/lazyloader';
import {
  Send, Smile,
  Reply, Bookmark, Loader2, ChevronDown, FileIcon,
  ZoomIn, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/animate-ui/components/animate/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { TimeEntryWidget } from "../time-tracking/TimeEntryModal"
import CallHistory from '@/components/calls/CallHistory';
import IncomingCallModal from 'components/calls/IncomingCallModal';
import { useCall } from 'contexts/CallContext';
import {Mic, Users, History} from 'lucide-react';
import { Player } from "../music/player"


interface FileWithPreview extends File {
  preview?: string;
}

interface Channel { id: string; name: string; type: ChannelType; serverId: string; }
interface User { id: string; name: string; imageUrl: string; email: string; }
interface Member { id: string; role: string; userId: string; serverId: string; user: User; }
interface ChatInterfaceProps {
  channelId?: string;
  serverId?: string;
  type?: 'channel' | 'conversation';
  currentMember?: Member | null;
}

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|ogg)$/i;


interface NotificationData {
  id: number
  name: string
  message: string
  timeAgo: string
  icon: string
}
type NotificationProps = {
  notification: NotificationData
}

interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  serverId: string;
}

interface User {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
}

interface Member {
  id: string;
  role: string;
  userId: string;
  serverId: string;
  user: User;
}

interface DashboardProps {
  initialClips: Clip[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

// Animation variants
const ANIMATION_VARIANTS = {
  "ring-idle": { scale: 0.9, scaleX: 0.9, bounce: 0.5 },
  "timer-ring": { scale: 0.7, y: -7.5, bounce: 0.35 },
  "ring-timer": { scale: 1.4, y: 7.5, bounce: 0.35 },
  "timer-idle": { scale: 0.7, y: -7.5, bounce: 0.3 },
  "idle-timer": { scale: 1.2, y: 5, bounce: 0.3 },
  "idle-ring": { scale: 1.1, y: 3, bounce: 0.5 },
} as const

const BOUNCE_VARIANTS = {
  idle: 0.5,
  "ring-idle": 0.5,
  "timer-ring": 0.35,
  "ring-timer": 0.35,
  "timer-idle": 0.3,
  "idle-timer": 0.3,
  "idle-ring": 0.5,
} as const

const variants = {
  exit: (transition: any, custom: any) => {
    if (custom && custom.nextView === "idle") {
      return {
        opacity: [1, 0],
        scale: 0.7,
        filter: "blur(5px)",
        transition: { duration: 0.18, ease: "ease-in" },
      }
    }
    return {
      ...transition,
      opacity: [1, 0],
      filter: "blur(5px)",
    }
  },
}


// Ring Component
const TimeEntry = () => {
  return (
    <>
      <TimeEntryWidget/> 
    </>
  )
}


const PlusOption = () => {
  return (
    <TaskForm />
  )
}

const Record = () => {
 
  return (
    <FloatingPanelContent className="text-foreground !-ml-48 flex w-64 !rounded-md items-center gap-3 overflow-hidden px-4 py-2">
      <RecordingInterface/>
    </FloatingPanelContent>
  )
}

const MusicPlayer = () => {
  return(
        <FloatingPanelContent className="!max-w-auto flex h-fit !-ml-40 !bg-transparent !border-none">
          <Player />
        </FloatingPanelContent>
  )
}


export type IslandOption = "record" | "ring" | "timer" | "chat" | "ask" | "notification-bell" | "music" | "plus"

export type View = "idle" | "ring" | "timer" | "notification" | "music" | "chat" | "ask" | "record" | "notification-bell" | "plus"

export interface DynamicIslandProps {
  view?: View
  onViewChange?: (view: View) => void
  idleContent?: ReactNode
  ringContent?: ReactNode
  timerContent?: ReactNode
  chatContent?: ReactNode
  className?: string
  /** Which island options to show in the dock. Defaults to all. */
  options?: IslandOption[]
}

// Map each option to its icon component
const OPTION_CONFIG: Record<IslandOption, { icon: React.ReactNode }> = {
  record: { icon: <Disc3 className="size-4" /> },
  ring: { icon: <PhoneCall className="size-4" /> },
  timer: { icon: <Timer className="size-4" /> },
  chat: { icon: <MessageCircleMore className="size-4" /> },
  ask: { icon: <BotIcon className="size-4" /> },
  "notification-bell": { icon: <NotificationBell /> },
  music: { icon: <Music2 className="size-4" /> },
  plus: { icon: <PlusCircleIcon className="size-4" /> },
}


// ALL available options
const ALL_OPTIONS: IslandOption[] = [
  "record", "ring", "timer", "chat", "ask", "notification-bell", "music", "plus"
]

export default function DynamicIsland({
  view: controlledView,
  onViewChange,
  idleContent,
  ringContent,
  timerContent,
  chatContent,
  className = "",
  options,
}: DynamicIslandProps) {
  const [internalView, setInternalView] = useState<View>()
  const [variantKey, setVariantKey] = useState<string>()

  const view = controlledView ?? internalView

  // Resolve options - use provided or fall back to all
  const resolvedOptions = options ?? ALL_OPTIONS

  const content = useMemo(() => {
    switch (view) {
      case "ring":
        return ringContent ?? <Calls />
      case "chat":
        return chatContent ?? <Chat />
      // case "notification":
      //   return <Notification />
      case "timer":
        return <TimeEntry />
      case "music":
        return <MusicPlayer />
      case "record":
        return <Record />
      case "plus":
        return <PlusOption />
    }
  }, [view, idleContent, ringContent, timerContent, chatContent])

  const handleViewChange = (newView: View) => {
    if (view === newView) return
    setVariantKey(`${view}-${newView}`)
    if (onViewChange) onViewChange(newView)
    else setInternalView(newView)
  }

  // Build the dock items from the resolved options
  const dockItems = useMemo(() => {
    return resolvedOptions.map((key) => ({
      key,
      icon: OPTION_CONFIG[key].icon,
    }))
  }, [resolvedOptions])

  return (
    <FloatingPanelRoot>
      <DynamicIslandInner
        dockItems={dockItems}
        view={view}
        setVariantKey={setVariantKey}
        handleViewChange={handleViewChange}
        content={content}
      />
    </FloatingPanelRoot>
  )
}

/** Inner component so it can access FloatingPanel context provided by FloatingPanelRoot */
function DynamicIslandInner({
  dockItems,
  view,
  setVariantKey,
  handleViewChange,
  content,
}: {
  dockItems: { key: string; icon: React.ReactNode }[]
  view: View | undefined
  setVariantKey: (key: string) => void
  handleViewChange: (newView: View) => void
  content: React.ReactNode
}) {
  const { isOpen, openFloatingPanel, closeFloatingPanel } = useFloatingPanel()
  const buttonRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    if (isOpen) {
      closeFloatingPanel()
    } else if (buttonRef.current) {
      openFloatingPanel(buttonRef.current.getBoundingClientRect())
    }
  }

  return (
    <>
      <div ref={buttonRef} className=" z-10 flex justify-center rounded-full gap-0.5 px-0 text-[#B4B4B4]">
        {dockItems.map(({ key, icon }) => (
          <AnimateIcon animateOnHover key={key}>
            <button
              type="button"
              className=" flex size-6 px-0 cursor-pointer hover:dark:bg-[#000] hover:bg-[#fff] items-center justify-center rounded-full "
              onClick={() => {
                if (view !== key) {
                  setVariantKey(`${view}-${key}`)
                  handleViewChange(key as View)
                }
                handleClick()
              }}
              aria-label={key}
            >
              {icon}
            </button>
          </AnimateIcon>
        ))}
      </div>

      {isOpen && (
        <div key={view} className="!z-[9999] relative flex flex-col justify-center items-center">
          {content}
        </div>
      )}
    </>
  )
}

function TaskForm(props: { children?: React.ReactNode }) {
  const { children } = props;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('3');
  const [createdAt, setCreatedAt] = useState<Dayjs | null>(null);
  const [dueTime, setDueTime] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const isFormValid = title.trim() !== '' && dueTime !== null;
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const Router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    locationType: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleNewTask = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    const taskData = {
      title,
      description,
      priority,
      createdAt: createdAt ? createdAt.toISOString() : null,
      dueTime: dueTime ? dueTime.toISOString() : null,
      category: category ? category : null,
    };

    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        body: JSON.stringify(taskData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating new task:', error);
    }
    setIsLoading(false);
  };

  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/event/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.refresh();
      setIsOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    createEventMutation.mutate(formData);
  };

  const locationOptions = [
    {
      id: 'JITSI_MEET',
      label: 'Conferio',
      logo: 'https://res.cloudinary.com/kanishkkcloud18/image/upload/v1718475378/CONFERIO/gbkp0siuxyro0cgjq9rq.png',
    },
    {
      id: 'GOOGLE_MEET_AND_CALENDAR',
      label: 'Google ',
      logo: 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_18_2x.png',
    },
    {
      id: 'ZOOM_MEETING',
      label: 'Zoom',
      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFrklEQVR4AaWXA5QjSxSG/6pgmGcsn23btm2tbdu2bdu2bdsaxUlV3VdzOpNNz3Q2iz7nOzcp/X/futVJcyS4ni1Jjsdr+d94ura/wTN1vWNfqO9d/WJDz6lXGrszXmvqlm82z5Fvt8zOeK919skP22at/qR95tjPOmbW/6Jz5htvNSY7ElxxDTxYk1z3Vww2cKcGDwvBloQkmgrJvg9L9qKOhTQ36nYeIfdz4bBgL4YF/17HZkJgSfp1WYe1kfrf9zibfkUGipQSn/s8YmdYsaZCsSJaDEIYhGOj1FEjJI9Elj8WFQLNAkHHzi86ZXx6WQZu/VdWEgqTtUixgmIJRE0mucZo1xSXik37otOFxpc04PqDaocE66wn8rBMLBoVy0OayG+QhSVv9FnHrBqWBlJ/Fp8rqVrEFRUWSM2VZUVHtP6oQ8YnJgO3/EMuxmRPkOIgCaVgKZYwKxZ1YmGKK8F7v6ULM2rA5/NVBsliGuRBpCAV4oteuig1zBpjbHF7jrOSYeAtsoNkKS0YEVcwGVEqMpFbi1kTNyvRG1C87LN9yMGTb816FSSLakARYGFGGUYsSZwVywIuknLO/SLnTLwBkiZBin4vaEYqxNxZVNSy8qXKJ5q/mEPsTc6Uejz2Tht878T2LqnY1iUF2zonaZzY1smhsWFLe44KHxFIGfXhdDC0/JnjYHcbjvW0YUoNG567x4bHinOMrODAzvZObGqVhKbfOZDqMETNBtnjnJS8M3qHkBi5JAAhCXffxiOwKPcWYqj2OQNIwsYUJlcHSr4HpCUBQgHP3sMwuhLHuCo2vHgfg1JAkgP49kUbhpR1AjBvRUjwOzlg7H8eB06F8FSlTBT+KwNF/8nSZOP3zn49CQCAXnMEQBI/vEx46QFgz0ng4UqEQv8BXWYCTjuQ7ACGLCHcV0ni2doCW48SHirC8P1LdlN9SMmKcpB0aQoUXY5XIMsj8PTdHH3LJsNhAzpODaL1xCBAEi/cZxjqOVvg2HmpF5RoMo6iRpuOB7wBhpMZDD3nEADgqTsLFK+LE8lUImVZdK89bMOYmulIcTJ0nR5AgxH+6DPCaTcWzfYqAMb4kFb3Bw0DGe6LQhkeBgB6ToFnRRrPEzabkFrcjol1b9D7q8Wn+VBnqNvUf/Eiy3alVEyxRUYSChxVzkj5oiYMtLgTE+vdbIhP9aDOkGyLZ0PeqgqUS2wbEB2nIsfWMFXgSHq5nuiOXfSFBxyY3PA2pCUzDJjrRpvx2bghjXBDKsGVHCtOJiEY5mPaZQyUlytTDYSIuTlInYgd/Pf7Lr3nhuN/P3DhxNCiODGkiKYQTg8rhFXtbkKhGygqdOC0MGXm4BkdAVPboTO55qAh02NdhnGCg8SR2MFD5mZiy8EADp0O64l5iCiuFIbvXknCyQsS9Ye7sXF/0FTA5fr4sGpPdDsNU9pk1SECR89R/sf6EU5KbgMuZmD1Lg9ernwQj5bcr8mNh/BoqcN4tPRRzTE8VuYEuk/LRvPRWeg0KafA8d18MIT3GuZASqMtrz76zQ2j9rCQabyQfBsH1FJY/xJatlEuicZbtJFFnw1iMQ/4vSuI5PF4Pz6A9eIU4RrMH3OfsK/hWPy2AIk+RqriLaCs2yBBCcbHN696YzETHAACjqSOIHk4TqoSLmppHpc0c9QnvV0v/imd9pyPIMuDpLrWfaa446NRMZKlMO42j+lfcXDOGzOYEnWudZ+RwDwjVcs77ubZlu8F/nlvtSVSlXNdmlNsgARmEpgnkGjiHX97+0u+GQXnvdlFT/wcJI9ZHqUrLDoyOMJIfOKbWDz+m5HZxDszA2F6BErWB6nj8Y9SQjPHiEQ9v8/9qHfS3bOv6O1YH09PYP7bLQIhdTdT8nWQbAClxkLJ1ZoTRDJTI0FKIzM1JzSrQGosETXQ8XV/zql7AlMebIm5T3oR5/ofW/oZFougXt8AAAAASUVORK5CYII=',
    },
  ];

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map((file) => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });
    setFiles((prev) => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    if (mimeType.startsWith('video/')) return <Video className="h-8 w-8" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress (real implementation would use actual upload progress)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Upload successful!');
        // Wait a moment to show 100% progress before closing
        setTimeout(() => {
          setFiles([]);
          setIsOpen(false);
          Router.refresh();
        }, 500);
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error) {
      clearInterval(interval);
      toast.error('Upload failed. Please try again.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (status === 'loading') {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LazyLoader />
      </div>
    );
  }

  return (
    <FloatingPanelContent className="!-ml-72 dark:!bg-black">
      <Tabs defaultValue="reminder" className="">
        <Loading isLoading={isLoading} />

        <div className="!min-h-[65%] !h-[70%] !max-h-[90%] dark:bg-neutral-900 bg-white border border-transparent dark:border-neutral-800 md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden">
          <TabsList className="h-auto gap-3 rounded-none bg-transparent p-0 pt-2 px-4">
            <TabsTrigger
              value="reminder"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Reminder
            </TabsTrigger>
            <TabsTrigger
              value="drive"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Drive
            </TabsTrigger>
            <TabsTrigger
              value="docs"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Docs
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger
              value="event"
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              Events
            </TabsTrigger>
          </TabsList>
          <Separator />
          <TabsContent value="reminder" className=" flex flex-col ">
            <ModalContent className="!px-6 gap-y-4 pb-0">
              <div className="flex justify-start items-center gap-2">
                <DropDownCategory
                  categoryToSend={category}
                  setCategory={setCategory}
                />
                <Select>
                  <SelectTrigger className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
                    <Disc2 className="h-4 w-4 mr-1" />{' '}
                    <SelectValue placeholder="Task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="px-0 gap-y-2">
                <Input
                  placeholder="Task Name"
                  className="border-none font-semibold !text-xl hover:bg-muted"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                />
                <Textarea
                  placeholder="Add Description"
                  className="border-none text-xs hover:bg-muted h-fit"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
              </div>

              <div className="flex justify-start items-center gap-2 ">
                <Select defaultValue="3">
                  <SelectTrigger className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
                    <SelectItem value="1">
                      <span className="flex items-center gap-2">
                        <StatusDot className="text-emerald-600" />
                        <span className="truncate">Completed</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="2">
                      <span className="flex items-center gap-2">
                        <StatusDot className="text-blue-500" />
                        <span className="truncate">In Progress</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="3">
                      <span className="flex items-center gap-2">
                        <StatusDot className="text-amber-500" />
                        <span className="truncate">To Do</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-fit !px-1.5 dark:!text-white !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] !text-black overflow-hidden text-xs">
                    <SelectValue placeholder="Assignee" className='!text-white' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs py-1 font-normal text-muted-foreground ps-2">
                        Select a user
                      </SelectLabel>
                      <SelectItem value="1">
                        <span className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src="" alt="@reui" />
                            <AvatarFallback>AB</AvatarFallback>
                          </Avatar>
                          <span>Alan Bold</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="2">
                        <span className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src="" alt="@reui" />
                            <AvatarFallback>EJ</AvatarFallback>
                          </Avatar>
                          <span>Ethan James</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="3">
                        <span className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src="" alt="@reui" />
                            <AvatarFallback>NK</AvatarFallback>
                          </Avatar>
                          <span>Nina Clark</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="4">
                        <span className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src="" alt="@reui" />
                            <AvatarFallback>JA</AvatarFallback>
                          </Avatar>
                          <span>Sean Otto</span>
                        </span>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* <PopoverDatePicker date={createdAt} setDate={setCreatedAt} /> */}
                <PopoverDatePicker date={dueTime} setDate={setDueTime} />

                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80 w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
                    <Flag className="h-4 w-4 mr-1" />{' '}
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>

                  <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
                    <SelectItem value="high">
                      <RiReactjsLine size={16} aria-hidden="true" />
                      <span className="truncate">High</span>
                    </SelectItem>

                    <SelectItem value="medium">
                      <RiNextjsLine size={16} aria-hidden="true" />
                      <span className="truncate">Medium</span>
                    </SelectItem>

                    <SelectItem value="low">
                      <RiGatsbyLine size={16} aria-hidden="true" />
                      <span className="truncate">Low</span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs"
                      aria-label="Open edit menu"
                    >
                      <EllipsisIcon size={16} aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Option 1</DropdownMenuItem>
                    <DropdownMenuItem>Option 2</DropdownMenuItem>
                    <DropdownMenuItem>Option 3</DropdownMenuItem>
                    <DropdownMenuItem>Option 4</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </ModalContent>
            <ModalFooter className="dark:bg-neutral-950 mt-auto">
              <div className="">
                <Button
                  onClick={handleNewTask}
                  disabled={!isFormValid}
                  className={`font-semibold rounded-lg ${isFormValid
                      ? 'text-white bg-[#6347EA] hover:text-white'
                      : 'text-white bg-[#6347EA] cursor-not-allowed'
                    }`}
                >
                  Create Task
                </Button>
              </div>
            </ModalFooter>
          </TabsContent>
          {/* drive */}
          <TabsContent value="drive" className="">
            {/* <div className="gap-y-4 !h-full min-h-full">
                    <Card
                      {...getRootProps()}
                      className={`border-2 border-dashed p-2 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      {isDragActive ? (
                        <p>Drop the files here...</p>
                      ) : (
                        <div>
                          <p className="text-lg font-medium">Drop files here or click to browse</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Supports images, videos, audio, and documents
                          </p>
                          <Button 
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              open();
                            }}
                          >
                            Select Files
                          </Button>
                        </div>
                      )}
                    </Card>
          
                    {files.length > 0 && (
                      <div className="gap-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Selected Files ({files.length})</h3>
                          <p className="text-sm text-muted-foreground">
                            Total: {formatBytes(totalSize)}
                          </p>
                        </div>
          
                        <div className="gap-y-2 max-h-60 overflow-y-auto">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              {file.preview ? (
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="h-12 w-12 object-cover rounded"
                                />
                              ) : (
                                <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
                                  {getFileIcon(file.type)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatBytes(file.size)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                disabled={uploading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
          
                        {uploading && (
                          <div className="gap-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                          </div>
                        )}
          
                        <div className="flex gap-2">
                          <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-1"
                          >
                            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setFiles([])}
                            disabled={uploading}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div> */}
            <div className="relative  w-full overflow-hidden bg-[#020208]">
              <img
                src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon.png"
                alt=""
                className="absolute !-bottom-24 object-cover left-1/2 -translate-x-1/2 w-full h-full "
              />

              <div className="relative z-10 flex items-start justify-center h-full px-4">
                <FileUploadCard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="event" className=" w-full">
            <ScrollArea className=" !overflow-y-auto w-full py-0">
              <form
                onSubmit={handleSubmit}
                className="!w-full !px-0 flex flex-col justify-between min-h-full !h-full"
              >
                <div className="space-y-6 !w-full py-6 !px-12 min-w-full">
                  <div className="group relative">
                    <label htmlFor="task-event-title" className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50">
                      Event Title
                    </label>
                    <Input
                      id="task-event-title"
                      className="h-10"
                      placeholder="e.g., 30 Minute Meeting"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="group relative">
                    <Label htmlFor="task-event-description" className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50">
                      Description
                    </Label>
                    <Textarea
                      id="task-event-description"
                      rows={1}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description of the meeting"
                    />
                  </div>

                  <div className="group relative">
                    <label htmlFor="task-event-duration" className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50">
                      Duration (min) *
                    </label>
                    <Input
                      id="task-event-duration"
                      className="h-10"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <div className="block text-sm font-medium text-gray-700 mb-2">
                      Location Type *
                    </div>
                    <div className="flex justify-start items-center gap-4">
                      {locationOptions.map((opt) => (
                        <Card
                          key={opt.id}
                          onClick={() =>
                            setFormData({ ...formData, locationType: opt.id })
                          }
                          className={`cursor-pointer w-24 h-20 p-0 flex justify-center items-center  transition-all ${formData.locationType === opt.id
                              ? 'border border-blue-600 shadow-lg'
                              : 'border'
                            }`}
                        >
                          <CardContent className="flex bg-transparent flex-col items-center justify-center gap-y-1 p-0">
                            <Image
                              src={opt.logo}
                              alt={opt.label}
                              width={28}
                              height={28}
                            />
                            <span className="text-sm font-medium">
                              {opt.label}
                            </span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Error if Google not verified */}
                  {error && (
                    <div className="text-red-600 text-sm mt-2">
                      {error}{' '}
                      <Link
                        href="/settings"
                        className="underline text-blue-600"
                      >
                        Go to settings
                      </Link>
                    </div>
                  )}
                </div>
                <div className="dark:bg-neutral-950 bg-gray-100 !mt-auto flex justify-end px-6 items-end h-full py-5">
                  <Button
                    type="submit"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </FloatingPanelContent>
  );
}

function StatusDot({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="8"
      fill="currentColor"
      viewBox="0 0 8 8"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}


// ─── Chat panel — the actual chat UI rendered inside FamilyButton's children ──
// NOTE: FamilyButton renders its children as a portal/popover when open.
// We do NOT gate this on any `isOpen` state — FamilyButton controls visibility.
const ChatPanel = ({
  messages, loading, hasChannel, channel, channels, channelId,
  serverId, member, session, router,
  groupedMessages, replyingTo, setReplyingTo,
  inputValue, setInputValue, inputRef,
  sendMessage, isSending, isUploading,
  addReaction, toggleBookmark,
  pendingFile, pendingPreviewUrl, showFilePanel, setShowFilePanel,
  clearAttachment, handleFileSelect, fileInputRef,
  isExpanded, setIsExpanded,
  handleChannelSwitch, openLightbox, messagesEndRef
}: any) => {
  const isPdf = pendingFile?.type === 'application/pdf';
  const isVideo = pendingFile?.type?.startsWith('video/');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 12 }}
      transition={{ type: "spring", damping: 22, stiffness: 320 }}
      className="rounded-xl shadow-2xl overflow-hidden flex flex-col bg-[#111] border border-zinc-800 w-[24.5rem] h-[600px]"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#212021] text-white px-3 py-2 flex justify-between items-center border-b border-zinc-800 flex-shrink-0">
        <div className="flex-1 min-w-0">
          {channels.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-1 hover:bg-zinc-800 rounded-md px-2 py-1 transition-colors">
                  <h3 className="font-semibold text-sm truncate">
                    {channel ? `# ${channel.name}` : 'Select channel'}
                  </h3>
                  <ChevronDown className="size-4 text-zinc-400 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-zinc-900 border-zinc-800">
                {channels.map((ch: Channel) => (
                  <DropdownMenuItem
                    key={ch.id}
                    onClick={() => handleChannelSwitch(ch)}
                    className={`cursor-pointer text-sm ${channelId === ch.id ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                  >
                    <span className="truncate"># {ch.name}</span>
                    {channelId === ch.id && <span className="ml-auto text-xs text-blue-400">●</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <h3 className="font-semibold text-sm truncate px-2 py-1">
              {channel ? `# ${channel.name}` : 'Chat'}
            </h3>
          )}
          <p className="text-[11px] text-zinc-500 px-2">{messages.length} messages</p>
        </div>
        <div className="flex gap-x-1">
          {/* <button type="button"
            onClick={() => setIsExpanded((p: boolean) => !p)}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button> */}
          <button type="button"
            onClick={() => serverId && channelId && router.push(`/servers/${serverId}/channels/${channelId}`)}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Open full page"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#111]">
        {!hasChannel ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 px-6 text-center gap-3">
            <MessageSquare className="size-10 opacity-30" />
            <p className="text-sm font-medium">No channels available</p>
            <p className="text-xs opacity-60">Ask your admin to create a channel</p>
          </div>
        ) : loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <LazyLoader />
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin2 py-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 py-16">
                  <MessageSquare className="size-8 opacity-30" />
                  <p className="text-xs">No messages yet</p>
                  <p className="text-[11px] opacity-50">Be the first to say something!</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
                  <div key={date}>
                    <div className="flex items-center justify-center relative my-3">
                      <Separator className="bg-zinc-800" />
                      <Badge variant="outline"
                        className="text-[10px] absolute mx-auto bg-[#1a1a1a] text-zinc-500 px-2 rounded-full border-zinc-700 h-5">
                        {date}
                      </Badge>
                    </div>
                    {msgs.map((message: any, idx: number) => {
                      const isCurrentUser =
                        message.member?.userId === session?.user?.id ||
                        message.member?.user?.id === session?.user?.id;
                      const showAvatar = idx === 0 || msgs[idx - 1]?.memberId !== message.memberId;
                      const isBookmarked = message.bookmarks?.some((b: any) => b.userId === session?.user?.id);
                      return (
                        <MiniMessageItem
                          key={message.id}
                          message={message}
                          isCurrentUser={isCurrentUser}
                          showAvatar={showAvatar}
                          isBookmarked={isBookmarked}
                          isReplyingToThis={replyingTo?.id === message.id}
                          currentUserId={session?.user?.id}
                          onReply={() => setReplyingTo(message)}
                          onReact={addReaction}
                          onBookmark={() => toggleBookmark(message.id)}
                          onOpenFile={openLightbox}
                        />
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply preview */}
            {replyingTo && (
              <div className="mx-3 mb-1 flex-shrink-0 rounded-lg overflow-hidden border-l-2 border-blue-500 bg-zinc-900">
                <div className="flex items-center justify-between px-2.5 py-1.5 gap-2">
                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                    <Reply className="size-3 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-blue-400 truncate">
                        {replyingTo.member?.user?.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {replyingTo.fileUrl && !replyingTo.content ? '📎 Attachment' : replyingTo.content?.substring(0, 50)}
                      </p>
                    </div>
                    {replyingTo.fileUrl && IMAGE_EXT.test(replyingTo.fileUrl) && (
                      <div className="size-7 rounded overflow-hidden flex-shrink-0 ml-auto">
                        <img src={replyingTo.fileUrl} alt="" className="size-full object-cover" />
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white flex-shrink-0">
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* File preview */}
            {pendingFile && (
              <div className="mx-3 mb-1 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 bg-zinc-900 relative">
                {!isPdf && !isVideo ? (
                  <div className="relative w-full" style={{ maxHeight: 180 }}>
                    <img src={pendingPreviewUrl} alt="preview" className="w-full object-contain" style={{ maxHeight: 180 }} />
                    <button type="button" onClick={clearAttachment}
                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5">
                      <X className="size-3.5" />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-[55%]">
                      {pendingFile.name}
                    </div>
                  </div>
                ) : isVideo ? (
                  <div className="relative">
                    <video src={pendingPreviewUrl} className="w-full max-h-32 object-contain" controls />
                    <button type="button" onClick={clearAttachment}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5">
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <FileIcon className="size-6 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium truncate">{pendingFile.name}</p>
                      <p className="text-[10px] text-zinc-400">{(pendingFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={clearAttachment} className="ml-auto text-zinc-500 hover:text-red-400">
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File picker panel */}
            {showFilePanel && !pendingFile && (
              <div className="mx-3 mb-1 p-2.5 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center gap-2 flex-shrink-0">
                <label className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs transition-colors flex-shrink-0">
                  <Plus className="size-3.5" />
                  Choose File
                  <input ref={fileInputRef} type="file" className="hidden"
                    accept="image/*,video/*,application/pdf" onChange={handleFileSelect} />
                </label>
                <span className="text-[11px] text-zinc-500 truncate">Image, video or PDF</span>
                <button type="button" onClick={() => setShowFilePanel(false)} className="ml-auto text-zinc-500 hover:text-white flex-shrink-0">
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* Input */}
            <div className="mx-3 mb-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => { if (pendingFile) { clearAttachment(); return; } setShowFilePanel((p: boolean) => !p); }}
                  className={`p-1 rounded-full hover:bg-zinc-800 transition-colors flex-shrink-0 ${showFilePanel ? 'text-blue-400' : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  {pendingFile || showFilePanel ? <X className="size-4" /> : <Plus className="size-4" />}
                </button>

                <input
                  ref={inputRef}
                  aria-label="message-input"
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    if (e.key === 'Escape') setReplyingTo(null);
                  }}
                  placeholder={replyingTo ? 'Reply…' : 'Write a message…'}
                  disabled={isSending}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1 text-white placeholder-zinc-500 disabled:opacity-50 min-w-0"
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 flex-shrink-0">
                      <Smile className="size-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top" align="end">
                    <Picker data={data} onEmojiSelect={(emoji: any) => {
                      setInputValue((prev: string) => prev + emoji.native);
                      inputRef.current?.focus();
                    }} />
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={sendMessage}
                  disabled={(!inputValue.trim() && !pendingFile) || isSending || isUploading}
                  size="icon"
                  className={`size-7 flex-shrink-0 transition-colors ${(inputValue.trim() || pendingFile) && !isSending && !isUploading
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-zinc-700 cursor-not-allowed'
                    }`}
                >
                  {isSending || isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
export const Chat: React.FC<ChatInterfaceProps> = ({
  channelId: propChannelId,
  serverId: propServerId,
  currentMember: propCurrentMember
}) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [member, setMember] = useState<Member | null>(propCurrentMember || null);
  const [serverId, setServerId] = useState<string | null>(propServerId || null);
  const [channelId, setChannelId] = useState<string | null>(propChannelId || null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [hasChannel, setHasChannel] = useState(true);
  const [queryLoading, setQueryLoading] = useState(true);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(false);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxType, setLightboxType] = useState<'image' | 'video' | 'pdf'>('image');

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketInitRef = useRef(false);
  const joinedChannelRef = useRef<string | null>(null);

  // ── Socket ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (socketInitRef.current) return;
    const s = io({ path: '/api/socket/io', transports: ['websocket', 'polling'], reconnection: true, reconnectionAttempts: 5 });
    s.on('connect', () => console.log('[CHAT WIDGET] Connected:', s.id));
    s.on('connect_error', err => console.error('[CHAT WIDGET] Error:', err.message));
    setSocket(s);
    socketInitRef.current = true;
    return () => { s.disconnect(); socketInitRef.current = false; };
  }, []);

  // ── Join channel ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !channelId) return;
    if (joinedChannelRef.current && joinedChannelRef.current !== channelId) {
      socket.emit('leave_channel', joinedChannelRef.current);
    }
    socket.emit('join_channel', channelId);
    joinedChannelRef.current = channelId;
  }, [socket, channelId]);

  // ── Fetch messages ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/messages?channelId=${channelId}`);
      if (!res.ok) throw new Error('Failed');
      const d = await res.json();
      setMessages(d.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [channelId]);

  useEffect(() => { if (channelId) fetchMessages(); }, [channelId, fetchMessages]);

  // ── Scroll to bottom when messages load ────────────────────────────────────
  useLayoutEffect(() => {
    if (!loading && messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }
  }, [loading, messages.length]);

  // ── Socket listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onNew = (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        const ti = prev.findIndex(m => m.id?.startsWith('temp-') && m.content === msg.content && m.memberId === msg.memberId);
        if (ti !== -1) { const n = [...prev]; n[ti] = msg; return n; }
        return [...prev, msg];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    const onReact = (d: any) => setMessages(prev => prev.map(m => m.id === d.messageId ? { ...m, reactions: d.reactions } : m));
    const onBookmark = (d: any) => setMessages(prev => prev.map(m => {
      if (m.id !== d.messageId) return m;
      const bookmarks = d.bookmarked ? [...(m.bookmarks || []), { userId: d.userId }] : (m.bookmarks || []).filter((b: any) => b.userId !== d.userId);
      return { ...m, bookmarks };
    }));
    socket.on('new_message', onNew);
    socket.on('message_reaction', onReact);
    socket.on('message_bookmark', onBookmark);
    return () => { socket.off('new_message', onNew); socket.off('message_reaction', onReact); socket.off('message_bookmark', onBookmark); };
  }, [socket]);

  // ── Load channel/server data ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setQueryLoading(true);
      try {
        if (propServerId && propChannelId) {
          setServerId(propServerId);
          setChannelId(propChannelId);
          if (propCurrentMember) setMember(propCurrentMember);
          const [chRes, chsRes] = await Promise.all([
            fetch(`/api/channels/${propChannelId}`),
            fetch(`/api/servers/${propServerId}/channels`)
          ]);
          if (chRes.ok) setChannel(await chRes.json());
          if (chsRes.ok) {
            const d = await chsRes.json();
            const txt = d.filter((c: Channel) => c.type === ChannelType.TEXT);
            setChannels(txt);
            setHasChannel(txt.length > 0);
          }
          return;
        }
        const res = await fetch('/api/chat/default');
        if (!res.ok) { setHasChannel(false); return; }
        const d = await res.json();
        if (d.serverId && d.channelId) {
          setServerId(d.serverId);
          setChannelId(d.channelId);
          setHasChannel(true);
          const [chRes, memRes] = await Promise.all([
            fetch(`/api/channels/${d.channelId}`),
            fetch(`/api/servers/${d.serverId}/member`)
          ]);
          if (chRes.ok) setChannel(await chRes.json());
          if (memRes.ok) setMember(await memRes.json());
        } else {
          setHasChannel(false);
        }
      } catch { setHasChannel(false); }
      finally { setQueryLoading(false); setLoading(false); }
    };
    load();
  }, [propServerId, propChannelId, propCurrentMember]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChannelSwitch = (ch: Channel) => {
    if (ch.id === channelId) return;
    setMessages([]); setLoading(true); setChannelId(ch.id); setChannel(ch);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Max 10MB'); return; }
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(file);
    setPendingPreviewUrl(URL.createObjectURL(file));
    setShowFilePanel(false);
    e.target.value = '';
  };

  const clearAttachment = () => {
    setPendingFile(null);
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingPreviewUrl('');
    setShowFilePanel(false);
  };

  const openLightbox = (url: string) => {
    if (IMAGE_EXT.test(url)) { setLightboxType('image'); setLightboxUrl(url); }
    else if (VIDEO_EXT.test(url)) { setLightboxType('video'); setLightboxUrl(url); }
    else { setLightboxType('pdf'); setLightboxUrl(url); }
  };

  const sendMessage = async () => {
    if ((!inputValue.trim() && !pendingFile) || !socket || !channelId || isSending) return;
    setIsSending(true);
    setIsUploading(!!pendingFile);

    let fileUrl = '';
    if (pendingFile) {
      try {
        const reader = new FileReader();
        const fileData = await new Promise<string>((res, rej) => { reader.onload = () => res(reader.result as string); reader.onerror = rej; reader.readAsDataURL(pendingFile); });
        const up = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: pendingFile.name, fileType: pendingFile.type, endpoint: 'messageFile', fileData }) });
        const ud = await up.json();
        if (!up.ok || !ud.success) throw new Error(ud.error || 'Upload failed');
        fileUrl = ud.fileUrl;
      } catch (err) { console.error('Upload failed:', err); setIsSending(false); setIsUploading(false); return; }
    }

    setIsUploading(false);
    const content = inputValue.trim();
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, content, fileUrl: fileUrl || null, channelId, memberId: member?.id, member: { ...member, user: session?.user }, reactions: [], bookmarks: [], createdAt: new Date().toISOString(), parentId: replyingTo?.id || null }]);
    setInputValue('');
    clearAttachment();
    setReplyingTo(null);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const res = await fetch('/api/socket/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, fileUrl: fileUrl || undefined, channelId, serverId, parentId: replyingTo?.id || undefined }) });
      if (!res.ok) throw new Error('Failed');
      const saved = await res.json();
      setMessages(prev => prev.map(m => m.id === tempId ? saved : m));
    } catch { setMessages(prev => prev.filter(m => m.id !== tempId)); setInputValue(content); }
    finally { setIsSending(false); }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!serverId) return;
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      const has = msg.reactions?.some((r: any) => r.emoji === emoji && r.member?.userId === session?.user?.id);
      return { ...msg, reactions: has ? msg.reactions.filter((r: any) => !(r.emoji === emoji && r.member?.userId === session?.user?.id)) : [...(msg.reactions || []), { emoji, member: { userId: session?.user?.id, user: session?.user } }] };
    }));
    try { await fetch('/api/messages/reactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, emoji, serverId }) }); }
    catch { fetchMessages(); }
  };

  const toggleBookmark = async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    const isBm = msg?.bookmarks?.some((b: any) => b.userId === session?.user?.id);
    setMessages(prev => prev.map(m => { if (m.id !== messageId) return m; const bookmarks = isBm ? (m.bookmarks || []).filter((b: any) => b.userId !== session?.user?.id) : [...(m.bookmarks || []), { userId: session?.user?.id }]; return { ...m, bookmarks }; }));
    try { await fetch('/api/messages/bookmark', { method: isBm ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId }) }); }
    catch { fetchMessages(); }
  };

  const groupedMessages = messages.reduce((g: any, msg: any) => {
    const d = format(new Date(msg.createdAt), 'MMMM d, yyyy');
    if (!g[d]) g[d] = [];
    g[d].push(msg);
    return g;
  }, {});

  // Props bundle passed to ChatPanel to keep JSX clean
  const panelProps = {
    messages, loading, hasChannel, channel, channels, channelId, serverId, member, session, router,
    groupedMessages, replyingTo, setReplyingTo, inputValue, setInputValue, inputRef,
    sendMessage, isSending, isUploading,
    addReaction, toggleBookmark,
    pendingFile, pendingPreviewUrl, showFilePanel, setShowFilePanel,
    clearAttachment, handleFileSelect, fileInputRef,
    isExpanded, setIsExpanded,
    handleChannelSwitch, openLightbox, messagesEndRef
  };

  return (
    <>
      <FloatingPanelContent className="!-ml-52">
        <ChatPanel {...panelProps} />
      </FloatingPanelContent>

      <Dialog open={!!lightboxUrl} onOpenChange={o => !o && setLightboxUrl(null)}>
        <DialogContent className="max-w-3xl dark:bg-zinc-950 border-zinc-800 p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[200px] max-h-[80vh]">
            {lightboxType === 'image' && lightboxUrl && (
              <Image src={lightboxUrl} alt="Preview" width={900} height={700} unoptimized
                className="max-h-[78vh] w-auto object-contain rounded-lg" />
            )}
            {lightboxType === 'video' && lightboxUrl && (
              <video src={lightboxUrl} controls autoPlay className="max-h-[78vh] w-full rounded-lg" />
            )}
            {lightboxType === 'pdf' && lightboxUrl && (
              <div className="flex flex-col items-center gap-4 py-8">
                <FileIcon className="size-16 fill-indigo-200 stroke-indigo-400" />
                <p className="text-sm text-zinc-300 truncate max-w-[300px]">{lightboxUrl.split('/').pop()}</p>
                <a href={lightboxUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                  Open PDF
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── MiniMessageItem ──────────────────────────────────────────────────────────
const MiniMessageItem = ({
  message, isCurrentUser, showAvatar, isBookmarked,
  isReplyingToThis, currentUserId,
  onReply, onReact, onBookmark, onOpenFile
}: any) => {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileUrl: string | undefined = message.fileUrl;
  const fileIsImage = !!fileUrl && IMAGE_EXT.test(fileUrl) && !imageError;
  const fileIsVideo = !!fileUrl && VIDEO_EXT.test(fileUrl);
  const fileIsPdf = !!fileUrl && fileUrl.toLowerCase().endsWith('.pdf');

  const reactionCounts = (message.reactions || []).reduce((acc: any, r: any) => {
    const e = r.emoji;
    if (!acc[e]) acc[e] = { count: 0, userIds: [] };
    acc[e].count++;
    acc[e].userIds.push(r.member?.userId || r.memberId);
    return acc;
  }, {});

  return (
    <div
      className={`group px-3 pt-1.5 pb-2 flex gap-2 transition-colors hover:bg-white/[0.03] ${isReplyingToThis ? 'bg-blue-500/10 ring-1 ring-blue-500 rounded-lg mx-1' : ''
        }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar ? (
        <Avatar className="size-7 mt-0.5 flex-shrink-0">
          <AvatarImage src={message.member?.user?.image} />
          <AvatarFallback className="text-[10px]">{message.member?.user?.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
      ) : <div className="w-7 flex-shrink-0" />}

      <div className="flex-1 min-w-0 flex flex-col">
        {showAvatar && (
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-xs text-white">{message.member?.user?.name || 'Unknown'}</span>
            <span className="text-[10px] text-zinc-500">{format(new Date(message.createdAt), 'h:mm a')}</span>
          </div>
        )}

        {message.parentId && (
          <div className="flex items-center gap-1 mb-1 px-2 py-0.5 rounded bg-zinc-800/60 border-l-2 border-blue-500/60 text-[10px] text-zinc-500">
            <Reply className="size-2.5 flex-shrink-0 text-blue-400" />
            <span className="truncate">{message.parent?.content?.substring(0, 40) || '📎 Attachment'}</span>
          </div>
        )}

        {message.content && (
          <p className="text-xs text-zinc-200 whitespace-pre-wrap break-words leading-snug">{message.content}</p>
        )}

        {fileUrl && (
          <div className="mt-1">
            {fileIsImage && (
              <button type="button" onClick={() => onOpenFile(fileUrl)}
                className="relative rounded-lg overflow-hidden border border-zinc-700 max-w-[180px] group/img block">
                <Image src={fileUrl} alt="attachment" width={180} height={120} unoptimized
                  className="object-cover w-full max-h-32" onError={() => setImageError(true)} />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="size-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
              </button>
            )}
            {fileIsVideo && (
              <button type="button" onClick={() => onOpenFile(fileUrl)}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                <FileIcon className="size-3" /> Video — click to play
              </button>
            )}
            {fileIsPdf && (
              <button type="button" onClick={() => onOpenFile(fileUrl)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 max-w-[180px] hover:border-zinc-600 transition-colors">
                <FileIcon className="size-4 fill-indigo-200 stroke-indigo-400 flex-shrink-0" />
                <span className="text-[10px] text-indigo-400 truncate">{fileUrl.split('/').pop()}</span>
              </button>
            )}
            {fileUrl && !fileIsImage && !fileIsVideo && !fileIsPdf && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline">📎 Attachment</a>
            )}
          </div>
        )}

        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactionCounts).map(([emoji, d]: [string, any]) => (
              <button key={emoji} type="button" onClick={() => onReact(message.id, emoji)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors ${d.userIds?.includes(currentUserId)
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}>
                <span>{emoji}</span>
                {d.count > 1 && <span className="font-medium">{d.count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`flex items-center h-fit gap-0.5 -mt-4 transition-opacity flex-shrink-0 ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } border bg-[#111111] border-[#484848] rounded-lg p-0.5`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-5" onClick={onReply}>
                <Reply className="size-2.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px]">Reply</TooltipContent>
          </Tooltip>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-5">
                <Smile className="size-2.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="top">
              <Picker data={data} onEmojiSelect={(emoji: any) => onReact(message.id, emoji.native)} />
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"
                className={`size-5 ${isBookmarked ? 'text-yellow-500' : 'text-zinc-400'}`}
                onClick={onBookmark}>
                <Bookmark className={`size-2.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px]">{isBookmarked ? 'Saved' : 'Save'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};


function Calls() {
  const { isInCall, incomingCall, currentCall } = useCall();

  // Debug logging
  useEffect(() => {
    console.log('[CALLS PAGE] State:', { isInCall, incomingCall, currentCall });
  }, [isInCall, incomingCall, currentCall]);

  return (
    <FloatingPanelContent className=" flex !-ml-52 items-center bg-white dark:bg-[#000] overflow-y-auto">

        {/* Show incoming call modal */} 
        {incomingCall && !isInCall && <IncomingCallModal />}


        <Tabs defaultValue="members" className="px-3 py-2">

          <div className=" flex justify-between items-start mt-4">

            <TabsList className="bg-white dark:bg-[#111] border dark:border-[#333]">
              <TabsTrigger value="members" className="data-[state=active]:dark:bg-gray-800">
                <Users className="mr-2 h-4 w-4" />
                Team Members
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:dark:bg-gray-800">
                <History className="mr-2 h-4 w-4" />
                Call History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="members" className="space-y-4">
            <TeamMemberList />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <CallHistory />
          </TabsContent>
        </Tabs>
      
    </FloatingPanelContent>
  );
}

 function TeamMemberList() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { startCall, isCalling } = useCall();

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchMembers()
    }
  }, []);
  

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/calls/members');
      const result = await response.json();
      setMembers(result.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (memberId: string, type: 'AUDIO' | 'VIDEO') => {
    try {
      await startCall(memberId, type);
    } catch (error: any) {
      if (error.message === 'Active call in progress') {
        // Auto-clear stuck calls and retry
        if (confirm('Stuck call detected. Clear it and try again?')) {
          await fetch('/api/calls/clear', { method: 'POST' });
          // Retry after clearing
          setTimeout(() => handleCall(memberId, type), 500);
        }
      } else {
        alert(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="grid gap-2">
        {[1, 2, 3, 4,5,6,7].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-800" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-8 text-center">
        <Users className="mx-auto mb-4 h-12 w-12 text-gray-600" />
        <h3 className="text-lg font-medium text-white">No team members found</h3>
        <p className="text-gray-400">You need to make calls</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {members.map((member) => (
        <div
          key={member.id}
          className="group relative overflow-hidden py-1 transition-all hover:shadow-xl"
        >
          {/* Avatar & Info */}
          <div className=" flex items-center gap-4">
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-gray-700"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-md font-semibold text-white">
                {member.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm dark:text-white truncate">{member.name}</h3>
              {/* <span className="inline-flex mt-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                {member.role.toLowerCase()}
              </span> */}
            </div>
            <div className="flex gap-1.5">
            <button type="button"
              onClick={() => handleCall(member.id, 'AUDIO')}
              disabled={isCalling}
              className=""
            >
              <Mic className="h-4 w-4" />
              
            </button>
            <button type="button"
              onClick={() => handleCall(member.id, 'VIDEO')}
              disabled={isCalling}
              className=""
            >
              <Video className="h-4 w-4" />
            
            </button>
          </div>
          </div>
        </div>
      ))}
    </div>
  );
}
