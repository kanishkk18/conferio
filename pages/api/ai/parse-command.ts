// // pages/api/ai/parse-command.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth';
// import { authOptions } from 'lib/auth';

// const SYSTEM_PROMPT = `You are an AI assistant for Conferio, a project management app.
// Parse the user's natural language command and return a JSON object.

// Return ONLY valid JSON with this structure:
// {
//   "type": one of ["create_task","schedule_meeting","upload_file","start_meeting","create_note","send_message","start_timer","stop_timer","unknown"],
//   "data": {
//     // For create_task: { title, boardName, columnName, priority, dueDate, assignee }
//     // For schedule_meeting: { eventSlug, guestName, guestEmail, dateTime, duration }
//     // For upload_file: { visibility, description }
//     // For start_meeting: { title }
//     // For create_note: { title, content }
//     // For send_message: { serverName, channelName, message }
//     // For start_timer/stop_timer: { taskId, description }
//     // For unknown: { originalText }
//   },
//   "confidence": 0.0-1.0,
//   "displayText": "Human-readable confirmation of what you understood"
// }

// Examples:
// - "create a task called Fix login bug in the Engineering board" → create_task
// - "schedule a meeting with john@example.com tomorrow at 2pm" → schedule_meeting  
// - "upload a file to the team" → upload_file
// - "start a video meeting" → start_meeting
// - "create a note called Meeting Notes" → create_note
// - "send a message to general channel saying hello everyone" → send_message
// - "start my timer" → start_timer
// - "stop timer" → stop_timer`;

// async function tryGemini(prompt: string, context: string): Promise<any> {
//   const apiKey = process.env.GOOGLE_AI_API_KEY;
//   if (!apiKey) throw new Error('No Gemini key');

//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         contents: [{
//           parts: [{
//             text: `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nUser command: "${prompt}"`
//           }]
//         }],
//         generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
//       }),
//     }
//   );

//   if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
//   const data = await res.json();
//   const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
//   const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
//   return JSON.parse(cleaned);
// }

// async function tryClaude(prompt: string, context: string): Promise<any> {
//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   if (!apiKey) throw new Error('No Claude key');

//   const res = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'x-api-key': apiKey,
//       'anthropic-version': '2023-06-01',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: 'claude-haiku-4-5-20251001',
//       max_tokens: 500,
//       system: SYSTEM_PROMPT,
//       messages: [{
//         role: 'user',
//         content: `Context: ${context}\n\nUser command: "${prompt}"`
//       }],
//     }),
//   });

//   if (!res.ok) throw new Error(`Claude error: ${res.status}`);
//   const data = await res.json();
//   const text = data.content?.[0]?.text || '';
//   const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
//   return JSON.parse(cleaned);
// }

// async function tryOpenAI(prompt: string, context: string): Promise<any> {
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) throw new Error('No OpenAI key');

//   const res = await fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: 'gpt-4o-mini',
//       temperature: 0.1,
//       messages: [
//         { role: 'system', content: SYSTEM_PROMPT },
//         { role: 'user', content: `Context: ${context}\n\nUser command: "${prompt}"` },
//       ],
//       response_format: { type: 'json_object' },
//     }),
//   });

//   if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
//   const data = await res.json();
//   return JSON.parse(data.choices[0].message.content);
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { prompt, context } = req.body;
//   if (!prompt) {
//     return res.status(400).json({ error: 'prompt is required' });
//   }

//   // Try providers in order: Gemini → Claude → OpenAI
//   const providers = [
//     { name: 'gemini', fn: tryGemini },
//     { name: 'claude', fn: tryClaude },
//     { name: 'openai', fn: tryOpenAI },
//   ];

//   let lastError: Error | null = null;

//   for (const provider of providers) {
//     try {
//       const result = await provider.fn(prompt, context || '');
//       console.log(`[AI] Parsed with ${provider.name}:`, result.type);
//       return res.status(200).json(result);
//     } catch (err) {
//       lastError = err instanceof Error ? err : new Error('Unknown error');
//       console.warn(`[AI] ${provider.name} failed:`, lastError.message);
//     }
//   }

//   // All providers failed — return a safe fallback
//   console.error('[AI] All providers failed:', lastError?.message);
//   return res.status(200).json({
//     type: 'unknown',
//     data: { originalText: prompt },
//     confidence: 0,
//     displayText: prompt,
//   });
// }

// // pages/api/ai/parse-command.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth';
// import { authOptions } from 'lib/auth';

// const SYSTEM_PROMPT = `You are an AI assistant for Conferio, a project management app.
// Parse the user's natural language command and return a JSON object.

// Return ONLY valid JSON with this structure:
// {
//   "type": one of ["create_task","schedule_meeting","upload_file","start_meeting","create_note","send_message","start_timer","stop_timer","unknown"],
//   "data": {
//     // For create_task: { title, boardName, columnName, priority, dueDate, assignee }
//     // For schedule_meeting: { eventSlug, guestName, guestEmail, dateTime, duration }
//     // For upload_file: { visibility, description }
//     // For start_meeting: { title }
//     // For create_note: { title, content }
//     // For send_message: { serverName, channelName, message }
//     // For start_timer/stop_timer: { taskId, description }
//     // For unknown: { originalText }
//   },
//   "confidence": 0.0-1.0,
//   "displayText": "Human-readable confirmation of what you understood"
// }

