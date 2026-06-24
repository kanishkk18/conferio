
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';
// import { meetingBaas } from '@/lib/meetingbaas';
// import { v4 as uuidv4 } from 'uuid';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const { meetingUrl, meetingName, platform, recordingMode = 'speaker_view' } = req.body;
//     // const { meetingUrl, meetingName, recordingMode = 'speaker_view' } = req.body;

//     if (!meetingUrl) {
//       return res.status(400).json({ error: 'Meeting URL is required' });
//     }

//     const validModes = ['audio_only', 'speaker_view', 'gallery_view'];
// if (!validModes.includes(recordingMode)) {
//   return res.status(400).json({ 
//     error: `Invalid recording_mode. Must be one of: ${validModes.join(', ')}` 
//   });
// }

//     // Detect platform from URL if not provided
//     const detectedPlatform = platform || detectPlatform(meetingUrl);

//     // Create meeting record in database
//     const meeting = await prisma.aiMeeting.create({
//       data: {
//         userId: session.user.id,
//         meetingUrl,
//         meetingName: meetingName || `Meeting ${new Date().toLocaleString()}`,
//         platform: detectedPlatform,
//         status: 'pending',
//       },
//     });

//     // Construct webhook URL
//     const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/meetingbaas`;

//     // Create bot via Meeting BaaS API v2
//     const botResponse = await meetingBaas.createBot({
//         meeting_url: meetingUrl,
//         bot_name: meetingName || 'AI Notetaker',
//         entry_message: "Hello! I'm here to record and transcribe this meeting.",
//         recording_mode: recordingMode, // ✅ Now passes correct value
//         speech_to_text: {
//           provider: 'Gladia',
//         },
//         webhook_url: webhookUrl,
//         deduplication_key: uuidv4(),
//       });

//     // Update meeting with bot ID
//     await prisma.aiMeeting.update({
//       where: { id: meeting.id },
//       data: {
//         botId: botResponse.bot_id,
//         status: 'joined',
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       meetingId: meeting.id,
//       botId: botResponse.bot_id,
//       status: botResponse.status,
//     });
//   } catch (error: any) {
//     console.error('Error joining meeting:', error);

//     // Update meeting status to failed if it was created
//     if (error.meetingId) {
//       await prisma.aiMeeting.update({
//         where: { id: error.meetingId },
//         data: { status: 'failed', errorMessage: error.message },
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to join meeting',
//     });
//   }
// }

// function detectPlatform(url: string): string {
//   if (url.includes('zoom.us')) return 'zoom';
//   if (url.includes('meet.google.com')) return 'google_meet';
//   if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'teams';
//   return 'unknown';
// }


// // working code 
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
// import { meetingBaas } from '@/lib/meetingbaas';
// import { v4 as uuidv4 } from 'uuid';

// // Recording mode type
// type RecordingMode = 'audio_only' | 'speaker_view' | 'gallery_view';

// // Meeting BaaS API response type
// interface BotResponse {
//   success: boolean;
//   data: {
//     bot_id: string;
//     status?: string;
//   };
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   // Get user session
//   const session = await getServerSession(req, res, authOptions);

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   let meetingId: string | null = null;

//   try {
//     const {
//       meetingUrl,
//       meetingName,
//       platform,
//       recordingMode = 'speaker_view'
//     } = req.body;

//     // Validate meeting URL
//     if (!meetingUrl) {
//       return res.status(400).json({ error: 'Meeting URL is required' });
//     }

//     // Validate recording mode
//     const validModes: RecordingMode[] = ['audio_only', 'speaker_view', 'gallery_view'];
//     if (!validModes.includes(recordingMode)) {
//       return res.status(400).json({
//         error: `Invalid recording_mode. Must be one of: ${validModes.join(', ')}`
//       });
//     }

//     // Detect platform from URL if not provided
//     const detectedPlatform = platform || detectPlatform(meetingUrl);

//     // Create meeting record in database
//     const meeting = await prisma.aiMeeting.create({
//       data: {
//         userId: session.user.id,
//         meetingUrl,
//         meetingName: meetingName || `Meeting ${new Date().toLocaleString()}`,
//         platform: detectedPlatform,
//         status: 'pending',
//       },
//     });

//     meetingId = meeting.id;
//     console.log('💾 Meeting created in DB:', meeting.id);

//     // Construct webhook URL from environment variable
//     const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
//     if (!appUrl) {
//       throw new Error('NEXT_PUBLIC_APP_URL or APP_URL environment variable is not set');
//     }

//     const webhookUrl = `${appUrl}/api/webhooks/meetingbaas`;
//     console.log('🔗 Webhook URL:', webhookUrl);

//     // Create bot via Meeting BaaS API v2
//     const botResponse = await meetingBaas.createBot({
//       meeting_url: meetingUrl,
//       bot_name: meetingName || 'AI Notetaker',
//       entry_message: "Hello! I'm here to record and transcribe this meeting.",
//       recording_mode: recordingMode,
//       speech_to_text: {
//         provider: 'Gladia',
//       },
//       webhook_url: webhookUrl,
//       deduplication_key: uuidv4(),
//     });

//     console.log('🤖 Bot created response:', JSON.stringify(botResponse, null, 2));

//     // FIX: Access bot_id directly from CreateBotResponse (not nested in data)
//     // const actualBotId = botResponse.bot_id;

