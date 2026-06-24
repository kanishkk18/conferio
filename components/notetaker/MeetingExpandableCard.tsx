// "use client"

// import * as React from "react"
// import { AnimatePresence, motion } from "motion/react"
// import { cn } from "@/lib/utils"
// import { useState, useRef } from 'react'
// import { Video, Clock, Users, FileText, Calendar } from 'lucide-react'

// interface MeetingExpandableCardProps {
//   meeting: {
//     id: string;
//     meetingName: string | null;
//     meetingUrl: string;
//     platform: string | null;
//     status: string;
//     duration: number | null;
//     createdAt: string;
//     speakers: string[];
//     summary: string | null;
//     videoUrl: string | null;
//     s3VideoKey: string | null;
//     s3AudioKey: string | null;
//   };
//   children?: React.ReactNode;
//   className?: string;
//   classNameExpanded?: string;
//   [key: string]: any;
// }

// export function MeetingExpandableCard({
//   meeting,
//   children,
//   className,
//   classNameExpanded,
//   ...props
// }: MeetingExpandableCardProps) {
//   const [active, setActive] = React.useState(false)
//   const cardRef = React.useRef<HTMLDivElement>(null)
//   const id = React.useId()
//   const [isPlaying, setIsPlaying] = useState(false)
//   const videoRef = useRef<HTMLVideoElement>(null)

//   const title = meeting.meetingName || 'Untitled Meeting'
//   const description = meeting.platform 
//     ? `${meeting.platform.charAt(0).toUpperCase() + meeting.platform.slice(1)} Meeting`
//     : 'Meeting Recording'
//   const videoUrl = meeting.videoUrl || ''
//   const hasVideo = !!meeting.videoUrl

//   const handleClose = () => {
//     if (videoRef.current) {
//       videoRef.current.pause()
//     }
//     setIsPlaying(false)
//     setActive(false)
//   }

//   React.useEffect(() => {
//     const onKeyDown = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         handleClose()
//       }
//     }

//     const handleClickOutside = (event: MouseEvent | TouchEvent) => {
//       if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
//         handleClose()
//       }
//     }

//     if (active) {
//       window.addEventListener("keydown", onKeyDown)
//       document.addEventListener("mousedown", handleClickOutside)
//       document.addEventListener("touchstart", handleClickOutside)
//     }

//     return () => {
//       window.removeEventListener("keydown", onKeyDown)
//       document.removeEventListener("mousedown", handleClickOutside)
//       document.removeEventListener("touchstart", handleClickOutside)
//     }
//   }, [active])

//   const getStatusBadge = (status: string) => {
//     const statusClasses = {
//       pending: 'bg-yellow-100 text-yellow-700',
//       joined: 'bg-blue-100 text-blue-700',
//       recording: 'bg-red-100 text-red-700',
//       completed: 'bg-green-100 text-green-700',
//       failed: 'bg-red-100 text-red-700',
//     }
//     return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
//   }

//   const getPlatformIcon = (platform: string | null) => {
//     switch (platform) {
//       case 'zoom':
//         return <span className="text-blue-500 font-medium">Zoom</span>;
//       case 'google_meet':
//         return <span className="text-green-500 font-medium">Google Meet</span>;
//       case 'teams':
//         return <span className="text-purple-500 font-medium">Teams</span>;
//       default:
//         return <span className="text-gray-500">Unknown</span>;
//     }
//   }

//   const formatDuration = (seconds: number | null) => {
//     if (!seconds) return 'N/A';
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   }

//   const isPermanent = !!meeting.s3VideoKey || !!meeting.s3AudioKey

