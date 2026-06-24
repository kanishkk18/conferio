
// pages/api/webhooks/meetingbaas.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { assemblyAI } from '@/lib/assemblyai';
import { ollama } from '@/lib/ollama';
import { gemini } from '@/lib/gemini';

type WebhookEvent = 'bot.status_change' | 'bot.completed' | 'bot.joined' | 'bot.left' | 'bot.failed';

interface WebhookPayload {
  event: WebhookEvent;
  data: {
    bot_id: string;
    status?: {
      code: string;
      created_at: string;
      start_time?: number;
    };
    video?: string;
    audio?: string;
    recording?: string;
    diarization?: string;
    transcription?: string;
    raw_transcription?: string;
    transcription_ids?: string[];
    transcription_provider?: string;
    duration_seconds?: number;
    joined_at?: string;
    exited_at?: string;
    sent_at?: string;
    participants?: Array<{
      id: number;
      name: string;
      display_name?: string;
      profile_picture?: string;
    }>;
    speakers?: Array<{
      id: number;
      name: string;
      display_name?: string;
    }>;
    error?: string;
    message?: string;
    data_deleted?: boolean;
  };
  event_id?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body as WebhookPayload;
    const { event, data } = payload;

    console.log('📨 Webhook received:', {
      event,
      bot_id: data?.bot_id,
      sent_at: data?.sent_at,
      timestamp: new Date().toISOString(),
    });

    if (!event || !data?.bot_id) {
      console.error('❌ Invalid webhook payload:', payload);
      return res.status(400).json({ error: 'Missing event or bot_id' });
    }

    // Generate unique event signature for deduplication
    const eventSignature = payload.event_id || `${event}_${data.bot_id}_${data.sent_at || Date.now()}`;

    switch (event) {
      case 'bot.joined':
        await handleBotJoined(data, eventSignature);
        break;
      case 'bot.status_change':
        await handleStatusChange(data, eventSignature);
        break;
      case 'bot.completed':
        await handleBotCompleted(data, eventSignature);
        break;
      case 'bot.left':
        await handleBotLeft(data, eventSignature);
        break;
      case 'bot.failed':
        await handleBotFailed(data, eventSignature);
        break;
      default:
        console.log('ℹ️ Unhandled event type:', event);
    }

    return res.status(200).json({ received: true, event, eventSignature });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return res.status(200).json({ received: true, error: error.message });
  }
}

async function handleBotJoined(data: WebhookPayload['data'], eventSignature: string) {
  const { bot_id, joined_at } = data;
  console.log('🤖 Bot joined:', bot_id);

  const meeting = await findMeetingByBotId(bot_id);
  if (!meeting) {
    console.error('❌ Meeting not found for bot:', bot_id);
    return;
  }

  // Check if already processed this event
  if (meeting.processedEventIds?.includes(eventSignature)) {
    console.log('⚠️ Duplicate bot.joined event, skipping:', eventSignature);
    return;
  }

  // Skip if already recording or completed
  if (meeting.status === 'recording' || meeting.status === 'completed') {
    console.log('⚠️ Meeting already in progress or completed:', meeting.id);
    await markEventProcessed(meeting.id, eventSignature, data.sent_at);
    return;
  }

  await prisma.aiMeeting.update({
    where: { id: meeting.id },
    data: {
      status: 'recording',
      startedAt: joined_at ? new Date(joined_at) : new Date(),
      webhookData: data as any,
      processedEventIds: { push: eventSignature },
      lastWebhookTimestamp: data.sent_at,
    },
  });
  console.log('✅ Meeting status updated to recording:', meeting.id);
}

async function handleStatusChange(data: WebhookPayload['data'], eventSignature: string) {
  const { bot_id, status, sent_at } = data;
  console.log('🔄 Bot status change:', { bot_id, status_code: status?.code });

  const meeting = await findMeetingByBotId(bot_id);
  if (!meeting) {
    console.error('❌ Meeting not found for bot:', bot_id);
    return;
  }

  // Check if already processed this specific event
  if (meeting.processedEventIds?.includes(eventSignature)) {
    console.log('⚠️ Duplicate status change event, skipping:', eventSignature);
    return;
  }

  const statusCode = status?.code || '';
  const statusMap: Record<string, string> = {
    'joining_call': 'pending',
    'in_waiting_room': 'pending',
    'in_call_not_recording': 'joined',
    'in_call_recording': 'recording',
    'call_ended': 'completed',
    'recording_succeeded': 'completed',
    'recording_failed': 'failed',
    'left_call': 'completed',
    'failed': 'failed',
  };

  const newStatus = statusMap[statusCode] || meeting.status;

  // Don't downgrade status (e.g., don't go from completed back to joined)
  const statusPriority = ['failed', 'pending', 'joined', 'recording', 'completed'];
  const currentPriority = statusPriority.indexOf(meeting.status);
  const newPriority = statusPriority.indexOf(newStatus);

  if (newPriority < currentPriority && meeting.status !== 'failed') {
    console.log('⚠️ Preventing status downgrade:', { from: meeting.status, to: newStatus });
    await markEventProcessed(meeting.id, eventSignature, sent_at);
    return;
  }

  await prisma.aiMeeting.update({
    where: { id: meeting.id },
    data: {
      status: newStatus,
      webhookData: data as any,
      updatedAt: new Date(),
      processedEventIds: { push: eventSignature },
      lastWebhookTimestamp: sent_at,
    },
  });
  console.log('✅ Meeting status updated:', { meetingId: meeting.id, newStatus });
}

