// // pages/api/clips/upload.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from 'lib/auth'
// import { prisma } from '../../../lib/prisma'
// import { s3 } from '../../../lib/aws-s3'
// import { PutObjectCommand } from '@aws-sdk/client-s3'
// import { v4 as uuidv4 } from 'uuid'
// import formidable from 'formidable'
// import fs from 'fs'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
//   return new Promise((resolve, reject) => {
//     const form = formidable({
//       multiples: false,
//       maxFileSize: 100 * 1024 * 1024, // 100MB
//     })

//     form.parse(req, (err, fields, files) => {
//       if (err) reject(err)
//       resolve({ fields, files })
//     })
//   })
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' })
//   }

//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   try {
//     console.log('Starting file upload process...')
    
//     const { fields, files } = await parseForm(req)
//     const file = files.file?.[0]
    
//     if (!file) {
//       return res.status(400).json({ error: 'No file provided' })
//     }

//     const title = fields.title?.[0] || `Recording_${new Date().toISOString()}`
//     const description = fields.description?.[0] || ''

//     console.log('Processing file:', file.originalFilename)

//     const fileId = uuidv4()
//     const fileExtension = file.originalFilename?.split('.').pop() || 'webm'
//     const fileName = `clips/${fileId}.${fileExtension}`

//     // Read file buffer
//     const fileBuffer = fs.readFileSync(file.filepath)

//     console.log('Uploading to S3...')

//     // Upload file to S3
//     const uploadCommand = new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET!,
//       Key: fileName,
//       Body: fileBuffer,
//       ContentType: file.mimetype || 'video/webm',
//       ACL: 'public-read',
//     })

//     await s3.send(uploadCommand)

//     const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`

//     console.log('Creating database record...')

//     // Create database record
//     const clip = await prisma.clip.create({
//       data: {
//         title,
//         description,
//         fileName,
//         fileUrl,
//         fileSize: file.size,
//         fileType: file.mimetype || 'video/webm',
//         thumbnailUrl: null,
//         userId: session.user.id,
//         shareToken: uuidv4(),
//       },
//     })

//     console.log('Clip created successfully:', clip.id)

//     // Clean up temporary file
//     fs.unlinkSync(file.filepath)

//     res.status(200).json(clip)
//   } catch (error) {
//     console.error('Upload error:', error)
    
//     // More specific error handling
//     if (error instanceof Error) {
//       if (error.message.includes('P2021') || error.message.includes('does not exist')) {
//         return res.status(500).json({ 
//           error: 'Database table not found. Please run database migrations.',
//           details: 'Run: npx prisma migrate dev --name init'
//         })
//       }
//     }
    
//     res.status(500).json({ 
//       error: 'Internal server error',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     })
//   }
// }

//  this above code works perfect for aws bucket credentials but as we are using r2 i need to make some chnages for it to work with r2



// // pages/api/clips/upload.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from 'lib/auth'
// import { prisma } from '../../../lib/prisma'
// import { s3 } from '../../../lib/aws-s3'
// import { PutObjectCommand } from '@aws-sdk/client-s3'
// import { v4 as uuidv4 } from 'uuid'
// import formidable from 'formidable'
// import fs from 'fs'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
//   return new Promise((resolve, reject) => {
//     const form = formidable({
//       multiples: false,
//       maxFileSize: 25 * 1024 * 1024, // 25MB
//     })

//     form.parse(req, (err, fields, files) => {
//       if (err) reject(err)
//       resolve({ fields, files })
//     })
//   })
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' })
//   }

//   const session = await getServerSession(req, res, authOptions)
//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   try {
//     const { fields, files } = await parseForm(req)
//     const file = files.file?.[0]
    
//     if (!file) {
//       return res.status(400).json({ error: 'No file provided' })
//     }

//     const title = fields.title?.[0] || `Recording_${new Date().toISOString()}`
//     const description = fields.description?.[0] || ''

//     const fileId = uuidv4()
//     const fileExtension = file.originalFilename?.split('.').pop() || 'webm'
//     const fileName = `clips/${fileId}.${fileExtension}`

