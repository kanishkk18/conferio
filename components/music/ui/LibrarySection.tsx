import React, { useState } from 'react'
import { Plus, Search, List, Grid } from 'lucide-react'
import { PlaylistItem } from './PlaylistItem'
import { useFeaturedPlaylists, usePopularArtists } from 'services/saavnApi'
import Link from 'next/link'
import { SidebarTrigger } from './sidebar'

export function LibrarySection() {
  const [filter, setFilter] = useState<'all' | 'playlists' | 'artists' | 'albums'>('all')
  const { playlists, loading: playlistsLoading } = useFeaturedPlaylists()
  const { artists, loading: artistsLoading } = usePopularArtists()

  const getImageUrl = (images: any[]) => {
    if (!images || images.length === 0) return undefined
    const highQuality = images.find(img => img.quality === '500x500') || images[0]
    return highQuality?.url
  }

  const filteredPlaylists = filter === 'all' || filter === 'playlists' ? playlists : []
  const filteredArtists = filter === 'all' || filter === 'artists' ? artists : []

  return (
    <div className="px-2">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <h2 className="font-semibold text-spotify-gray text-sm">Your Library</h2>
          <Plus className="size-4 text-spotify-gray hover:text-white cursor-pointer transition-colors" />
        </div>
        <div className="flex items-center gap-2">
          <Search className="size-4 text-spotify-gray hover:text-white cursor-pointer transition-colors" />
          <List className="size-4 text-spotify-gray hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>

      <div className="flex gap-2 mb-4 px-2">
        {['all', 'playlists', 'artists', 'albums'].map((filterType) => (
          <button type="button"
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${filter === filterType
              ? 'bg-white text-black'
              : 'bg-spotify-gray/20 text-spotify-gray hover:bg-spotify-gray/30'
              }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <Link href={`/music/me/liked-songs`}>
          {/* Liked Songs - Static */}
          <PlaylistItem
            image="https://misc.scdn.co/liked-songs/liked-songs-64.png"
            title="Liked Songs"
            subtitle="0 songs"
            type="playlist"
          /></Link>

        {/* Featured Playlists */}
        {!playlistsLoading && filteredPlaylists.map((playlist) => (
            <Link key={`playlist-link-${playlist.id}`} href={`/music/playlist/${playlist.id}`}>
          <PlaylistItem
            key={`playlist-${playlist.id}`}
            image={getImageUrl(playlist.image)}
            title={playlist.name || 'Unknown Playlist'}
            subtitle={`Playlist • ${playlist.songCount || 0} songs`}
            type="playlist"
          />
         </Link>
        ))}

        {/* Popular Artists */}
        {!artistsLoading && filteredArtists.map((artist) => (
          <Link key={`artist-link-${artist.id}`} href={`/music/search?q=${artist.name}`}>
            <PlaylistItem
              key={`artist-${artist.id}`}
              image={getImageUrl(artist.image)}
              title={artist.name || 'Unknown Artist'}
              subtitle="Artist"
              type="artist"
            />
          </Link>
        ))}

        {/* Loading states */}
        {(playlistsLoading || artistsLoading) && (
          <div className="px-2 py-4">
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-12 bg-spotify-gray/20 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-spotify-gray/20 rounded mb-1"></div>
                    <div className="h-3 bg-spotify-gray/20 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
