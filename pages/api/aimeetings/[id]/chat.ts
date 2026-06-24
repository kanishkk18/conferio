// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';
// import { prisma } from '@/lib/prisma';
// import { gemini } from '@/lib/gemini';
// import { ollama } from '@/lib/ollama';

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
//     const { question, useContext = true } = req.body;

//     if (!question) {
//       return res.status(400).json({ error: 'Question is required' });
//     }

//     // Get meeting data
//     const meeting = await prisma.aiMeeting.findFirst({
//       where: {
//         id,
//         userId: session.user.id,
//       },
//       select: {
//         transcript: true,
//         summary: true,
//         meetingName: true,
//         status: true,
//       },
//     });

//     if (!meeting) {
//       return res.status(404).json({ error: 'Meeting not found' });
//     }

//     // Get recent chat history
//     const chatHistory = await prisma.chatMessage.findMany({
//       where: {
//         meetingId: id,
//         userId: session.user.id,
//       },
//       orderBy: { createdAt: 'desc' },
//       take: 10,
//       select: {
//         role: true,
//         content: true,
//       },
//     });

//     // Reverse to get chronological order
//     const history = chatHistory.reverse();

//     let answer = '';
//     let contextUsed = false;

//     if (useContext && meeting.status === 'completed' && meeting.transcript) {
//       // Use meeting context
//       const transcriptArray = meeting.transcript as Array<{ speaker: string; text: string }>;
//       const fullTranscriptText = transcriptArray
//         .map((t) => `${t.speaker}: ${t.text}`)
//         .join('\\n');

//       const ollamaAvailable = await ollama.checkConnection();
      
//       if (ollamaAvailable) {
//         answer = await ollama.chatWithContext(
//           question,
//           fullTranscriptText,
//           meeting.summary || '',
//           history
//         );
//       } else {
//         answer = await gemini.chatWithContext(
//           question,
//           fullTranscriptText,
//           meeting.summary || '',
//           history
//         );
//       }
//       contextUsed = true;
//     } else {
//       // General question without context
//       const ollamaAvailable = await ollama.checkConnection();
      
//       if (ollamaAvailable) {
//         answer = await ollama.quickAnswer(question);
//       } else {
//         answer = await gemini.quickAnswer(question);
//       }
//     }

//     // Save user message
//     await prisma.chatMessage.create({
//       data: {
//         meetingId: id,
//         userId: session.user.id,
//         role: 'user',
//         content: question,
//         contextUsed,
//       },
//     });

//     // Save assistant response
//     await prisma.chatMessage.create({
//       data: {
//         meetingId: id,
//         userId: session.user.id,
//         role: 'assistant',
//         content: answer,
//         contextUsed,
//       },
//     });

//     return res.status(200).json({
//       answer,
//       contextUsed,
//     });
//   } catch (error) {
//     console.error('Chat error:', error);
//     return res.status(500).json({ error: 'Failed to process chat' });
//   }
// }

// // pages/api/aimeetings/[id]/chat.ts
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
//     const { message, transcript } = req.body;

//     if (!message) {
//       return res.status(400).json({ error: 'Message is required' });
//     }

//     // Get meeting to verify ownership and get transcript if not provided
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

//     // Use provided transcript or from meeting
//     const meetingTranscript = transcript || meeting.transcript || [];
    
//     // Format transcript for context
//     const transcriptText = Array.isArray(meetingTranscript)
//       ? meetingTranscript.map((t: any) => `${t.speaker}: ${t.text}`).join('\n')
//       : '';

//     // Get chat history
//     const chatHistory = await prisma.chatMessage.findMany({
//       where: { meetingId: id },
//       orderBy: { createdAt: 'asc' },
//       take: 10, // Last 10 messages for context
//     });

//     // Try Ollama first, fallback to Gemini
//     let response: string;
    
