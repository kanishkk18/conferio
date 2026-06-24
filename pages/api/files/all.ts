// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { getAllFilesService } from '@/lib/services/files'

// export async function GET(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { message: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     const { searchParams } = new URL(req.url)
//     const keyword = searchParams.get('keyword') || undefined
//     const pageSize = parseInt(searchParams.get('pageSize') || '20')
//     const pageNumber = parseInt(searchParams.get('pageNumber') || '1')

//     const result = await getAllFilesService(
//       session.user.id,
//       { keyword },
//       { pageSize, pageNumber }
//     )

//     return NextResponse.json({
//       message: 'All files retrieved successfully',
//       ...result,
//     })
//   } catch (error) {
//     console.error('Get files error:', error)
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { getAllFilesService } from '@/lib/services/files'

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ message: 'Method not allowed' })
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions)
    
//     if (!session?.user?.id) {
//       return res.status(401).json({ message: 'Unauthorized' })
//     }

//     const {
//       keyword,
//       pageSize = '20',
//       pageNumber = '1'
//     } = req.query

//     const result = await getAllFilesService(
//       session.user.id,
//       { keyword: keyword as string | undefined },
//       { 
//         pageSize: parseInt(pageSize as string), 
//         pageNumber: parseInt(pageNumber as string) 
//       }
//     )

//     return res.status(200).json({
//       message: 'All files retrieved successfully',
//       ...result,
//     })
//   } catch (error) {
//     console.error('Get files error:', error)
//     return res.status(500).json({ message: 'Internal server error' })
//   }
// }

// pages/api/files/all.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import { FileVisibility } from '@prisma/client'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ message: 'Method not allowed' })
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions)
//     if (!session?.user?.id) {
//       return res.status(401).json({ message: 'Unauthorized' })
//     }

//     const userId = session.user.id
//     const {
//       keyword,
//       type, // 'image', 'video', 'audio', 'document', 'all'
//       visibility, // 'personal', 'team', 'assigned'
//       folderId,
//       teamId,
//       pageSize = '20',
//       pageNumber = '1'
//     } = req.query

//     const pageSizeNum = parseInt(pageSize as string)
//     const pageNumberNum = parseInt(pageNumber as string)
//     const skip = (pageNumberNum - 1) * pageSizeNum

//     // Build where clause
//     let where: any = {}

//     // Type filtering
//     if (type && type !== 'all') {
//       switch (type) {
//         case 'image':
//           where.mimeType = { startsWith: 'image/' }
//           break
//         case 'video':
//           where.mimeType = { startsWith: 'video/' }
//           break
//         case 'audio':
//           where.mimeType = { startsWith: 'audio/' }
//           break
//         case 'document':
//           where.mimeType = { 
//             in: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
//           }
//           break
//       }
//     }

//     // Visibility filtering
//     if (visibility === 'personal') {
//       where.AND = [
//         { visibility: FileVisibility.PERSONAL },
//         { userId }
//       ]
//     } else if (visibility === 'team') {
//       where.AND = [
//         { visibility: { in: [FileVisibility.TEAM, FileVisibility.PASSWORD_PROTECTED] } },
//         { teamId: teamId as string }
//       ]
//     } else if (visibility === 'assigned') {
//       // Files assigned to me
//       where.assignedTo = {
//         some: { userId }
//       }
//     } else {
//       // Default: show personal files + team files + assigned files
//       where.OR = [
//         // Personal files owned by user
//         {
//           AND: [
//             { visibility: FileVisibility.PERSONAL },
//             { userId }
//           ]
//         },
//         // Team files where user is member
//         {
//           AND: [
//             { visibility: { in: [FileVisibility.TEAM, FileVisibility.PASSWORD_PROTECTED] } },
//             {
//               team: {
//                 members: {
//                   some: { userId }
//                 }
//               }
//             }
//           ]
//         },
//         // Files assigned to user
//         {
//           assignedTo: {
//             some: { userId }
//           }
//         }
//       ]
//     }

//     // Folder filtering
//     if (folderId) {
//       where.folderId = folderId as string
//     } else {
//       where.folderId = null // Root level files
//     }

//     // Search keyword
//     if (keyword) {
//       where.originalName = {
//         contains: keyword as string,
//         mode: 'insensitive'
//       }
//     }

