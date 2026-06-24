
export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
}

export interface Meeting {
  id: string;
  userId: string;
  botId?: string | null;
  meetingUrl: string;
  meetingName?: string | null;
  platform?: string | null;
  status: 'pending' | 'joined' | 'recording' | 'completed' | 'failed';
  videoUrl?: string | null;
  audioUrl?: string | null;
  duration?: number | null;
  transcript?: TranscriptSegment[] | null;
  speakers?: string[];
  summary?: string | null;
  actionItems?: ActionItem[] | null;
  keyPoints?: string[] | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string | null;
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

export interface ActionItem {
  task: string;
  assignee?: string;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  meetingId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contextUsed: boolean;
  createdAt: Date;
}

// src/types/index.ts

export interface CreateBotRequest {
    meeting_url: string;
    bot_name?: string;
    bot_image?: string;
    entry_message?: string;
    recording_mode?: 'audio_only' | 'speaker_view' | 'gallery_view'; // ✅ Correct values
    speech_to_text?: {
      provider: 'Gladia' | 'AssemblyAI' | 'Deepgram';
      api_key?: string;
    };
    webhook_url?: string;
    deduplication_key?: string;
  }

export interface CreateBotResponse {
  bot_id: string;
  status: string;
}

export interface BotWebhookCompleted {
  event: 'bot.completed';
  data: {
    bot_id: string;
    status: 'completed';
    recording_url?: string;
    transcription?: TranscriptSegment[];
    metadata?: {
      duration: number;
      participants: string[];
    };
  };
}

export interface BotWebhookFailed {
  event: 'bot.failed';
  data: {
    bot_id: string;
    status: 'failed';
    error: string;
  };
}

export type BotWebhookEvent = BotWebhookCompleted | BotWebhookFailed;

