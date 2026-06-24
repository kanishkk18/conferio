import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { prisma } from '@/lib/prisma';
import { gemini } from '@/lib/gemini';
import { ollama } from '@/lib/ollama';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid meeting ID' });
  }

  if (req.method === 'GET') {
    try {
      const meeting = await prisma.aiMeeting.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
        select: {
          summary: true,
          actionItems: true,
          keyPoints: true,
          status: true,
        },
      });

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      return res.status(200).json({
        summary: meeting.summary,
        actionItems: meeting.actionItems,
        keyPoints: meeting.keyPoints,
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }
  }

  if (req.method === 'POST') {
    // Regenerate summary
    try {
      const meeting = await prisma.aiMeeting.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
        select: {
          transcript: true,
          meetingName: true,
          status: true,
        },
      });

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      if (meeting.status !== 'completed' || !meeting.transcript) {
        return res.status(400).json({ error: 'No transcript available' });
      }

      // Build transcript text
      // const transcriptArray = meeting.transcript as Array<{ speaker: string; text: string }>;
      // const fullTranscriptText = transcriptArray
      //   .map((t) => `${t.speaker}: ${t.text}`)
      //   .join('\\n');
            // Build transcript text - handle both formats
      let utterances: any[] = [];
      
      if (typeof meeting.transcript === 'object' && !Array.isArray(meeting.transcript)) {
        utterances = meeting.transcript.utterances || [];
      } else if (Array.isArray(meeting.transcript)) {
        utterances = meeting.transcript;
      }

      if (utterances.length === 0) {
        return res.status(400).json({ error: 'No transcript content available' });
      }

      const fullTranscriptText = utterances
        .map((t) => `${t.speaker}: ${t.text}`)
        .join('\n');

      // Generate new summary
      let result;
      const ollamaAvailable = await ollama.checkConnection();
      
      if (ollamaAvailable) {
        result = await ollama.generateSummary(fullTranscriptText, meeting.meetingName || undefined);
      } else {
        result = await gemini.generateSummary(fullTranscriptText, meeting.meetingName || undefined);
      }

      // Update meeting
      await prisma.aiMeeting.update({
        where: { id },
        data: {
          summary: result.summary,
          actionItems: result.actionItems,
          keyPoints: result.keyPoints,
        },
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error regenerating summary:', error);
      return res.status(500).json({ error: 'Failed to regenerate summary' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

