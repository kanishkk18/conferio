import React from 'react'
import { Music, User } from 'lucide-react'

interface PlaylistItemProps {
  image?: string
  title: string
  subtitle: string
  type?: 'playlist' | 'artist' | 'album'
}

export function PlaylistItem({ image, title, subtitle, type = 'playlist' }: PlaylistItemProps) {
  const getIcon = () => {
    if (type === 'artist') return <User className="size-4 />
    return <Music className="size-4 />
  }

  return (
    <div className="flex items-center gap-3 px-2 py-1.5 text-sm text-spotify-gray hover:bg-spotify-gray/10 hover:text-white transition-colors cursor-pointer rounded group">
      <div className="size-12 bg-spotify-gray/20 rounded flex-shrink-0 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center ${image ? 'hidden' : ''}`}>
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white group-hover:text-white truncate">{title}</div>
        <div className="text-xs text-spotify-gray truncate">{subtitle}</div>
      </div>
    </div>
  )
}
