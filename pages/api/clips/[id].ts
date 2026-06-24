
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from 'lib/auth'
// import { prisma } from '../../../lib/prisma'
// import { DeleteObjectCommand } from '@aws-sdk/client-s3'
// import { s3 } from '../../../lib/aws-s3'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   const { id } = req.query

//   if (req.method === 'GET') {
//     try {
//       const clip = await prisma.clip.findFirst({
//         where: { id: id as string, userId: session.user.id },
//       })
      
//       if (!clip) {
//         return res.status(404).json({ error: 'Clip not found' })
//       }
      
//       res.status(200).json(clip)
//     } catch (error) {
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   } else if (req.method === 'PUT') {
//     try {
//       const { title, description } = req.body
//       const clip = await prisma.clip.update({
//         where: { id: id as string, userId: session.user.id },
//         data: { title, description },
//       })
//       res.status(200).json(clip)
//     } catch (error) {
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   } else if (req.method === 'DELETE') {
//     try {
//       const clip = await prisma.clip.findFirst({
//         where: { id: id as string, userId: session.user.id },
//       })

//       if (!clip) {
//         return res.status(404).json({ error: 'Clip not found' })
//       }

//       // Delete from S3
//       const deleteCommand = new DeleteObjectCommand({
//         Bucket: process.env.AWS_S3_BUCKET!,
//         Key: `clips/${clip.fileName}`,
//       })

//       await s3.send(deleteCommand)

//       // Delete from database
//       await prisma.clip.delete({
//         where: { id: id as string },
//       })

//       res.status(200).json({ message: 'Clip deleted successfully' })
//     } catch (error) {
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   }
// }
  //    the above code works for aws but not for r2

  // pages/api/clips/[id].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/auth'
import { prisma } from '../../../lib/prisma'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '../../../lib/aws-s3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const clip = await prisma.clip.findFirst({
        where: { id: id as string, userId: session.user.id },
      })
      
      if (!clip) {
        return res.status(404).json({ error: 'Clip not found' })
      }
      
      // FIX: Reconstruct public URL so existing broken records also work
      const publicUrl = `${process.env.S3_PUBLIC_URL}/${clip.fileName}`
      
      res.status(200).json({
        ...clip,
        fileUrl: publicUrl,
      })
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, description } = req.body
      const clip = await prisma.clip.update({
        where: { id: id as string, userId: session.user.id },
        data: { title, description },
      })
      res.status(200).json(clip)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const clip = await prisma.clip.findFirst({
        where: { id: id as string, userId: session.user.id },
      })

      if (!clip) {
        return res.status(404).json({ error: 'Clip not found' })
      }

      // FIX: clip.fileName already includes "clips/" prefix
      // Don't prepend it again!
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: clip.fileName, // Was: `clips/${clip.fileName}` — caused double prefix
      })

      await s3.send(deleteCommand)

      await prisma.clip.delete({
        where: { id: id as string },
      })

      res.status(200).json({ message: 'Clip deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}