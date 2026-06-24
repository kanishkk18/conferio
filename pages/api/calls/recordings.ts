import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Parse multipart form data manually
    const chunks: Buffer[] = [];
    
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    
    const data = Buffer.concat(chunks);
    
    // Extract callId from the multipart data
    const callIdMatch = data.toString().match(/name="callId"\r\n\r\n([^\r]+)/);
    const callId = callIdMatch ? callIdMatch[1] : null;

    if (!callId) {
      return res.status(400).json({ error: 'Call ID required' });
    }

    // Verify user is part of the call
    const call = await prisma.call.findFirst({
      where: {
        id: callId,
        OR: [
          { callerId: session.user.id },
          { calleeId: session.user.id }
        ]
      }
    });

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Extract file data
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({ error: 'Invalid form data' });
    }

    // Find file content
    const fileStart = data.indexOf('\r\n\r\n', data.indexOf('filename=')) + 4;
    const fileEnd = data.lastIndexOf(`--${boundary}--`) - 2;
    const fileData = data.slice(fileStart, fileEnd);

    // Save file
    const recordingsDir = join(process.cwd(), 'public', 'recordings');
    await mkdir(recordingsDir, { recursive: true });
    
    const filename = `call-${callId}-${Date.now()}.webm`;
    const filepath = join(recordingsDir, filename);
    
    await writeFile(filepath, fileData);

    // Save to database
    const recording = await prisma.callRecording.create({
      data: {
        callId,
        recordedBy: session.user.id,
        url: `/recordings/${filename}`,
        filename,
        size: fileData.length,
        format: 'webm'
      }
    });

    return res.status(201).json(recording);

  } catch (error) {
    console.error('Recording error:', error);
    return res.status(500).json({ error: 'Failed to save recording' });
  }
}