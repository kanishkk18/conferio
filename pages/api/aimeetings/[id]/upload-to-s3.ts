// pages/api/aimeetings/[id]/upload-to-s3.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { s3Upload } from '@/lib/s3upload';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid meeting ID' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get meeting with existing video URL
    const meeting = await prisma.aiMeeting.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        botId: true,
        videoUrl: true,
        audioUrl: true,
        s3VideoKey: true,
        s3AudioKey: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Check if already uploaded to S3
    if (meeting.s3VideoKey || meeting.s3AudioKey) {
      // Just refresh the URLs
      const { videoUrl, audioUrl } = await s3Upload.refreshUrls(
        meeting.s3VideoKey,
        meeting.s3AudioKey
      );

      return res.status(200).json({
        success: true,
        message: 'S3 URLs refreshed',
        videoUrl,
        audioUrl,
        isS3: true,
      });
    }

    // Check if we have original URLs to upload
    if (!meeting.videoUrl && !meeting.audioUrl) {
      return res.status(400).json({ 
        error: 'No video/audio URLs available to upload to S3' 
      });
    }

    // Try to upload to S3
    if (!s3Upload.isConfigured()) {
      return res.status(500).json({ 
        error: 'S3 not configured. Check your AWS credentials.' 
      });
    }

    console.log('☁️ Uploading to S3...');
    console.log('Video URL:', meeting.videoUrl ? 'Yes' : 'No');
    console.log('Audio URL:', meeting.audioUrl ? 'Yes' : 'No');

    const uploadResult = await s3Upload.processAndUpload(
      meeting.videoUrl,
      meeting.audioUrl,
      meeting.id,
      meeting.botId || 'unknown'
    );

    // Update meeting with S3 keys
    await prisma.aiMeeting.update({
      where: { id },
      data: {
        s3VideoKey: uploadResult.videoKey,
        s3AudioKey: uploadResult.audioKey,
        s3UploadedAt: new Date(),
        videoUrl: uploadResult.videoUrl, // Update with fresh S3 URL
        audioUrl: uploadResult.audioUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Uploaded to S3 successfully',
      videoUrl: uploadResult.videoUrl,
      audioUrl: uploadResult.audioUrl,
      videoKey: uploadResult.videoKey,
      audioKey: uploadResult.audioKey,
      isS3: true,
    });

  } catch (error) {
    console.error('S3 upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload to S3',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}