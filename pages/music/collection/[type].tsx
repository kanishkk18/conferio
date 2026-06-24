import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { getImageSrc } from "@/lib/music/jiosaavn";
import SongCard from "@/components/music/song-card";

type Item = {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
  image: { quality: string; link?: string; url?: string }[] | string;
  type?: string;
};

const COLLECTION_CONFIG: Record<
  string,
  { resource: string; title: string; linkPrefix: string }
> = {
  album: { resource: "top-albums", title: "Top Albums", linkPrefix: "/music/album" },
  chart: { resource: "charts", title: "Top Charts", linkPrefix: "/music/playlist" },
  playlist: { resource: "featured-playlists", title: "Top Playlists", linkPrefix: "/music/playlist" },
  artist: { resource: "top-artists", title: "Top Artists", linkPrefix: "/music/artist" },
  show: { resource: "top-shows", title: "Podcasts", linkPrefix: "/music/show" },
};

// Check if value is array
const isArr = (v: unknown): v is unknown[] => Array.isArray(v);

// Extract array from any possible nesting level
function extractArray(data: unknown): unknown[] {
  if (isArr(data)) return data;
  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;

  // 1st level: { data: [...] }, { results: [...] }, etc.
  if (isArr(obj.data)) return obj.data;
  if (isArr(obj.results)) return obj.results;
  if (isArr(obj.albums)) return obj.albums;
  if (isArr(obj.songs)) return obj.songs;
  if (isArr(obj.playlists)) return obj.playlists;
  if (isArr(obj.artists)) return obj.artists;
  if (isArr(obj.shows)) return obj.shows;
  if (isArr(obj.topSongs)) return obj.topSongs;

  // 2nd level: { data: { results: [...] } }, { data: { songs: [...] } }, etc.
  if (obj.data && typeof obj.data === "object" && !isArr(obj.data)) {
    const inner = obj.data as Record<string, unknown>;
    if (isArr(inner.results)) return inner.results;
    if (isArr(inner.data)) return inner.data;
    if (isArr(inner.albums)) return inner.albums;
    if (isArr(inner.songs)) return inner.songs;
    if (isArr(inner.playlists)) return inner.playlists;
    if (isArr(inner.artists)) return inner.artists;
    if (isArr(inner.shows)) return inner.shows;
    if (isArr(inner.topSongs)) return inner.topSongs;
  }

  // 3rd level: { data: { data: { songs: [...] } } } (some v0.1.0 responses)
  if (obj.data && typeof obj.data === "object" && !isArr(obj.data)) {
    const inner = obj.data as Record<string, unknown>;
    if (inner.data && typeof inner.data === "object" && !isArr(inner.data)) {
      const deep = inner.data as Record<string, unknown>;
      if (isArr(deep.songs)) return deep.songs;
      if (isArr(deep.albums)) return deep.albums;
      if (isArr(deep.playlists)) return deep.playlists;
      if (isArr(deep.artists)) return deep.artists;
      if (isArr(deep.results)) return deep.results;
    }
  }

  return [];
}

export function CollectionView({ type }: { type: string }) {
  const config = COLLECTION_CONFIG[type] ?? COLLECTION_CONFIG.album;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/music/data?resource=${config.resource}&n=50`)
      .then((r) => r.json())
      .then((data) => {
        const results = extractArray(data) as Item[];
        
        // DEBUG: Log the full response so we can see what's happening
        console.log(`[${type}] Full API response:`, JSON.stringify(data).slice(0, 500));
        console.log(`[${type}] Extracted items:`, results.length);
        
        setItems(results);
      })
      .catch((err) => {
        console.error(`[${type}] Load error:`, err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [config.resource, type]);

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">{config.title}</h1>

      {loading && <p className="text-muted-foreground">Loading...</p>}

      {!loading && items.length === 0 && (
        <p className="text-muted-foreground">No items found.</p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
          {items.map((item) => (
            <Link key={item.id} href={`${config.linkPrefix}/${item.id}`}>
              <SongCard
                title={item.name ?? item.title ?? "Unknown"}
                artist={item.subtitle}
                image={getImageSrc(item.image, "high")}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CollectionPage() {
  const router = useRouter();
  const type = (router.query.type as string) ?? "album";

  return <CollectionView type={type} />;
}