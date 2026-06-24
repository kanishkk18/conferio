import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, Loader2, ListMusic, X, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type MusicPlaylist = {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  songIds: string[];
  createdAt: string;
};

type Props = {
  /** If provided, shows an "Add to playlist" button that adds this song to whichever playlist the user picks */
  addSongId?: string;
  /** Callback after a song is added to a playlist */
  onAdded?: (playlistId: string) => void;
  /** Custom trigger element */
  trigger?: React.ReactNode;
};

export function PlaylistManager({ addSongId, onAdded, trigger }: Props) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !session?.user) return;
    loadPlaylists();
  }, [open, session]);

  async function loadPlaylists() {
    setLoading(true);
    try {
      const res = await fetch("/api/music/playlists");
      const data = await res.json();
      setPlaylists(data.playlists ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/music/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlaylists((prev) => [data.playlist, ...prev]);
      setNewName("");
      toast.success(`Playlist "${data.playlist.name}" created`);

      // If we're in "add song" mode, add to the new playlist immediately
      if (addSongId) {
        await addSongToPlaylist(data.playlist.id, data.playlist.name);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(id: string) {
    if (!editingName.trim()) { setEditingId(null); return; }
    try {
      const res = await fetch("/api/music/playlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editingName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlaylists((prev) => prev.map((p) => (p.id === id ? data.playlist : p)));
      toast.success("Playlist renamed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename");
    } finally {
      setEditingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/music/playlists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed");
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      toast.success("Playlist deleted");
    } catch {
      toast.error("Failed to delete playlist");
    }
  }

  async function addSongToPlaylist(playlistId: string, playlistName: string) {
    if (!addSongId) return;
    setAddingTo(playlistId);
    try {
      const res = await fetch("/api/music/playlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playlistId, addSongId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Added to "${playlistName}"`);
      onAdded?.(playlistId);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add song");
    } finally {
      setAddingTo(null);
    }
  }

  if (!session?.user) return null;

  const defaultTrigger = addSongId ? (
    <Button variant="ghost" size="sm" className="gap-1 text-xs">
      <ListMusic className="h-3 w-3" />
      Add to playlist
    </Button>
  ) : (
    <Button variant="outline" size="sm" className="gap-2">
      <ListMusic className="h-4 w-4" />
      My Playlists
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {addSongId ? "Add to Playlist" : "My Playlists"}
          </DialogTitle>
        </DialogHeader>

        {/* Create new playlist */}
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New playlist name..."
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={creating || !newName.trim()} size="icon">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {/* Playlist list */}
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && playlists.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No playlists yet. Create one above!
            </p>
          )}

          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50 group"
            >
              {/* Playlist cover or icon */}
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {playlist.coverImage ? (
                  <img src={playlist.coverImage} className="h-full w-full object-cover" />
                ) : (
                  <ListMusic className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Name / edit */}
              <div className="flex-1 min-w-0">
                {editingId === playlist.id ? (
                  <div className="flex gap-1">
                    <Input
                      value={editingName}
                      autoFocus
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(playlist.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-7 text-sm"
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRename(playlist.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium truncate">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {playlist.songIds.length} song{playlist.songIds.length !== 1 ? "s" : ""}
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              {editingId !== playlist.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {addSongId ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs"
                      disabled={addingTo === playlist.id || playlist.songIds.includes(addSongId)}
                      onClick={() => addSongToPlaylist(playlist.id, playlist.name)}
                    >
                      {addingTo === playlist.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : playlist.songIds.includes(addSongId) ? (
                        "Added"
                      ) : (
                        "Add"
                      )}
                    </Button>
                  ) : null}

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditingId(playlist.id);
                      setEditingName(playlist.name);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(playlist.id, playlist.name)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}