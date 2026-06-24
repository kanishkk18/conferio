import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2, getR2PublicUrl } from "@/lib/music/r2";
import type { Song } from "@/lib/music/jiosaavn";

/**
 * Converts an UploadedTrack DB row into a `Song`-shaped object so it can be
 * dropped into the same queue/player/favorites flows as JioSaavn songs.
 * Local track ids are prefixed with "local:" everywhere in the app.
 */
export function uploadedTrackToSong(track: {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  audioKey: string;
  imageKey: string | null;
  duration: number | null;
  mimeType: string;
}): Song {
  const audioUrl = getR2PublicUrl(track.audioKey);
  const imageUrl = track.imageKey ? getR2PublicUrl(track.imageKey) : "/placeholder-song.png";

  return {
    id: `local:${track.id}`,
    name: track.title,
    subtitle: track.artist ?? "Unknown artist",
    type: "song",
    image: [
      { quality: "50x50", url: imageUrl },
      { quality: "150x150", url: imageUrl },
      { quality: "500x500", url: imageUrl },
    ],
    language: "unknown",
    download_url: [
      { quality: "12kbps", url: audioUrl },
      { quality: "48kbps", url: audioUrl },
      { quality: "160kbps", url: audioUrl },
      { quality: "320kbps", url: audioUrl },
    ],
    duration: track.duration ?? 0,
    album: track.album ?? undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    const { id, search } = req.query;

    if (id && typeof id === "string") {
      const rawId = id.replace(/^local:/, "");
      const track = await prisma.uploadedTrack.findFirst({
        where: { id: rawId, OR: [{ userId }, { isPublic: true }] },
      });

      if (!track) return res.status(404).json({ error: "Track not found" });

      return res.status(200).json({ song: uploadedTrackToSong(track) });
    }

    const tracks = await prisma.uploadedTrack.findMany({
      where: {
        OR: [
          { userId },
          ...(search ? [{ isPublic: true }] : []),
        ],
        ...(search && typeof search === "string"
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { artist: { contains: search, mode: "insensitive" } },
                { album: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ songs: tracks.map(uploadedTrackToSong), tracks });
  }

  if (req.method === "DELETE") {
    const { id } = req.body as { id: string };
    const rawId = id?.replace(/^local:/, "");

    if (!rawId) return res.status(400).json({ error: "Track id is required" });

    const track = await prisma.uploadedTrack.findFirst({ where: { id: rawId, userId } });
    if (!track) return res.status(404).json({ error: "Track not found" });

    await deleteFromR2(track.audioKey);
    if (track.imageKey) await deleteFromR2(track.imageKey);

    await prisma.uploadedTrack.delete({ where: { id: rawId } });

    return res.status(200).json({ success: true });
  }

  if (req.method === "PATCH") {
    const { id, title, artist, album, isPublic } = req.body as {
      id: string;
      title?: string;
      artist?: string;
      album?: string;
      isPublic?: boolean;
    };

    const rawId = id?.replace(/^local:/, "");
    if (!rawId) return res.status(400).json({ error: "Track id is required" });

    const track = await prisma.uploadedTrack.findFirst({ where: { id: rawId, userId } });
    if (!track) return res.status(404).json({ error: "Track not found" });

    const updated = await prisma.uploadedTrack.update({
      where: { id: rawId },
      data: {
        title: title ?? track.title,
        artist: artist ?? track.artist,
        album: album ?? track.album,
        isPublic: isPublic ?? track.isPublic,
      },
    });

    return res.status(200).json({ song: uploadedTrackToSong(updated) });
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).end();
}
