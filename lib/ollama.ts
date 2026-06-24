
import axios from 'axios';

// lib/ollama.ts
interface OllamaResponse {
  summary: string;
  actionItems: any[];
  keyPoints: string[];
}

class OllamaClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        timeout: 5000,
      } as any);
      return response.ok;
    } catch (error) {
      console.log('Ollama not available:', error);
      return false;
    }
  }

  async generateSummary(transcript: string, meetingName?: string): Promise<OllamaResponse> {
    const prompt = `You are an AI meeting assistant. Analyze this meeting transcript and provide:
1. A concise summary (2-3 paragraphs)
2. Action items (list of specific tasks with assignees if mentioned)
3. Key points (bullet points of important discussions)

Meeting: ${meetingName || 'Untitled Meeting'}

Transcript:
${transcript.substring(0, 15000)} ${transcript.length > 15000 ? '...(truncated)' : ''}

Respond in JSON format:
{
  "summary": "meeting summary here",
  "actionItems": ["task 1", "task 2"],
  "keyPoints": ["point 1", "point 2"]
}`;

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    
    try {
      // Parse the response - Ollama returns response in .response field
      const parsed = JSON.parse(data.response);
      return {
        summary: parsed.summary || 'No summary generated',
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      };
    } catch (e) {
      // Fallback if JSON parsing fails
      return {
        summary: data.response || 'Failed to parse summary',
        actionItems: [],
        keyPoints: [],
      };
    }
  }

  async chat(message: string, transcript: string, history: any[]): Promise<string> {
    const context = transcript 
      ? `Meeting Transcript:\n${transcript.substring(0, 10000)}\n\nUser Question: ${message}`
      : message;

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `You are an AI assistant helping with meeting questions. Answer based on the meeting transcript provided.\n\n${context}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || 'No response generated';
  }
}

export const ollama = new OllamaClient();
