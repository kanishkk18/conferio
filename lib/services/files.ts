import { prisma } from '@/lib/prisma'
import { s3 } from 'lib/aws-s3'
import { UploadSource } from '@prisma/client'
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'
import archiver from 'archiver'
import { PassThrough, Readable } from 'stream'
import { sanitizeFilename } from '@/lib/utils'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_QUOTA = 2 * 1024 * 1024 * 1024; // 2GB

export async function uploadFilesService(
  userId: string,
  files: File[],
  uploadedVia: UploadSource
) {
  if (!files?.length) {
    throw new Error('No files provided')
  }

  // Check storage availability  
  // const totalFileSize = files.reduce((sum, file) => sum + file.size, 0)
  // await validateStorageAvailability(userId, totalFileSize)

  // const results = await Promise.allSettled(
  //   files.map(async (file) => {
  //     let storageKey: string | null = null
  //     try {
  //       const { storageKey: key } = await uploadToS3(file, userId)
  //       storageKey = key

  //       const createdFile = await prisma.file.create({
  //         data: {
  //           userId,
  //           storageKey: key,
  //           originalName: file.name,
  //           uploadVia: uploadedVia,
  //           size: file.size,
  //           ext: path.extname(file.name)?.slice(1)?.toLowerCase() || '',
  //           url: '',
  //           mimeType: file.type,
  //         },
  //       })

  //       return {
  //         fileId: createdFile.id,
  //         originalName: createdFile.originalName,
  //         size: createdFile.size,
  //         ext: createdFile.ext,
  //         mimeType: createdFile.mimeType,
  //       }
  //     } catch (error) {
  //       if (storageKey) {
  //         // Clean up S3 if database operation failed
  //         try {
  //           await deleteFromS3(storageKey)
  //         } catch (cleanupError) {
  //           console.error('Failed to cleanup S3 object:', cleanupError)
  //         }
  //       }
  //       throw error
  //     }
  //   })
  // )

  const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);
  await validateStorageAvailability(userId, totalFileSize);

  const results = await Promise.allSettled(
    files.map(async (file) => {
      let storageKey: string | null = null;
      try {
        const { storageKey: key } = await uploadToS3(file, userId);
        storageKey = key;

        const createdFile = await prisma.file.create({
          data: {
            userId,
            storageKey: key,
            originalName: file.name,
            uploadVia: uploadedVia,
            size: file.size,
            ext: path.extname(file.name)?.slice(1)?.toLowerCase() || '',
            url: '',
            mimeType: file.type,
          },
        });

        return {
          fileId: createdFile.id,
          originalName: createdFile.originalName,
          size: createdFile.size,
          ext: createdFile.ext,
          mimeType: createdFile.mimeType,
        };
      } catch (error) {
        if (storageKey) {
          // Clean up S3 if database operation failed
          try {
            await deleteFromS3(storageKey);
          } catch (cleanupError) {
            console.error('Failed to cleanup S3 object:', cleanupError);
          }
        }
        throw error;
      }
    })
  );

  const successfulRes = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)

  const failedRes = results
    .filter((r) => r.status === 'rejected')
    .map((r) => r.reason.message)

  return {
    message: `Uploaded successfully ${successfulRes.length} out of ${files.length} files`,
    data: successfulRes,
    failedCount: failedRes.length,
  }
}

export async function getAllFilesService(
  userId: string,
  filter: { keyword?: string },
  pagination: { pageSize: number; pageNumber: number }
) {
  const { keyword } = filter
  const { pageSize, pageNumber } = pagination
  const skip = (pageNumber - 1) * pageSize

  const where: any = { userId }

  if (keyword) {
    where.originalName = {
      contains: keyword,
      mode: 'insensitive',
    }
  }

  const [files, totalCount] = await Promise.all([
    prisma.file.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.file.count({ where }),
  ])

  const filesWithUrls = await Promise.all(
    files.map(async (file) => {
      const url = await getFileFromS3({
        storageKey: file.storageKey,
        mimeType: file.mimeType,
        expiresIn: 3600,
      })

      return {
        ...file,
        url,
        formattedSize: formatBytes(file.size),
        storageKey: undefined,
      }
    })
  )

  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    files: filesWithUrls,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  }
}

// export async function deleteFilesService(userId: string, fileIds: string[]) {
//   const files = await prisma.file.findMany({
//     where: {
//       id: { in: fileIds },
//       userId,
//     },
//   })

//   if (!files.length) {
//     throw new Error('No files found')
//   }

//   const s3Errors: string[] = []

//   await Promise.all(
//     files.map(async (file) => {
//       try {
//         await deleteFromS3(file.storageKey)
//       } catch (error) {
//         console.error(`Failed to delete ${file.storageKey} from S3:`, error)
//         s3Errors.push(file.storageKey)
//       }
//     })
//   )

//   const successfulFileIds = files
//     .filter((file) => !s3Errors.includes(file.storageKey))
//     .map((file) => file.id)

//   const { count: deletedCount } = await prisma.file.deleteMany({
//     where: {
//       id: { in: successfulFileIds },
//       userId,
//     },
//   })

//   return {
//     deletedCount,
//     failedCount: s3Errors.length,
//   }
// }

