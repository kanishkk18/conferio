import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import SongCard from "@/components/music/song-card";
import { setQueueAndPlay } from "hooks/use-music-store";
import type { Song } from "@/lib/music/jiosaavn";
import { redirect } from "next/navigation";

type RecentItem = {
  id: string;
  itemId: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  duration: number | null;
  playedAt: string;
};

export default function RecentlyPlayedPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    fetch("/api/music/recently-played")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="container py-6">Loading...</div>;
  }

  if (status !== "authenticated") {
    redirect("/");
  }

  const toSong = (item: RecentItem): Song => ({
    id: item.itemId,
    name: item.title,
    subtitle: item.subtitle ?? "",
    type: "song",
    image: item.image
      ? [
        { quality: "50x50", url: item.image },
        { quality: "150x150", url: item.image },
        { quality: "500x500", url: item.image },
      ]
      : [],
    language: "unknown",
    download_url: [],
    duration: item.duration ?? 0,
  });

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Recently Played</h1>

      {items.length === 0 && (
        <p className="text-muted-foreground">No recently played tracks yet.</p>
      )}

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={async () => {
              // re-fetch full song data (download_url) before playing
              const res = await fetch(`/api/music/data?resource=song&id=${item.itemId}`);
              const data = await res.json();
              const song = data.songs?.[0];
              if (song) setQueueAndPlay([song], 0);
            }}
          >
            <SongCard
              title={item.title}
              artist={item.subtitle ?? ""}
              image={item.image ?? undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
