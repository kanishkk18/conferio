// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { MoreVertical, Heart, ListPlus, Plus, ListMusic, Loader2 } from "lucide-react";
// import { toast } from "sonner";

// import type { Song } from "@/lib/music/jiosaavn";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSub,
//   DropdownMenuSubContent,
//   DropdownMenuSubTrigger,
//   DropdownMenuPortal,
// } from "@/components/ui/dropdown-menu";
// import { getImageSrc } from "@/lib/music/jiosaavn";
// import { addToQueue } from "hooks/use-music-store";

// type MusicPlaylist = {
//   id: string;
//   name: string;
//   songIds: string[];
// };

// export function SongMoreMenu({ song }: { song: Song }) {
//   const { data: session } = useSession();
//   const [playlists, setPlaylists] = useState<MusicPlaylist[] | null>(null);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [loadingFav, setLoadingFav] = useState(false);
//   const [open, setOpen] = useState(false);

//   const authed = !!session?.user;

//   useEffect(() => {
//     if (!open || !authed) return;

//     fetch("/api/music/playlists")
//       .then((r) => r.json())
//       .then((data) => setPlaylists(data.playlists ?? []))
//       .catch(() => setPlaylists([]));
//   }, [open, authed]);

//   const requireAuth = () => {
//     if (!authed) {
//       toast.error("Please sign in to use this feature");
//       return false;
//     }
//     return true;
//   };

//   const handleAddToQueue = () => {
//     addToQueue([song]);
//     toast.success("Added to queue");
//   };

//   const handleToggleFavorite = async () => {
//     if (!requireAuth()) return;

//     setLoadingFav(true);
//     try {
//       const method = isFavorite ? "DELETE" : "POST";
//       const res = await fetch("/api/music/favorites", {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           itemId: song.id,
//           type: "SONG",
//           title: song.name,
//           subtitle: song.subtitle,
//           image: getImageSrc(song.image, "medium"),
//         }),
//       });

//       if (!res.ok) throw new Error("Failed");

//       setIsFavorite(!isFavorite);
//       toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
//     } catch {
//       toast.error("Something went wrong");
//     } finally {
//       setLoadingFav(false);
//     }
//   };

//   const handleAddToPlaylist = async (playlistId: string) => {
//     if (!requireAuth()) return;

//     try {
//       const res = await fetch("/api/music/playlists", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: playlistId, addSongId: song.id }),
//       });

//       if (!res.ok) throw new Error("Failed");

//       toast.success("Added to playlist");
//     } catch {
//       toast.error("Something went wrong");
//     }
//   };

//   return (
//     <DropdownMenu onOpenChange={setOpen}>
//       <DropdownMenuTrigger asChild>
//         <Button
//           size="icon"
//           variant="ghost"
//           className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
//         >
//           <MoreVertical className="h-4 w-4" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-48">
//         <DropdownMenuItem onClick={handleAddToQueue}>
//           <ListPlus className="mr-2 h-4 w-4" />
//           Add to queue
//         </DropdownMenuItem>

//         <DropdownMenuItem onClick={handleToggleFavorite} disabled={loadingFav}>
//           {loadingFav ? (
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           ) : (
//             <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
//           )}
//           {isFavorite ? "Remove from favorites" : "Add to favorites"}
//         </DropdownMenuItem>

//         <DropdownMenuSub>
//           <DropdownMenuSubTrigger>
//             <ListMusic className="mr-2 h-4 w-4" />
//             Add to playlist
//           </DropdownMenuSubTrigger>
//           <DropdownMenuPortal>
//             <DropdownMenuSubContent>
//               {playlists === null && <DropdownMenuItem disabled>Loading...</DropdownMenuItem>}
//               {playlists?.length === 0 && (
//                 <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>
//               )}
//               {playlists?.map((p) => (
//                 <DropdownMenuItem key={p.id} onClick={() => handleAddToPlaylist(p.id)}>
//                   <Plus className="mr-2 h-4 w-4" />
//                   {p.name}
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuSubContent>
//           </DropdownMenuPortal>
//         </DropdownMenuSub>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MoreVertical, Heart, ListPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Song } from "@/lib/music/jiosaavn";
import { getImageSrc } from "@/lib/music/jiosaavn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { addToQueue } from "hooks/use-music-store";
import { PlaylistManager } from "./playlist-manager";

export function SongMoreMenu({ song }: { song: Song }) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [open, setOpen] = useState(false);

  const authed = !!session?.user;

  const handleAddToQueue = () => {
    addToQueue([song]);
    toast.success("Added to queue");
  };

  const handleToggleFavorite = async () => {
    if (!authed) { toast.error("Please sign in"); return; }

    setLoadingFav(true);
    try {
      const method = isFavorite ? "DELETE" : "POST";
      const res = await fetch("/api/music/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: song.id,
          type: "SONG",
          title: song.name,
          subtitle: song.subtitle,
          image: getImageSrc(song.image, "medium"),
        }),
      });
      if (!res.ok) throw new Error();
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onClick={handleAddToQueue}>
          <ListPlus className="mr-2 h-4 w-4" />
          Add to queue
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleToggleFavorite} disabled={loadingFav}>
          {loadingFav
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current text-red-500" : ""}`} />}
          {isFavorite ? "Remove from favorites" : "Add to favorites"}
        </DropdownMenuItem>

        {authed && (
          <>
            <DropdownMenuSeparator />
            {/* Render PlaylistManager inline inside the dropdown */}
            <div className="px-2 py-1">
              <PlaylistManager
                addSongId={song.id}
                onAdded={() => setOpen(false)}
              />
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
