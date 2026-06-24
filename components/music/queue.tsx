import { X, GripVertical } from "lucide-react";

import { getImageSrc } from "@/lib/music/jiosaavn";
import { useCurrentSongIndex, useQueue } from "hooks/use-music-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Queue({ onClose }: { onClose: () => void }) {
  const [queue, setQueue] = useQueue();
  const [currentIndex, setCurrentIndex] = useCurrentSongIndex();

  const removeFromQueue = (index: number) => {
    const next = queue.filter((_, i) => i !== index);
    setQueue(next);

    if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (index === currentIndex && next.length) {
      setCurrentIndex(Math.min(currentIndex, next.length - 1));
    }
  };

  return (
    <div className="fixed bottom-[72px] right-4 z-50 w-80 max-h-[60vh] overflow-y-auto rounded-lg border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold">Queue ({queue.length})</h3>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="divide-y">
        {queue.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Queue is empty</p>
        )}

        {queue.map((song, i) => (
          <div
            key={`${song.id}-${i}`}
            className={cn(
              "flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted/50",
              i === currentIndex && "bg-muted",
            )}
            onClick={() => setCurrentIndex(i)}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <img
              src={getImageSrc(song.image, "low")}
              alt={song.name}
              className="h-10 w-10 rounded object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{song.name}</p>
              <p className="truncate text-xs text-muted-foreground">{song.subtitle}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                removeFromQueue(i);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
