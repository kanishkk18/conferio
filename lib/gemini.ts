
// import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// class GeminiClient {
//   private client: GoogleGenerativeAI;
//   private model: GenerativeModel;

//   constructor() {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       throw new Error('GEMINI_API_KEY is not defined');
//     }

//     this.client = new GoogleGenerativeAI(apiKey);
//     // Use gemini-1.5-flash (free tier: 15 RPM, 1M TPM)
//     const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
//     this.model = this.client.getGenerativeModel({ model: modelName });
//   }

//   async generateSummary(transcript: string, meetingName?: string): Promise<{
//     summary: string;
//     actionItems: Array<{ task: string; assignee?: string; deadline?: string; priority?: string }>;
//     keyPoints: string[];
//   }> {
//     const prompt = `You are an expert meeting assistant. Analyze this meeting transcript and provide a comprehensive summary.

// Meeting: ${meetingName || 'Untitled Meeting'}

// Transcript:
// ${transcript}

// Please provide the response in this exact JSON format:
// {
//   "summary": "A detailed 2-3 paragraph summary of the meeting...",
//   "actionItems": [
//     { "task": "Description of task", "assignee": "Person name if mentioned", "deadline": "Date if mentioned", "priority": "high/medium/low" }
//   ],
//   "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
// }

// Rules:
// - Extract all action items with assignees if mentioned
// - Identify deadlines if mentioned
// - Prioritize action items based on urgency words (ASAP, urgent, immediately = high)
// - Key points should be specific and actionable
// - Summary should capture decisions made and context`;

//     try {
//       const result = await this.model.generateContent(prompt);
//       const response = result.response.text();
      
//       // Extract JSON from response
//       const jsonMatch = response.match(/\\{[\\s\\S]*\\}/);
//       if (jsonMatch) {
//         const parsed = JSON.parse(jsonMatch[0]);
//         return {
//           summary: parsed.summary || 'No summary generated',
//           actionItems: parsed.actionItems || [],
//           keyPoints: parsed.keyPoints || [],
//         };
//       }
      
//       return {
//         summary: response,
//         actionItems: [],
//         keyPoints: [],
//       };
//     } catch (error) {
//       console.error('[Gemini] Summary generation error:', error);
//       throw error;
//     }
//   }

//   async chatWithContext(
//     question: string,
//     transcript: string,
//     summary: string,
//     chatHistory: Array<{ role: string; content: string }>
//   ): Promise<string> {
//     const contextPrompt = `You are an AI meeting assistant. Use the meeting context to answer the user's question accurately.

// Meeting Summary:
// ${summary}

// Full Transcript:
// ${transcript}

// Previous conversation:
// ${chatHistory.map(m => `${m.role}: ${m.content}`).join('\\n')}

// User question: ${question}

// Instructions:
// - Answer based ONLY on the meeting content provided
// - If the answer isn't in the meeting, say "I don't see that information in the meeting transcript"
// - Be concise but thorough
// - Cite specific speakers when referencing their statements
// - If asked about action items, list them clearly`;

//     try {
//       const result = await this.model.generateContent(contextPrompt);
//       return result.response.text();
//     } catch (error) {
//       console.error('[Gemini] Chat error:', error);
//       throw error;
//     }
//   }

//   async quickAnswer(question: string): Promise<string> {
//     try {
//       const result = await this.model.generateContent(question);
//       return result.response.text();
//     } catch (error) {
//       console.error('[Gemini] Quick answer error:', error);
//       throw error;
//     }
//   }
// }

// export const gemini = new GeminiClient();


// // lib/gemini.ts  this code is working
// import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// interface GeminiResponse {
//   summary: string;
//   actionItems: any[];
//   keyPoints: string[];
// }

// class GeminiClient {
//   private client: GoogleGenerativeAI | null = null;
//   private model: GenerativeModel | null = null;

//   constructor() {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (apiKey) {
//       this.client = new GoogleGenerativeAI(apiKey);
//       this.model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
//     }
//   }

