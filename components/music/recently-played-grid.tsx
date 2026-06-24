// components/music/recently-played-grid.tsx
import { useEffect, useState } from "react";
import Link from "next/link";

type RecentItem = {
  id: string;
  itemId: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  type: string;
  playedAt: string;
};

function getLinkPrefix(type: string): string {
  switch (type) {
    case "album": return "/music/album";
    case "playlist": return "/music/playlist";
    case "artist": return "/music/artist";
    case "show": return "/music/show";
    default: return "/music/playlist";
  }
}

export function RecentlyPlayedGrid() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/music/recently-played")
      .then((r) => r.json())
      .then((data) => {
        // Deduplicate by itemId, keep most recent, limit to 8
        const seen = new Set<string>();
        const unique: RecentItem[] = [];
        (data.items ?? []).forEach((item: RecentItem) => {
          if (!seen.has(item.itemId)) {
            seen.add(item.itemId);
            unique.push(item);
          }
        });
        setItems(unique.slice(0, 8));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Loading skeleton — exact same layout
  if (loading) {
    return (
      <div className="my-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex rounded-sm overflow-hidden h-[3.2rem] bg-slate-500/20 justify-start gap-3 items-center animate-pulse"
          >
            <div className="h-full w-[56px] bg-slate-500/30 flex-shrink-0" />
            <div className="h-4 w-32 bg-slate-500/30 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state — keep original placeholders
  if (items.length === 0) {
    return (
      <div className="my-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex rounded-sm overflow-hidden h-[3.2rem] bg-slate-500/20 justify-start gap-3 items-center"
          >
            <img
              className="h-full w-[56px] object-cover flex-shrink-0"
              src="https://i.pinimg.com/736x/2b/0d/6c/2b0d6c71a0a6e9ffe42f384fccc6ab67.jpg"
              alt="Album Art"
            />
            <h1 className="text-base font-semibold">Featured Album</h1>
          </div>
        ))}
      </div>
    );
  }

  // Real data — exact same design as your original
  return (
    <div className="py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 w-full">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${getLinkPrefix(item.type)}?q=${item.itemId}`}
          className="flex rounded-sm overflow-hidden h-[3.2rem] bg-slate-500/20 justify-start gap-3 items-center hover:bg-slate-500/30 transition-colors cursor-pointer group"
        >
          <img
            className="h-full w-[56px] object-cover flex-shrink-0"
            src={item.image || "https://i.pinimg.com/736x/2b/0d/6c/2b0d6c71a0a6e9ffe42f384fccc6ab67.jpg"}
            alt={item.title}
          />
          <div className="min-w-0 pr-2">
            <h1 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
              {item.title}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {item.subtitle || "Recently played"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}