// Examples:
// - "create a task called Fix login bug in the Engineering board" → create_task
// - "schedule a meeting with john@example.com tomorrow at 2pm" → schedule_meeting  
// - "upload a file to the team" → upload_file
// - "start a video meeting" → start_meeting
// - "create a note called Meeting Notes" → create_note
// - "send a message to general channel saying hello everyone" → send_message
// - "start my timer" → start_timer
// - "stop timer" → stop_timer`;

// async function tryGemini(prompt: string, context: string): Promise<any> {
//   const apiKey = process.env.GOOGLE_AI_API_KEY;
//   if (!apiKey) throw new Error('No Gemini key');

//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         contents: [{
//           parts: [{
//             text: `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nUser command: "${prompt}"`
//           }]
//         }],
//         generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
//       }),
//     }
//   );

//   if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
//   const data = await res.json();
//   const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
//   const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
//   return JSON.parse(cleaned);
// }

// async function tryClaude(prompt: string, context: string): Promise<any> {
//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   if (!apiKey) throw new Error('No Claude key');

//   const res = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'x-api-key': apiKey,
//       'anthropic-version': '2023-06-01',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: 'claude-haiku-4-5-20251001',
//       max_tokens: 500,
//       system: SYSTEM_PROMPT,
//       messages: [{
//         role: 'user',
//         content: `Context: ${context}\n\nUser command: "${prompt}"`
//       }],
//     }),
//   });

//   if (!res.ok) throw new Error(`Claude error: ${res.status}`);
//   const data = await res.json();
//   const text = data.content?.[0]?.text || '';
//   const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
//   return JSON.parse(cleaned);
// }

// async function tryOpenAI(prompt: string, context: string): Promise<any> {
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) throw new Error('No OpenAI key');

//   const res = await fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: 'gpt-4o-mini',
//       temperature: 0.1,
//       messages: [
//         { role: 'system', content: SYSTEM_PROMPT },
//         { role: 'user', content: `Context: ${context}\n\nUser command: "${prompt}"` },
//       ],
//       response_format: { type: 'json_object' },
//     }),
//   });

//   if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
//   const data = await res.json();
//   return JSON.parse(data.choices[0].message.content);
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const session = await getServerSession(req, res, authOptions);
//   if (!session?.user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { prompt, context } = req.body;
//   if (!prompt) {
//     return res.status(400).json({ error: 'prompt is required' });
//   }

//   // Try providers in order: Gemini → Claude → OpenAI
//   const providers = [
//     { name: 'gemini', fn: tryGemini },
//     { name: 'claude', fn: tryClaude },
//     { name: 'openai', fn: tryOpenAI },
//   ];

//   let lastError: Error | null = null;

//   for (const provider of providers) {
//     try {
//       const result = await provider.fn(prompt, context || '');
//       console.log(`[AI] Parsed with ${provider.name}:`, result.type);
//       return res.status(200).json(result);
//     } catch (err) {
//       lastError = err instanceof Error ? err : new Error('Unknown error');
//       console.warn(`[AI] ${provider.name} failed:`, lastError.message);
//     }
//   }

//   // All providers failed — return a safe fallback
//   console.error('[AI] All providers failed:', lastError?.message);
//   return res.status(200).json({
//     type: 'unknown',
//     data: { originalText: prompt },
//     confidence: 0,
//     displayText: prompt,
//   });
// }



// pages/api/ai/parse-command.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';

const SYSTEM_PROMPT = `You are an AI assistant for Conferio, a project management app.
Parse the user's natural language command and return a JSON object.

Return ONLY valid JSON (no markdown, no code blocks, no explanation) with this structure:
{
  "type": one of ["create_task","schedule_meeting","upload_file","start_meeting","create_note","send_message","start_timer","stop_timer","unknown"],
  "data": {
    "title": "…",
    "boardName": null,
    ...
  },
  "confidence": 0.9,
  "displayText": "human readable summary"
}`;

function extractJson(text: string): any {
  let cleaned = text.replace(/\`\`\`json\s*/gi, '').replace(/\`\`\`\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_) {} }
  throw new Error('Could not extract valid JSON from response');
}

async function tryGemini(prompt: string, context: string): Promise<any> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('No Gemini key');

  const models = ['gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-pro'];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nUser command: "${prompt}"\n\nReturn ONLY JSON, no markdown.` }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 600 },
          }),
        }
      );
      if (!res.ok) { const e = await res.text(); console.warn(`[AI] Gemini ${model} ${res.status}`); continue; }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;
      return extractJson(text);
    } catch (e) { if (model === models[models.length - 1]) throw e; }
  }
  throw new Error('All Gemini models failed');
}