async function handleBotCompleted(data: WebhookPayload['data'], eventSignature: string) {
  const { 
    bot_id, 
    video, 
    audio, 
    recording,
    duration_seconds,
    exited_at,
    participants,
    speakers,
    sent_at,
  } = data;

  console.log('✅ Bot completed:', {
    bot_id,
    hasVideo: !!(video || recording),
    hasAudio: !!audio,
    duration: duration_seconds,
    sent_at,
  });

  // Retry logic for finding meeting
  let meeting = null;
  let retries = 3;
  
  while (retries > 0 && !meeting) {
    meeting = await findMeetingByBotId(bot_id);
    if (!meeting) {
      console.log(`⏳ Meeting not found, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    }
  }

  if (!meeting) {
    console.error('❌ Meeting not found for bot after retries:', bot_id);
    return;
  }

  // 🛡️ IDEMPOTENCY CHECK 1: Already processed this exact event
  if (meeting.processedEventIds?.includes(eventSignature)) {
    console.log('⚠️ Duplicate bot.completed event, already processed:', eventSignature);
    return;
  }

  // 🛡️ IDEMPOTENCY CHECK 2: Already fully processed (completed with transcript and summary)
  if (meeting.status === 'completed' && meeting.transcript && meeting.summary) {
    console.log('✅ Meeting fully processed already:', meeting.id);
    await markEventProcessed(meeting.id, eventSignature, sent_at);
    return;
  }

  // 🛡️ IDEMPOTENCY CHECK 3: Currently processing (another webhook handling it)
  if (meeting.status === 'processing_transcription') {
    // Check for stale lock (processing for more than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const lastUpdate = meeting.updatedAt ? new Date(meeting.updatedAt) : new Date(0);
    
    if (lastUpdate > tenMinutesAgo) {
      console.log('⏳ Transcription in progress by another process:', meeting.id);
      return;
    } else {
      console.log('⚠️ Stale processing lock detected, continuing...');
    }
  }

  // Extract speaker names
  const speakerNames = speakers?.map(s => s.display_name || s.name).filter(Boolean) || 
                      participants?.map(p => p.display_name || p.name).filter(Boolean) || 
                      [];

  const mediaUrl = audio || video || recording;

  if (!mediaUrl) {
    console.log('⚠️ No media URL provided');
    await prisma.aiMeeting.update({
      where: { id: meeting.id },
      data: { 
        status: 'completed',
        processedEventIds: { push: eventSignature },
        lastWebhookTimestamp: sent_at,
      },
    });
    return;
  }

  // 🛡️ IDEMPOTENCY CHECK 4: Atomic update with status check
  try {
    await prisma.aiMeeting.update({
      where: { 
        id: meeting.id,
        // Only update if not currently processing (prevents race conditions)
        status: { not: 'processing_transcription' }
      },
      data: {
        status: 'processing_transcription',
        videoUrl: video || recording || null,
        audioUrl: audio || null,
        duration: duration_seconds || null,
        endedAt: exited_at ? new Date(exited_at) : new Date(),
        speakers: speakerNames,
        webhookData: data as any,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    // Another process already started processing
    console.log('⏳ Another process started processing, aborting:', meeting.id);
    return;
  }

  console.log('🎙️ Starting AssemblyAI transcription:', meeting.id);

  // Process transcription
  try {
    await transcribeWithAssemblyAI(meeting.id, mediaUrl, speakerNames);
    
    // Mark event as processed after successful completion
    await markEventProcessed(meeting.id, eventSignature, sent_at);
    
  } catch (error) {
    console.error('❌ Transcription failed:', error);
    
    // Check if another process succeeded
    const currentState = await prisma.aiMeeting.findUnique({
      where: { id: meeting.id },
      select: { status: true, transcript: true }
    });
    
    if (currentState?.status === 'completed' && currentState?.transcript) {
      console.log('✅ Another process completed successfully');
      await markEventProcessed(meeting.id, eventSignature, sent_at);
      return;
    }
    
    // Mark as failed
    await prisma.aiMeeting.update({
      where: { id: meeting.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Transcription failed',
        processedEventIds: { push: eventSignature },
        lastWebhookTimestamp: sent_at,
      },
    });
  }
}

async function transcribeWithAssemblyAI(meetingId: string, audioUrl: string, speakers: string[]) {
  console.log('🎙️ Starting AssemblyAI transcription for meeting:', meetingId);
  console.log('🔗 Audio URL:', audioUrl);

  try {
    const transcript = await assemblyAI.transcripts.transcribe({
      audio: audioUrl,
      speech_models: ['universal-3-pro', 'universal-2'],
      speaker_labels: true,
      language_detection: true,
      punctuate: true,
      format_text: true,
    });

    if (transcript.status === 'error') {
      throw new Error(`AssemblyAI transcription error: ${transcript.error}`);
    }

    console.log('✅ AssemblyAI transcription completed:', transcript.id);

    const formattedTranscript = formatAssemblyAITranscript(transcript, speakers);

    await prisma.aiMeeting.update({
      where: { id: meetingId },
      data: {
        transcript: formattedTranscript,
        assemblyaiTranscriptId: transcript.id,
        status: 'completed',
        updatedAt: new Date(),
      },
    });

    console.log('✅ Transcript saved to database for meeting:', meetingId);

    // Auto-generate summary
    await generateSummaryForMeeting(meetingId);
    
  } catch (error) {
    console.error('❌ Error in AssemblyAI transcription:', error);
    throw error;
  }
}

function formatAssemblyAITranscript(transcript: any, meetingSpeakers: string[]) {
  const utterances = transcript.utterances || [];
  
  if (utterances.length > 0) {
    return {
      utterances: utterances.map((u: any) => ({
        speaker: `Speaker ${u.speaker}`,
        speaker_label: u.speaker,
        text: u.text,
        start: u.start,
        end: u.end,
        confidence: u.confidence,
        words: u.words || [],
      })),
      speaker_mapping: mapSpeakersToParticipants(utterances, meetingSpeakers),
      text: transcript.text,
      confidence: transcript.confidence,
      audio_duration: transcript.audio_duration,
      language_code: transcript.language_code,
    };
  } else {
    return {
      utterances: [{
        speaker: 'Unknown',
        text: transcript.text,
        start: 0,
        end: transcript.audio_duration || 0,
        confidence: transcript.confidence,
      }],
      text: transcript.text,
      confidence: transcript.confidence,
      audio_duration: transcript.audio_duration,
      language_code: transcript.language_code,
    };
  }
}

function mapSpeakersToParticipants(utterances: any[], meetingSpeakers: string[]) {
  const speakerCounts: Record<string, number> = {};
  utterances.forEach(u => {
    speakerCounts[u.speaker] = (speakerCounts[u.speaker] || 0) + 1;
  });

  const sortedSpeakers = Object.entries(speakerCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([speaker]) => speaker);

  const mapping: Record<string, string> = {};
  sortedSpeakers.forEach((speaker, index) => {
    mapping[speaker] = meetingSpeakers[index] || `Speaker ${speaker}`;
  });

  return mapping;
}

async function handleBotLeft(data: WebhookPayload['data'], eventSignature: string) {
  const { bot_id, exited_at, sent_at } = data;
  console.log('👋 Bot left:', bot_id);

  const meeting = await findMeetingByBotId(bot_id);
  if (!meeting) {
    console.error('❌ Meeting not found for bot:', bot_id);
    return;
  }

  if (meeting.processedEventIds?.includes(eventSignature)) {
    console.log('⚠️ Duplicate bot.left event, skipping:', eventSignature);
    return;
  }

  // Don't overwrite completed status
  if (meeting.status === 'completed') {
    console.log('⚠️ Meeting already completed, skipping bot.left');
    await markEventProcessed(meeting.id, eventSignature, sent_at);
    return;
  }

  await prisma.aiMeeting.update({
    where: { id: meeting.id },
    data: {
      status: 'completed',
      endedAt: exited_at ? new Date(exited_at) : new Date(),
      webhookData: data as any,
      updatedAt: new Date(),
      processedEventIds: { push: eventSignature },
      lastWebhookTimestamp: sent_at,
    },
  });
}

async function handleBotFailed(data: WebhookPayload['data'], eventSignature: string) {
  const { bot_id, error, message, sent_at } = data;
  console.error('❌ Bot failed:', { bot_id, error, message });

  const meeting = await findMeetingByBotId(bot_id);
  if (!meeting) return;

  if (meeting.processedEventIds?.includes(eventSignature)) {
    console.log('⚠️ Duplicate bot.failed event, skipping:', eventSignature);
    return;
  }

  // Don't overwrite completed status
  if (meeting.status === 'completed') {
    console.log('⚠️ Meeting already completed, not marking as failed');
    await markEventProcessed(meeting.id, eventSignature, sent_at);
    return;
  }

  await prisma.aiMeeting.update({
    where: { id: meeting.id },
    data: {
      status: 'failed',
      errorMessage: error || message || 'Bot failed',
      webhookData: data as any,
      updatedAt: new Date(),
      processedEventIds: { push: eventSignature },
      lastWebhookTimestamp: sent_at,
    },
  });
}

async function generateSummaryForMeeting(meetingId: string) {
  try {
    const meeting = await prisma.aiMeeting.findUnique({
      where: { id: meetingId },
      select: {
        id: true,
        meetingName: true,
        transcript: true,
        summary: true,
      },
    });

    if (!meeting || !meeting.transcript) {
      console.log('⚠️ No transcript available for summary generation');
      return;
    }

    // Skip if summary already exists
    if (meeting.summary) {
      console.log('✅ Summary already exists for meeting:', meetingId);
      return;
    }

    let utterances: any[] = [];
    
    if (typeof meeting.transcript === 'object' && !Array.isArray(meeting.transcript)) {
      utterances = meeting.transcript.utterances || [];
    } else if (Array.isArray(meeting.transcript)) {
      utterances = meeting.transcript;
    }

    if (utterances.length === 0) {
      console.log('⚠️ No utterances found in transcript');
      return;
    }

    const transcriptText = utterances
      .map((t: any) => `${t.speaker || 'Unknown'}: ${t.text || ''}`)
      .join('\n');

    console.log('📝 Auto-generating summary for transcript length:', transcriptText.length);

    let result: any;

    try {
      const ollamaAvailable = await ollama.checkConnection();
      if (ollamaAvailable) {
        console.log('🦙 Using Ollama for auto-summary');
        result = await ollama.generateSummary(transcriptText, meeting.meetingName || undefined);
      } else {
        throw new Error('Ollama not available');
      }
    } catch (ollamaError) {
      console.log('♊ Falling back to Gemini for auto-summary');
      if (!gemini.isConfigured()) {
        throw new Error('No AI provider available');
      }
      result = await gemini.generateSummary(transcriptText, meeting.meetingName || undefined);
    }

    await prisma.aiMeeting.update({
      where: { id: meetingId },
      data: {
        summary: result.summary,
        actionItems: result.actionItems,
        keyPoints: result.keyPoints,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Summary auto-generated and saved for meeting:', meetingId);
    
  } catch (error) {
    console.error('❌ Auto-summary generation error:', error);
  }
}

async function markEventProcessed(meetingId: string, eventSignature: string, timestamp?: string) {
  try {
    await prisma.aiMeeting.update({
      where: { id: meetingId },
      data: {
        processedEventIds: { push: eventSignature },
        lastWebhookTimestamp: timestamp,
      },
    });
  } catch (error) {
    console.error('Failed to mark event as processed:', error);
  }
}

async function findMeetingByBotId(botId: string) {
  try {
    return await prisma.aiMeeting.findFirst({
      where: { botId: botId },
    });
  } catch (error) {
    console.error('Database error finding meeting:', error);
    return null;
  }
}

// import type { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '@/lib/prisma';
// import { gemini } from '@/lib/gemini';
// import { ollama } from '@/lib/ollama';
// import { Webhook } from 'svix';

// // Disable body parsing to get raw body for signature verification
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// async function getRawBody(req: NextApiRequest): Promise<string> {
//   return new Promise((resolve, reject) => {
//     let data = '';
//     req.on('data', (chunk) => {
//       data += chunk;
//     });
//     req.on('end', () => {
//       resolve(data);
//     });
//     req.on('error', reject);
//   });
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     // Get raw body
//     const payload = await getRawBody(req);
    
//     // Get Svix headers
//     const svix_id = req.headers['svix-id'] as string;
//     const svix_timestamp = req.headers['svix-timestamp'] as string;
//     const svix_signature = req.headers['svix-signature'] as string;

//     if (!svix_id || !svix_timestamp || !svix_signature) {
//       console.log('Missing Svix headers, proceeding without verification (development mode)');
//       // In production, you should verify. For now, we'll parse and proceed.
//     } else {
//       // Verify webhook signature using Svix
//       const webhookSecret = process.env.WEBHOOK_SECRET;
//       if (webhookSecret) {
//         const wh = new Webhook(webhookSecret);
//         try {
//           wh.verify(payload, {
//             'svix-id': svix_id,
//             'svix-timestamp': svix_timestamp,
//             'svix-signature': svix_signature,
//           });
//           console.log('✅ Webhook signature verified');
//         } catch (err) {
//           console.error('❌ Invalid webhook signature:', err);
//           return res.status(400).json({ error: 'Invalid signature' });
//         }
//       }
//     }

//     // Parse the event
//     const event = JSON.parse(payload);
//     console.log('📨 Received webhook event:', event.event);

//     // Handle different event types
//     switch (event.event) {
//       case 'bot.completed':
//         await handleBotCompleted(event.data);
//         break;
//       case 'bot.failed':
//         await handleBotFailed(event.data);
//         break;
//       case 'bot.status_change':
//         await handleStatusChange(event.data);
//         break;
//       default:
//         console.log(`Unhandled event type: ${event.event}`);
//     }

//     return res.status(200).json({ received: true });
//   } catch (error) {
//     console.error('Webhook error:', error);
//     return res.status(500).json({ error: 'Webhook processing failed' });
//   }
// }

// async function handleBotCompleted(data: any) {
//   const { bot_id, mp4, transcript, metadata } = data;
  
//   console.log(`✅ Bot ${bot_id} completed`);
//   console.log(`📹 Recording: ${mp4}`);
//   console.log(`📝 Transcript entries: ${transcript?.length || 0}`);

//   try {
//     // Find meeting by bot ID
//     const meeting = await prisma.meeting.findFirst({
//       where: { botId: bot_id },
//     });

//     if (!meeting) {
//       console.error(`Meeting not found for bot ${bot_id}`);
//       return;
//     }

//     // Extract unique speakers
//     const speakers = [...new Set(transcript?.map((t: any) => t.speaker) || [])];

//     // Format transcript
//     const formattedTranscript = transcript?.map((t: any) => ({
//       speaker: t.speaker,
//       text: t.text,
//       startTime: t.start_time,
//       endTime: t.end_time,
//       confidence: t.confidence,
//     })) || [];

//     // Build full transcript text for AI processing
//     const fullTranscriptText = formattedTranscript
//       .map((t: any) => `${t.speaker}: ${t.text}`)
//       .join('\\n');

//     // Generate AI summary using available provider
//     let summary = '';
//     let actionItems: any[] = [];
//     let keyPoints: string[] = [];

//     try {
//       // Try Ollama first (local, free)
//       const ollamaAvailable = await ollama.checkConnection();
//       if (ollamaAvailable) {
//         console.log('🦙 Using Ollama for summary generation');
//         const result = await ollama.generateSummary(fullTranscriptText, meeting.meetingName || undefined);
//         summary = result.summary;
//         actionItems = result.actionItems;
//         keyPoints = result.keyPoints;
//       } else {
//         // Fallback to Gemini (free tier)
//         console.log('♊ Using Gemini for summary generation');
//         const result = await gemini.generateSummary(fullTranscriptText, meeting.meetingName || undefined);
//         summary = result.summary;
//         actionItems = result.actionItems;
//         keyPoints = result.keyPoints;
//       }
//     } catch (aiError) {
//       console.error('AI summary generation failed:', aiError);
//       summary = 'AI summary generation failed. Transcript is available for manual review.';
//     }

//     // Update meeting record
//     await prisma.aimeeting.update({
//       where: { id: meeting.id },
//       data: {
//         status: 'completed',
//         videoUrl: mp4,
//         audioUrl: mp4, // Same URL, can extract audio if needed
//         duration: metadata?.duration || 0,
//         transcript: formattedTranscript,
//         speakers: speakers as string[],
//         summary,
//         actionItems,
//         keyPoints,
//         endedAt: new Date(),
//         webhookData: data,
//       },
//     });

//     console.log(`✅ Meeting ${meeting.id} updated with recording and summary`);
//   } catch (error) {
//     console.error('Error handling bot.completed:', error);
//   }
// }

// async function handleBotFailed(data: any) {
//   const { bot_id, error: errorMessage } = data;
  
//   console.log(`❌ Bot ${bot_id} failed: ${errorMessage}`);

//   try {
//     await prisma.aimeeting.updateMany({
//       where: { botId: bot_id },
//       data: {
//         status: 'failed',
//         errorMessage,
//         endedAt: new Date(),
//       },
//     });
//   } catch (error) {
//     console.error('Error handling bot.failed:', error);
//   }
// }

// async function handleStatusChange(data: any) {
//   const { bot_id, status } = data;
  
//   console.log(`🔄 Bot ${bot_id} status changed to: ${status.code}`);

//   try {
//     // Map status codes to our status
//     let meetingStatus = 'pending';
//     switch (status.code) {
//       case 'joining':
//         meetingStatus = 'joined';
//         break;
//       case 'in_call_recording':
//         meetingStatus = 'recording';
//         break;
//       case 'transcribing':
//         meetingStatus = 'recording'; // Still recording until complete
//         break;
//       case 'completed':
//         meetingStatus = 'completed';
//         break;
//       case 'failed':
//         meetingStatus = 'failed';
//         break;
//     }

//     await prisma.aimeeting.updateMany({
//       where: { botId: bot_id },
//       data: {
//         status: meetingStatus,
//         startedAt: status.start_time ? new Date(status.start_time * 1000) : undefined,
//       },
//     });
//   } catch (error) {
//     console.error('Error handling status change:', error);
//   }
// }


// // pages/api/webhooks/meetingbaas.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '@/lib/prisma';
// import { gemini } from '@/lib/gemini';
// import { ollama } from '@/lib/ollama';
// import { s3Upload } from '@/lib/s3upload';
// import { Webhook } from 'svix';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// async function getRawBody(req: NextApiRequest): Promise<string> {
//   return new Promise((resolve, reject) => {
//     let data = '';
//     req.on('data', (chunk) => {
//       data += chunk;
//     });
//     req.on('end', () => {
//       resolve(data);
//     });
//     req.on('error', reject);
//   });
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const payload = await getRawBody(req);
    
//     // Optional: Verify Svix signature in production
//     const svix_id = req.headers['svix-id'] as string;
//     const svix_timestamp = req.headers['svix-timestamp'] as string;
//     const svix_signature = req.headers['svix-signature'] as string;

//     if (svix_id && svix_timestamp && svix_signature && process.env.WEBHOOK_SECRET) {
//       const wh = new Webhook(process.env.WEBHOOK_SECRET);
//       try {
//         wh.verify(payload, {
//           'svix-id': svix_id,
//           'svix-timestamp': svix_timestamp,
//           'svix-signature': svix_signature,
//         });
//       } catch (err) {
//         return res.status(400).json({ error: 'Invalid signature' });
//       }
//     }

//     const event = JSON.parse(payload);
//     console.log('📨 Webhook event:', event.event);

//     if (event.event === 'bot.completed') {
//       await handleBotCompleted(event.data);
//     } else if (event.event === 'bot.failed') {
//       await handleBotFailed(event.data);
//     }

//     return res.status(200).json({ received: true });
//   } catch (error) {
//     console.error('Webhook error:', error);
//     return res.status(500).json({ error: 'Webhook processing failed' });
//   }
// }

// // pages/api/webhooks/meetingbaas.ts

// async function handleBotCompleted(data: any) {
//   const { 
//     bot_id, 
//     video,           // Video URL from Meeting BaaS
//     audio,           // Audio URL from Meeting BaaS
//     diarization,     // Diarization JSONL URL
//     duration_seconds,
//     participants,
//     speakers 
//   } = data;
  
//   console.log(`✅ Bot ${bot_id} completed`);
//   console.log(`📹 Video: ${video ? 'Yes' : 'No'}`);
//   console.log(`🔊 Audio: ${audio ? 'Yes' : 'No'}`);
//   console.log(`⏱️ Duration: ${duration_seconds}s`);

//   try {
//     // Find meeting by bot ID
//     const meeting = await prisma.aiMeeting.findFirst({
//       where: { botId: bot_id },
//     });

//     if (!meeting) {
//       console.error(`❌ Meeting not found for bot ${bot_id}`);
//       return;
//     }

//     // Fetch transcript from diarization URL
//     let formattedTranscript: any[] = [];
//     let speakersList: string[] = [];

//     if (diarization) {
//       try {
//         console.log('📥 Fetching diarization...');
//         const response = await fetch(diarization);
//         const text = await response.text();
        
//         const lines = text.split('\n').filter(line => line.trim());
//         const diarizationData = lines.map(line => JSON.parse(line));
        
//         formattedTranscript = diarizationData.map((t: any) => ({
//           speaker: t.speaker,
//           text: t.text,
//           startTime: t.start_time,
//           endTime: t.end_time,
//           confidence: t.confidence,
//         }));
        
//         speakersList = [...new Set(diarizationData.map((t: any) => t.speaker))];
//         console.log(`✅ Parsed ${formattedTranscript.length} segments`);
//       } catch (err) {
//         console.error('❌ Failed to fetch diarization:', err);
//       }
//     }

//     // Generate AI summary
//     let summary = '';
//     let actionItems: any[] = [];
//     let keyPoints: string[] = [];

//     if (formattedTranscript.length > 0) {
//       const fullText = formattedTranscript
//         .map((t: any) => `${t.speaker}: ${t.text}`)
//         .join('\n');

//       try {
//         const ollamaAvailable = await ollama.checkConnection();
//         if (ollamaAvailable) {
//           const result = await ollama.generateSummary(fullText, meeting.meetingName || undefined);
//           summary = result.summary;
//           actionItems = result.actionItems;
//           keyPoints = result.keyPoints;
//         } else {
//           const result = await gemini.generateSummary(fullText, meeting.meetingName || undefined);
//           summary = result.summary;
//           actionItems = result.actionItems;
//           keyPoints = result.keyPoints;
//         }
//       } catch (aiError) {
//         console.error('AI summary failed:', aiError);
//         summary = 'AI summary generation failed.';
//       }
//     }

//     // Upload to S3 (PERMANENT STORAGE)
//     let videoUrl = video;
//     let audioUrl = audio;
//     let s3VideoKey: string | null = null;
//     let s3AudioKey: string | null = null;

//     if ((video || audio) && s3Upload.isConfigured()) {
//       try {
//         console.log('☁️ Uploading to S3 for permanent storage...');
//         const uploadResult = await s3Upload.processAndUpload(
//           video,
//           audio,
//           meeting.id,
//           bot_id
//         );
        
//         // Store the S3 keys permanently (these never expire)
//         s3VideoKey = uploadResult.videoKey;
//         s3AudioKey = uploadResult.audioKey;
        
//         // Use the fresh signed URLs for immediate access
//         videoUrl = uploadResult.videoUrl || video;
//         audioUrl = uploadResult.audioUrl || audio;
        
//         console.log('✅ Permanent upload complete!');
//         console.log(`   Video Key: ${s3VideoKey}`);
//         console.log(`   Audio Key: ${s3AudioKey}`);
//       } catch (uploadError) {
//         console.error('❌ S3 upload failed:', uploadError);
//         // Keep original Meeting BaaS URLs as fallback
//       }
//     }

//     // Update meeting with PERMANENT S3 keys
//     await prisma.aiMeeting.update({
//       where: { id: meeting.id },
//       data: {
//         status: 'completed',
//         videoUrl: videoUrl,           // Current signed URL (temporary)
//         audioUrl: audioUrl,           // Current signed URL (temporary)
//         s3VideoKey: s3VideoKey,       // PERMANENT - never expires
//         s3AudioKey: s3AudioKey,       // PERMANENT - never expires
//         s3UploadedAt: s3VideoKey ? new Date() : null,
//         duration: duration_seconds,
//         transcript: formattedTranscript,
//         speakers: speakersList,
//         summary,
//         actionItems,
//         keyPoints,
//         endedAt: new Date(),
//         webhookData: data, // Store full webhook data
//       },
//     });

//     console.log(`✅ Meeting ${meeting.id} saved with permanent storage`);

//   } catch (error) {
//     console.error('❌ Error handling bot.completed:', error);
//   }
// }

// async function handleBotFailed(data: any) {
//   const { bot_id, error: errorMessage } = data;
  
//   console.log(`❌ Bot ${bot_id} failed: ${errorMessage}`);

//   await prisma.aiMeeting.updateMany({
//     where: { botId: bot_id },
//     data: {
//       status: 'failed',
//       errorMessage,
//       endedAt: new Date(),
//     },
//   });
// }

// import type { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '@/lib/prisma';

// // Meeting BaaS webhook event types
// type WebhookEvent = 'bot.status_change' | 'bot.completed' | 'bot.joined' | 'bot.left';

// interface WebhookPayload {
//   event: WebhookEvent;
//   data: {
//     bot_id: string;
//     status?: {
//       code: string;
//       created_at: string;
//       start_time?: number;
//     };
//     video?: string;
//     audio?: string;
//     diarization?: string;
//     duration_seconds?: number;
//     joined_at?: string;
//     exited_at?: string;
//     sent_at?: string;
//     participants?: Array<{
//       id: number;
//       name: string;
//       display_name?: string;
//       profile_picture?: string;
//     }>;
//     speakers?: Array<{
//       id: number;
//       name: string;
//       display_name?: string;
//     }>;
//     transcription?: any;
//     raw_transcription?: any;
//     transcription_ids?: string[];
//     transcription_provider?: string;
//     event_id?: string | null;
//     data_deleted?: boolean;
//   };
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   // Only allow POST requests
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const payload = req.body as WebhookPayload;
//     const { event, data } = payload;

//     console.log('📨 Webhook received:', {
//       event,
//       bot_id: data?.bot_id,
//       timestamp: new Date().toISOString(),
//     });

//     // Validate payload
//     if (!event || !data?.bot_id) {
//       console.error('❌ Invalid webhook payload:', payload);
//       return res.status(400).json({ error: 'Missing event or bot_id' });
//     }

//     // Handle different event types
//     switch (event) {
//       case 'bot.joined':
//         await handleBotJoined(data);
//         break;
        
//       case 'bot.status_change':
//         await handleStatusChange(data);
//         break;
        
//       case 'bot.completed':
//         await handleBotCompleted(data);
//         break;
        
//       case 'bot.left':
//         await handleBotLeft(data);
//         break;
        
//       default:
//         console.log('ℹ️ Unhandled event type:', event);
//     }

//     // Always return 200 to acknowledge receipt
//     return res.status(200).json({ received: true, event });

//   } catch (error: any) {
//     console.error('❌ Webhook processing error:', error);
//     // Still return 200 to prevent retries, but log the error
//     return res.status(200).json({ received: true, error: error.message });
//   }
// }

// async function handleBotJoined(data: WebhookPayload['data']) {
//   const { bot_id, joined_at } = data;
  
//   console.log('🤖 Bot joined:', bot_id);

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) {
//     console.error('❌ Meeting not found for bot:', bot_id);
//     return;
//   }

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'recording',
//       startedAt: joined_at ? new Date(joined_at) : new Date(),
//       webhookData: data as any,
//     },
//   });

//   console.log('✅ Meeting status updated to recording:', meeting.id);
// }

// async function handleStatusChange(data: WebhookPayload['data']) {
//   const { bot_id, status } = data;
  
//   console.log('🔄 Bot status change:', { bot_id, status });

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) {
//     console.error('❌ Meeting not found for bot:', bot_id);
//     return;
//   }

//   // Map Meeting BaaS status codes to our status
//   const statusCode = status?.code || '';
//   const statusMap: Record<string, string> = {
//     'joining_call': 'pending',
//     'in_waiting_room': 'pending',
//     'in_call_not_recording': 'joined',
//     'in_call_recording': 'recording',
//     'call_ended': 'completed',
//     'recording_succeeded': 'completed',
//     'recording_failed': 'failed',
//     'left_call': 'completed',
//     'failed': 'failed',
//   };

//   const newStatus = statusMap[statusCode] || meeting.status;

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: newStatus,
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });

//   console.log('✅ Meeting status updated:', { 
//     meetingId: meeting.id, 
//     newStatus,
//     statusCode 
//   });
// }

// async function handleBotCompleted(data: WebhookPayload['data']) {
//   const { 
//     bot_id, 
//     video, 
//     audio, 
//     diarization,
//     duration_seconds,
//     exited_at,
//     participants,
//     speakers,
//     transcription,
//     raw_transcription,
//   } = data;

//   console.log('✅ Bot completed:', {
//     bot_id,
//     hasVideo: !!video,
//     hasAudio: !!audio,
//     hasDiarization: !!diarization,
//     duration: duration_seconds,
//   });

//   // Retry logic for finding meeting (handles race conditions)
//   let meeting = null;
//   let retries = 3;
  
//   while (retries > 0 && !meeting) {
//     meeting = await findMeetingByBotId(bot_id);
    
//     if (!meeting) {
//       console.log(`⏳ Meeting not found, retrying... (${retries} attempts left)`);
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       retries--;
//     }
//   }

//   if (!meeting) {
//     console.error('❌ Meeting not found for bot after retries:', bot_id);
//     // List recent meetings for debugging
//     const recentMeetings = await prisma.aiMeeting.findMany({
//       where: { botId: { not: null } },
//       orderBy: { createdAt: 'desc' },
//       take: 5,
//       select: { 
//         id: true, 
//         botId: true, 
//         meetingName: true, 
//         status: true, 
//         createdAt: true 
//       },
//     });
//     console.log('Recent meetings with botIds:', recentMeetings);
//     return;
//   }

//   console.log('🎯 Found meeting:', { 
//     meetingId: meeting.id, 
//     botId: meeting.botId,
//     currentStatus: meeting.status 
//   });

//   // Extract unique speaker names
//   const speakerNames = speakers?.map(s => s.display_name || s.name).filter(Boolean) || 
//                       participants?.map(p => p.display_name || p.name).filter(Boolean) || 
//                       [];

//   // Update meeting with all completion data
//   const updatedMeeting = await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'completed',
//       videoUrl: video || null,
//       audioUrl: audio || null,
//       duration: duration_seconds || null,
//       endedAt: exited_at ? new Date(exited_at) : new Date(),
//       speakers: speakerNames,
//       transcript: transcription || raw_transcription || null,
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });

//   console.log('✅ Meeting completed and saved:', {
//     meetingId: updatedMeeting.id,
//     videoUrl: updatedMeeting.videoUrl ? 'Present' : 'Missing',
//     audioUrl: updatedMeeting.audioUrl ? 'Present' : 'Missing',
//     duration: updatedMeeting.duration,
//     speakers: updatedMeeting.speakers?.length || 0,
//   });
// }

// async function handleBotLeft(data: WebhookPayload['data']) {
//   const { bot_id, exited_at } = data;
  
//   console.log('👋 Bot left:', bot_id);

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) {
//     console.error('❌ Meeting not found for bot:', bot_id);
//     return;
//   }

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'completed',
//       endedAt: exited_at ? new Date(exited_at) : new Date(),
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });

//   console.log('✅ Meeting marked as completed (bot left):', meeting.id);
// }

// // Helper function to find meeting by botId
// async function findMeetingByBotId(botId: string) {
//   try {
//     const meeting = await prisma.aiMeeting.findFirst({
//       where: { 
//         botId: botId, // Prisma maps this to bot_id column due to @map("bot_id")
//       },
//     });
//     return meeting;
//   } catch (error) {
//     console.error('Database error finding meeting:', error);
//     return null;
//   }
// }

// pages/api/webhooks/meetingbaas.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '@/lib/prisma';

// type WebhookEvent = 'bot.status_change' | 'bot.completed' | 'bot.joined' | 'bot.left' | 'bot.failed';

// interface WebhookPayload {
//   event: WebhookEvent;
//   data: {
//     bot_id: string;
//     status?: {
//       code: string;
//       created_at: string;
//       start_time?: number;
//     };
//     video?: string;  // S3 URL
//     audio?: string;  // S3 URL
//     recording?: string;  // S3 URL (v2)
//     diarization?: string;  // S3 URL
//     transcription?: string;  // S3 URL to JSON file
//     raw_transcription?: string;  // S3 URL to raw JSON
//     transcription_ids?: string[];
//     transcription_provider?: string;
//     duration_seconds?: number;
//     joined_at?: string;
//     exited_at?: string;
//     sent_at?: string;
//     participants?: Array<{
//       id: number;
//       name: string;
//       display_name?: string;
//       profile_picture?: string;
//     }>;
//     speakers?: Array<{
//       id: number;
//       name: string;
//       display_name?: string;
//     }>;
//     error?: string;
//     message?: string;
//     data_deleted?: boolean;
//   };
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const payload = req.body as WebhookPayload;
//     const { event, data } = payload;

//     console.log('📨 Webhook received:', {
//       event,
//       bot_id: data?.bot_id,
//       timestamp: new Date().toISOString(),
//     });

//     if (!event || !data?.bot_id) {
//       console.error('❌ Invalid webhook payload:', payload);
//       return res.status(400).json({ error: 'Missing event or bot_id' });
//     }

//     switch (event) {
//       case 'bot.joined':
//         await handleBotJoined(data);
//         break;
//       case 'bot.status_change':
//         await handleStatusChange(data);
//         break;
//       case 'bot.completed':
//         await handleBotCompleted(data);
//         break;
//       case 'bot.left':
//         await handleBotLeft(data);
//         break;
//       case 'bot.failed':
//         await handleBotFailed(data);
//         break;
//       default:
//         console.log('ℹ️ Unhandled event type:', event);
//     }

//     return res.status(200).json({ received: true, event });
//   } catch (error: any) {
//     console.error('❌ Webhook processing error:', error);
//     return res.status(200).json({ received: true, error: error.message });
//   }
// }

// async function handleBotJoined(data: WebhookPayload['data']) {
//   const { bot_id, joined_at } = data;
//   console.log('🤖 Bot joined:', bot_id);

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) {
//     console.error('❌ Meeting not found for bot:', bot_id);
//     return;
//   }

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'recording',
//       startedAt: joined_at ? new Date(joined_at) : new Date(),
//       webhookData: data as any,
//     },
//   });
//   console.log('✅ Meeting status updated to recording:', meeting.id);
// }

// async function handleStatusChange(data: WebhookPayload['data']) {
//   const { bot_id, status } = data;
//   console.log('🔄 Bot status change:', { bot_id, status_code: status?.code });

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) {
//     console.error('❌ Meeting not found for bot:', bot_id);
//     return;
//   }

//   const statusCode = status?.code || '';
//   const statusMap: Record<string, string> = {
//     'joining_call': 'pending',
//     'in_waiting_room': 'pending',
//     'in_call_not_recording': 'joined',
//     'in_call_recording': 'recording',
//     'call_ended': 'completed',
//     'recording_succeeded': 'completed',
//     'recording_failed': 'failed',
//     'left_call': 'completed',
//     'failed': 'failed',
//   };

//   const newStatus = statusMap[statusCode] || meeting.status;

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: newStatus,
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });
//   console.log('✅ Meeting status updated:', { meetingId: meeting.id, newStatus });
// }

// async function handleBotCompleted(data: WebhookPayload['data']) {
//   const { 
//     bot_id, 
//     video, 
//     audio, 
//     recording,
//     transcription,
//     raw_transcription,
//     duration_seconds,
//     exited_at,
//     participants,
//     speakers,
//   } = data;

//   console.log('✅ Bot completed:', {
//     bot_id,
//     hasVideo: !!(video || recording),
//     hasAudio: !!audio,
//     hasTranscription: !!transcription,
//     duration: duration_seconds,
//   });

//   // Retry logic for finding meeting
//   let meeting = null;
//   let retries = 3;
  
//   while (retries > 0 && !meeting) {
//     meeting = await findMeetingByBotId(bot_id);
//     if (!meeting) {
//       console.log(`⏳ Meeting not found, retrying... (${retries} attempts left)`);
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       retries--;
//     }
//   }

//   if (!meeting) {
//     console.error('❌ Meeting not found for bot after retries:', bot_id);
//     return;
//   }

//   // Extract speaker names
//   const speakerNames = speakers?.map(s => s.display_name || s.name).filter(Boolean) || 
//                       participants?.map(p => p.display_name || p.name).filter(Boolean) || 
//                       [];

//   // Update meeting with completion data
//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'completed',
//       videoUrl: video || recording || null,
//       audioUrl: audio || null,
//       duration: duration_seconds || null,
//       endedAt: exited_at ? new Date(exited_at) : new Date(),
//       speakers: speakerNames,
//       webhookData: data as any,
//       updatedAt: new Date(),
//       // Don't save transcript yet - fetch it first
//     },
//   });

//   console.log('✅ Meeting marked as completed:', meeting.id);

//   // 🆕 FETCH TRANSCRIPTION FROM URL
//   if (transcription) {
//     try {
//       console.log('📥 Fetching transcription from URL:', transcription);
//       const transcriptData = await fetchTranscriptionFromURL(transcription);
      
//       await prisma.aiMeeting.update({
//         where: { id: meeting.id },
//         data: {
//           transcript: transcriptData,
//           updatedAt: new Date(),
//         },
//       });
//       console.log('✅ Transcription saved to database');

//       // Auto-generate summary
//       await generateSummaryForMeeting(meeting.id);
//     } catch (error) {
//       console.error('❌ Failed to fetch/save transcription:', error);
//     }
//   } else {
//     console.log('⚠️ No transcription URL provided in webhook');
//   }
// }

// async function handleBotLeft(data: WebhookPayload['data']) {
//   const { bot_id, exited_at } = data;
//   console.log('👋 Bot left:', bot_id);

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) {
//     console.error('❌ Meeting not found for bot:', bot_id);
//     return;
//   }

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'completed',
//       endedAt: exited_at ? new Date(exited_at) : new Date(),
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });
// }

// async function handleBotFailed(data: WebhookPayload['data']) {
//   const { bot_id, error, message } = data;
//   console.error('❌ Bot failed:', { bot_id, error, message });

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) return;

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'failed',
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });
// }

// // 🆕 Helper to fetch transcription from S3 URL
// async function fetchTranscriptionFromURL(url: string): Promise<any> {
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error(`Failed to fetch transcription: ${response.status} ${response.statusText}`);
//   }
//   return await response.json();
// }

// // 🆕 Auto-generate summary
// async function generateSummaryForMeeting(meetingId: string) {
//   try {
//     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
//     const response = await fetch(`${baseUrl}/api/aimeetings/${meetingId}/regenerate-summary`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//     });

//     if (!response.ok) {
//       throw new Error(`Summary generation failed: ${response.status}`);
//     }
//     console.log('✅ Summary auto-generated for meeting:', meetingId);
//   } catch (error) {
//     console.error('❌ Auto-summary generation error:', error);
//   }
// }

// async function findMeetingByBotId(botId: string) {
//   try {
//     return await prisma.aiMeeting.findFirst({
//       where: { botId: botId },
//     });
//   } catch (error) {
//     console.error('Database error finding meeting:', error);
//     return null;
//   }
// }

// pages/api/webhooks/meetingbaas.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '@/lib/prisma';
// import { assemblyAI } from '@/lib/assemblyai';
// import { ollama } from '@/lib/ollama';
// import { gemini } from '@/lib/gemini';

// type WebhookEvent = 'bot.status_change' | 'bot.completed' | 'bot.joined' | 'bot.left' | 'bot.failed';

// interface WebhookPayload {
//   event: WebhookEvent;
//   data: {
//     bot_id: string;
//     status?: {
//       code: string;
//       created_at: string;
//       start_time?: number;
//     };
//     video?: string;  // S3 URL
//     audio?: string;  // S3 URL
//     recording?: string;  // S3 URL (v2)
//     diarization?: string;  // S3 URL
//     transcription?: string;  // S3 URL to JSON file (Meeting BaaS)
//     raw_transcription?: string;
//     transcription_ids?: string[];
//     transcription_provider?: string;
//     duration_seconds?: number;
//     joined_at?: string;
//     exited_at?: string;
//     sent_at?: string;
//     participants?: Array<{
//       id: number;
//       name: string;
//       display_name?: string;
//       profile_picture?: string;
//     }>;
//     speakers?: Array<{
//       id: number;
//       name: string;
//       display_name?: string;
//     }>;
//     error?: string;
//     message?: string;
//     data_deleted?: boolean;
//   };
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const payload = req.body as WebhookPayload;
//     const { event, data } = payload;

//     console.log('📨 Webhook received:', {
//       event,
//       bot_id: data?.bot_id,
//       timestamp: new Date().toISOString(),
//     });

//     if (!event || !data?.bot_id) {
//       console.error('❌ Invalid webhook payload:', payload);
//       return res.status(400).json({ error: 'Missing event or bot_id' });
//     }

//     switch (event) {
//       case 'bot.joined':
//         await handleBotJoined(data);
//         break;
//       case 'bot.status_change':
//         await handleStatusChange(data);
//         break;
//       case 'bot.completed':
//         await handleBotCompleted(data);
//         break;
//       case 'bot.left':
//         await handleBotLeft(data);
//         break;
//       case 'bot.failed':
//         await handleBotFailed(data);
//         break;
//       default:
//         console.log('ℹ️ Unhandled event type:', event);
//     }

//     return res.status(200).json({ received: true, event });
//   } catch (error: any) {
//     console.error('❌ Webhook processing error:', error);
//     return res.status(200).json({ received: true, error: error.message });
//   }
// }

// async function handleBotJoined(data: WebhookPayload['data']) {
//   const { bot_id, joined_at } = data;
//   console.log('🤖 Bot joined:', bot_id);

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) {
//     console.error('❌ Meeting not found for bot:', bot_id);
//     return;
//   }

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'recording',
//       startedAt: joined_at ? new Date(joined_at) : new Date(),
//       webhookData: data as any,
//     },
//   });
//   console.log('✅ Meeting status updated to recording:', meeting.id);
// }

// async function handleStatusChange(data: WebhookPayload['data']) {
//   const { bot_id, status } = data;
//   console.log('🔄 Bot status change:', { bot_id, status_code: status?.code });

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) {
//     console.error('❌ Meeting not found for bot:', bot_id);
//     return;
//   }

//   const statusCode = status?.code || '';
//   const statusMap: Record<string, string> = {
//     'joining_call': 'pending',
//     'in_waiting_room': 'pending',
//     'in_call_not_recording': 'joined',
//     'in_call_recording': 'recording',
//     'call_ended': 'completed',
//     'recording_succeeded': 'completed',
//     'recording_failed': 'failed',
//     'left_call': 'completed',
//     'failed': 'failed',
//   };

//   const newStatus = statusMap[statusCode] || meeting.status;

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: newStatus,
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });
//   console.log('✅ Meeting status updated:', { meetingId: meeting.id, newStatus });
// }

// async function handleBotCompleted(data: WebhookPayload['data']) {
//   const { 
//     bot_id, 
//     video, 
//     audio, 
//     recording,
//     duration_seconds,
//     exited_at,
//     participants,
//     speakers,
//   } = data;

//   console.log('✅ Bot completed:', {
//     bot_id,
//     hasVideo: !!(video || recording),
//     hasAudio: !!audio,
//     duration: duration_seconds,
//   });

//   // Retry logic for finding meeting
//   let meeting = null;
//   let retries = 3;
  
//   while (retries > 0 && !meeting) {
//     meeting = await findMeetingByBotId(bot_id);
//     if (!meeting) {
//       console.log(`⏳ Meeting not found, retrying... (${retries} attempts left)`);
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       retries--;
//     }
//   }

//   if (!meeting) {
//     console.error('❌ Meeting not found for bot after retries:', bot_id);
//     return;
//   }

//   // Extract speaker names
//   const speakerNames = speakers?.map(s => s.display_name || s.name).filter(Boolean) || 
//    participants?.map(p => p.display_name || p.name).filter(Boolean) || 
//    [];

//   // Determine the audio/video URL to transcribe
//   const mediaUrl = audio || video || recording;

//   // Update meeting with completion data
//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'processing_transcription', // New status while we process with AssemblyAI
//       videoUrl: video || recording || null,
//       audioUrl: audio || null,
//       duration: duration_seconds || null,
//       endedAt: exited_at ? new Date(exited_at) : new Date(),
//       speakers: speakerNames,
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });

//   console.log('✅ Meeting marked as completed, starting AssemblyAI transcription:', meeting.id);

//   // 🎙️ START ASSEMBLYAI TRANSCRIPTION
//   if (mediaUrl) {
//     try {
//       await transcribeWithAssemblyAI(meeting.id, mediaUrl, speakerNames);
//     } catch (error) {
//       console.error('❌ AssemblyAI transcription failed:', error);
//       await prisma.aiMeeting.update({
//         where: { id: meeting.id },
//         data: {
//           status: 'failed',
//           errorMessage: error instanceof Error ? error.message : 'Transcription failed',
//         },
//       });
//     }
//   } else {
//     console.log('⚠️ No media URL provided for transcription');
//     await prisma.aiMeeting.update({
//       where: { id: meeting.id },
//       data: { status: 'completed' },
//     });
//   }
// }

// async function transcribeWithAssemblyAI(meetingId: string, audioUrl: string, speakers: string[]) {
//   console.log('🎙️ Starting AssemblyAI transcription for meeting:', meetingId);
//   console.log('🔗 Audio URL:', audioUrl);

//   try {
//     // Submit transcription request to AssemblyAI
//     const transcript = await assemblyAI.transcripts.transcribe({
//       audio: audioUrl,
//       // NEW: Use speech_models array (speech_model is deprecated)
//       speech_models: ['universal-3-pro', 'universal-2'],
//       // Enable speaker diarization (speaker labels)
//       speaker_labels: true,
//       // Enable automatic language detection
//       language_detection: true,
//       // Additional options for better meeting transcription
//       punctuate: true,
//       format_text: true,
//     });

//     if (transcript.status === 'error') {
//       throw new Error(`AssemblyAI transcription error: ${transcript.error}`);
//     }

//     console.log('✅ AssemblyAI transcription completed:', transcript.id);

//     // Format the transcript for storage
//     const formattedTranscript = formatAssemblyAITranscript(transcript, speakers);

//     // Update meeting with transcript
//     await prisma.aiMeeting.update({
//       where: { id: meetingId },
//       data: {
//         transcript: formattedTranscript,
//         assemblyaiTranscriptId: transcript.id,
//         status: 'completed',
//         updatedAt: new Date(),
//       },
//     });

//     console.log('✅ Transcript saved to database for meeting:', meetingId);

//     // Auto-generate summary
//     await generateSummaryForMeeting(meetingId);
    
//   } catch (error) {
//     console.error('❌ Error in AssemblyAI transcription:', error);
//     throw error;
//   }
// }

// function formatAssemblyAITranscript(transcript: any, meetingSpeakers: string[]) {
//   // Format AssemblyAI response to match your app's transcript structure
//   const utterances = transcript.utterances || [];
  
//   if (utterances.length > 0) {
//     // Speaker diarization was enabled
//     return {
//       utterances: utterances.map((u: any) => ({
//         speaker: `Speaker ${u.speaker}`, // AssemblyAI labels as A, B, C...
//         speaker_label: u.speaker,
//         text: u.text,
//         start: u.start,
//         end: u.end,
//         confidence: u.confidence,
//         words: u.words || [],
//       })),
//       // Map AssemblyAI speakers to detected meeting participants if possible
//       speaker_mapping: mapSpeakersToParticipants(utterances, meetingSpeakers),
//       text: transcript.text,
//       confidence: transcript.confidence,
//       audio_duration: transcript.audio_duration,
//       language_code: transcript.language_code,
//     };
//   } else {
//     // No speaker diarization, return full text
//     return {
//       utterances: [{
//         speaker: 'Unknown',
//         text: transcript.text,
//         start: 0,
//         end: transcript.audio_duration || 0,
//         confidence: transcript.confidence,
//       }],
//       text: transcript.text,
//       confidence: transcript.confidence,
//       audio_duration: transcript.audio_duration,
//       language_code: transcript.language_code,
//     };
//   }
// }

// function mapSpeakersToParticipants(utterances: any[], meetingSpeakers: string[]) {
//   // Simple heuristic: map most frequent speakers to provided participant names
//   const speakerCounts: Record<string, number> = {};
//   utterances.forEach(u => {
//     speakerCounts[u.speaker] = (speakerCounts[u.speaker] || 0) + 1;
//   });

//   const sortedSpeakers = Object.entries(speakerCounts)
//     .sort((a, b) => b[1] - a[1])
//     .map(([speaker]) => speaker);

//   const mapping: Record<string, string> = {};
//   sortedSpeakers.forEach((speaker, index) => {
//     mapping[speaker] = meetingSpeakers[index] || `Speaker ${speaker}`;
//   });

//   return mapping;
// }

// async function handleBotLeft(data: WebhookPayload['data']) {
//   const { bot_id, exited_at } = data;
//   console.log('👋 Bot left:', bot_id);

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) {
//     console.error('❌ Meeting not found for bot:', bot_id);
//     return;
//   }

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'completed',
//       endedAt: exited_at ? new Date(exited_at) : new Date(),
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });
// }

// async function handleBotFailed(data: WebhookPayload['data']) {
//   const { bot_id, error, message } = data;
//   console.error('❌ Bot failed:', { bot_id, error, message });

//   const meeting = await findMeetingByBotId(bot_id);
//   if (!meeting) return;

//   await prisma.aiMeeting.update({
//     where: { id: meeting.id },
//     data: {
//       status: 'failed',
//       webhookData: data as any,
//       updatedAt: new Date(),
//     },
//   });
// }


// // Replace the generateSummaryForMeeting function completely
// async function generateSummaryForMeeting(meetingId: string) {
//   try {
//     // Get meeting directly from database
//     const meeting = await prisma.aiMeeting.findUnique({
//       where: { id: meetingId },
//       select: {
//         id: true,
//         meetingName: true,
//         transcript: true,
//       },
//     });

//     if (!meeting || !meeting.transcript) {
//       console.log('⚠️ No transcript available for summary generation');
//       return;
//     }

//     // Extract utterances from transcript (handle AssemblyAI format)
//     let utterances: any[] = [];
    
//     if (typeof meeting.transcript === 'object' && !Array.isArray(meeting.transcript)) {
//       utterances = meeting.transcript.utterances || [];
//     } else if (Array.isArray(meeting.transcript)) {
//       utterances = meeting.transcript;
//     }

//     if (utterances.length === 0) {
//       console.log('⚠️ No utterances found in transcript');
//       return;
//     }

//     // Format transcript text
//     const transcriptText = utterances
//       .map((t: any) => `${t.speaker || 'Unknown'}: ${t.text || ''}`)
//       .join('\n');

//     console.log('📝 Auto-generating summary for transcript length:', transcriptText.length);

//     // Try Ollama first, fallback to Gemini
//     let result: any;

//     try {
//       const ollamaAvailable = await ollama.checkConnection();
//       if (ollamaAvailable) {
//         console.log('🦙 Using Ollama for auto-summary');
//         result = await ollama.generateSummary(transcriptText, meeting.meetingName || undefined);
//       } else {
//         throw new Error('Ollama not available');
//       }
//     } catch (ollamaError) {
//       console.log('♊ Falling back to Gemini for auto-summary');
//       if (!gemini.isConfigured()) {
//         throw new Error('No AI provider available');
//       }
//       result = await gemini.generateSummary(transcriptText, meeting.meetingName || undefined);
//     }

//     // Save summary directly to database
//     await prisma.aiMeeting.update({
//       where: { id: meetingId },
//       data: {
//         summary: result.summary,
//         actionItems: result.actionItems,
//         keyPoints: result.keyPoints,
//         updatedAt: new Date(),
//       },
//     });

//     console.log('✅ Summary auto-generated and saved for meeting:', meetingId);
    
//   } catch (error) {
//     console.error('❌ Auto-summary generation error:', error);
//     // Don't throw - we don't want to fail the webhook if summary fails
//   }
// }

// async function findMeetingByBotId(botId: string) {
//   try {
//     return await prisma.aiMeeting.findFirst({
//       where: { botId: botId },
//     });
//   } catch (error) {
//     console.error('Database error finding meeting:', error);
//     return null;
//   }
// }