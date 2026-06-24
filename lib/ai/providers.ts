import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const models = {
  openai: {
    realtime: 'gpt-4o-realtime-preview-2024-10-01',
    chat: 'gpt-4o-2024-08-06',
    vision: 'gpt-4o-2024-08-06',
    fast: 'gpt-4o-mini-2024-07-18',
    embedding: 'text-embedding-3-large',
  },
  anthropic: {
    sonnet: 'claude-3-5-sonnet-20241022',
    haiku: 'claude-3-5-haiku-20241022',
    opus: 'claude-3-opus-20240229',
  },
  google: {
    pro: 'gemini-1.5-pro-002',
    flash: 'gemini-2.5-flash',
  }
};

// export function selectProvider(intent: string) {
//   const routing: Record<string, { provider: string; model: string }> = {
//     'voice_conversation': { provider: 'openai', model: models.openai.realtime },
//     'extract_tasks': { provider: 'anthropic', model: models.anthropic.sonnet },
//     'extract_meeting_details': { provider: 'anthropic', model: models.anthropic.sonnet },
//     'parse_command': { provider: 'anthropic', model: models.anthropic.haiku },
//     'summarize': { provider: 'openai', model: models.openai.chat },
//     'generate_doc': { provider: 'anthropic', model: models.anthropic.sonnet },
//     'classify_intent': { provider: 'openai', model: models.openai.fast },
//     'quick_response': { provider: 'google', model: models.google.flash },
//     'analyze_image': { provider: 'openai', model: models.openai.vision },
//     'analyze_document': { provider: 'google', model: models.google.pro },
//     'embedding': { provider: 'openai', model: models.openai.embedding },
//   };

//   return routing[intent] || { provider: 'openai', model: models.openai.chat };
// }

export function selectProvider(intent: string) {
  const routing: Record<string, { provider: string; model: string }> = {
    'voice_conversation': { provider: 'openai', model: models.openai.realtime },
    'extract_tasks': { provider: 'anthropic', model: models.anthropic.sonnet },
    'extract_meeting_details': { provider: 'anthropic', model: models.anthropic.sonnet },
    'parse_command': { provider: 'anthropic', model: models.anthropic.haiku },
    'summarize': { provider: 'openai', model: models.openai.chat },
    'generate_doc': { provider: 'anthropic', model: models.anthropic.sonnet },
    'classify_intent': { provider: 'openai', model: models.openai.fast },
    'quick_response': { provider: 'google', model: models.google.flash },
    'analyze_image': { provider: 'openai', model: models.openai.vision },
    'analyze_document': { provider: 'google', model: models.google.pro },
    'embedding': { provider: 'openai', model: models.openai.embedding },
    // Add this line - prioritizes Gemini as requested
    'generate_email_body': { provider: 'google', model: models.google.pro },
  };

  return routing[intent] || { provider: 'openai', model: models.openai.chat };
}
