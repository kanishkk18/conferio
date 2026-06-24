import { useState } from "react";
import { Play } from "lucide-react";

import type { Song } from "@/lib/music/jiosaavn";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getImageSrc } from "@/lib/music/jiosaavn";
import { playSong, setQueueAndPlay } from "hooks/use-music-store";
import { SongMoreMenu } from "./song-more-menu";

type SongCardProps = {
  song?: Song;
  title?: string;
  image?: string;
  artist?: string;
  id?: string;
  desc?: string;
  keepQueue?: boolean;
};

export default function SongCard({ song, title, image, artist, desc, keepQueue }: SongCardProps) {
  const [hovered, setHovered] = useState(false);

  const displayTitle = title ?? song?.name ?? "";
  const displayArtist = artist ?? song?.subtitle ?? "";
  const displayImage = image ?? (song ? getImageSrc(song.image, "high") : undefined);

  const handlePlay = () => {
    if (song) playSong(song);
  };

  return (
    <div
      className="h-fit w-[200px] rounded-lg py-2.5 px-3 relative overflow-hidden group hover:bg-[#1F1F1F]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="overflow-hidden rounded-md">
        {displayImage ? (
          <div className="relative shadow-md cursor-pointer" onClick={handlePlay}>
            <img
              src={displayImage}
              alt={displayTitle}
              className="w-full aspect-square object-cover rounded-md mb-1"
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2 text-white rounded-full bg-blue-600 hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
            >
              <Play className="h-4 w-4 text-white fill-white" />
            </Button>

            {song && (
              <div
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <SongMoreMenu song={song} />
              </div>
            )}
          </div>
        ) : (
          <Skeleton className="w-full h-[182px]" />
        )}
      </div>
      <div className="cursor-pointer" onClick={handlePlay}>
        {displayTitle ? (
          <h1 className="font-medium text-white truncate">
            {displayTitle.slice(0, 20)}
            {displayTitle.length > 20 && "..."}
          </h1>
        ) : (
          <Skeleton className="w-[70%] h-4 mt-2" />
        )}
        {desc && <p className="text-xs text-muted-foreground">{desc.slice(0, 30)}</p>}
        {displayArtist ? (
          <p className="text-sm font-medium text-gray-400 truncate">
            {displayArtist.slice(0, 20)}
            {displayArtist.length > 20 && "..."}
          </p>
        ) : (
          <Skeleton className="w-10 h-2 mt-2" />
        )}
      </div>
    </div>
  );
}
