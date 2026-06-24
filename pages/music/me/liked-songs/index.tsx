import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import SongCard from "@/components/music/song-card";
import { setQueueAndPlay } from "hooks/use-music-store";
import type { Song } from "@/lib/music/jiosaavn";

type Favorite = {
  id: string;
  itemId: string;
  type: string;
  title: string;
  subtitle: string | null;
  image: string | null;
};

export default function LikedSongsPage() {
  const { status } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    fetch("/api/music/favorites?type=song")
      .then((r) => r.json())
      .then((data) => setFavorites(data.favorites ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="container py-6">Loading...</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="container py-6 space-y-4">
        <h1 className="text-3xl font-bold">Your Favorites</h1>
        <p className="text-muted-foreground">Sign in to see your liked songs.</p>
        <Button onClick={() => signIn()}>Sign in</Button>
      </div>
    );
  }

  const playFavorite = async (itemId: string) => {
    const res = await fetch(`/api/music/data?resource=song&id=${itemId}`);
    const data = await res.json();
    const song: Song | undefined = data.songs?.[0];
    if (song) setQueueAndPlay([song], 0);
  };

  const playAll = async () => {
    const songs: Song[] = [];
    for (const fav of favorites) {
      const res = await fetch(`/api/music/data?resource=song&id=${fav.itemId}`);
      const data = await res.json();
      if (data.songs?.[0]) songs.push(data.songs[0]);
    }
    if (songs.length) setQueueAndPlay(songs, 0);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Favorites</h1>
        {favorites.length > 0 && <Button onClick={playAll}>Play all</Button>}
      </div>

      {favorites.length === 0 && (
        <p className="text-muted-foreground">No liked songs yet. Tap the heart icon on any song to add it here.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {favorites.map((fav) => (
          <div key={fav.id} onClick={() => playFavorite(fav.itemId)}>
            <SongCard title={fav.title} artist={fav.subtitle ?? ""} image={fav.image ?? undefined} />
          </div>
        ))}
      </div>
    </div>
  );
}
