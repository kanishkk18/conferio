import { useCallback } from "react";

export function useMusicActions() {
  const toggleFavourite = useCallback(async (trackId: string, isFavourited: boolean) => {
    const url = "/api/music/favourites";
    const res = await fetch(url + (isFavourited ? `?trackId=${trackId}` : ""), {
      method: isFavourited ? "DELETE" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: isFavourited ? undefined : JSON.stringify({ trackId }),
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }, []);

  const addToPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    const res = await fetch(`/api/music/playlists/${playlistId}/tracks`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackId }),
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }, []);

  const removeFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    const res = await fetch(`/api/music/playlists/${playlistId}/tracks`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackId }),
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }, []);

  const createPlaylist = useCallback(async (data: { name: string; description?: string; isPublic?: boolean }) => {
    const res = await fetch("/api/music/playlists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }, []);

  const deletePlaylist = useCallback(async (id: string) => {
    const res = await fetch(`/api/music/playlists/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }, []);

  const deleteTrack = useCallback(async (id: string) => {
    const res = await fetch(`/api/music/tracks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }, []);

  return { toggleFavourite, addToPlaylist, removeFromPlaylist, createPlaylist, deletePlaylist, deleteTrack };
}
