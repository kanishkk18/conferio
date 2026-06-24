import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_PLAYLISTS = 30;
const MAX_SONGS_PER_PLAYLIST = 500;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  /* -------------------------------------------------------------- */
  /* GET - list all playlists or one playlist by ?id=                */
  /* -------------------------------------------------------------- */
  if (req.method === "GET") {
    const { id } = req.query;

    if (id && typeof id === "string") {
      const playlist = await prisma.musicPlaylist.findFirst({
        where: { id, userId },
      });

      if (!playlist) return res.status(404).json({ error: "Playlist not found" });

      return res.status(200).json({ playlist });
    }

    const playlists = await prisma.musicPlaylist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ playlists });
  }

  /* -------------------------------------------------------------- */
  /* POST - create new playlist                                       */
  /* -------------------------------------------------------------- */
  if (req.method === "POST") {
    const { name, description, coverImage } = req.body as {
      name: string;
      description?: string;
      coverImage?: string;
    };

    if (!name?.trim()) {
      return res.status(400).json({ error: "Playlist name is required" });
    }

    const count = await prisma.musicPlaylist.count({ where: { userId } });

    if (count >= MAX_PLAYLISTS) {
      return res.status(400).json({ error: `You can only have ${MAX_PLAYLISTS} playlists` });
    }

    const playlist = await prisma.musicPlaylist.create({
      data: { userId, name: name.trim(), description, coverImage, songIds: [] },
    });

    return res.status(201).json({ playlist });
  }

  /* -------------------------------------------------------------- */
  /* PATCH - update playlist (rename, add/remove songs, reorder)      */
  /* -------------------------------------------------------------- */
  if (req.method === "PATCH") {
    const { id, name, description, coverImage, addSongId, removeSongId, songIds } =
      req.body as {
        id: string;
        name?: string;
        description?: string;
        coverImage?: string;
        addSongId?: string;
        removeSongId?: string;
        songIds?: string[]; // full replace (for reordering)
      };

    if (!id) return res.status(400).json({ error: "Playlist id is required" });

    const playlist = await prisma.musicPlaylist.findFirst({ where: { id, userId } });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    let nextSongIds = playlist.songIds;

    if (songIds) {
      nextSongIds = songIds.slice(0, MAX_SONGS_PER_PLAYLIST);
    } else if (addSongId) {
      if (!nextSongIds.includes(addSongId)) {
        if (nextSongIds.length >= MAX_SONGS_PER_PLAYLIST) {
          return res
            .status(400)
            .json({ error: `Playlist can only have ${MAX_SONGS_PER_PLAYLIST} songs` });
        }
        nextSongIds = [...nextSongIds, addSongId];
      }
    } else if (removeSongId) {
      nextSongIds = nextSongIds.filter((s) => s !== removeSongId);
    }

    const updated = await prisma.musicPlaylist.update({
      where: { id },
      data: {
        name: name?.trim() ?? playlist.name,
        description: description ?? playlist.description,
        coverImage: coverImage ?? playlist.coverImage,
        songIds: nextSongIds,
      },
    });

    return res.status(200).json({ playlist: updated });
  }

  /* -------------------------------------------------------------- */
  /* DELETE - delete playlist                                         */
  /* -------------------------------------------------------------- */
  if (req.method === "DELETE") {
    const { id } = req.body as { id: string };

    if (!id) return res.status(400).json({ error: "Playlist id is required" });

    const playlist = await prisma.musicPlaylist.findFirst({ where: { id, userId } });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    await prisma.musicPlaylist.delete({ where: { id } });

    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
  return res.status(405).end();
}
