
// File: pages/api/meetings/[id]/recording.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { createHmac } from 'crypto';
import { z } from 'zod';

const WebhookSchema = z.object({
  event: z.enum(['STARTED', 'STOPPED', 'FAILED']),
  meetingId: z.string(),
  recordingId: z.string(),
  s3Key: z.string().optional(),
  fileSize: z.number().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  error: z.string().optional(),
});

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.JIBRI_WEBHOOK_SECRET;
  if (!secret) return true; // Skip in dev if not set
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  return signature === `sha256=${expected}`;
}

export async function recordingWebhookHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const signature = req.headers['x-jibri-signature'] as string;
  const rawBody = JSON.stringify(req.body);

  if (!verifyWebhookSignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const parsed = WebhookSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const { event, meetingId, recordingId, s3Key, fileSize, startedAt, endedAt } = parsed.data;

  const meeting = await prisma.videoMeeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  if (event === 'STARTED') {
    await prisma.videoMeetingRecording.create({
      data: {
        id: recordingId,
        meetingId,
        s3Key: s3Key ?? '',
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        status: 'recording',
      },
    });
  } else if (event === 'STOPPED') {
    await prisma.videoMeetingRecording.update({
      where: { id: recordingId },
      data: {
        status: 'processing',
        endedAt: endedAt ? new Date(endedAt) : new Date(),
        s3Key: s3Key ?? undefined,
        fileSize: fileSize ? BigInt(fileSize) : undefined,
      },
    });

    // Trigger async S3 check / status update
    // (In production, use SQS or Inngest job)
    setTimeout(async () => {
      try {
        await prisma.videoMeetingRecording.update({
          where: { id: recordingId },
          data: { status: 'ready' },
        });
      } catch {}
    }, 5000);
  } else if (event === 'FAILED') {
    await prisma.videoMeetingRecording.updateMany({
      where: { id: recordingId },
      data: { status: 'failed' },
    });
  }

  return res.status(200).json({ ok: true });
}

export default recordingWebhookHandler;