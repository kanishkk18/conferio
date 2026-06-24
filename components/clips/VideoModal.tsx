// components/VideoModal.tsx

import { useState, useRef } from 'react'
import { Clip } from '@prisma/client'

interface VideoModalProps {
  clip: Clip | null
  isOpen: boolean
  onClose: () => void
}

export default function VideoModal({ clip, isOpen, onClose }: VideoModalProps) {
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
    onClose()
  }

  if (!isOpen || !clip) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className=" rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{clip.title}</h3>
          <button type="button" 
          aria-label="Close"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <video
          aria-label="Video player"
            ref={videoRef}
            src={clip.fileUrl}
            className="w-full max-h-[70vh]"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        <div className="p-4 border-t">
          <p className="text-gray-600 mb-2">{clip.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Created: {new Date(clip.createdAt).toLocaleString()}</span>
            <span>Size: {Math.round(clip.fileSize / 1024 / 1024)} MB</span>
          </div>
        </div>
      </div>
    </div>
  )
}
