// // pages/api/meetings/[id]/refresh-urls.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';
// import { s3Upload } from '@/lib/s3upload';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id } = req.query;

//   if (!id || typeof id !== 'string') {
//     return res.status(400).json({ error: 'Invalid meeting ID' });
//   }

//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const meeting = await prisma.aiMeeting.findFirst({
//       where: {
//         id,
//         userId: session.user.id,
//       },
//       select: {
//         id: true,
//         videoUrl: true,
//         audioUrl: true,
//         s3VideoKey: true,
//         s3AudioKey: true,
//       },
//     });

//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     // If we have permanent S3 keys, generate fresh signed URLs
//     if (meeting.s3VideoKey || meeting.s3AudioKey) {
//       console.log('🔄 Refreshing signed URLs from permanent S3 storage...');
      
//       const { videoUrl, audioUrl } = await s3Upload.refreshUrls(
//         meeting.s3VideoKey,
//         meeting.s3AudioKey
//       );

//       return res.status(200).json({
//         videoUrl: videoUrl || meeting.videoUrl,
//         audioUrl: audioUrl || meeting.audioUrl,
//         isPermanent: true,
//         expiresIn: 3600 * 24 * 7, // 7 days
//         message: 'Fresh URLs generated from permanent storage',
//       });
//     }

//     // No S3 storage, return existing URLs (might be expired)
//     return res.status(200).json({
//       videoUrl: meeting.videoUrl,
//       audioUrl: meeting.audioUrl,
//       isPermanent: false,
//       message: 'Using original URLs (may expire)',
//     });

//   } catch (error) {
//     console.error('Error refreshing URLs:', error);
//     return res.status(500).json({ error: 'Failed to refresh URLs' });
//   }
// }

// pages/api/aimeetings/[id]/refresh-urls.ts
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const meeting = await prisma.aiMeeting.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        videoUrl: true,
        audioUrl: true,
        s3VideoKey: true,
        s3AudioKey: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // If we have S3 keys, generate fresh presigned URLs
    if (meeting.s3VideoKey || meeting.s3AudioKey) {
      console.log('🔑 Generating fresh S3 presigned URLs...');
      
      const { videoUrl, audioUrl } = await s3Upload.refreshUrls(
        meeting.s3VideoKey,
        meeting.s3AudioKey
      );

      return res.status(200).json({
        videoUrl: videoUrl || meeting.videoUrl,
        audioUrl: audioUrl || meeting.audioUrl,
        isS3: true,
        expiresIn: 3600 * 24 * 7, // 7 days
        message: 'Fresh URLs generated from S3',
      });
    }

    // No S3 keys - return existing URLs (likely expired)
    return res.status(200).json({
      videoUrl: meeting.videoUrl,
      audioUrl: meeting.audioUrl,
      isS3: false,
      message: 'No S3 storage - using original URLs (may be expired)',
    });

  } catch (error) {
    console.error('Refresh URLs error:', error);
    return res.status(500).json({ 
      error: 'Failed to refresh URLs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}