async function tryClaude(prompt: string, context: string): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No Claude key');
  
  // Try multiple Claude models
  const models = ['claude-haiku-4-5-20251001', 'claude-3-haiku-20240307', 'claude-3-5-haiku-20241022'];
  for (const model of models) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          max_tokens: 600,
          system: `${SYSTEM_PROMPT}\n\nIMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no code blocks.`,
          messages: [{ role: 'user', content: `Context: ${context}\n\nUser command: "${prompt}"` }],
        }),
      });
      if (!res.ok) { const e = await res.text(); console.warn(`[AI] Claude ${model} ${res.status}: ${e.slice(0,100)}`); continue; }
      const data = await res.json();
      const text = data.content?.[0]?.text;
      if (!text) continue;
      return extractJson(text);
    } catch (e) { if (model === models[models.length - 1]) throw e; }
  }
  throw new Error('All Claude models failed');
}

async function tryOpenAI(prompt: string, context: string): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('No OpenAI key');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 600,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Context: ${context}\n\nUser command: "${prompt}"` },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) { const e = await res.text(); throw new Error(`OpenAI ${res.status}: ${e.slice(0,100)}`); }
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content);
}

// Rule-based parser — always works with zero API calls
function localParser(prompt: string): any {
  const lower = prompt.toLowerCase().trim();
  if (lower.match(/\b(stop|end|finish)\b.*\btimer\b/)) return { type: 'stop_timer', data: {}, confidence: 0.9, displayText: 'Stop the running timer' };
  if (lower.match(/\bstart\b.*\btimer\b/)) return { type: 'start_timer', data: { taskId: null, description: 'Work session' }, confidence: 0.9, displayText: 'Start time tracking timer' };
  if (lower.match(/\b(start|begin|create|launch)\b.*\b(meeting|video|call)\b/)) {
    const t = prompt.match(/(?:called?|named?|titled?)\s+["']?([^"']+?)["']?(?:\s|$)/i);
    return { type: 'start_meeting', data: { title: t?.[1] || 'Instant Meeting' }, confidence: 0.85, displayText: 'Start a new video meeting' };
  }
  if (lower.match(/\b(create|add|new)\b.*\bnote\b/)) {
    const t = prompt.match(/(?:note\s+(?:called?|named?|titled?)\s+|called?\s+|named?\s+)["']?([^"'\n]+?)["']?(?:\s|$)/i);
    return { type: 'create_note', data: { title: t?.[1]?.trim() || 'Untitled Note', content: null }, confidence: 0.85, displayText: `Create note` };
  }
  if (lower.match(/\b(create|add|new)\b.*\btask\b/)) {
    const t = prompt.match(/task\s+(?:called?|named?|titled?|:)?\s*["']?([^"'\n]+?)["']?(?:\s+in\s+|\s*$)/i);
    const b = prompt.match(/\bin\s+(?:the\s+)?([a-zA-Z\s]+?)\s+board\b/i);
    return { type: 'create_task', data: { title: t?.[1]?.trim() || 'New Task', boardName: b?.[1]?.trim() || null, columnName: null, priority: lower.includes('urgent') ? 'URGENT' : lower.includes('high') ? 'HIGH' : 'MEDIUM', dueDate: null, assignee: null }, confidence: 0.8, displayText: 'Create task' };
  }
  if (lower.match(/\b(upload|send|attach)\b.*\bfile\b/)) {
    return { type: 'upload_file', data: { visibility: lower.includes('team') ? 'TEAM' : 'PERSONAL', description: null }, confidence: 0.85, displayText: 'Upload file' };
  }
  if (lower.match(/\b(schedule|book|arrange)\b.*\bmeeting\b/)) {
    return { type: 'schedule_meeting', data: { eventSlug: null, guestName: null, guestEmail: null, dateTime: null, duration: 30 }, confidence: 0.8, displayText: 'Schedule a meeting' };
  }
  if (lower.match(/\b(send|post|text|write)\b.*\b(message|msg)\b/) || lower.match(/\bsend\b/)) {
    const cm = prompt.match(/(?:to\s+)?(?:#|channel\s+)?([a-z-]+)\s+(?:channel\s+)?(?:saying?|that|:)\s+(.+)/i);
    const gm = prompt.match(/(?:saying?|that|:)\s+(.+)/i)?.[1];
    return { type: 'send_message', data: { serverName: null, channelName: cm?.[1] || 'general', message: cm?.[2] || gm || prompt }, confidence: 0.75, displayText: 'Send message to channel' };
  }
  return { type: 'unknown', data: { originalText: prompt }, confidence: 0, displayText: prompt };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
  const { prompt, context } = req.body;
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt is required' });

  const providers = [
    { name: 'gemini', fn: tryGemini },
    { name: 'claude', fn: tryClaude },
    { name: 'openai', fn: tryOpenAI },
  ];

  for (const provider of providers) {
    try {
      const result = await provider.fn(prompt, context || '');
      if (!result?.type) throw new Error('Invalid response structure');
      console.log(`[AI] Parsed with ${provider.name}: ${result.type}`);
      return res.status(200).json(result);
    } catch (err) {
      console.warn(`[AI] ${provider.name} failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  // Always-available fallback — no API needed
  console.log('[AI] Using local rule-based parser');
  return res.status(200).json(localParser(prompt));
}