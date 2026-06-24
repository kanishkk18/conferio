// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { deleteFilesService } from '@/lib/services/files'
// import { z } from 'zod'

// const deleteFilesSchema = z.object({
//   fileIds: z.array(z.string()).min(1, 'At least one file ID must be provided'),
// })

// export async function DELETE(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { message: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     const body = await req.json()
//     const { fileIds } = deleteFilesSchema.parse(body)

//     const result = await deleteFilesService(session.user.id, fileIds)

//     return NextResponse.json({
//       message: 'Files deleted successfully',
//       ...result,
//     })
//   } catch (error) {
//     console.error('Delete files error:', error)
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteFilesService } from '@/lib/services/files'
import { z } from 'zod'

const deleteFilesSchema = z.object({
  fileIds: z.array(z.string()).min(1, 'At least one file ID must be provided'),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { fileIds } = deleteFilesSchema.parse(body)

    const result = await deleteFilesService(session.user.id, fileIds)

    return res.status(200).json({
      message: 'Files deleted successfully',
      ...result,
    })
  } catch (error) {
    console.error('Delete files error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid request data',
        errors: error.errors 
      })
    }
    
    return res.status(500).json({ message: 'Internal server error' })
  }
}