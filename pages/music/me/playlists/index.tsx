import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { ListMusic, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlaylistManager, type MusicPlaylist } from "@/components/music/playlist-manager";
import { setQueueAndPlay } from "hooks/use-music-store";

export default function MyPlaylistsPage() {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") { setLoading(false); return; }

    fetch("/api/music/playlists")
      .then((r) => r.json())
      .then((data) => setPlaylists(data.playlists ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="container py-6">Loading...</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="container py-6 space-y-4">
        <h1 className="text-3xl font-bold">My Playlists</h1>
        <p className="text-muted-foreground">Sign in to create and manage playlists.</p>
        <Button onClick={() => signIn()}>Sign in</Button>
      </div>
    );
  }

  async function playPlaylist(playlist: MusicPlaylist) {
    if (!playlist.songIds.length) return;

    // Fetch full song objects for all ids in the playlist
    const songs = await Promise.all(
      playlist.songIds.map(async (id) => {
        const res = await fetch(`/api/music/data?resource=song&id=${id}`);
        const data = await res.json();
        return data.songs?.[0];
      })
    );

    const valid = songs.filter(Boolean);
    if (valid.length) setQueueAndPlay(valid, 0);
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Playlists</h1>
        {/* Manager dialog for creating */}
        <PlaylistManager
          trigger={
            <Button className="gap-2">
              <ListMusic className="h-4 w-4" />
              Manage Playlists
            </Button>
          }
        />
      </div>

      {playlists.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <ListMusic className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">
            You haven't created any playlists yet.
          </p>
          <PlaylistManager />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="group relative rounded-lg p-3 hover:bg-[#1F1F1F] transition-colors">
            {/* Cover */}
            <Link href={`/music/me/playlists/${playlist.id}`}>
              <div className="relative aspect-square w-full rounded-md bg-muted mb-2 flex items-center justify-center overflow-hidden cursor-pointer">
                {playlist.coverImage ? (
                  <img src={playlist.coverImage} className="h-full w-full object-cover" />
                ) : (
                  <ListMusic className="h-12 w-12 text-muted-foreground" />
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                  <Button
                    size="icon"
                    className="rounded-full bg-blue-600 h-9 w-9"
                    onClick={(e) => {
                      e.preventDefault();
                      playPlaylist(playlist);
                    }}
                  >
                    <Play className="h-4 w-4 fill-white text-white" />
                  </Button>
                </div>
              </div>
            </Link>

            <Link href={`/music/me/playlists/${playlist.id}`}>
              <p className="font-medium text-sm truncate cursor-pointer hover:underline">{playlist.name}</p>
            </Link>
            <p className="text-xs text-muted-foreground">
              {playlist.songIds.length} song{playlist.songIds.length !== 1 ? "s" : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
