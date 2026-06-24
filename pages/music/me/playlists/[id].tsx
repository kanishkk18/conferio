import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import { Play, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

import type { Song } from "lib/music/jiosaavn";
import { getImageSrc, formatDuration } from "lib/music/jiosaavn";
import { Button } from "@/components/ui/button";
import { SongMoreMenu } from "@/components/music/song-more-menu";
import { PlaylistManager } from "@/components/music/playlist-manager";
import { setQueueAndPlay } from "hooks/use-music-store";

type PlaylistData = {
  id: string;
  name: string;
  coverImage?: string | null;
  songIds: string[];
};

export default function UserPlaylistDetailPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = router.query.id as string;

  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(false);

  useEffect(() => {
    if (!id || status !== "authenticated") return;

    fetch(`/api/music/playlists?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPlaylist(data.playlist);
        return data.playlist?.songIds ?? [];
      })
      .then(fetchSongs)
      .finally(() => setLoading(false));
  }, [id, status]);

  async function fetchSongs(songIds: string[]) {
    if (!songIds.length) return;
    setLoadingSongs(true);
    try {
      const results = await Promise.all(
        songIds.map(async (songId) => {
          const res = await fetch(`/api/music/data?resource=song&id=${songId}`);
          const data = await res.json();
          return data.songs?.[0] as Song | undefined;
        })
      );
      setSongs(results.filter(Boolean) as Song[]);
    } finally {
      setLoadingSongs(false);
    }
  }

  async function removeSong(songId: string) {
    if (!playlist) return;
    try {
      const res = await fetch("/api/music/playlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playlist.id, removeSongId: songId }),
      });
      if (!res.ok) throw new Error();
      setPlaylist((p) => p ? { ...p, songIds: p.songIds.filter((s) => s !== songId) } : p);
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      toast.success("Removed from playlist");
    } catch {
      toast.error("Failed to remove song");
    }
  }

  if (status === "loading" || loading) return <div className="container py-6">Loading...</div>;

  if (status !== "authenticated") {
    return (
      <div className="container py-6 space-y-4">
        <p className="text-muted-foreground">Sign in to view your playlists.</p>
        <Button onClick={() => signIn()}>Sign in</Button>
      </div>
    );
  }

  if (!playlist) return <div className="container py-6">Playlist not found.</div>;

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex gap-6 items-end">
        <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg">
          {playlist.coverImage
            ? <img src={playlist.coverImage} className="w-full h-full object-cover" />
            : <span className="text-6xl">🎵</span>}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground uppercase">Your Playlist</p>
          <h1 className="text-4xl font-bold mb-1">{playlist.name}</h1>
          <p className="text-muted-foreground mb-4">
            {playlist.songIds.length} song{playlist.songIds.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setQueueAndPlay(songs, 0)}
              disabled={songs.length === 0}
              className="gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              Play all
            </Button>
            {/* Manage (rename/delete this playlist) */}
            <PlaylistManager
              trigger={
                <Button variant="outline" size="sm">Manage</Button>
              }
            />
          </div>
        </div>
      </div>

      {/* Song list */}
      {loadingSongs && <p className="text-muted-foreground">Loading songs...</p>}

      {!loadingSongs && songs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No songs in this playlist yet.</p>
          <p className="text-sm mt-1">Click the ⋮ menu on any song and choose "Add to playlist".</p>
        </div>
      )}

      <div className="divide-y">
        {songs.map((song, i) => (
          <div
            key={`${song.id}-${i}`}
            className="flex items-center gap-3 py-2 px-2 rounded hover:bg-muted/50 cursor-pointer group"
            onClick={() => setQueueAndPlay(songs, i)}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100" />
            <span className="w-5 text-center text-sm text-muted-foreground group-hover:hidden">{i + 1}</span>
            <img
              src={getImageSrc(song.image, "low")}
              alt={song.name}
              className="h-10 w-10 rounded object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{song.name}</p>
              <p className="truncate text-xs text-muted-foreground">{song.subtitle}</p>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
              {formatDuration(song.duration)}
            </span>
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <SongMoreMenu song={song} />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                onClick={() => removeSong(song.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