//   return (
//     <>
//       <AnimatePresence>
//         {active && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-10 h-full w-full bg-white/50 backdrop-blur-md dark:bg-black/50"
//           />
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {active && (
//           <div
//             className={cn(
//               "fixed inset-0 z-[100] grid place-items-center before:pointer-events-none sm:mt-16"
//             )}
//           >
//             <motion.div
//               layoutId={`meeting-card-${meeting.id}-${id}`}
//               ref={cardRef}
//               className={cn(
//                 "relative flex h-full w-full min-w-[950px] max-w-[950px] flex-col overflow-auto bg-zinc-50 shadow-sm [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:rounded-t-3xl dark:bg-zinc-950 dark:shadow-none",
//                 classNameExpanded
//               )}
//               {...props}
//             >
//               <motion.div layoutId={`meeting-image-${meeting.id}-${id}`}>
//                 <div className="relative before:absolute before:inset-x-0 before:bottom-[-1px] before:z-50 before:h-[70px] before:bg-gradient-to-t before:from-zinc-50 dark:before:from-zinc-950">
//                   {hasVideo ? (
//                     <video
//                       ref={videoRef}
//                       src={videoUrl}
//                       className="h-full w-full object-cover object-center max-h-[500px]"
//                       controls
//                       onPlay={() => setIsPlaying(true)}
//                       onPause={() => setIsPlaying(false)}
//                     />
//                   ) : (
//                     <div className="h-64 w-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
//                       <div className="text-center">
//                         <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-500 dark:text-zinc-400">No video available</p>
//                         <p className="text-sm text-gray-400 mt-1">Recording not ready yet</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </motion.div>

//               <div className="relative h-full before:fixed before:inset-x-0 before:bottom-0 before:z-50 before:h-[70px] before:bg-gradient-to-t before:from-zinc-50 dark:before:from-zinc-950">
//                 <div className="flex h-auto items-start justify-between p-4">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-2">
//                       <span className={cn("px-2 py-0.5 text-xs rounded-full", getStatusBadge(meeting.status))}>
//                         {meeting.status}
//                       </span>
//                       {getPlatformIcon(meeting.platform)}
//                       {isPermanent && (
//                         <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
//                           ☁️ Permanent
//                         </span>
//                       )}
//                     </div>

//                     <motion.h3
//                       layoutId={`meeting-title-${meeting.id}-${id}`}
//                       className="mt-0.5 text-4xl font-semibold text-black sm:text-4xl dark:text-white"
//                     >
//                       {title}
//                     </motion.h3>

//                     <motion.p
//                       layoutId={`meeting-desc-${meeting.id}-${id}`}
//                       className="text-lg text-zinc-500 dark:text-zinc-400 mt-2"
//                     >
//                       {description}
//                     </motion.p>

//                     <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-zinc-400">
//                       <span className="flex items-center gap-1">
//                         <Calendar className="size-4 />
//                         {new Date(meeting.createdAt).toLocaleDateString()}
//                       </span>
//                       {meeting.duration && (
//                         <span className="flex items-center gap-1">
//                           <Clock className="size-4 />
//                           {formatDuration(meeting.duration)}
//                         </span>
//                       )}
//                       {meeting.speakers?.length > 0 && (
//                         <span className="flex items-center gap-1">
//                           <Users className="size-4 />
//                           {meeting.speakers.length} speakers
//                         </span>
//                       )}
//                       {meeting.summary && (
//                         <span className="flex items-center gap-1 text-green-600">
//                           <FileText className="size-4 />
//                           AI Summary
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <button type="button"
//                     onClick={handleClose}
//                     className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
//                   >
//                     <svg className="size-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>

//                 <div className="relative px-6 sm:px-8">
//                   <motion.div
//                     layout
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="flex flex-col items-start gap-4 overflow-auto pb-10 text-base text-zinc-500 dark:text-zinc-400"
//                   >
//                     {children}
//                   </motion.div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       <motion.div
//         role="dialog"
//         aria-labelledby={`meeting-card-title-${meeting.id}-${id}`}
//         aria-modal="true"
//         layoutId={`meeting-card-${meeting.id}-${id}`}
//         className={cn(
//           "flex cursor-pointer flex-col items-center justify-between rounded-2xl border border-gray-200/70 bg-zinc-50 p-2.5 shadow-sm dark:border-zinc-900 dark:bg-zinc-950 dark:shadow-none hover:shadow-md transition-shadow",
//           className
//         )}
//       >
//         <div className="flex group relative flex-col gap-4 w-full">
//           <motion.div 
//             layoutId={`meeting-image-${meeting.id}-${id}`}
//             onClick={() => setActive(true)}
//             className="relative"
//           >
//             {hasVideo ? (
//               <video
//                 src={videoUrl}
//                 className="h-48 w-full rounded-lg object-cover object-center"
//                 preload="metadata"
//               />
//             ) : (
//               <div className="h-48 w-full rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
//                 <Video className="h-12 w-12 text-gray-400" />
//               </div>
//             )}

//             {/* Play overlay on thumbnail */}
//             {hasVideo && (
//               <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
//                 <div className="size-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//                   <svg className="size-6 text-white fill-white" viewBox="0 0 24 24">
//                     <path d="M8 5v14l11-7z" />
//                   </svg>
//                 </div>
//               </div>
//             )}
//           </motion.div>

//           <div className="flex items-center px-0 py-2 justify-between w-full" onClick={() => setActive(true)}>
//             <div className="flex flex-col flex-1 min-w-0">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className={cn("px-1.5 py-0.5 text-[10px] rounded-full", getStatusBadge(meeting.status))}>
//                   {meeting.status}
//                 </span>
//                 {isPermanent && (
//                   <span className="text-xs">☁️</span>
//                 )}
//               </div>

//               <motion.h3
//                 layoutId={`meeting-title-${meeting.id}-${id}`}
//                 className="font-semibold text-black md:text-left dark:text-white truncate"
//               >
//                 {title}
//               </motion.h3>

//               <motion.p
//                 layoutId={`meeting-desc-${meeting.id}-${id}`}
//                 className="text-xs text-zinc-500 md:text-left dark:text-zinc-400 truncate"
//               >
//                 {description}
//               </motion.p>

//               <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
//                 <span className="flex items-center gap-1">
//                   <Clock className="size-3" />
//                   {formatDuration(meeting.duration)}
//                 </span>
//                 {meeting.speakers?.length > 0 && (
//                   <span className="flex items-center gap-1">
//                     <Users className="size-3" />
//                     {meeting.speakers.length}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </>
//   )
// }

"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from 'react'
import { Video, Clock, Users, FileText, Calendar, RefreshCw, Loader2, Upload, CloudIcon } from 'lucide-react'

interface Meeting {
  id: string;
  meetingName: string | null;
  meetingUrl: string;
  platform: string | null;
  status: string;
  duration: number | null;
  createdAt: string;
  speakers: string[];
  summary: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  s3VideoKey: string | null;
  s3AudioKey: string | null;
}

interface MeetingExpandableCardProps {
  meeting: Meeting;
  children?: React.ReactNode;
  className?: string;
  classNameExpanded?: string;
  [key: string]: any;
}

export function MeetingExpandableCard({
  meeting: initialMeeting,
  children,
  className,
  classNameExpanded,
  ...props
}: MeetingExpandableCardProps) {
  const [active, setActive] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const id = React.useId()
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Fetch full meeting details when expanded (in case list doesn't include videoUrl)
  const [meeting, setMeeting] = useState<Meeting>(initialMeeting)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Video state management
  const [videoUrl, setVideoUrl] = useState(initialMeeting.videoUrl || '')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  const title = meeting.meetingName || 'Untitled Meeting'
  const description = meeting.platform
    ? `${meeting.platform.charAt(0).toUpperCase() + meeting.platform.slice(1)}`
    : 'Meeting Recording'

  const hasVideo = !!videoUrl
  const isPermanent = !!meeting.s3VideoKey || !!meeting.s3AudioKey
  const hasS3Keys = !!meeting.s3VideoKey || !!meeting.s3AudioKey

  // Fetch full meeting details when card opens (if we don't have videoUrl)
  useEffect(() => {
    if (active && !initialMeeting.videoUrl && !meeting.videoUrl && !isLoadingDetails) {
      fetchMeetingDetails()
    }
  }, [active])

  const fetchMeetingDetails = async () => {
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/aimeetings/${meeting.id}`)
      if (response.ok) {
        const data = await response.json()
        setMeeting(data)
        if (data.videoUrl) {
          setVideoUrl(data.videoUrl)
          setError(false)
        }
      }
    } catch (error) {
      console.error('Error fetching meeting details:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Auto-refresh URL if error occurs and has S3 keys
  useEffect(() => {
    if (error && hasS3Keys && active && !isRefreshing) {
      refreshVideoUrl()
    }
  }, [error, hasS3Keys, active])

  const refreshVideoUrl = async () => {
    setIsRefreshing(true)
    setUploadMessage('Refreshing video URL...')

    try {
      const response = await fetch(`/api/aimeetings/${meeting.id}/refresh-urls`)
      if (response.ok) {
        const data = await response.json()
        if (data.videoUrl) {
          setVideoUrl(data.videoUrl)
          setError(false)
          setUploadMessage('')

          // Reload video with new URL
          if (videoRef.current) {
            const currentTime = videoRef.current.currentTime || 0
            videoRef.current.src = data.videoUrl
            videoRef.current.load()
            videoRef.current.currentTime = currentTime
            if (isPlaying) {
              videoRef.current.play().catch(() => { })
            }
          }
        } else {
          setUploadMessage('No video URL available')
        }
      } else {
        const errorData = await response.json()
        setUploadMessage(errorData.error || 'Failed to refresh URL')
      }
    } catch (error) {
      console.error('Failed to refresh URL:', error)
      setUploadMessage('Failed to refresh URL')
    } finally {
      setIsRefreshing(false)
    }
  }

  const uploadToS3 = async () => {
    setIsUploading(true)
    setUploadMessage('Uploading to S3... This may take a few minutes.')

    try {
      const response = await fetch(`/api/aimeetings/${meeting.id}/upload-to-s3`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setVideoUrl(data.videoUrl)
        setError(false)
        setUploadMessage('✅ Uploaded to S3! Video will now be available permanently.')

        // Reload video
        if (videoRef.current) {
          videoRef.current.src = data.videoUrl
          videoRef.current.load()
        }
      } else {
        const errorData = await response.json()
        setUploadMessage(`❌ ${errorData.error || 'Upload failed'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadMessage('❌ Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsPlaying(false)
    setActive(false)
    setError(false)
    setUploadMessage('')
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error event:', e)
    console.error('Video src:', videoUrl)
    console.error('Video error code:', videoRef.current?.error?.code)
    console.error('Video error message:', videoRef.current?.error?.message)
    setError(true)
    setIsPlaying(false)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose()
      }
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (active) {
      window.addEventListener("keydown", onKeyDown)
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside , {passive: true})
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [active])

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-700',
      joined: 'bg-blue-100 text-blue-700',
      recording: 'bg-red-100 text-red-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    }
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
  }

  const getPlatformIcon = (platform: string | null) => {
    switch (platform) {
      case 'zoom':
        return <span className="text-blue-500 font-medium">Zoom</span>;
      case 'google_meet':
        return <span className="text-green-500 font-medium">Google Meet</span>;
      case 'teams':
        return <span className="text-purple-500 font-medium">Teams</span>;
      default:
        return <span className="text-gray-500">Unknown</span>;
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 h-full w-full bg-white/50 backdrop-blur-md dark:bg-black/50"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <div
            className={cn(
              "fixed inset-0 z-[100] grid place-items-center before:pointer-events-none sm:mt-16"
            )}
          >
            <motion.div
              layoutId={`meeting-card-${meeting.id}-${id}`}
              ref={cardRef}
              className={cn(
                "relative flex h-full w-full min-w-[950px] max-w-[950px] flex-col overflow-auto bg-zinc-50 shadow-sm [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:rounded-t-3xl dark:bg-zinc-950 dark:shadow-none",
                classNameExpanded
              )}
              {...props}
            >
              <motion.div layoutId={`meeting-image-${meeting.id}-${id}`}>
                <div className="relative before:absolute before:inset-x-0 before:bottom-[-1px] before:z-50 before:h-[70px] before:bg-gradient-to-t before:from-zinc-50 dark:before:from-zinc-950 bg-black">
                  {isLoadingDetails ? (
                    <div className="h-96 w-full flex items-center justify-center">
                      <Loader2 className="size-8 animate-spin text-blue-500" />
                    </div>
                  ) : hasVideo && !error ? (
                    <video
                    aria-label='video player'
                      ref={videoRef}
                      src={videoUrl}
                      className="h-full w-full object-contain max-h-[500px]"
                      controls
                      autoPlay
                      preload="auto"
                      crossOrigin="anonymous"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={handleVideoError}
                      playsInline
                    />
                  ) : error ? (
                    <div className="h-96 w-full bg-gray-900 flex flex-col items-center justify-center text-white p-8">
                      <p className="text-lg mb-2">Video failed to load</p>
                      <p className="text-sm text-gray-400 mb-2 text-center max-w-md">
                        The video URL has expired or is inaccessible.
                      </p>
                      <p className="text-xs text-gray-500 mb-4 font-mono break-all max-w-md">
                        {videoUrl || 'No URL'}
                      </p>

                      {uploadMessage && (
                        <p className={`text-sm mb-4 text-center ${uploadMessage.includes('✅') ? 'text-green-400' : uploadMessage.includes('❌') ? 'text-red-400' : 'text-yellow-400'}`}>
                          {uploadMessage}
                        </p>
                      )}

                      <div className="flex gap-3 flex-wrap justify-center">
                        {hasS3Keys && (
                          <button type="button"
                            onClick={refreshVideoUrl}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                          >
                            {isRefreshing ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <RefreshCw className="size-4" />
                            )}
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                          </button>
                        )}

                        <button type="button"
                          onClick={uploadToS3}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                          {isUploading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Upload className="size-4" />
                          )}
                          {isUploading ? 'Uploading...' : 'Upload to Cloud'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-96 w-full bg-gray-800 flex flex-col items-center justify-center text-white p-8">
                      <Video className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-300 text-lg">No video available</p>
                      <p className="text-sm text-gray-500 mt-2">The meeting recording is not ready yet</p>

                      {meeting.status === 'recording' && (
                        <p className="text-sm text-blue-400 mt-4 flex items-center gap-2">
                          <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
                          Recording in progress&hellip;
                        </p>
                      )}

                      {meeting.status === 'completed' && !hasS3Keys && (
                        <button type="button"
                          onClick={uploadToS3}
                          disabled={isUploading}
                          className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Uploading&hellip;
                            </>
                          ) : (
                            <>
                              <Upload className="size-4" />
                              Upload forever
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="relative h-full before:fixed before:inset-x-0 before:bottom-0 before:z-50 before:h-[70px] before:bg-gradient-to-t before:from-zinc-50 dark:before:from-zinc-950">
                <div className="flex h-auto items-start justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={cn("px-2 py-0.5 text-xs rounded-full", getStatusBadge(meeting.status))}>
                        {meeting.status}
                      </span>
                      {getPlatformIcon(meeting.platform)}
                      {isPermanent && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                          <CloudIcon className="size-4" /> Cloud
                        </span>
                      )}
                      {meeting.speakers?.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                          <Users className="size-3" />
                          {meeting.speakers.length} speakers
                        </span>
                      )}
                    </div>

                    <motion.h3
                      layoutId={`meeting-title-${meeting.id}-${id}`}
                      className="mt-0.5 text-4xl font-semibold text-black sm:text-4xl dark:text-white"
                    >
                      {title}
                    </motion.h3>

                    <motion.p
                      layoutId={`meeting-desc-${meeting.id}-${id}`}
                      className="text-lg text-zinc-500 dark:text-zinc-400 mt-2"
                    >
                      {description}
                    </motion.p>

                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {new Date(meeting.createdAt).toLocaleDateString()}
                      </span>
                      {meeting.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {formatDuration(meeting.duration)}
                        </span>
                      )}
                      {meeting.summary && (
                        <span className="flex items-center gap-1 text-green-600">
                          <FileText className="size-4" />
                          AI Summary Available
                        </span>
                      )}
                    </div>
                  </div>

                  <button type="button"
                  aria-label='close button'
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <svg className="size-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="relative px-6 sm:px-8">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-start gap-4 overflow-auto pb-10 text-base text-zinc-500 dark:text-zinc-400"
                  >
                    {children}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        role="dialog"
        aria-labelledby={`meeting-card-title-${meeting.id}-${id}`}
        aria-modal="true"
        layoutId={`meeting-card-${meeting.id}-${id}`}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-between rounded-2xl border border-gray-200/70 bg-zinc-50 p-2.5 shadow-sm dark:border-zinc-900 dark:bg-zinc-950 dark:shadow-none",
          className
        )}
      >
        <div className="flex group relative flex-col gap-2 w-full">
          <motion.div
            layoutId={`meeting-image-${meeting.id}-${id}`}
            onClick={() => setActive(true)}
            className="relative bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden"
          >
            {initialMeeting.videoUrl ? (
              <>
                <video
                  aria-label='video player'
                  src={initialMeeting.videoUrl}
                  className="h-48 w-full rounded-lg object-cover object-center"
                  preload="metadata"
                  controls
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="size-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="size-6 text-white fill-white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-48 w-full flex flex-col items-center justify-center">
                {/* <Video className="h-12 w-12 text-gray-400 mb-2" /> */}
                {initialMeeting.status === 'recording' ? (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
                    Recording&hellip;
                  </span>
                ) : initialMeeting.status === 'completed' ? (
                  <img src="https://i.pinimg.com/736x/d0/7f/ce/d07fce3952137aaaa71817e4ece3450a.jpg" alt="video" className='h-48 w-full' />
                ) : (
                  <span className="text-xs text-gray-400">No video</span>
                )}
              </div>
            )}
          </motion.div>

          <div className="flex items-center px-0 py-1 justify-between w-full" onClick={() => setActive(true)}>
            <div className="flex flex-col flex-1 min-w-0">
             {/* <div className="flex items-center gap-2 mb-0">
                 <span className={cn("px-1.5 py-0.5 text-[10px] rounded-full", getStatusBadge(meeting.status))}>
                  {meeting.status}
                </span> 
                {isPermanent && (
                  <span className="text-xs">☁️</span>
                )}
              </div>*/}

              <motion.h3
                layoutId={`meeting-title-${meeting.id}-${id}`}
                className="font-semibold text-black md:text-left dark:text-white truncate"
              >
                {title}
              </motion.h3>

              <motion.p
                layoutId={`meeting-desc-${meeting.id}-${id}`}
                className="text-xs text-zinc-500 md:text-left dark:text-zinc-400 truncate"
              >
                {description}
              </motion.p>

              {/* <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDuration(meeting.duration)}
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
