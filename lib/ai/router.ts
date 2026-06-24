import { openai, anthropic, gemini, selectProvider, models } from './providers';

export interface AIRequest {
  intent: string;
  prompt: string;
  context?: any;
  userId: string;
  requireJson?: boolean;
}

export interface AIResponse {
  content: string;
  json?: any;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
  latency: number;
}

export class AIRouter {
  async route(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const { provider, model } = selectProvider(request.intent);
    
    try {
      let result: AIResponse;

      switch (provider) {
        case 'openai':
          result = await this.callOpenAI(request, model);
          break;
        case 'anthropic':
          result = await this.callAnthropic(request, model);
          break;
        case 'google':
          result = await this.callGoogle(request, model);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      result.latency = Date.now() - startTime;
      return result;
    } catch (error) {
      if (provider !== 'openai') {
        return this.callOpenAI(request, models.openai.chat);
      }
      throw error;
    }
  }

  private async callOpenAI(request: AIRequest, model: string): Promise<AIResponse> {
    const messages = this.buildMessages(request);
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      response_format: request.requireJson ? { type: 'json_object' } : undefined,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content || '';
    
    return {
      content,
      json: request.requireJson ? JSON.parse(content) : undefined,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
      provider: 'openai',
      model,
      latency: 0,
    };
  }

  private async callAnthropic(request: AIRequest, model: string): Promise<AIResponse> {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: request.context ? `Context: ${JSON.stringify(request.context)}` : undefined,
      messages: [{ role: 'user', content: request.prompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      content,
      json: request.requireJson ? this.extractJson(content) : undefined,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      provider: 'anthropic',
      model,
      latency: 0,
    };
  }

  private async callGoogle(request: AIRequest, model: string): Promise<AIResponse> {
    const genModel = gemini.getGenerativeModel({ model });
    const result = await genModel.generateContent(request.prompt);
    const response = await result.response;
    const content = response.text();

    return {
      content,
      json: request.requireJson ? JSON.parse(content) : undefined,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      provider: 'google',
      model,
      latency: 0,
    };
  }

  private buildMessages(request: AIRequest): any[] {
    const messages = [];
    if (request.context) {
      messages.push({
        role: 'system',
        content: `Context: ${JSON.stringify(request.context)}`
      });
    }
    messages.push({ role: 'user', content: request.prompt });
    return messages;
  }

  private extractJson(text: string): any {
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : null;
    } catch {
      return null;
    }
  }
}

export const aiRouter = new AIRouter();
