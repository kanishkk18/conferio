// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
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

//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const meeting = await prisma.aiMeeting.findFirst({
//       where: {
//         id,
//         userId: session.user.id,
//       },
//       select: {
//         transcript: true,
//         speakers: true,
//         status: true,
//       },
//     });

//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     if (meeting.status !== 'completed') {
//       return res.status(400).json({ error: 'Meeting not yet completed' });
//     }

//     return res.status(200).json({
//       transcript: meeting.transcript,
//       speakers: meeting.speakers,
//     });
//   } catch (error) {
//     console.error('Error fetching transcript:', error);
//     return res.status(500).json({ error: 'Failed to fetch transcript' });
//   }
// }

// pages/api/aimeetings/[id]/transcript.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { assemblyAI } from '@/lib/assemblyai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

  try {
    const meeting = await prisma.aiMeeting.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        transcript: true,
        speakers: true,
        status: true,
        botId: true,
        meetingName: true,
        webhookData: true,
        assemblyaiTranscriptId: true,
        audioUrl: true,
      },
    });

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    let formattedTranscript = null;
    let transcriptStatus = 'unavailable';

    if (meeting.transcript) {
      transcriptStatus = 'available';
      let rawTranscript = meeting.transcript;

      // Parse if stored as string
      if (typeof rawTranscript === 'string') {
        try {
          rawTranscript = JSON.parse(rawTranscript);
        } catch {
          formattedTranscript = [{ speaker: 'Unknown', text: rawTranscript, startTime: 0, endTime: 0 }];
          return res.json({ 
            transcript: formattedTranscript, 
            status: meeting.status, 
            transcriptStatus,
            transcriptionProvider: 'assemblyai'
          });
        }
      }

      // Handle AssemblyAI format (utterances array)
      if (rawTranscript.utterances && Array.isArray(rawTranscript.utterances)) {
        formattedTranscript = rawTranscript.utterances.map((u: any) => ({
          speaker: u.speaker || u.speaker_label || 'Unknown',
          text: u.text || '',
          startTime: u.start || u.start_time || 0,
          endTime: u.end || u.end_time || 0,
          confidence: u.confidence || 0,
          words: u.words || [],
        }));
      } 
      // Handle alternative format (results array - legacy)
      else if (rawTranscript.results && Array.isArray(rawTranscript.results)) {
        formattedTranscript = rawTranscript.results.map((r: any) => ({
          speaker: r.speaker || 'Unknown',
          text: r.text || r.alternatives?.[0]?.transcript || '',
          startTime: r.start || 0,
          endTime: r.end || 0,
        }));
      }
      // Handle plain text format
      else if (rawTranscript.text) {
        formattedTranscript = [{ speaker: 'Unknown', text: rawTranscript.text, startTime: 0, endTime: 0 }];
      }
      // Return raw if unknown format
      else {
        formattedTranscript = rawTranscript;
      }
    } else if (meeting.status === 'processing_transcription') {
      transcriptStatus = 'processing';
      
      // Check AssemblyAI status if we have a transcript ID
      if (meeting.assemblyaiTranscriptId) {
        try {
          const transcript = await assemblyAI.transcripts.get(meeting.assemblyaiTranscriptId);
          if (transcript.status === 'completed') {
            // Transcript is ready but not saved yet - process it now
            const formatted = {
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
            };

            await prisma.aiMeeting.update({
              where: { id: meeting.id },
              data: {
                transcript: formatted,
                status: 'completed',
              },
            });

            formattedTranscript = formatted.utterances.map((u: any) => ({
              speaker: u.speaker,
              text: u.text,
              startTime: u.start,
              endTime: u.end,
              confidence: u.confidence,
            }));
            transcriptStatus = 'available';
          } else if (transcript.status === 'error') {
            transcriptStatus = 'error';
          }
        } catch (error) {
          console.error('Error checking AssemblyAI status:', error);
        }
      }
    } else if (meeting.status === 'completed' && meeting.audioUrl && !meeting.transcript) {
      // Auto-start AssemblyAI transcription if not done yet
      transcriptStatus = 'processing';
      
      try {
        console.log('🎙️ Auto-starting AssemblyAI transcription from transcript API');
        
        const transcript = await assemblyAI.transcripts.transcribe({
          audio: meeting.audioUrl,
          speech_models: ['universal-3-pro', 'universal-2'],
          speaker_labels: true,
          language_detection: true,
          punctuate: true,
          format_text: true,
        });

        if (transcript.status === 'error') {
          throw new Error(`AssemblyAI error: ${transcript.error}`);
        }

        // Format the transcript
        const formatted = {
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
            transcript: formatted,
            assemblyaiTranscriptId: transcript.id,
            status: 'completed',
            updatedAt: new Date(),
          },
        });

        // Format for response
        formattedTranscript = formatted.utterances.map((u: any) => ({
          speaker: u.speaker,
          text: u.text,
          startTime: u.start,
          endTime: u.end,
          confidence: u.confidence,
          words: u.words,
        }));
        
        transcriptStatus = 'available';
        
        // Trigger summary generation in background
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/aimeetings/${id}/regenerate-summary`, {
          method: 'POST',
        }).catch(console.error);
        
      } catch (error) {
        console.error('❌ Auto-transcription failed:', error);
        transcriptStatus = 'error';
      }
    }

    return res.status(200).json({
      transcript: formattedTranscript,
      rawTranscript: meeting.transcript,
      speakers: meeting.sakers,
      status: meeting.status,
      transcriptStatus,
      meetingName: meeting.meetingName,
      transcriptionProvider: 'assemblyai',
      assemblyaiTranscriptId: meeting.assemblyaiTranscriptId,
      canFetch: meeting.status === 'completed' && meeting.audioUrl && !meeting.transcript,
    });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return res.status(500).json({ error: 'Failed to fetch transcript' });
  }
}