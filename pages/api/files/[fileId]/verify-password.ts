// pages/api/files/[fileId]/verify-password.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '@/lib/aws-s3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { fileId } = req.query
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: 'Password required' })
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId as string },
    })

    if (!file || !file.password) {
      return res.status(404).json({ message: 'File not found or not password protected' })
    }

    const isValid = await compare(password, file.password)

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    // Generate fresh signed URL with longer expiry
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: file.storageKey,
      ResponseContentDisposition: `inline; filename="${encodeURIComponent(file.originalName)}"`,
    })

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }) // 1 hour

    return res.status(200).json({ 
      url: signedUrl,
      fileName: file.originalName,
      mimeType: file.mimeType,
    })

  } catch (error) {
    console.error('Verify password error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}