// // pages/api/clips/index.ts

// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from 'lib/auth'
// import { prisma } from '../../../lib/prisma'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions)
//   if (!session) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }

//   if (req.method === 'GET') {
//     try {
//       const clips = await prisma.clip.findMany({
//         where: { userId: session.user.id },
//         orderBy: { createdAt: 'desc' },
//       })
//       res.status(200).json(clips)
//     } catch (error) {
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   }
// }  works for aws but not for r2


// pages/api/clips/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const clips = await prisma.clip.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      })

      // FIX: Override stored private URL with public URL
      const clipsWithPublicUrls = clips.map((clip) => ({
        ...clip,
        fileUrl: `${process.env.S3_PUBLIC_URL}/${clip.fileName}`,
      }))

      res.status(200).json(clipsWithPublicUrls)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}