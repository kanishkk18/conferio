import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import formidable from "formidable";
import { readFile } from "fs/promises";
import { randomUUID } from "crypto";
import { parseBuffer } from "music-metadata";

import { authOptions } from "lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/music/r2";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "50mb",
  },
};

const ALLOWED_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/m4a",
  "audio/mp4",
  "audio/ogg",
  "audio/aac",
  "audio/webm",
  "audio/x-m4a",
  "application/octet-stream", // fallback for files with no MIME detection
]);

const ALLOWED_EXT = new Set([
  "mp3", "wav", "flac", "m4a", "aac", "ogg", "wma", "webm",
]);

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

function getExt(filename?: string): string {
  return (filename?.split(".").pop() ?? "").toLowerCase();
}

function isAllowed(file: formidable.File): boolean {
  // Check MIME type first
  if (file.mimetype && ALLOWED_MIME.has(file.mimetype)) return true;
  
  // Fallback: check file extension
  const ext = getExt(file.originalFilename);
  if (ALLOWED_EXT.has(ext)) return true;
  
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const userId = session.user.id;

  const form = formidable({
    maxFileSize: MAX_FILE_SIZE,
    multiples: false,
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);

    const audioFile = files.audio?.[0];

    if (!audioFile) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    console.log("Upload detected:", {
      name: audioFile.originalFilename,
      mime: audioFile.mimetype,
      size: audioFile.size,
    });

    if (!isAllowed(audioFile)) {
      return res.status(400).json({
        error: `Unsupported format: ${audioFile.mimetype ?? "unknown"} (${getExt(audioFile.originalFilename)}). Allowed: MP3, WAV, FLAC, M4A, AAC, OGG`,
      });
    }

    const audioBuffer = await readFile(audioFile.filepath);

    let duration: number | undefined;
    let detectedTitle: string | undefined;
    let detectedArtist: string | undefined;
    let detectedAlbum: string | undefined;

    try {
      const metadata = await parseBuffer(audioBuffer, audioFile.mimetype ?? undefined);
      duration = metadata.format.duration ? Math.round(metadata.format.duration) : undefined;
      detectedTitle = metadata.common.title;
      detectedArtist = metadata.common.artist;
      detectedAlbum = metadata.common.album;
    } catch {
      // metadata parsing is best-effort
    }

    const trackId = randomUUID();
    const audioExt = getExt(audioFile.originalFilename) || "mp3";
    const audioKey = `music/${userId}/${trackId}.${audioExt}`;

    await uploadToR2(audioKey, audioBuffer, audioFile.mimetype ?? "audio/mpeg");

    let imageKey: string | undefined;
    if (files.image?.[0]) {
      const img = files.image[0];
      const imageBuffer = await readFile(img.filepath);
      const imageExt = getExt(img.originalFilename) || "jpg";
      imageKey = `music/${userId}/${trackId}-cover.${imageExt}`;
      await uploadToR2(imageKey, imageBuffer, img.mimetype ?? "image/jpeg");
    }

    const title =
      (Array.isArray(fields.title) ? fields.title[0] : fields.title) ||
      detectedTitle ||
      audioFile.originalFilename?.replace(/\.[^/.]+$/, "") ||
      "Untitled";

    const artist =
      (Array.isArray(fields.artist) ? fields.artist[0] : fields.artist) || detectedArtist;

    const album =
      (Array.isArray(fields.album) ? fields.album[0] : fields.album) || detectedAlbum;

    const isPublicField = Array.isArray(fields.isPublic) ? fields.isPublic[0] : fields.isPublic;
    const isPublic = isPublicField === "true";

    const track = await prisma.uploadedTrack.create({
      data: {
        id: trackId,
        userId,
        title,
        artist,
        album,
        audioKey,
        imageKey,
        duration,
        fileSize: audioFile.size,
        mimeType: audioFile.mimetype ?? "audio/mpeg",
        isPublic,
      },
    });

    return res.status(201).json({ track });
  } catch (err) {
    console.error("Upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return res.status(500).json({ error: message });
  }
}