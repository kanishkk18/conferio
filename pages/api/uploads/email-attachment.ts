// import type { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
// import { readFile } from 'fs/promises'
// import { randomUUID } from 'crypto'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'us-east-1',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// })

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' })
//   }

//   try {
//     const { default: formidable } = await import('formidable')
//     const form = formidable({ 
//       maxFileSize: 25 * 1024 * 1024, // 25MB limit
//       keepExtensions: true,
//     })

//     const [fields, files] = await form.parse(req)
//     const file = files.file?.[0]

//     if (!file) {
//       return res.status(400).json({ error: 'No file uploaded' })
//     }

//     // Read file and upload to S3
//     const fileBuffer = await readFile(file.filepath)
//     const fileKey = `email-attachments/${session.user.id}/${randomUUID()}-${file.originalFilename}`

//     await s3Client.send(new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET!,
//       Key: fileKey,
//       Body: fileBuffer,
//       ContentType: file.mimetype || 'application/octet-stream',
//       ACL: 'public-read', // or use presigned URLs for private access
//     }))

//     const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`

//     return res.status(200).json({ 
//       fileId: fileKey, // Store the S3 key for later retrieval
//       url: fileUrl,    // Public URL for preview
//       filename: file.originalFilename,
//       size: file.size,
//       mimeType: file.mimetype,
//     })
//   } catch (error: any) {
//     console.error('[S3 Upload Error]', error)
//     return res.status(500).json({ error: error.message })
//   }
// }  working perfect for s3 bucket but not for r2 

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { s3 } from '@/lib/aws-s3'  // Use your existing R2 client
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { readFile } from 'fs/promises'
import { randomUUID } from 'crypto'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { default: formidable } = await import('formidable')
    const form = formidable({
      maxFileSize: 25 * 1024 * 1024,
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)
    const file = files.file?.[0]

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const fileBuffer = await readFile(file.filepath)
    const fileKey = `email-attachments/${session.user.id}/${randomUUID()}-${file.originalFilename}`

    // Use your existing R2 client (has endpoint + forcePathStyle)
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,  // "conferio"
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.mimetype || 'application/octet-stream',
      // REMOVED: ACL - R2 doesn't support it
    }))

    // FIX: Return public R2 URL, not AWS URL
    const fileUrl = `${process.env.S3_PUBLIC_URL}/${fileKey}`

    return res.status(200).json({
      fileId: fileKey,
      url: fileUrl,
      filename: file.originalFilename,
      size: file.size,
      mimeType: file.mimetype,
    })
  } catch (error: any) {
    console.error('[R2 Upload Error]', error)
    return res.status(500).json({ error: error.message })
  }
}