import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { uploadCoverImage } from 'lib/aws-s3'
import { nanoid } from 'nanoid'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
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
      maxFileSize: 10 * 1024 * 1024, // 10MB limit for cover images
    })

    const [fields, files] = await form.parse(req)
    const file = files.image?.[0] || files.file?.[0]

    if (!file) {
      return res.status(400).json({ success: 0, message: "No image file provided" })
    }

    // Validate image type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.mimetype || "")) {
      fs.unlinkSync(file.filepath)
      return res.status(400).json({ 
        success: 0, 
        message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      })
    }

    // Read the temp file
    const fileBuffer = fs.readFileSync(file.filepath)
    
    // Generate unique filename
    const extension = file.originalFilename?.split('.').pop() || 'jpg'
    const filename = `${nanoid()}.${extension}`
    
    // Upload to S3
    const result = await uploadCoverImage(fileBuffer, filename, file.mimetype || 'image/jpeg')

    // Clean up temp file
    fs.unlinkSync(file.filepath)

    return res.json({
      success: 1,
      file: {
        url: result.Location,
        key: result.Key,
      }
    })

  } catch (error) {
    console.error('Cover upload error:', error)
    return res.status(500).json({ 
      success: 0, 
      message: 'Upload failed', 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}