//     // Read file buffer
//     const fileBuffer = fs.readFileSync(file.filepath)

//     // Upload file to R2
//     const uploadCommand = new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET!,
//       Key: fileName,
//       Body: fileBuffer,
//       ContentType: file.mimetype || 'video/webm',
//     })

//     await s3.send(uploadCommand)

//     // FIX: Use public URL, not private endpoint
//     const fileUrl = `${process.env.S3_PUBLIC_URL}/${fileName}`

//     // Create database record
//     const clip = await prisma.clip.create({
//       data: {
//         title,
//         description,
//         fileName,
//         fileUrl,
//         fileSize: file.size,
//         fileType: file.mimetype || 'video/webm',
//         thumbnailUrl: null,
//         userId: session.user.id,
//         shareToken: uuidv4(),
//         isPublic: true, 
//       },
//     })

//     // Clean up temporary file
//     fs.unlinkSync(file.filepath)

//     res.status(200).json(clip)
//   } catch (error:any) {
//     console.error('Upload error:', error)
//     res.status(500).json({ 
//       error: 'Internal server error',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     })
//   }
// }

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/auth'
import { prisma } from '../../../lib/prisma'
import { s3 } from '../../../lib/aws-s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import formidable from 'formidable'
import fs from 'fs'
import { broadcastClipEvent, SSE_EVENTS } from '@/lib/sse'
import { compressVideoIfPossible } from '@/lib/videoCompression'

export const config = {
  api: {
    bodyParser: false,
  },
}

const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      maxFileSize: 25 * 1024 * 1024, // 25MB
    })

    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      resolve({ fields, files })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { fields, files } = await parseForm(req)
    const file = files.file?.[0]
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const title = fields.title?.[0] || `Recording_${new Date().toISOString()}`
    const description = fields.description?.[0] || ''
    const clipType = fields.clipType?.[0] || 'both' // 'audio' | 'video' | 'both'
    const duration = fields.duration?.[0] ? parseFloat(fields.duration[0]) : null
    const fileId = uuidv4()
    const isAudioOnly = clipType === 'audio'
    const fileExtension = isAudioOnly 
      ? (file.mimetype?.includes('ogg') ? 'ogg' : 'webm')
      : (file.originalFilename?.split('.').pop() || 'webm')
    
    const fileName = `clips/${fileId}.${fileExtension}`

    // Optional: compress if ffmpeg is available (best-effort)
    const compressedPath = `${file.filepath}.compressed.mp4`
    const didCompress = !isAudioOnly && await compressVideoIfPossible(file.filepath, compressedPath)
    const finalPath = didCompress ? compressedPath : file.filepath
    const finalBuffer = fs.readFileSync(finalPath)
    const finalFileName = didCompress ? fileName.replace(/\.webm$/, '.mp4') : fileName
    const finalMimeType = didCompress 
      ? 'video/mp4' 
      : (file.mimetype || (isAudioOnly ? 'audio/webm' : 'video/webm'))

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: finalFileName,
      Body: finalBuffer,
      ContentType: finalMimeType,
    })

    await s3.send(uploadCommand)

    const fileUrl = `${process.env.S3_PUBLIC_URL}/${finalFileName}`

    const clip = await prisma.clip.create({
      data: {
        title,
        description,
        fileName: finalFileName,
        fileUrl,
        fileSize: finalBuffer.length,
        fileType: finalMimeType,
        duration: duration,
        thumbnailUrl: null,
        userId: session.user.id,
        shareToken: uuidv4(),
        isPublic: true,
        type: clipType,
      },
    })

    // Real-time broadcast to all SSE clients
    broadcastClipEvent(SSE_EVENTS.NEW_CLIP, {
      type: 'new-clip',
      clip,
    })

    // Cleanup
    fs.unlinkSync(file.filepath)
    if (didCompress && fs.existsSync(compressedPath)) {
      fs.unlinkSync(compressedPath)
    }

    res.status(200).json(clip)
  } catch (error:any) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}