//     const [files, totalCount] = await Promise.all([
//       prisma.file.findMany({
//         where,
//         include: {
//           user: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               image: true,
//             }
//           },
//           team: {
//             select: {
//               id: true,
//               name: true,
//             }
//           },
//           assignedTo: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   name: true,
//                   email: true,
//                   image: true,
//                 }
//               }
//             }
//           },
//           folder: true,
//         },
//         orderBy: { createdAt: 'desc' },
//         skip,
//         take: pageSizeNum,
//       }),
//       prisma.file.count({ where })
//     ])

//     // Format files
//     const formattedFiles = files.map(file => ({
//       ...file,
//       formattedSize: formatFileSize(file.size),
//       isOwner: file.userId === userId,
//       isAssigned: file.assignedTo.some(a => a.userId === userId),
//       assignedTo: file.assignedTo.map(a => ({
//         id: a.id,
//         user: a.user,
//         assignedBy: a.assignedBy,
//       })),
//     }))

//     return res.status(200).json({
//       message: 'Files retrieved successfully',
//       files: formattedFiles,
//       pagination: {
//         pageNumber: pageNumberNum,
//         pageSize: pageSizeNum,
//         totalCount,
//         totalPages: Math.ceil(totalCount / pageSizeNum),
//       }
//     })

//   } catch (error) {
//     console.error('Get files error:', error)
//     return res.status(500).json({ message: 'Internal server error' })
//   }
// }

// function formatFileSize(bytes: number): string {
//   if (bytes === 0) return '0 Bytes'
//   const k = 1024
//   const sizes = ['Bytes', 'KB', 'MB', 'GB']
//   const i = Math.floor(Math.log(bytes) / Math.log(k))
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
// }

// pages/api/files/all.ts - Updated to properly handle S3 URLs
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FileVisibility } from '@prisma/client'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/aws-s3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userId = session.user.id
    const {
      keyword,
      type,
      visibility,
      folderId,
      teamId,
      pageSize = '20',
      pageNumber = '1'
    } = req.query

    const pageSizeNum = parseInt(pageSize as string)
    const pageNumberNum = parseInt(pageNumber as string)
    const skip = (pageNumberNum - 1) * pageSizeNum

    // Build where clause
    let where: any = {}

    // Type filtering
    if (type && type !== 'all') {
      switch (type) {
        case 'image':
          where.mimeType = { startsWith: 'image/' }
          break
        case 'video':
          where.mimeType = { startsWith: 'video/' }
          break
        case 'audio':
          where.mimeType = { startsWith: 'audio/' }
          break
        case 'document':
          where.mimeType = { 
            in: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
          }
          break
      }
    }

    // Visibility filtering
    if (visibility === 'personal') {
      where.AND = [
        { visibility: FileVisibility.PERSONAL },
        { userId }
      ]
    } else if (visibility === 'team') {
      where.AND = [
        { visibility: { in: [FileVisibility.TEAM, FileVisibility.PASSWORD_PROTECTED] } },
        { teamId: teamId as string }
      ]
    } else if (visibility === 'assigned') {
      where.assignedTo = {
        some: { userId }
      }
    } else {
      // Default: show personal files + team files + assigned files
      where.OR = [
        {
          AND: [
            { visibility: FileVisibility.PERSONAL },
            { userId }
          ]
        },
        {
          AND: [
            { visibility: { in: [FileVisibility.TEAM, FileVisibility.PASSWORD_PROTECTED] } },
            {
              team: {
                members: {
                  some: { userId }
                }
              }
            }
          ]
        },
        {
          assignedTo: {
            some: { userId }
          }
        }
      ]
    }

    // Folder filtering
    if (folderId) {
      where.folderId = folderId as string
    } else {
      where.folderId = null
    }

    // Search keyword
    if (keyword) {
      where.originalName = {
        contains: keyword as string,
        mode: 'insensitive'
      }
    }

    const [files, totalCount] = await Promise.all([
      prisma.file.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
            }
          },
          assignedTo: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                }
              }
            }
          },
          folder: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSizeNum,
      }),
      prisma.file.count({ where })
    ])

    // Generate signed URLs for all files
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        // Generate fresh signed URL for S3
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: file.storageKey,
        })
        
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })

        return {
          ...file,
          url: signedUrl, // Use signed URL instead of empty url from DB
          formattedSize: formatFileSize(file.size),
          isOwner: file.userId === userId,
          isAssigned: file.assignedTo.some(a => a.userId === userId),
        }
      })
    )

    return res.status(200).json({
      message: 'Files retrieved successfully',
      files: filesWithUrls,
      pagination: {
        pageNumber: pageNumberNum,
        pageSize: pageSizeNum,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSizeNum),
      }
    })

  } catch (error) {
    console.error('Get files error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}