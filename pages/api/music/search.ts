import type { NextApiRequest, NextApiResponse } from "next";

import { searchAll, searchAllV1, searchByType, searchPodcasts } from "@/lib/music/jiosaavn";
import { prisma } from "@/lib/prisma";
import { uploadedTrackToSong } from "./tracks";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  const { q, type, page, n } = req.query as {
    q?: string;
    type?: "songs" | "albums" | "playlists" | "artists" | "shows" | "all";
    page?: string;
    n?: string;
  };

  if (!q?.trim()) {
    return res.status(400).json({ error: "Search query 'q' is required" });
  }

  try {
    const localTracksPromise = prisma.uploadedTrack.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { artist: { contains: q, mode: "insensitive" } },
          { album: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    });

    if (!type || type === "all") {
      const [results, localTracks] = await Promise.all([searchAllV1(q), localTracksPromise]);
      const localSongs = localTracks.map(uploadedTrackToSong);

      return res.status(200).json({
        songs: {
          position: results.songs.position,
          data: [...localSongs, ...results.songs.data],
        },
        albums: results.albums,
        playlists: results.playlists,
        artists: results.artists,
        shows: results.shows,
        episodes: results.episodes,
        topQuery: results.topQuery,
      });
    }

    if (type === "songs") {
      const [results, localTracks] = await Promise.all([
        searchByType("songs", q, Number(page) || 1, Number(n) || 20),
        localTracksPromise,
      ]);
      const localSongs = localTracks.map(uploadedTrackToSong);

      return res.status(200).json({
        data: [...localSongs, ...results.data],
        total: results.total + localSongs.length,
        start: results.start,
      });
    }

    if (type === "shows") {
      const results = await searchPodcasts(q, Number(page) || 1, Number(n) || 20);
      return res.status(200).json(results);
    }

    const results = await searchByType(type, q, Number(page) || 1, Number(n) || 20);
    return res.status(200).json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return res.status(500).json({ error: message });
  }
}