//     const actualBotId = botResponse.data?.bot_id || botResponse.bot_id;

//     // Verify bot_id exists in response
//     if (!actualBotId) {
//       console.error('❌ Bot response structure:', botResponse);
//       throw new Error('No bot_id returned from Meeting BaaS API');
//     }

//     // Update meeting with bot ID - CRITICAL STEP
//     const updatedMeeting = await prisma.aiMeeting.update({
//       where: { id: meeting.id },
//       data: {
//         botId: actualBotId, // This maps to bot_id in database
//         status: 'pending',
//         startedAt: new Date(),
//       },
//     });

//     console.log('✅ Meeting updated with botId:', {
//       meetingId: updatedMeeting.id,
//       botId: updatedMeeting.botId,
//       status: updatedMeeting.status,
//     });

//     return res.status(200).json({
//       success: true,
//       meetingId: meeting.id,
//       botId: actualBotId,
//       status: botResponse.data?.status || 'joined',
//     });

//   } catch (error: any) {
//     console.error('❌ Error in join meeting:', error);

//     // Update meeting status to failed if it was created
//     if (meetingId) {
//       try {
//         await prisma.aiMeeting.update({
//           where: { id: meetingId },
//           data: {
//             status: 'failed',
//             errorMessage: error.message || 'Unknown error'
//           },
//         });
//         console.log('📝 Meeting marked as failed:', meetingId);
//       } catch (updateError) {
//         console.error('Failed to update meeting status:', updateError);
//       }
//     }

//     return res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to join meeting',
//     });
//   }
// }

// function detectPlatform(url: string): string {
//   if (url.includes('zoom.us')) return 'zoom';
//   if (url.includes('meet.google.com')) return 'google_meet';
//   if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'teams';
//   return 'unknown';
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { meetingBaas } from '@/lib/meetingbaas';
import { v4 as uuidv4 } from 'uuid';

type RecordingMode = 'audio_only' | 'speaker_view' | 'gallery_view';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let meetingId: string | null = null;

  try {
    const {
      meetingUrl,
      meetingName,
      platform,
      recordingMode = 'speaker_view'
    } = req.body;

    if (!meetingUrl) {
      return res.status(400).json({ error: 'Meeting URL is required' });
    }

    const validModes: RecordingMode[] = ['audio_only', 'speaker_view', 'gallery_view'];
    if (!validModes.includes(recordingMode)) {
      return res.status(400).json({
        error: `Invalid recording_mode. Must be one of: ${validModes.join(', ')}`
      });
    }

    const detectedPlatform = platform || detectPlatform(meetingUrl);

    // Create meeting record in database
    const meeting = await prisma.aiMeeting.create({
      data: {
        userId: session.user.id,
        meetingUrl,
        meetingName: meetingName || `Meeting ${new Date().toLocaleString()}`,
        platform: detectedPlatform,
        status: 'pending',
        // Mark that we'll use AssemblyAI for transcription later
        transcriptionProvider: 'assemblyai',
      },
    });

    meetingId = meeting.id;
    console.log('💾 Meeting created in DB:', meeting.id);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL or APP_URL environment variable is not set');
    }

    const webhookUrl = `${appUrl}/api/webhooks/meetingbaas`;
    console.log('🔗 Webhook URL:', webhookUrl);

    // Create bot via Meeting BaaS API v2
    // Note: We're NOT using Meeting BaaS transcription - we'll use AssemblyAI after
    const botResponse = await meetingBaas.createBot({
      meeting_url: meetingUrl,
      bot_name: meetingName || 'AI Notetaker',
      entry_message: "Hello! I'm here to record and transcribe this meeting.",
      recording_mode: recordingMode,
      // Disable Meeting BaaS transcription - we'll use AssemblyAI
      speech_to_text: {
        provider: "AssemblyAI", // or omit entirely if possible
      },
      webhook_url: webhookUrl,
      deduplication_key: uuidv4(),
    }); 

    console.log('🤖 Bot created response:', JSON.stringify(botResponse, null, 2));

    const actualBotId = botResponse.data?.bot_id || botResponse.bot_id;

    if (!actualBotId) {
      console.error('❌ Bot response structure:', botResponse);
      throw new Error('No bot_id returned from Meeting BaaS API');
    }

    const updatedMeeting = await prisma.aiMeeting.update({
      where: { id: meeting.id },
      data: {
        botId: actualBotId,
        status: 'pending',
        startedAt: new Date(),
      },
    });

    console.log('✅ Meeting updated with botId:', {
      meetingId: updatedMeeting.id,
      botId: updatedMeeting.botId,
      status: updatedMeeting.status,
    });

    return res.status(200).json({
      success: true,
      meetingId: meeting.id,
      botId: actualBotId,
      status: botResponse.data?.status || 'joined',
    });

  } catch (error: any) {
    console.error('❌ Error in join meeting:', error);

    if (meetingId) {
      try {
        await prisma.aiMeeting.update({
          where: { id: meetingId },
          data: {
            status: 'failed',
            errorMessage: error.message || 'Unknown error'
          },
        });
      } catch (updateError) {
        console.error('Failed to update meeting status:', updateError);
      }
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to join meeting',
    });
  }
}

function detectPlatform(url: string): string {
  if (url.includes('zoom.us')) return 'zoom';
  if (url.includes('meet.google.com')) return 'google_meet';
  if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'teams';
  return 'unknown';
}