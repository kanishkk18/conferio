

// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// // Create S3 client instance (v3)
// export const s3 = new S3Client({
//   region: process.env.AWS_REGION || 'auto',
//   endpoint: process.env.S3_ENDPOINT,
//   forcePathStyle: true, 
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// })

// // Helper function to upload with public URL generation
// export async function uploadToS3(params: {
//   Bucket: string
//   Key: string
//   Body: Buffer | Uint8Array | string
//   ContentType: string
// }) {
//   const command = new PutObjectCommand({
//     ...params,
//     // ACL: 'public-read',
//   })
  
//   await s3.send(command)
  
//   // Construct the public URL
//   // const region = process.env.AWS_REGION || 'auto'
//   // const location = `https://${params.Bucket}.s3.${region}.amazonaws.com/${params.Key}`
//   const location = `${process.env.S3_ENDPOINT}/${params.Bucket}/${params.Key}`
  
//   return { Location: location, Key: params.Key }
// } 

// export async function uploadCoverImage(buffer: Buffer, filename: string, contentType: string) {
//   const key = `covers/${Date.now()}-${filename}`
  
//   return uploadToS3({
//     Bucket: process.env.AWS_S3_BUCKET!,
//     Key: key,
//     Body: buffer,
//     ContentType: contentType,
//   })
// }
//  above code is working for s3 bucket  but not for r2

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToS3(params: {
  Bucket: string
  Key: string
  Body: Buffer | Uint8Array | string
  ContentType: string
}) {
  const command = new PutObjectCommand({
    Bucket: params.Bucket,
    Key: params.Key,
    Body: params.Body,
    ContentType: params.ContentType,
  })
  
  await s3.send(command)
  
  // FIX: Return public URL so images/files display inline in the editor
  const location = `${process.env.S3_PUBLIC_URL}/${params.Key}`
  
  return { Location: location, Key: params.Key }
} 

export async function uploadCoverImage(buffer: Buffer, filename: string, contentType: string) {
  const key = `covers/${Date.now()}-${filename}`
  
  return uploadToS3({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })
}
