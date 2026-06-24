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
  const { quality = 'original' } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid meeting ID' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get meeting with S3 keys
    const meeting = await prisma.aiMeeting.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        videoUrl: true,
        webhookData: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Check if we have S3 keys stored
    const s3Data = (meeting.webhookData as any)?.s3;
    
    if (!s3Data?.originalKey || !s3Upload.isConfigured()) {
      // No S3 upload, return existing URL (might be Meeting BaaS URL)
      // For Meeting BaaS URLs, we can't get compressed version
      return res.status(200).json({
        videoUrl: meeting.videoUrl,
        compressedUrl: null,
        isS3: false,
        quality: 'original',
      });
    }

    // Generate fresh presigned URLs for requested quality
    console.log(`🔄 Refreshing S3 presigned URLs for meeting ${id}, quality: ${quality}`);
    
    let videoUrl: string;
    let compressedUrl: string | null = null;
    
    // Always generate both URLs so client can switch
    const [originalUrl, compUrl] = await Promise.all([
      s3Upload.getSignedUrl(s3Data.originalKey, 3600 * 24), // 24 hours
      s3Data.compressedKey ? s3Upload.getSignedUrl(s3Data.compressedKey, 3600 * 24) : null,
    ]);

    // Return requested quality as primary videoUrl
    videoUrl = quality === 'compressed' && compUrl ? compUrl : originalUrl;
    compressedUrl = compUrl;

    return res.status(200).json({
      videoUrl, // Primary URL based on quality preference
      originalUrl, // Always available for HD playback
      compressedUrl, // Available for SD/bandwidth saving
      isS3: true,
      quality: quality === 'compressed' && compUrl ? 'compressed' : 'original',
      expiresIn: 3600 * 24, // 24 hours
    });
  } catch (error) {
    console.error('Error refreshing video URL:', error);
    return res.status(500).json({ error: 'Failed to refresh video URL' });
  }
}

