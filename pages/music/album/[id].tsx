import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Play, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import type { Album } from "@/lib/music/jiosaavn";
import { getImageSrc, formatDuration } from "@/lib/music/jiosaavn";
import { Button } from "@/components/ui/button";
import { SongMoreMenu } from "@/components/music/song-more-menu";
import { setQueueAndPlay } from "hooks/use-music-store";

export default function AlbumPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const id = router.query.id as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/music/data?resource=album&id=${id}`)
      .then((r) => r.json())
      .then(setAlbum)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error("Please sign in to favorite albums");
      return;
    }
    if (!album) return;

    const method = isFavorite ? "DELETE" : "POST";
    await fetch("/api/music/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: album.id,
        type: "ALBUM",
        title: album.name,
        subtitle: album.subtitle,
        image: getImageSrc(album.image, "medium"),
      }),
    });

    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  if (loading) return <div className="container py-6">Loading...</div>;
  if (!album) return <div className="container py-6">Album not found</div>;

  const songs = album.songs ?? [];

  return (
    <div className="container py-6 space-y-6">
      <div className="flex gap-6 items-end">
        <img
          src={getImageSrc(album.image, "high")}
          alt={album.name}
          className="w-48 h-48 rounded-lg object-cover shadow-lg"
        />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground uppercase">Album</p>
          <h1 className="text-4xl font-bold mb-2">{album.name}</h1>
          <p className="text-muted-foreground">{album.subtitle}</p>
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
            key={song.id}
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
              {formatDuration(song.duration, "mm:ss")}
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
