// import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { v4 as uuidv4 } from 'uuid';

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'us-east-1',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// export async function generateUploadURL(filename: string, contentType: string) {
//   const key = `uploads/${uuidv4()}-${filename}`;
  
//   const command = new PutObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//     ContentType: contentType,
//   });

//   const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 300 });
//   const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//   return { uploadURL, fileUrl, key };
// }

// export async function generateDownloadURL(key: string) {
//   const command = new GetObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//   });
//   return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
// }

// export async function deleteFile(key: string) {
//   const command = new DeleteObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//   });
//   await s3Client.send(command);
// }

// export function extractKeyFromUrl(url: string): string {
//   const urlObj = new URL(url);
//   return urlObj.pathname.substring(1);
// }

// // lib/s3.ts
// import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { v4 as uuidv4 } from 'uuid';

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'us-east-1',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// // export async function generateUploadURL(filename: string, contentType: string) {
// //   const key = `uploads/${uuidv4()}-${filename}`;
  
// //   const command = new PutObjectCommand({
// //     Bucket: BUCKET_NAME,
// //     Key: key,
// //     ContentType: contentType,
// //   });

// //   const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
// //   const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

// //   return {
// //     uploadURL,
// //     fileUrl,
// //     key,
// //   };
// // }

// // lib/s3.ts - update generateUploadURL function
// export async function generateUploadURL(filename: string, contentType: string) {
//   const key = `uploads/${uuidv4()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
//   const command = new PutObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//     ContentType: contentType,
//     // Remove ACL if your bucket doesn't support it, or use proper ACL
//     // ACL: 'public-read', 
//   });

//   const uploadURL = await getSignedUrl(s3Client, command, { 
//     expiresIn: 300, // 5 minutes
//     signableHeaders: new Set(['content-type']), // Only sign content-type header
//   });

//   const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//   return { uploadURL, fileUrl, key };
// }

// export async function generateDownloadURL(key: string) {
//   const command = new GetObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//   });

//   return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
// }

// export async function deleteFile(key: string) {
//   const command = new DeleteObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//   });

//   await s3Client.send(command);
// }

// export function extractKeyFromUrl(url: string): string {
//   const urlObj = new URL(url);
//   return urlObj.pathname.substring(1); // Remove leading slash
// }

// // lib/s3.ts
// import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { v4 as uuidv4 } from 'uuid';

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'ap-south-1',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// export async function generateUploadURL(filename: string, contentType: string) {
//   // Clean filename
//   const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
//   const key = `users/${uuidv4()}-${cleanFilename}`;
  
//   const command = new PutObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//     ContentType: contentType,
//     // Remove ACL - configure bucket policy instead
//   });

//   // Generate URL without extra headers
//   const uploadURL = await getSignedUrl(s3Client, command, { 
//     expiresIn: 300, // 5 minutes
//     // Don't sign extra headers to avoid CORS issues
//   });

//   const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//   return { uploadURL, fileUrl, key };
// }

// export async function generateDownloadURL(key: string) {
//   const command = new GetObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//   });
//   return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
// }

// export async function deleteFile(key: string) {
//   const command = new DeleteObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//   });
//   await s3Client.send(command);
// }

// export function extractKeyFromUrl(url: string): string {
//   const urlObj = new URL(url);
//   return urlObj.pathname.substring(1);
// }

// import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import crypto from "crypto";

// const s3 = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

// export async function generateUploadURL(filename: string, contentType: string) {
//   const key = `uploads/${crypto.randomUUID()}-${filename}`;

//   const command = new PutObjectCommand({
//     Bucket: BUCKET,
//     Key: key,
//     ContentType: contentType,
//   });

//   const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });

//   return { uploadURL, key };
// }

// export async function generateDownloadURL(key: string) {
//   const command = new GetObjectCommand({
//     Bucket: BUCKET,
//     Key: key,
//   });

//   return await getSignedUrl(s3, command, { expiresIn: 60 });
// }

// // lib/s3.ts
// import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { v4 as uuidv4 } from 'uuid';

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'auto',
//   endpoint: process.env.S3_ENDPOINT,
//   forcePathStyle: true,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// export async function generateUploadURL(filename: string, contentType: string) {
//   // Clean filename
//   const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
//   const key = `uploads/${uuidv4()}-${cleanFilename}`;
  
//   const command = new PutObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//     ContentType: contentType,
//     // Remove ACL - configure bucket policy instead
//   });

//   // Generate URL without extra headers
//   const uploadURL = await getSignedUrl(s3Client, command, { 
//     expiresIn: 300, // 5 minutes
//     // Don't sign extra headers to avoid CORS issues
//   });

//   // const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//   const fileUrl = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;

//   return { uploadURL, fileUrl, key };
// }

// export async function generateDownloadURL(key: string) {
//   const command = new GetObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//   });
//   return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
// }

// export async function deleteFile(key: string) {
//   const command = new DeleteObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//   });
//   await s3Client.send(command);
// }

// export function extractKeyFromUrl(url: string): string {
//   const urlObj = new URL(url);
//   return urlObj.pathname.substring(1);
// }


// lib/s3.ts
import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand,
  HeadObjectCommand, // ADD THIS
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


const BUCKET_NAME = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET!;

export async function generateUploadURL(filename: string, contentType: string) {
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `uploads/${uuidv4()}-${cleanFilename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const fileUrl = `${process.env.S3_PUBLIC_URL}/${key}`;
  return { uploadURL, fileUrl, key };
}

export async function generateDownloadURL(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
}

// ADD THIS FUNCTION
export async function headObject(key: string) {
  const command = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return await s3Client.send(command);
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  await s3Client.send(command);
}

export function extractKeyFromUrl(url: string): string {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const parts = path.split('/');
  // Remove leading empty string and bucket name for path-style URLs
  // e.g. /conferio/uploads/xyz.jpg -> uploads/xyz.jpg
  return parts.slice(2).join('/');
}
