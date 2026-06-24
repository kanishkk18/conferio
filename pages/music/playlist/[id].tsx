import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Play, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import type { Playlist, Song } from "@/lib/music/jiosaavn";
import { getImageSrc, formatDuration } from "@/lib/music/jiosaavn";
import { Button } from "@/components/ui/button";
import { SongMoreMenu } from "@/components/music/song-more-menu";
import { setQueueAndPlay } from "hooks/use-music-store";

export default function PlaylistPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const id = router.query.id as string;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/music/data?resource=playlist&id=${id}`)
      .then((r) => r.json())
      .then(setPlaylist)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error("Please sign in to favorite playlists");
      return;
    }
    if (!playlist) return;

    const method = isFavorite ? "DELETE" : "POST";
    await fetch("/api/music/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: playlist.id,
        type: "PLAYLIST",
        title: playlist.name,
        subtitle: playlist.subtitle,
        image: getImageSrc(playlist.image, "medium"),
      }),
    });

    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  if (loading) return <div className="container py-6">Loading...</div>;
  if (!playlist) return <div className="container py-6">Playlist not found</div>;

  const songs: Song[] = playlist.songs ?? [];

  return (
    <div className="container py-6 space-y-6">
      <div className="flex gap-6 items-end">
        <img
          src={getImageSrc(playlist.image, "high")}
          alt={playlist.name}
          className="w-48 h-48 rounded-lg object-cover shadow-lg"
        />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground uppercase">Playlist</p>
          <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
          {playlist.subtitle && <p className="text-muted-foreground">{playlist.subtitle}</p>}
          <div className="flex items-center gap-2 mt-4">
            <Button onClick={() => setQueueAndPlay(songs, 0)} className="gap-2">
              <Play className="h-4 w-4 fill-current" />
              Play
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFavorite}>
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {songs.map((song, i) => (
          <div
            key={`${song.id}-${i}`}
            className="flex items-center gap-4 py-2 px-2 rounded hover:bg-muted/50 cursor-pointer group"
            onClick={() => setQueueAndPlay(songs, i)}
          >
            <span className="w-6 text-center text-sm text-muted-foreground">{i + 1}</span>
            <img
              src={getImageSrc(song.image, "low")}
              alt={song.name}
              className="h-10 w-10 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{song.name}</p>
              <p className="truncate text-xs text-muted-foreground">{song.subtitle}</p>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDuration(song.duration)}
            </span>
            <div onClick={(e) => e.stopPropagation()}>
              <SongMoreMenu song={song} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
