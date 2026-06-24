import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const isR2 = process.env.R2_ENDPOINT?.includes("r2.cloudflarestorage");

const s3Client = new S3Client({
  region: isR2 ? "auto" : (process.env.AWS_REGION || "us-east-1"),
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
}); 

const BUCKET_NAME = process.env.AWS_S3_BUCKET;
const PUBLIC_URL = process.env.S3_PUBLIC_URL;

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  originalName: string;
}

export async function uploadMusicFile(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string
): Promise<UploadResult> {
  const ext = path.extname(originalName) || ".mp3";
  const key = `music/${userId}/${uuidv4()}${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        "original-name": originalName,
        "uploaded-by": userId,
      },
    })
  );

  return {
    url: `${PUBLIC_URL}/${key}`,
    key,
    size: fileBuffer.length,
    mimeType,
    originalName,
  };
}

export async function deleteMusicFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function getPresignedUploadUrl(
  fileName: string,
  mimeType: string,
  userId: string,
  expiresIn: number = 300
) {
  const ext = path.extname(fileName) || ".mp3";
  const key = `music/${userId}/${uuidv4()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return { uploadUrl, key, publicUrl: `${PUBLIC_URL}/${key}` };
}
