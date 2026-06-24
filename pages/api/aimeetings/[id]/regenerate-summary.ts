// // pages/api/aimeetings/[id]/regenerate-summary.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';
// import { ollama } from '@/lib/ollama';
// import { gemini } from '@/lib/gemini';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id } = req.query;

//   if (!id || typeof id !== 'string') {
//     return res.status(400).json({ error: 'Invalid meeting ID' });
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     // Get meeting with transcript
//     const meeting = await prisma.aiMeeting.findFirst({
//       where: {
//         id,
//         userId: session.user.id,
//       },
//       select: {
//         id: true,
//         transcript: true,
//         meetingName: true,
//       },
//     });

//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     if (!meeting.transcript || !Array.isArray(meeting.transcript) || meeting.transcript.length === 0) {
//       return res.status(400).json({ error: 'No transcript available to generate summary' });
//     }

//     // Format transcript
//     const transcriptText = meeting.transcript
//       .map((t: any) => `${t.speaker}: ${t.text}`)
//       .join('\n');

//     // Try Ollama first, fallback to Gemini
//     let summary = '';
//     let actionItems: any[] = [];
//     let keyPoints: string[] = [];

//     try {
//       const ollamaAvailable = await ollama.checkConnection();
//       if (ollamaAvailable) {
//         console.log('🦙 Using Ollama for summary regeneration');
//         const result = await ollama.generateSummary(transcriptText, meeting.meetingName || undefined);
//         summary = result.summary;
//         actionItems = result.actionItems;
//         keyPoints = result.keyPoints;
//       } else {
//         throw new Error('Ollama not available');
//       }
//     } catch (ollamaError) {
//       console.log('♊ Falling back to Gemini for summary regeneration');
//       if (!gemini.isConfigured()) {
//         return res.status(500).json({ 
//           error: 'No AI provider available. Please configure Ollama or Gemini.' 
//         });
//       }
//       const result = await gemini.generateSummary(transcriptText, meeting.meetingName || undefined);
//       summary = result.summary;
//       actionItems = result.actionItems;
//       keyPoints = result.keyPoints;
//     }

//     // Update meeting with new summary
//     await prisma.aiMeeting.update({
//       where: { id },
//       data: {
//         summary,
//         actionItems,
//         keyPoints,
//         updatedAt: new Date(),
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       summary,
//       actionItems,
//       keyPoints,
//     });

//   } catch (error) {
//     console.error('Regenerate summary error:', error);
//     return res.status(500).json({ 
//       error: 'Failed to regenerate summary',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// }

// pages/api/aimeetings/[id]/regenerate-summary.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ollama } from '@/lib/ollama';
import { gemini } from '@/lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid meeting ID' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get meeting with transcript
    const meeting = await prisma.aiMeeting.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        transcript: true,
        meetingName: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Extract utterances from transcript (handle both formats)
    let utterances: any[] = [];
    
    if (!meeting.transcript) {
      return res.status(400).json({ error: 'No transcript available to generate summary' });
    }
    
    // Handle AssemblyAI format (object with utterances array)
    if (typeof meeting.transcript === 'object' && !Array.isArray(meeting.transcript)) {
      if (meeting.transcript.utterances && Array.isArray(meeting.transcript.utterances)) {
        utterances = meeting.transcript.utterances;
      } else if (meeting.transcript.text) {
        // Single text format
        utterances = [{ speaker: 'Unknown', text: meeting.transcript.text }];
      }
    } 
    // Handle flat array format (legacy or pre-formatted)
    else if (Array.isArray(meeting.transcript)) {
      utterances = meeting.transcript;
    }

    if (utterances.length === 0) {
      return res.status(400).json({ error: 'No transcript content available to generate summary' });
    }

    // Format transcript text
    const transcriptText = utterances
      .map((t: any) => `${t.speaker || 'Unknown'}: ${t.text || ''}`)
      .join('\n');

    console.log('📝 Transcript length for summary:', transcriptText.length, 'characters');

    // Try Ollama first, fallback to Gemini
    let summary = '';
    let actionItems: any[] = [];
    let keyPoints: string[] = [];

    try {
      const ollamaAvailable = await ollama.checkConnection();
      if (ollamaAvailable) {
        console.log('🦙 Using Ollama for summary regeneration');
        const result = await ollama.generateSummary(transcriptText, meeting.meetingName || undefined);
        summary = result.summary;
        actionItems = result.actionItems;
        keyPoints = result.keyPoints;
      } else {
        throw new Error('Ollama not available');
      }
    } catch (ollamaError) {
      console.log('♊ Falling back to Gemini for summary regeneration');
      if (!gemini.isConfigured()) {
        return res.status(500).json({ 
          error: 'No AI provider available. Please configure Ollama or Gemini.' 
        });
      }
      const result = await gemini.generateSummary(transcriptText, meeting.meetingName || undefined);
      summary = result.summary;
      actionItems = result.actionItems;
      keyPoints = result.keyPoints;
    }

    // Update meeting with new summary
    await prisma.aiMeeting.update({
      where: { id },
      data: {
        summary,
        actionItems,
        keyPoints,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      summary,
      actionItems,
      keyPoints,
    });

  } catch (error) {
    console.error('Regenerate summary error:', error);
    return res.status(500).json({ 
      error: 'Failed to regenerate summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}