// lib/s3upload.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

class S3UploadService {
  private client: S3Client;
  private bucket: string;
  private videoPrefix: string;
  private audioPrefix: string;

  constructor() {
    const region = process.env.AWS_REGION || 'auto';
    const endpoint = process.env.S3_ENDPOINT;
    const forcePathStyle = true;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.videoPrefix = 'videos/';
    this.audioPrefix = 'audio/';

    if (!accessKeyId || !endpoint || !secretAccessKey || !this.bucket) {
      console.log('ℹ️ AWS S3 credentials not fully configured');
      this.client = null as any;
      return;
    }

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    console.log('✅ S3 Upload Service initialized');
    console.log(`📁 Bucket: ${this.bucket}`);
    console.log(`🌏 Region: ${region}`);
  }

  isConfigured(): boolean {
    return !!this.client && !!this.bucket;
  }

  /**
   * Download file from URL to local path
   */
  private async downloadFile(url: string, outputPath: string): Promise<void> {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 300000, // 5 minutes
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
      response.data.on('error', reject);
    });
  }

  /**
   * Upload file to S3
   */
  private async uploadFile(filePath: string, key: string, contentType: string): Promise<void> {
    const fileStream = fs.createReadStream(filePath);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    });

    await this.client.send(command);
  }

  /**
   * Generate presigned URL for temporary access (7 days max)
   * For permanent storage, we generate fresh URLs on demand
   */
  async getSignedUrl(key: string, expiresIn: number = 3600 * 24 * 7): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Get public URL (if bucket allows public access) - NOT RECOMMENDED
   * Better to use presigned URLs with longer expiration
   */
  getObjectUrl(key: string): string {
    // return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return `${process.env.S3_ENDPOINT}/${this.bucket}/${key}`;
  }

  /**
   * Process and upload both video and audio to S3
   * Returns the S3 keys for permanent storage
   */
  async processAndUpload(
    videoUrl: string | null,
    audioUrl: string | null,
    meetingId: string,
    botId: string
  ): Promise<{
    videoKey: string | null;
    audioKey: string | null;
    videoUrl: string | null;
    audioUrl: string | null;
  }> {
    if (!this.isConfigured()) {
      throw new Error('S3 not configured');
    }

    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'meeting-'));
    const timestamp = Date.now();

    let videoKey: string | null = null;
    let audioKey: string | null = null;
    let videoSignedUrl: string | null = null;
    let audioSignedUrl: string | null = null;

    try {
      // Upload Video
      if (videoUrl) {
        console.log(`📥 Downloading video from Meeting BaaS...`);
        const videoPath = path.join(tempDir, 'video.mp4');
        await this.downloadFile(videoUrl, videoPath);

        const stats = await fs.promises.stat(videoPath);
        console.log(`📊 Video size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        // Permanent key structure: videos/{meetingId}/{timestamp}_video.mp4
        videoKey = `${this.videoPrefix}${meetingId}/${timestamp}_video.mp4`;

        console.log(`☁️ Uploading video to S3: ${videoKey}`);
        await this.uploadFile(videoPath, videoKey, 'video/mp4');

        // Generate initial signed URL (7 days)
        videoSignedUrl = await this.getSignedUrl(videoKey);
        console.log(`✅ Video uploaded successfully`);
      }

      // Upload Audio
      if (audioUrl) {
        console.log(`📥 Downloading audio from Meeting BaaS...`);
        const audioPath = path.join(tempDir, 'audio.flac');
        await this.downloadFile(audioUrl, audioPath);

        const stats = await fs.promises.stat(audioPath);
        console.log(`📊 Audio size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        // Permanent key structure: audio/{meetingId}/{timestamp}_audio.flac
        audioKey = `${this.audioPrefix}${meetingId}/${timestamp}_audio.flac`;

        console.log(`☁️ Uploading audio to S3: ${audioKey}`);
        await this.uploadFile(audioPath, audioKey, 'audio/flac');

        // Generate initial signed URL (7 days)
        audioSignedUrl = await this.getSignedUrl(audioKey);
        console.log(`✅ Audio uploaded successfully`);
      }

      return {
        videoKey,
        audioKey,
        videoUrl: videoSignedUrl,
        audioUrl: audioSignedUrl,
      };

    } finally {
      // Cleanup temp files
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
        console.log('🧹 Temp files cleaned up');
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }
  }

  /**
   * Refresh signed URLs for existing S3 objects
   * Call this when URLs are about to expire or when user requests access
   */
  async refreshUrls(videoKey: string | null, audioKey: string | null): Promise<{
    videoUrl: string | null;
    audioUrl: string | null;
  }> {
    const [videoUrl, audioUrl] = await Promise.all([
      videoKey ? this.getSignedUrl(videoKey) : null,
      audioKey ? this.getSignedUrl(audioKey) : null,
    ]);

    return { videoUrl, audioUrl };
  }
}

export const s3Upload = new S3UploadService();
