// scripts/setup-s3-cors.mjs
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const corsConfig = {
  Bucket: 'conferiotestbkt',
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedOrigins: [
          'http://localhost:4002',
          'https://localhost:4002',
          'http://127.0.0.1:4002',
          'https://conferio-calls.vercel.app',
          'https://conferio.in'
        ],
        ExposeHeaders: ['ETag', 'Content-Type', 'Content-Length', 'Date'],
        MaxAgeSeconds: 3600,
      },
    ],
  },
};

async function setupCors() {
  try {
    await s3Client.send(new PutBucketCorsCommand(corsConfig));
    console.log('✅ S3 CORS configured successfully for bucket: conferiotestbkt');
    console.log('Allowed origins:');
    console.log('  - http://localhost:4002');
    console.log('  - https://localhost:4002');
  } catch (error) {
    console.error('❌ Failed to configure CORS:', error.message);
    process.exit(1);
  }
}

setupCors();