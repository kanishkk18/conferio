"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useState, useRef } from 'react'
import { Clip } from '@prisma/client'
import ClipMenu from "../clips/ClipMenu"


interface ExpandableCardProps {
  title: string
  src: string
  description: string
  children?: React.ReactNode
  className?: string
  classNameExpanded?: string
  [key: string]: any
   clip: Clip | null
}

export function ExpandableCard({
  title,
  src,
  description,
  children,
  className,
  classNameExpanded,
  clip,
  onUpdate,
  ...props
}  : ExpandableCardProps) {
  const [active, setActive] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const id = React.useId()
   const [isPlaying, setIsPlaying] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
  
    const handlePlayPause = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause()
        } else {
          videoRef.current.play()
        }
        setIsPlaying(!isPlaying)
      }
    }
  
    const handleClose = () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      setIsPlaying(false)
      
    }

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(false)
      }
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

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
              layoutId={`card-${title}-${id}`}
              ref={cardRef}
              className={cn(
                "relative flex h-full w-full min-w-[950px] max-w-[950px] flex-col overflow-auto bg-zinc-50 shadow-sm [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:rounded-t-3xl dark:bg-zinc-950 dark:shadow-none",
                classNameExpanded
              )}
              {...props}
            >
              <motion.div layoutId={`image-${title}-${id}`}>
                <div className="relative before:absolute before:inset-x-0 before:bottom-[-1px] before:z-50 before:h-[70px] before:bg-gradient-to-t before:from-zinc-50 dark:before:from-zinc-950">
                   <video
                    aria-label="video-player"
            ref={videoRef}
            src={src}
            className="h-full w-full object-cover object-center"
            // autoPlay
            // muted
            // loop
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
                </div>
              </motion.div>
              <div className="relative h-full before:fixed before:inset-x-0 before:bottom-0 before:z-50 before:h-[70px] before:bg-gradient-to-t before:from-zinc-50 dark:before:from-zinc-950">
                <div className="flex h-auto items-start justify-between p-4">
                  <div>
                    <motion.p
                      layoutId={`description-${description}-${id}`}
                      className="text-lg text-zinc-500 dark:text-zinc-400"
                    >
                      {description}
                    </motion.p>
                    <motion.h3
                      layoutId={`title-${title}-${id}`}
                      className="mt-0.5 text-4xl font-semibold text-black sm:text-4xl dark:text-white"
                    >
                      {title}
                    </motion.h3>
                  </div>
                   {/* {clip && <ClipMenu clip={clip} onUpdate={onUpdate} />} */}
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
        aria-labelledby={`card-title-${id}`}
        aria-modal="true"
        layoutId={`card-${title}-${id}`}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-between rounded-2xl border border-gray-200/70 bg-zinc-50 p-2.5 shadow-sm dark:border-zinc-900 dark:bg-zinc-950 dark:shadow-none",
          className
        )}
      >
        <div className="flex group relative flex-col gap-4">
          <motion.button
              className={cn(
                "flex h-8 absolute inset-x-0   opacity-0 group-hover:opacity-100 transition-opacity mt-2 shrink-0 z-50 items-end justify-end px-1 duration-300",
                className
              )}
            >
              <motion.div
                animate={{ rotate: active ? 45 : 0 }}
                transition={{ duration: 0.4 }}
              >
             {clip && <ClipMenu clip={clip} onUpdate={onUpdate} />} 
             </motion.div>
            </motion.button>

            <motion.div layoutId={`image-${title}-${id}`}
             onClick={() => setActive(true)}
>
            <video
            aria-label="video-player"
            ref={videoRef}
            src={src}
            className="h-48 w-64 rounded-lg object-cover object-center"
        
          />
           
          </motion.div >
          <div className="flex items-center px-0 -py-2 justify-between"   onClick={() => setActive(true)}>
            <div className="flex flex-col">
              <motion.h3
                layoutId={`title-${title}-${id}`}
                className="font-semibold text-black md:text-left dark:text-white"
              >
                {title}
              </motion.h3>
              <motion.p
                layoutId={`description-${description}-${id}`}
                className="text-xs  text-zinc-500 md:text-left dark:text-zinc-400"
              >
                {description}
              </motion.p>
              
            </div>
            
          </div>
        </div>
      </motion.div>
    </>
  )
}
