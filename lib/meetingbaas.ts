import axios, { AxiosInstance } from 'axios';
import { CreateBotRequest, CreateBotResponse } from 'types/noteaker.type';

class MeetingBaasClient {
  private client: AxiosInstance;
  private apiVersion: string;

  constructor() {
    const apiKey = process.env.MEETING_BAAS_API_KEY;
    this.apiVersion = process.env.MEETING_BAAS_API_VERSION || 'v2';
    
    if (!apiKey) {
      throw new Error('MEETING_BAAS_API_KEY is not defined');
    }

    // ✅ CORRECT BASE URL - no /api suffix
    this.client = axios.create({
      baseURL: 'https://api.meetingbaas.com',
      headers: {
        'x-meeting-baas-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      console.log(`[MeetingBaaS] ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`[MeetingBaaS] Full URL: ${config.baseURL}${config.url}`);
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[MeetingBaaS] Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

 // lib/meetingbaas.ts

async createBot(params: CreateBotRequest): Promise<CreateBotResponse> {
    const endpoint = this.apiVersion === 'v2' ? '/v2/bots' : '/v1/bots';
    
    console.log(`[MeetingBaaS] Using endpoint: ${endpoint}`);
    
    const response = await this.client.post(endpoint, {
      meeting_url: params.meeting_url,
      bot_name: params.bot_name || 'AI Notetaker',
      bot_image: params.bot_image,
      entry_message: params.entry_message || "Hi! I'm here to take notes for this meeting.",
      // ✅ FIXED: Use correct recording_mode values
      recording_mode: params.recording_mode || 'speaker_view', // Default to speaker view
      speech_to_text: params.speech_to_text || {
        provider: 'Gladia',
      },
      webhook_url: params.webhook_url,
      deduplication_key: params.deduplication_key,
    });
  
    return response.data;
  }

  async getBot(botId: string): Promise<any> {
    const endpoint = this.apiVersion === 'v2' ? `/v2/bots/${botId}` : `/v1/bots/${botId}`;
    const response = await this.client.get(endpoint);
    return response.data;
  }

  async deleteBot(botId: string): Promise<void> {
    const endpoint = this.apiVersion === 'v2' ? `/v2/bots/${botId}` : `/v1/bots/${botId}`;
    await this.client.delete(endpoint);
  }

  async listBots(params?: { 
    status?: string; 
    limit?: number; 
    cursor?: string;
    meeting_url?: string;
  }): Promise<any> {
    const endpoint = this.apiVersion === 'v2' ? '/v2/bots' : '/v1/bots';
    const response = await this.client.get(endpoint, { params });
    return response.data;
  }

  async leaveBot(botId: string): Promise<void> {
    const endpoint = this.apiVersion === 'v2' ? `/v2/bots/${botId}/leave` : `/v1/bots/${botId}/leave`;
    await this.client.post(endpoint);
  }

  async sendChatMessage(botId: string, message: string): Promise<void> {
    if (this.apiVersion !== 'v2') {
      throw new Error('Chat messages require API v2');
    }
    await this.client.post(`/v2/bots/${botId}/send_chat`, { message });
  }

  async getRecording(botId: string): Promise<Blob> {
    const response = await this.client.get(`/v2/bots/${botId}/recording`, {
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], { type: 'video/mp4' });
  }

  async getTranscript(botId: string): Promise<any> {
    const response = await this.client.get(`/v2/bots/${botId}/transcript`);
    return response.data;
  }
}

export const meetingBaas = new MeetingBaasClient();

