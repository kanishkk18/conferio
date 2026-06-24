import { useEffect, useState } from "react";
import { Radio as RadioIcon, Play } from "lucide-react";

import { getImageSrc } from "@/lib/music/jiosaavn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setQueueAndPlay } from "hooks/use-music-store";

type Station = {
  id: string;
  name?: string;
  title?: string;
  image: { quality: string; url: string }[];
};

export default function RadioPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/music/data?resource=radio-stations&n=30")
      .then((r) => r.json())
      .then((data) => setStations(data.results ?? data.featured_stations ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function playStation(stationId: string) {
    const res = await fetch(`/api/music/data?resource=radio-songs&id=${stationId}&n=20`);
    const songs = await res.json();
    if (Array.isArray(songs) && songs.length) {
      setQueueAndPlay(songs, 0);
    }
  }

  async function createCustomRadio() {
    if (!query.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(
        `/api/music/data?resource=radio-create&type=featured&name=${encodeURIComponent(query)}`,
      );
      const data = await res.json();

      if (data.stationid) {
        await playStation(data.stationid);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Radio</h1>

      <div className="flex gap-2 max-w-md">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Create radio from any keyword (artist, mood, genre...)"
        />
        <Button onClick={createCustomRadio} disabled={creating}>
          {creating ? "..." : "Create"}
        </Button>
      </div>

      {loading && <p className="text-muted-foreground">Loading stations...</p>}

      <div className="flex flex-wrap gap-3">
        {stations.map((station) => (
          <div
            key={station.id}
            className="w-[200px] rounded-lg p-3 hover:bg-[#1F1F1F] cursor-pointer group relative"
            onClick={() => playStation(station.id)}
          >
            <div className="relative">
              <img
                src={getImageSrc(station.image, "high")}
                alt={station.name ?? station.title}
                className="w-full aspect-square object-cover rounded-md mb-1"
              />
              <Button
                size="icon"
                className="absolute right-2 bottom-2 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="h-4 w-4 fill-white text-white" />
              </Button>
            </div>
            <h3 className="font-medium truncate flex items-center gap-1">
              <RadioIcon className="h-3 w-3" />
              {station.name ?? station.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
