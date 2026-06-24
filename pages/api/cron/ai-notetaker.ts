
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { meetingBaas } from '@/lib/meetingbaas';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('🔑 Header received:', req.headers.authorization);
  console.log('🔑 Env secret:', process.env.CRON_SECRET);
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 2 * 86400000); // 2 days  window for testing

    const scheduled = await prisma.aiMeeting.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: { gte: now, lte: windowEnd },
      },
    });

    const results = [];

    for (const ai of scheduled) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
        if (!appUrl) throw new Error('App URL not set');

        const botResponse = await meetingBaas.createBot({
          meeting_url: ai.meetingUrl,
          bot_name: ai.meetingName || 'AI Notetaker',
          entry_message: "Hello! I'm here to record and transcribe this meeting.",
          recording_mode: 'speaker_view',
          speech_to_text: { provider: 'AssemblyAI' },
          webhook_url: `${appUrl}/api/webhooks/meetingbaas`,
          deduplication_key: uuidv4(),
        });

        const botId = botResponse.data?.bot_id || botResponse.bot_id;

        await prisma.aiMeeting.update({
          where: { id: ai.id },
          data: {
            botId,
            status: 'pending',
            startedAt: new Date(),
          },
        });

        results.push({ id: ai.id, status: 'started', botId });
      } catch (err: any) {
        console.error(`Failed to start bot ${ai.id}:`, err);
        await prisma.aiMeeting.update({
          where: { id: ai.id },
          data: { status: 'failed', errorMessage: err.message },
        });
        results.push({ id: ai.id, status: 'failed', error: err.message });
      }
    }

    return res.status(200).json({ processed: scheduled.length, results });
  } catch (error: any) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
  }
}