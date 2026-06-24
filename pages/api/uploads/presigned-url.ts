// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]';
// import { generateUploadURL } from '@/lib/s3';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });
//   if (req.method !== 'POST') { res.setHeader('Allow', ['POST']); return res.status(405).end(); }

//   try {
//     const { filename, contentType, fileSize } = req.body;
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
//     if (!allowedTypes.includes(contentType)) return res.status(400).json({ error: 'File type not allowed' });
//     if (fileSize > 10 * 1024 * 1024) return res.status(400).json({ error: 'File size exceeds 10MB' });

//     const { uploadURL, fileUrl, key } = await generateUploadURL(filename, contentType);
//     return res.status(200).json({ uploadURL, fileUrl, key });
//   } catch (error) {
//     return res.status(500).json({ error: 'Failed to generate upload URL' });
//   }
// }


// pages/api/upload/presigned-url.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { generateUploadURL } from '../../../lib/s3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { filename, contentType, fileSize } = req.body;

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ error: 'File type not allowed' });
    }

    // Validate file size (max 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }

    const { uploadURL, key } = await generateUploadURL(filename, contentType);

    return res.status(200).json({
      uploadURL,
      // fileUrl,
      key,
      filename,
      contentType,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}