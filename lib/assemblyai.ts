// lib/assemblyai.ts
import { AssemblyAI } from 'assemblyai';

if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error('ASSEMBLYAI_API_KEY environment variable is not set');
}

export const assemblyAI = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export default assemblyAI;
