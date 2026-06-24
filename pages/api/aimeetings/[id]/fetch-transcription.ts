// // pages/api/aimeetings/[id]/fetch-transcription.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';

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
//     const meeting = await prisma.aiMeeting.findFirst({
//       where: { id, userId: session.user.id },
//       select: { id: true, botId: true, status: true, transcript: true, webhookData: true },
//     });

//     if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
//     if (!meeting.botId) return res.status(400).json({ error: 'No bot associated' });

//     // Check if webhook has transcription URL
//     const webhookData = meeting.webhookData as any;
//     const transcriptionUrl = webhookData?.transcription || webhookData?.data?.transcription;

//     if (transcriptionUrl) {
//       // Fetch from S3 URL stored in webhook
//       const response = await fetch(transcriptionUrl);
//       if (!response.ok) throw new Error('Failed to fetch from URL');
//       const transcriptData = await response.json();

//       await prisma.aiMeeting.update({
//         where: { id: meeting.id },
//         data: { transcript: transcriptData },
//       });

//       return res.status(200).json({ success: true, source: 'webhook_url', transcript: transcriptData });
//     }

//     // Fallback: Try Meeting BaaS API directly
//     const apiKey = process.env.MEETING_BAAS_API_KEY;
//     const response = await fetch(`https://api.meetingbaas.com/v2/bots/${meeting.botId}`, {
//       headers: { 'x-meeting-baas-api-key': apiKey!, 'Content-Type': 'application/json' },
//     });

//     if (!response.ok) throw new Error('Failed to fetch bot data');

//     const botData = await response.json();
//     const botTranscriptionUrl = botData.data?.transcription;

//     if (!botTranscriptionUrl) {
//       return res.status(404).json({ error: 'Transcription not available yet' });
//     }

//     const transcriptRes = await fetch(botTranscriptionUrl);
//     const transcriptData = await transcriptRes.json();

//     await prisma.aiMeeting.update({
//       where: { id: meeting.id },
//       data: { transcript: transcriptData },
//     });

//     // Trigger summary generation
//     await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/aimeetings/${id}/regenerate-summary`, {
//       method: 'POST',
//     });

//     return res.status(200).json({ success: true, source: 'api_fetch', transcript: transcriptData });

//   } catch (error: any) {
//     console.error('Error fetching transcription:', error);
//     return res.status(500).json({ error: error.message });
//   }
// }

// pages/api/aimeetings/[id]/fetch-transcript.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { assemblyAI } from '@/lib/assemblyai';

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
    const meeting = await prisma.aiMeeting.findFirst({
      where: { id, userId: session.user.id },
      select: { 
        id: true, 
        botId: true, 
        status: true, 
        transcript: true, 
        webhookData: true,
        audioUrl: true,
        videoUrl: true,
        speakers: true,
      },
    });

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    
    const mediaUrl = meeting.audioUrl || meeting.videoUrl;
    if (!mediaUrl) {
      return res.status(400).json({ error: 'No audio/video URL available for transcription' });
    }

    // Start AssemblyAI transcription
    const transcript = await assemblyAI.transcripts.transcribe({
      audio: mediaUrl,
      // NEW: Use speech_models array (speech_model is deprecated)
      speech_models: ['universal-3-pro', 'universal-2'],
      speaker_labels: true,
      language_detection: true,
      punctuate: true,
      format_text: true,
    });

    if (transcript.status === 'error') {
      throw new Error(`AssemblyAI transcription error: ${transcript.error}`);
    }

    // Format transcript
    const formattedTranscript = {
      utterances: transcript.utterances?.map((u: any) => ({
        speaker: `Speaker ${u.speaker}`,
        speaker_label: u.speaker,
        text: u.text,
        start: u.start,
        end: u.end,
        confidence: u.confidence,
        words: u.words,
      })) || [],
      text: transcript.text,
      confidence: transcript.confidence,
      audio_duration: transcript.audio_duration,
      language_code: transcript.language_code,
    };

    // Save to database
    await prisma.aiMeeting.update({
      where: { id: meeting.id },
      data: {
        transcript: formattedTranscript,
        assemblyaiTranscriptId: transcript.id,
        status: 'completed',
        updatedAt: new Date(),
      },
    });

    // Trigger summary generation
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/aimeetings/${id}/regenerate-summary`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to trigger summary generation:', error);
    }

    return res.status(200).json({ 
      success: true, 
      source: 'assemblyai',
      transcript: formattedTranscript,
      transcriptId: transcript.id,
    });

  } catch (error: any) {
    console.error('Error fetching transcription:', error);
    return res.status(500).json({ error: error.message });
  }
}