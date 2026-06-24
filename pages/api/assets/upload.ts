// pages/api/assets/upload.ts
// Production-ready: uploads to Cloudflare R2 (S3-compatible)

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import formidable from "formidable";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;
const PUBLIC_URL = process.env.S3_PUBLIC_URL || process.env.NEXT_PUBLIC_S3_PUBLIC_URL!;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const form = formidable({
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true,
  });

  try {
    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: "No file" });

    // Read file and upload to R2
    const fileBuffer = fs.readFileSync(file.filepath);
    const ext = path.extname(file.originalFilename || file.filepath);
    const key = `whiteboards/${roomId}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: file.mimetype || "application/octet-stream",
    }));

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    const url = `${PUBLIC_URL}/${key}`;
    return res.status(201).json({ url, key });
  } catch (err: any) {
    console.error("[assets/upload] Error:", err);
    return res.status(500).json({ error: err?.message || "Upload failed" });
  }
}