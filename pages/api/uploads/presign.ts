// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/lib/auth'
// import { createPresignedUrl } from 'lib/aws-s3'
// import { nanoid } from 'nanoid'
// import { DEFAULT_TEST_USER, isTestMode } from '@/lib/test-user'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   let session = await getServerSession(req, res, authOptions)
  
//   // Use test user in development if enabled
//   if (isTestMode && !session) {
//     session = { user: DEFAULT_TEST_USER }
//   }

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   if (req.method === 'POST') {
//     try {
//       const { filename, contentType, workspaceId } = req.body

//       if (!filename || !contentType) {
//         return res.status(400).json({ error: 'Filename and content type are required' })
//       }

//       // Generate unique key
//       const key = `uploads/${workspaceId}/${nanoid()}/${filename}`

//       // Create presigned URL
//       const presignedUrl = await createPresignedUrl(key, contentType)

//       // File URL after upload
//       const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

//       res.json({
//         presignedUrl,
//         fileUrl,
//         key,
//       })
//     } catch (error) {
//       console.error('Presigned URL error:', error)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' })
//   }
// }