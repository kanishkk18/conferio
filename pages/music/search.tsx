import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import type { AllSearch, Song } from "@/lib/music/jiosaavn";
import { getImageSrc } from "@/lib/music/jiosaavn";
import SongCard from "@/components/music/song-card";
import { Input } from "@/components/ui/input";
import { setQueueAndPlay } from "hooks/use-music-store";

export default function SearchPage() {
  const router = useRouter();
  const initialQuery = (router.query.q as string) ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AllSearch | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialQuery) return;
    setQuery(initialQuery);
    runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function runSearch(q: string) {
    if (!q.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/music/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
    runSearch(query);
  };

  // v0.1.0 uses .data not .results
  const songs: Song[] = results?.songs?.data ?? [];
  const albums = results?.albums?.data ?? [];
  const playlists = results?.playlists?.data ?? [];
  const artists = results?.artists?.data ?? [];
  const shows = results?.shows?.data ?? [];

  return (
    <div className="container py-3 space-y-6">
      {/* <form onSubmit={handleSubmit}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, albums, artists, playlists..."
          className="max-w-md"
        />
      </form> */}

      {loading && <p className="text-muted-foreground">Searching...</p>}

      {!loading && results && (
        <>
          {songs.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3">Songs</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} keepQueue />
                ))}
              </div>
              <button
                className="mt-3 text-sm text-primary underline"
                onClick={() => setQueueAndPlay(songs, 0)}
              >
                Play all
              </button>
            </section>
          )}

          {albums.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3">Albums</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
                {albums.map((album) => (
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

          {playlists.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3">Playlists</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
                {playlists.map((pl) => (
                  <Link key={pl.id} href={`/music/playlist/${pl.id}`}>
                    <SongCard title={pl.name} artist={pl.subtitle} image={getImageSrc(pl.image, "high")} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {artists.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3">Artists</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
                {artists.map((artist) => (
                  <Link key={artist.id} href={`/music/artist/${artist.id}`}>
                    <SongCard title={artist.name} artist="Artist" image={getImageSrc(artist.image, "high")} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {shows.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3">Shows/Podcasts</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
                {shows.map((show) => (
                  <Link key={show.id} href={`/music/show/${show.id}`}>
                    <SongCard title={show.title} artist="Show" image={getImageSrc(show.image, "high")} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}