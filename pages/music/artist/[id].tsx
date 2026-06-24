import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

import type { Artist } from "@/lib/music/jiosaavn";
import { getImageSrc } from "@/lib/music/jiosaavn";
import { Button } from "@/components/ui/button";
import SongCard from "@/components/music/song-card";
import { setQueueAndPlay } from "hooks/use-music-store";

export default function ArtistPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const id = router.query.id as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/music/data?resource=artist&id=${id}`)
      .then((r) => r.json())
      .then(setArtist)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error("Please sign in to favorite artists");
      return;
    }
    if (!artist) return;

    const method = isFavorite ? "DELETE" : "POST";
    await fetch("/api/music/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: artist.id,
        type: "ARTIST",
        title: artist.name,
        image: getImageSrc(artist.image, "medium"),
      }),
    });

    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  if (loading) return <div className="container py-6">Loading...</div>;
  if (!artist) return <div className="container py-6">Artist not found</div>;

  const topSongs = artist.topSongs ?? [];
  const topAlbums = artist.topAlbums ?? [];

  return (
    <div className="container py-6 space-y-8">
      <div className="flex gap-6 items-end">
        <img
          src={getImageSrc(artist.image, "high")}
          alt={artist.name}
          className="w-48 h-48 rounded-full object-cover shadow-lg"
        />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground uppercase">Artist</p>
          <h1 className="text-4xl font-bold mb-2">{artist.name}</h1>
          <div className="flex items-center gap-2 mt-4">
            {topSongs.length > 0 && (
              <Button onClick={() => setQueueAndPlay(topSongs, 0)}>Play top songs</Button>
            )}
            <Button variant="outline" size="icon" onClick={toggleFavorite}>
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {topSongs.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Top Songs</h2>
          <div className="flex flex-wrap gap-2">
            {topSongs.map((song) => (
              <SongCard key={song.id} song={song} keepQueue />
            ))}
          </div>
        </section>
      )}

      {topAlbums.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Albums</h2>
          <div className="flex flex-wrap gap-2">
            {topAlbums.map((album) => (
              <Link key={album.id} href={`/music/album/${album.id}`}>
                <SongCard
                  title={album.name}
                  artist={album.subtitle}
                  image={getImageSrc(album.image, "high")}
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
