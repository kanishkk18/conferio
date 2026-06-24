import { useEffect, useState } from "react";
import Link from "next/link";

import { getImageSrc } from "@/lib/music/jiosaavn";
import SongCard from "@/components/music/song-card";
import { setQueueAndPlay } from "hooks/use-music-store";
import type { Song } from "@/lib/music/jiosaavn";
import { AlbumCarousel } from '@/components/music/ui/MusicCarousel';
import ArtistCard from 'components/music-components/cards/artist';
import { ScrollArea, ScrollBar } from 'components/ui/scroll-area';
import { Skeleton } from 'components/ui/skeleton';
import { getSongsByQuery, searchAlbumByQuery } from 'lib/fetch';
import { useMemo } from 'react';
import { Button } from 'components/ui/button';
// import MusicDiscovery from "@/components/music/discovery";
import { RecentlyPlayedGrid } from "@/components/music/recently-played-grid";


type HomeData = {
  [key: string]: {
    title?: string;
    subtitle?: string;
    data?: any[];
  };
};

export default function MusicHomePage() {
  const [home, setHome] = useState<HomeData | null>(null);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);

  const getSongs = async (query, setter) => {
    try {
      const res = await getSongsByQuery(query);
      const data = await res.json();
      setter(data?.data?.results || []);
    } catch (err) {
      setError('Failed to load songs');
    }
  };

  const getAlbums = async () => {
    try {
      const res = await searchAlbumByQuery('latest');
      const data = await res.json();
      setAlbums(data?.data?.results || []);
    } catch (err) {
      setError('Failed to load albums');
    }
  };

  useEffect(() => {
    getSongs('latest', setLatest);
    getSongs('bollywood', setPopular);
    getAlbums();
  }, []);

  /* ---------------- TRENDING (frontend-based) ---------------- */
  const trending = useMemo(() => {
    return [...popular]
      .sort(
        (a, b) =>
          (b.playCount || b.listeners || 0) -
          (a.playCount || a.listeners || 0)
      )
      .slice(0, 15);
  }, [popular]);

  /* ---------------- UNIQUE ARTISTS (optimized) ---------------- */
  const uniqueArtists = useMemo(() => {
    const map = new Map();
    latest.forEach((song) => {
      const artist = song?.artists?.primary?.[0];
      if (artist && !map.has(artist.id)) {
        map.set(artist.id, artist);
      }
    });
    return Array.from(map.values());
  }, [latest]);


  useEffect(() => {
    Promise.all([
      fetch("/api/music/data?resource=home").then((r) => r.json()),
      fetch("/api/music/data?resource=trending&type=song").then((r) => r.json()),
    ])
      .then(([homeData, trending]) => {
        setHome(homeData);
        setTrendingSongs(trending.song ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container py-6">Loading...</div>;

  const sections = Object.entries(home ?? {}).filter(
    ([, value]) => Array.isArray(value?.data) && value.data.length > 0,
  );

  return (
    <>
      <AlbumCarousel />
      <RecentlyPlayedGrid />
    
      <div className="container py-6 space-y-10 dark">
        <div className="space-y-10">

          <div>
            <div className="px-2">
              <h1 className="font-bold text-2xl font-jakarta">
                Today's biggest hits
              </h1>
            </div>

            <ScrollArea className="rounded-md mt-1">
              <div className="flex">
                {latest.length
                  ? latest
                    .slice()
                    .reverse()
                    .map((song) => (
                      <SongCard
                        key={song.id}
                        image={song.image[2].url}
                        album={song.album}
                        title={song.name}
                        artist={song.artists.primary[0].name}
                        id={song.id}
                      />
                    ))
                  : Array.from({ length: 10 }).map((_, i) => (
                    <SongCard key={i} />
                  ))}
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </div>
         
          {/* ARTISTS */}
          <div>
            <div className="px-2">
              <h1 className="font-bold text-2xl font-jakarta">
                Most searched artists
              </h1>
            </div>

            <ScrollArea className="rounded-md mt-1">
              <div className="flex">
                {uniqueArtists.length
                  ? uniqueArtists.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      id={artist.id}
                      image={
                        artist.image?.[2]?.url ||
                        `https://az-avatar.vercel.app/api/avatar/?bgColor=0f0f0f&fontSize=60&text=${artist.name[0]}`
                      }
                      name={artist.name}
                    />
                  ))
                  : Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="grid gap-2">
                      <Skeleton className="h-[100px] w-[100px] rounded-2xl" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </div>

         
        
        </div>


        {trendingSongs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Trending Songs</h2>
              <button
                className="text-sm text-primary underline"
                onClick={() => setQueueAndPlay(trendingSongs, 0)}
              >
                Play all
              </button>
            </div>
            <div className="flex gap-0 overflow-x-auto pb-2">
              {trendingSongs.map((song) => (
                <SongCard key={song.id} song={song} keepQueue />
              ))}
            </div>
          </section>
        )}

        {sections.map(([key, section]) => (
          <section key={key}>
            <h2 className="text-xl font-semibold mb-3">{section.title ?? key}</h2>
            <div className="flex gap-0 overflow-x-auto pb-2">
              {section.data!.slice(0, 12).map((item: any) => {
                const href =
                  item.type === "song"
                    ? undefined
                    : item.type === "album"
                      ? `/music/album/${item.id}`
                      : item.type === "playlist" || item.type === "radio_station" || item.type === "mix"
                        ? `/music/playlist/${item.id}`
                        : item.type === "artist"
                          ? `/music/artist/${item.id}`
                          : item.type === "show"
                            ? `/music/show/${item.id}`
                            : undefined;

                const card = (
                  <SongCard
                    song={item.type === "song" ? item : undefined}
                    title={item.name ?? item.title}
                    artist={item.subtitle}
                    image={getImageSrc(item.image, "high")}
                    keepQueue
                  />
                );

                return href ? (
                  <Link key={item.id} href={href}>
                    {card}
                  </Link>
                ) : (
                  <div key={item.id}>{card}</div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
