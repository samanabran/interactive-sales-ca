// Mistral AI integration - FREE TIER (no credit card required)
// API Docs: https://docs.mistral.ai/api/

export interface MistralConfig {
  apiKey?: string; // Optional - Mistral has free tier
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class MistralService {
  private config: Required<Pick<MistralConfig, 'baseUrl' | 'temperature' | 'maxTokens'>> & MistralConfig;

  constructor(config: MistralConfig = {}) {
    this.config = {
      apiKey: config.apiKey || '', // Mistral free tier doesn't always need a key for small requests
      model: config.model || 'mistral-small-latest', // Free tier model
      baseUrl: config.baseUrl || 'https://api.mistral.ai/v1',
      temperature: config.temperature ?? 0.9,
      maxTokens: config.maxTokens ?? 150,
    };
  }

  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        console.warn(`Mistral API warning: ${response.status} - using fallback`);
        return this.getFallbackResponse(messages);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'I see. Tell me more.';
    } catch (error) {
      console.warn('Mistral API unavailable, using fallback:', error);
      return this.getFallbackResponse(messages);
    }
  }

  private getFallbackResponse(messages: ChatMessage[]): string {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const content = lastUserMsg?.content?.toLowerCase() || '';

    if (content.includes('cost') || content.includes('price') || content.includes('budget')) {
      return "That's a concern for us. What exactly would the total cost be? Any hidden fees we should know about?";
    }
    if (content.includes('time') || content.includes('long') || content.includes('implement')) {
      return "I'm worried about the timeline. Our business can't afford extended downtime. How exactly will this work?";
    }
    if (content.includes('roi') || content.includes('return') || content.includes('value')) {
      return "Show me the numbers. What's the actual ROI calculation for a business our size?";
    }
    if (content.includes('competitor') || content.includes('other') || content.includes('compare')) {
      return "We're looking at other solutions too. What makes you different from SAP or Microsoft Dynamics?";
    }
    
    const fallbacks = [
      "That's interesting. Can you tell me more about how this works for our specific industry?",
      "I hear you, but I have some concerns. What about implementation disruption?",
      "Okay, but how does this actually solve our day-to-day problems? Can you give me a concrete example?",
      "Hmm, that sounds good in theory. What do other UAE businesses say about this?",
      "I'm listening, but we've tried automation before. How is this different?",
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// Export singleton
export const mistralService = new MistralService();

// Helper to create custom instances
export function createMistralService(config?: MistralConfig): MistralService {
  return new MistralService(config);
}