// lib/services/files.ts
export async function deleteFilesService(userId: string, fileIds: string[]) {
  const files = await prisma.file.findMany({
    where: {
      id: { in: fileIds },
      userId,
    },
  });

  if (!files.length) {
    throw new Error('No files found');
  }

  const s3Errors: string[] = [];

  await Promise.all(
    files.map(async (file) => {
      try {
        await deleteFromS3(file.storageKey);
      } catch (error) {
        console.error(`Failed to delete ${file.storageKey} from S3:`, error);
        s3Errors.push(file.storageKey);
      }
    })
  );

  const successfulFileIds = files
    .filter((file) => !s3Errors.includes(file.storageKey))
    .map((file) => file.id);

  const { count: deletedCount } = await prisma.file.deleteMany({
    where: {
      id: { in: successfulFileIds },
      userId,
    },
  });

  return {
    deletedCount,
    failedCount: s3Errors.length,
  };
}

export async function downloadFilesService(userId: string, fileIds: string[]) {
  const files = await prisma.file.findMany({
    where: {
      id: { in: fileIds },
      userId,
    },
  })

  if (!files.length) {
    throw new Error('No files found')
  }

  if (files.length === 1) {
    const signedUrl = await getFileFromS3({
      storageKey: files[0].storageKey,
      filename: files[0].originalName,
    })

    return {
      url: signedUrl,
      isZip: false,
    }
  }

  const url = await handleMultipleFilesDownload(files, userId)

  return {
    url,
    isZip: true,
  }
}

export async function getFileUrlService(fileId: string) {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    throw new Error('File not found')
  }

  const stream = await getS3ReadStream(file.storageKey)

  return {
    url: '',
    stream,
    contentType: file.mimeType,
    fileSize: file.size,
  }
}

// Helper functions
// async function validateStorageAvailability(userId: string, totalFileSize: number) {
//   const storage = await prisma.storage.findUnique({
//     where: { userId },
//   })

//   if (!storage) {
//     throw new Error('Storage record not found')
//   }

//   const usage = await calculateStorageUsage(userId)
//   const remaining = Number(storage.storageQuota) - usage

//   if (remaining < totalFileSize) {
//     const shortfall = totalFileSize - remaining
//     throw new Error(`Insufficient storage. ${formatBytes(shortfall)} needed.`)
//   }
// }

// lib/services/files.ts
async function validateStorageAvailability(userId: string, totalFileSize: number) {
  // Try to find existing storage record
  let storage = await prisma.storage.findUnique({
    where: { userId },
  });

  // If storage doesn't exist, create it
  if (!storage) {
    storage = await prisma.storage.create({
      data: {
        userId,
        storageQuota: BigInt(10 * 1024 * 1024 * 1024), // 10GB in bytes
      },
    });
  }

  // Calculate current usage by summing up all file sizes for the user
  const usageResult = await prisma.file.aggregate({
    where: { userId },
    _sum: {
      size: true,
    },
  });
  
  const usage = usageResult._sum.size || 0;
  const remaining = Number(storage.storageQuota) - usage;

  if (remaining < totalFileSize) {
    const shortfall = totalFileSize - remaining;
    throw new Error(`Insufficient storage. ${formatBytes(shortfall)} needed.`);
  }
}

async function calculateStorageUsage(userId: string): Promise<number> {
  const result = await prisma.file.aggregate({
    where: { userId },
    _sum: { size: true },
  })
  return result._sum.size || 0
}

async function uploadToS3(file: File, userId: string) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = path.extname(file.name)
  const basename = path.basename(file.name, ext)
  const cleanName = sanitizeFilename(basename).substring(0, 64)
  const storageKey = `users/${userId}/${uuidv4()}-${cleanName}${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: storageKey,
    Body: buffer,
    ContentType: file.type,
  })

  await s3.send(command)

  return { storageKey }
}

async function getFileFromS3({
  storageKey,
  filename,
  mimeType,
  expiresIn = 60,
}: {
  storageKey: string
  expiresIn?: number
  filename?: string
  mimeType?: string
}) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: storageKey,
    ...(!filename && {
      ResponseContentType: mimeType,
      ResponseContentDisposition: 'inline',
    }),
    ...(filename && {
      ResponseContentDisposition: `attachment;filename="${filename}"`,
    }),
  })

  return await getSignedUrl(s3, command, { expiresIn })
}

async function getS3ReadStream(storageKey: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: storageKey,
  })
  
  const response = await s3.send(command)
  
  if (!response.Body) {
    throw new Error(`No body returned for key: ${storageKey}`)
  }
  
  return response.Body as Readable
}

async function deleteFromS3(storageKey: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: storageKey,
  })
  await s3.send(command)
}

async function handleMultipleFilesDownload(
  files: Array<{ storageKey: string; originalName: string }>,
  userId: string
) {
  const timestamp = Date.now()
  const zipKey = `temp-zips/${userId}/${timestamp}.zip`
  const zipFilename = `uploadnest-${timestamp}.zip`

  const zip = archiver('zip', { zlib: { level: 6 } })
  const passThrough = new PassThrough()

  zip.on('error', (err) => {
    passThrough.destroy(err)
  })

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: zipKey,
      Body: passThrough,
      ContentType: 'application/zip',
    },
  })

  zip.pipe(passThrough)

  for (const file of files) {
    try {
      const stream = await getS3ReadStream(file.storageKey)
      zip.append(stream, { name: sanitizeFilename(file.originalName) })
    } catch (error: any) {
      zip.destroy(error)
      throw error
    }
  }

  await zip.finalize()
  await upload.done()

  const url = await getFileFromS3({
    storageKey: zipKey,
    filename: zipFilename,
    expiresIn: 3600,
  })

  return url
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }

  const value = Number(bytes.toFixed(2))
  return `${value}${units[i]}`
}