//     try {
//       const ollamaAvailable = await ollama.checkConnection();
//       if (ollamaAvailable) {
//         console.log('🦙 Using Ollama for chat');
//         response = await ollama.chat(message, transcriptText, chatHistory);
//       } else {
//         throw new Error('Ollama not available');
//       }
//     } catch (ollamaError) {
//       console.log('♊ Falling back to Gemini');
//       if (!gemini.isConfigured()) {
//         return res.status(500).json({ 
//           error: 'No AI provider available. Please configure Ollama or Gemini.' 
//         });
//       }
//       response = await gemini.chat(message, transcriptText, chatHistory);
//     }

//     // Save user message
//     await prisma.chatMessage.create({
//       data: {
//         meetingId: id,
//         userId: session.user.id,
//         role: 'user',
//         content: message,
//       },
//     });

//     // Save assistant response
//     await prisma.chatMessage.create({
//       data: {
//         meetingId: id,
//         userId: session.user.id,
//         role: 'assistant',
//         content: response,
//       },
//     });

//     return res.status(200).json({ response });

//   } catch (error) {
//     console.error('Chat API error:', error);
//     return res.status(500).json({ 
//       error: 'Failed to process message',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// }

// pages/api/aimeetings/[id]/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
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
    const { message, transcript } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get meeting to verify ownership and get transcript if not provided
    const meeting = await prisma.aiMeeting.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        transcript: true,
        meetingName: true,
        summary: true,
        speakers: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Use provided transcript or from meeting
    const meetingTranscript = transcript || meeting.transcript;

    // Format transcript for context - handle both formats
    let transcriptText = '';
    
    if (meetingTranscript) {
      // Handle AssemblyAI format (object with utterances array)
      if (typeof meetingTranscript === 'object' && !Array.isArray(meetingTranscript)) {
        if (meetingTranscript.utterances && Array.isArray(meetingTranscript.utterances)) {
          transcriptText = meetingTranscript.utterances
            .map((t: any) => `${t.speaker || t.speaker_label || 'Unknown'}: ${t.text || ''}`)
            .join('\n');
        } else if (meetingTranscript.text) {
          // Single text format
          transcriptText = meetingTranscript.text;
        }
      } 
      // Handle flat array format (legacy or pre-formatted)
      else if (Array.isArray(meetingTranscript)) {
        transcriptText = meetingTranscript
          .map((t: any) => `${t.speaker || 'Unknown'}: ${t.text || ''}`)
          .join('\n');
      }
    }

    // If still no transcript text, try to use summary as context
    let contextForAI = transcriptText;
    if (!contextForAI && meeting.summary) {
      contextForAI = `Meeting Summary: ${meeting.summary}\n\nNote: Full transcript not available, but you can answer based on the summary above.`;
    }

    if (!contextForAI) {
      return res.status(400).json({ 
        error: 'No transcript or summary available for this meeting. Please wait for the meeting to be processed.' 
      });
    }

    // Get chat history
    const chatHistory = await prisma.chatMessage.findMany({
      where: { meetingId: id },
      orderBy: { createdAt: 'asc' },
      take: 10, // Last 10 messages for context
    });

    // Try Ollama first, fallback to Gemini
    let response: string;
    
    try {
      const ollamaAvailable = await ollama.checkConnection();
      if (ollamaAvailable) {
        console.log('🦙 Using Ollama for chat');
        response = await ollama.chat(message, contextForAI, chatHistory);
      } else {
        throw new Error('Ollama not available');
      }
    } catch (ollamaError) {
      console.log('♊ Falling back to Gemini');
      if (!gemini.isConfigured()) {
        return res.status(500).json({ 
          error: 'No AI provider available. Please configure Ollama or Gemini.' 
        });
      }
      response = await gemini.chat(message, contextForAI, chatHistory);
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        meetingId: id,
        userId: session.user.id,
        role: 'user',
        content: message,
      },
    });

    // Save assistant response
    await prisma.chatMessage.create({
      data: {
        meetingId: id,
        userId: session.user.id,
        role: 'assistant',
        content: response,
      },
    });

    return res.status(200).json({ response });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}