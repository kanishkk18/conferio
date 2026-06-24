import useSWR from "swr";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => 
  fetch(url, { credentials: "include" }).then((res) => res.json());

export function useTracks(params?: { search?: string; genre?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.genre) query.set("genre", params.genre);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  const { data, error, isLoading, mutate } = useSWR(`/api/music/tracks?${query.toString()}`, fetcher);
  return { tracks: data?.tracks || [], pagination: data?.pagination, isLoading, isError: error, mutate };
}

export function useTrack(trackId: string | null) {
  const { data, error, isLoading } = useSWR(trackId ? `/api/music/tracks/${trackId}` : null, fetcher);
  return { track: data, isLoading, isError: error };
}

export function useMyTracks() {
  const { data: session } = useSession();
  const { data, error, isLoading, mutate } = useSWR(session ? "/api/music/my-tracks" : null, fetcher);
  return { tracks: data || [], isLoading, isError: error, mutate };
}

export function usePlaylists() {
  const { data: session } = useSession();
  const { data, error, isLoading, mutate } = useSWR(session ? "/api/music/playlists" : null, fetcher);
  return { playlists: data || [], isLoading, isError: error, mutate };
}

export function usePlaylist(playlistId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(playlistId ? `/api/music/playlists/${playlistId}` : null, fetcher);
  return { playlist: data, isLoading, isError: error, mutate };
}

export function useFavourites() {
  const { data: session } = useSession();
  const { data, error, isLoading, mutate } = useSWR(session ? "/api/music/favourites" : null, fetcher);
  return { favourites: data || [], isLoading, isError: error, mutate };
}
