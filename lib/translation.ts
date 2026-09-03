// lib/translation.ts
// import { Translate } from '@google-cloud/translate/v2';
import { ollama } from './ollama';

// const googleTranslate = process.env.GOOGLE_TRANSLATE_API_KEY 
//   ? new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY })
//   : null;

export class TranslationService {
  /**
   * Translate text using Google Cloud (fast, cheap) with Ollama fallback
   */
  async translate(text: string, targetLang: string): Promise<string> {
    if (!text || !text.trim()) return '';
    
    // Skip if already target language (we'll detect later)
    if (targetLang === 'auto') return text;

    // Try Google first
    // if (googleTranslate) {
    //   try {
    //     const [translation] = await googleTranslate.translate(text, targetLang);
    //     return translation;
    //   } catch (error) {
    //     console.warn('Google Translate failed, falling back:', error);
    //   }
    // }

    // Fallback: Ollama/Qwen for offline translation
    try {
      const ollamaAvailable = await ollama.checkConnection();
      if (ollamaAvailable) {
        return await this.translateWithOllama(text, targetLang);
      }
    } catch (error) {
      console.error('Ollama translation failed:', error);
    }

    // Last resort: return original
    return text;
  }

  /**
   * Batch translate array of segments (more efficient)
   */
  async translateSegments(
    segments: Array<{ speaker: string; text: string; startTime?: number; endTime?: number }>,
    targetLang: string
  ): Promise<Array<{ speaker: string; text: string; translatedText: string; startTime?: number; endTime?: number }>> {
    // Batch text for efficiency
    const texts = segments.map(s => s.text);
    const joinedText = texts.join('\n---SEGMENT---\n');
    
    const translatedJoined = await this.translate(joinedText, targetLang);
    const translatedTexts = translatedJoined.split('---SEGMENT---').map(t => t.trim());
    
    return segments.map((seg, i) => ({
      ...seg,
      translatedText: translatedTexts[i] || seg.text,
    }));
  }

  /**
   * Translate full meeting data: transcript, summary, action items, key points
   */
  async translateMeeting(
    originalTranscript: any[],
    summary: string | null,
    actionItems: any[],
    keyPoints: string[],
    targetLang: string
  ): Promise<{
    transcript: any[];
    summary: string | null;
    actionItems: any[];
    keyPoints: string[];
  }> {
    // Translate transcript segments
    const translatedTranscript = await this.translateSegments(
      originalTranscript.map((u: any) => ({
        speaker: u.speaker || 'Unknown',
        text: u.text || '',
        startTime: u.startTime || u.start || 0,
        endTime: u.endTime || u.end || 0,
      })),
      targetLang
    );

    // Translate summary
    const translatedSummary = summary ? await this.translate(summary, targetLang) : null;

    // Translate action items
    const translatedActionItems = await Promise.all(
      actionItems.map(async (item: any) => {
        const text = typeof item === 'string' ? item : (item.text || item.description || JSON.stringify(item));
        const translated = await this.translate(text, targetLang);
        return typeof item === 'string' ? translated : { ...item, text: translated };
      })
    );

    // Translate key points
    const translatedKeyPoints = await Promise.all(
      keyPoints.map(kp => this.translate(kp, targetLang))
    );

    return {
      transcript: translatedTranscript,
      summary: translatedSummary,
      actionItems: translatedActionItems,
      keyPoints: translatedKeyPoints,
    };
  }

  private async translateWithOllama(text: string, targetLang: string): Promise<string> {
    const langNames: Record<string, string> = {
      en: 'English', hi: 'Hindi', de: 'German', pt: 'Portuguese',
      es: 'Spanish', fr: 'French', ja: 'Japanese', zh: 'Chinese',
    };
    
    const prompt = `Translate the following text to ${langNames[targetLang] || targetLang}. 
Only output the translation, nothing else:

"${text}"`;

    const response = await ollama.generate(prompt);
    return response.trim().replace(/^["']|["']$/g, '');
  }
}

export const translationService = new TranslationService();