//   isConfigured(): boolean {
//     return !!this.client && !!this.model;
//   }

//   async generateSummary(transcript: string, meetingName?: string): Promise<GeminiResponse> {
//     if (!this.model) {
//       throw new Error('Gemini not configured');
//     }

//     const prompt = `Analyze this meeting transcript and provide a JSON response with:
// 1. summary: A concise 2-3 paragraph summary
// 2. actionItems: Array of specific action items with assignees
// 3. keyPoints: Array of important discussion points

// Meeting: ${meetingName || 'Untitled Meeting'}

// Transcript:
// ${transcript.substring(0, 30000)}

// Respond ONLY with valid JSON in this format:
// {
//   "summary": "string",
//   "actionItems": ["string"],
//   "keyPoints": ["string"]
// }`;

//     try {
//       const result = await this.model.generateContent(prompt);
//       const text = result.response.text();
      
//       // Extract JSON from response
//       const jsonMatch = text.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         const parsed = JSON.parse(jsonMatch[0]);
//         return {
//           summary: parsed.summary || 'No summary generated',
//           actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
//           keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
//         };
//       }
      
//       throw new Error('No JSON found in response');
//     } catch (error) {
//       console.error('Gemini summary error:', error);
//       return {
//         summary: 'Failed to generate summary. Please try again.',
//         actionItems: [],
//         keyPoints: [],
//       };
//     }
//   }

//   async chat(message: string, transcript: string, history: any[]): Promise<string> {
//     if (!this.model) {
//       throw new Error('Gemini not configured');
//     }

//     const context = transcript 
//       ? `Meeting Transcript:\n${transcript.substring(0, 15000)}\n\nUser: ${message}`
//       : message;

//     try {
//       const result = await this.model.generateContent(context);
//       return result.response.text() || 'No response generated';
//     } catch (error) {
//       console.error('Gemini chat error:', error);
//       throw error;
//     }
//   }
// }

// export const gemini = new GeminiClient();

// lib/gemini.ts
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface GeminiResponse {
  summary: string;
  actionItems: any[];
  keyPoints: string[];
}

class GeminiClient {
  private client: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
      // Use gemini-1.5-flash which is confirmed working
      this.model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  isConfigured(): boolean {
    return !!this.client && !!this.model;
  }

  async generateSummary(transcript: string, meetingName?: string): Promise<GeminiResponse> {
    if (!this.model) {
      throw new Error('Gemini not configured');
    }

    const prompt = `You are an AI meeting assistant. Analyze this meeting transcript and provide a structured response.

Meeting: ${meetingName || 'Untitled Meeting'}

Transcript:
${transcript.substring(0, 30000)}

Provide a JSON response with this exact structure:
{
  "summary": "2-3 paragraph summary of what was discussed",
  "actionItems": ["specific task 1", "specific task 2"],
  "keyPoints": ["important point 1", "important point 2"]
}

If the transcript is informal, personal, or not a formal meeting, still provide a summary of what was discussed, even if it's someone thinking aloud or dealing with personal matters.`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || 'No summary available',
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        };
      }
      
      // Fallback: return text as summary if no JSON found
      return {
        summary: text || 'No summary generated',
        actionItems: [],
        keyPoints: [],
      };
    } catch (error) {
      console.error('Gemini summary error:', error);
      return {
        summary: 'Failed to generate summary. Please try regenerating.',
        actionItems: [],
        keyPoints: [],
      };
    }
  }

  async chat(message: string, transcript: string, history: any[]): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini not configured');
    }

    const context = transcript 
      ? `You are an AI assistant helping with meeting questions. Based on the meeting transcript below, answer the user's question.

Meeting Transcript:
${transcript.substring(0, 15000)}

User Question: ${message}

Provide a helpful, concise answer based on the transcript.`
      : `User: ${message}`;

    try {
      const result = await this.model.generateContent(context);
      return result.response.text() || 'No response generated';
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw error;
    }
  }
}

export const gemini = new GeminiClient();
