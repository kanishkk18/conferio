import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Upload, Loader2, Music, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SongCard from "@/components/music/song-card";
import { useEffect } from "react";
import type { Song } from "@/lib/music/jiosaavn";

export default function UploadMusicPage() {
  const { data: session, status } = useSession();

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [myTracks, setMyTracks] = useState<{ id: string; title: string; artist: string | null }[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/music/tracks")
      .then((r) => r.json())
      .then((data) => setMyTracks(data.tracks ?? []));
  }, [status]);

  if (status === "loading") {
    return <div className="container py-6">Loading...</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="container py-6 space-y-4">
        <h1 className="text-3xl font-bold">Upload Music</h1>
        <p className="text-muted-foreground">Sign in to upload your own tracks.</p>
        <Button onClick={() => signIn()}>Sign in</Button>
      </div>
    );
  }

  async function handleUpload() {
    if (!audioFile) {
      toast.error("Please select an audio file");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);
    if (imageFile) formData.append("image", imageFile);
    if (title) formData.append("title", title);
    if (artist) formData.append("artist", artist);
    if (album) formData.append("album", album);
    formData.append("isPublic", String(isPublic));

    setUploading(true);
    try {
      const res = await fetch("/api/music/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      toast.success("Track uploaded successfully");
      setMyTracks((prev) => [data.track, ...prev]);

      // reset form
      setAudioFile(null);
      setImageFile(null);
      setTitle("");
      setArtist("");
      setAlbum("");
      setIsPublic(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/music/tracks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setMyTracks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Track deleted");
    } else {
      toast.error("Failed to delete track");
    }
  }

  async function playTrack(id: string) {
    const res = await fetch(`/api/music/data?resource=song&id=local:${id}`);
    const data = await res.json();
    const song: Song | undefined = data.songs?.[0];
    if (song) {
      const { setQueueAndPlay } = await import("hooks/use-music-store");
      setQueueAndPlay([song], 0);
    }
  }

  return (
    <div className="container py-6 space-y-8 max-w-2xl">
      <h1 className="text-3xl font-bold">Upload Music</h1>
      <p className="text-muted-foreground">
        Add a song that's not available on the app. Supported formats: MP3, WAV, FLAC, M4A, OGG (max 30MB).
      </p>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="audio">Audio file *</Label>
          <Input
            id="audio"
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Cover image (optional)</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-detected from file if blank"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist">Artist</Label>
            <Input id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="album">Album</Label>
          <Input id="album" value={album} onChange={(e) => setAlbum(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
          <Label htmlFor="public">Make visible to other users (in search results)</Label>
        </div>

        <Button onClick={handleUpload} disabled={uploading} className="w-full gap-2">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {myTracks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Your uploads</h2>
          <div className="divide-y">
            {myTracks.map((track) => (
              <div key={track.id} className="flex items-center gap-3 py-2">
                <Music className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playTrack(track.id)}>
                  <p className="truncate text-sm font-medium">{track.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{track.artist ?? "Unknown artist"}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(track.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
