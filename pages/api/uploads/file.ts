// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { s3 } from 'lib/aws-s3'
// import { nanoid } from 'nanoid'
// import { DEFAULT_TEST_USER, isTestMode } from '@/lib/test-user'
// import formidable from 'formidable'
// import fs from 'fs'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   let session = await getServerSession(req, res, authOptions)
  
//   if (isTestMode && !session) {
//     session = { user: DEFAULT_TEST_USER }
//   }

//   if (!session?.user?.id) {
//     return res.status(401).json({ success: 0, message: 'Unauthorized' })
//   }

//   if (req.method === 'POST') {
//     try {
//       const form = formidable({
//         maxFileSize: 50 * 1024 * 1024, // 50MB
//       })

//       const [fields, files] = await form.parse(req)
//       const file = Array.isArray(files.file) ? files.file[0] : files.file

//       if (!file) {
//         return res.status(400).json({ success: 0, message: 'No file provided' })
//       }

//       const fileBuffer = fs.readFileSync(file.filepath)
//       const key = `files/${nanoid()}/${file.originalFilename}`

//       const uploadParams = {
//         Bucket: process.env.AWS_S3_BUCKET!,
//         Key: key,
//         Body: fileBuffer,
//         ContentType: file.mimetype || 'application/octet-stream',
//         ACL: 'public-read',
//       }

//       const result = await s3.upload(uploadParams).promise()

//       // Clean up temp file
//       fs.unlinkSync(file.filepath)

//       return res.json({
//         success: 1,
//         file: {
//           url: result.Location,
//           title: file.originalFilename,
//           size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
//         }
//       })
//     } catch (error) {
//       console.error('File upload error:', error)
//       res.status(500).json({ success: 0, message: 'Upload failed' })
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { s3, uploadToS3 } from 'lib/aws-s3'
import { nanoid } from 'nanoid'
import { DEFAULT_TEST_USER, isTestMode } from '@/lib/test-user'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getServerSession(req, res, authOptions)
  
  if (isTestMode && !session) {
    session = { user: DEFAULT_TEST_USER }
  }

  if (!session?.user?.id) {
    return res.status(401).json({ success: 0, message: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    try {
      const form = formidable({
        maxFileSize: 50 * 1024 * 1024, // 50MB
      })

      const [fields, files] = await form.parse(req)
      const file = Array.isArray(files.file) ? files.file[0] : files.file

      if (!file) {
        return res.status(400).json({ success: 0, message: 'No file provided' })
      }

      const fileBuffer = fs.readFileSync(file.filepath)
      const key = `files/${nanoid()}/${file.originalFilename}`

      const result = await uploadToS3({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype || 'application/octet-stream',
      })

      // Clean up temp file
      fs.unlinkSync(file.filepath)

      return res.json({
        success: 1,
        file: {
          url: result.Location,
          title: file.originalFilename,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
        }
      })
    } catch (error) {
      console.error('File upload error:', error)
      res.status(500).json({ success: 0, message: 'Upload failed' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}