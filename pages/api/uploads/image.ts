// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { s3 } from 'lib/aws-s3'
// import { nanoid } from 'nanoid'

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '10mb',
//     },
//   },
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)


//   if (!session?.user?.id) {
//     return res.status(401).json({ success: 0, message: 'Unauthorized' })
//   }

//   if (req.method === 'POST') {
//     try {
//       // Handle file upload from Editor.js
//       if (req.body.image) {
//         // Base64 image upload
//         const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '')
//         const buffer = Buffer.from(base64Data, 'base64')
        
//         const key = `images/${nanoid()}.jpg`
        
//         const uploadParams = {
//           Bucket: process.env.AWS_S3_BUCKET!,
//           Key: key,
//           Body: buffer,
//           ContentType: 'image/jpeg',
//           ACL: 'public-read',
//         }

//         const result = await s3.upload(uploadParams).promise()
        
//         return res.json({
//           success: 1,
//           file: {
//             url: result.Location,
//           }
//         })
//       }

//       // Handle URL upload
//       if (req.body.url) {
//         return res.json({
//           success: 1,
//           file: {
//             url: req.body.url,
//           }
//         })
//       }

//       res.status(400).json({ success: 0, message: 'No image provided' })
//     } catch (error) {
//       console.error('Image upload error:', error)
//       res.status(500).json({ success: 0, message: 'Upload failed' })
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { uploadToS3 } from 'lib/aws-s3'
import { nanoid } from 'nanoid'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false, // Required for formidable to work
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ success: 0, message: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: false,
    })

    const [fields, files] = await form.parse(req)
    
    // Get the uploaded file - Editor.js sends it as 'image'
    const file = files.image?.[0]

    if (!file) {
      return res.status(400).json({ success: 0, message: 'No image file provided' })
    }

    // Read the temp file
    const fileBuffer = fs.readFileSync(file.filepath)
    
    // Generate unique key preserving original extension
    const extension = file.originalFilename?.split('.').pop() || 'webp'
    const key = `images/${nanoid()}.${extension}`
    
    // Upload to S3
    const result = await uploadToS3({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: fileBuffer,
      ContentType: file.mimetype || 'image/webp',
    })

    // Clean up temp file
    fs.unlinkSync(file.filepath)

    // Return in Editor.js expected format
    return res.json({
      success: 1,
      file: {
        url: result.Location,
      }
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return res.status(500).json({ 
      success: 0, 
      message: 'Upload failed', 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}