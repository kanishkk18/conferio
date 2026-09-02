// pages/api/aimeetings/[id]/translate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { translationService } from '@/lib/translation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const meeting = await prisma.aiMeeting.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        transcript: true,
        summary: true,
        actionItems: true,
        keyPoints: true,
        speakers: true,
      },
    });

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (!meeting.transcript) return res.status(400).json({ error: 'No transcript available' });

    // Get all team members who should receive translated versions
    // In your case, this might be the meeting owner + shared users
    const targetLanguages = req.body.languages as string[] || ['en'];
    
    // Normalize transcript to array format (reuse your existing logic)
    let utterances: any[] = [];
    if (typeof meeting.transcript === 'object' && !Array.isArray(meeting.transcript)) {
      utterances = meeting.transcript.utterances || [];
    } else if (Array.isArray(meeting.transcript)) {
      utterances = meeting.transcript;
    }

    const results = [];

    for (const lang of targetLanguages) {
      // Skip if already exists
      const existing = await prisma.meetingTranscript.findFirst({
        where: { meetingId: id, userId: session.user.id, language: lang },
      });

      if (existing) {
        results.push({ language: lang, status: 'already_exists', id: existing.id });
        continue;
      }

      const translated = await translationService.translateMeeting(
        utterances,
        meeting.summary,
        meeting.actionItems as any[] || [],
        meeting.keyPoints as string[] || [],
        lang
      );

      const saved = await prisma.meetingTranscript.create({
        data: {
          meetingId: id,
          userId: session.user.id,
          language: lang,
          content: JSON.stringify(translated.transcript),
          originalContent: JSON.stringify(utterances),
          summary: translated.summary,
          actionItems: translated.actionItems,
          keyPoints: translated.keyPoints,
        },
      });

      results.push({ language: lang, status: 'created', id: saved.id });
    }

    return res.status(200).json({ success: true, results });

  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: error.message || 'Translation failed' });
  }
}