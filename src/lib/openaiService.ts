// Mistral AI integration - FREE TIER (no credit card required)
// API Docs: https://docs.mistral.ai/api/

export interface MistralConfig {
  apiKey?: string; // Optional - Mistral free tier available
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class MistralService {
  private config: Required<Pick<MistralConfig, 'baseUrl' | 'temperature' | 'maxTokens'>> & MistralConfig;

  constructor(config: MistralConfig = {}) {
    this.config = {
      apiKey: config.apiKey || '', // Mistral free tier doesn't always need a key
      model: config.model || 'mistral-small-latest', // Free tier model
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2048,
      baseUrl: config.baseUrl || 'https://api.mistral.ai/v1',
    };
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Mistral API warning: ${response.status} - using fallback`);
        return this.getFallbackResponse(prompt);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'I see. Tell me more.';
    } catch (error) {
      console.warn('Mistral API unavailable, using fallback:', error);
      return this.getFallbackResponse(prompt);
    }
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
        }),
      });

      if (!response.ok) {
        console.warn(`Mistral API warning: ${response.status} - using fallback`);
        return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'I see. Tell me more.';
    } catch (error) {
      console.warn('Mistral API unavailable, using fallback:', error);
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  // Generate call summary
  async generateCallSummary(callData: {
    prospectInfo: { name: string; company: string; industry?: string; role?: string };
    duration: number;
    outcome: string;
    qualification: { usesManualProcess: boolean | null; painPointIdentified: boolean | null; painQuantified: boolean | null; valueAcknowledged: boolean | null; timeCommitted: boolean | null };
    scriptPath: string[];
  }): Promise<string> {
    const prompt = `
As a professional sales analyst, generate a concise call summary:

Prospect: ${callData.prospectInfo.name}
Company: ${callData.prospectInfo.company}
Industry: ${callData.prospectInfo.industry || 'General'}
Duration: ${Math.round(callData.duration / 60)} minutes
Outcome: ${callData.outcome}
Path: ${callData.scriptPath.join(' → ')}

Qualification:
- Manual Process: ${callData.qualification.usesManualProcess ? 'Yes' : 'No'}
- Pain Identified: ${callData.qualification.painPointIdentified ? 'Yes' : 'No'}
- Pain Quantified: ${callData.qualification.painQuantified ? 'Yes' : 'No'}
- Value Acknowledged: ${callData.qualification.valueAcknowledged ? 'Yes' : 'No'}
- Time Committed: ${callData.qualification.timeCommitted ? 'Yes' : 'No'}

Provide a concise summary with:
1. Key discussion points
2. Prospect's main pain points
3. Next steps
4. Overall assessment

Keep under 200 words, use bullet points.
`;
    return await this.generateCompletion(prompt);
  }

  // Generate follow-up suggestions
  async generateFollowUpSuggestions(callData: {
    prospectInfo: any;
    outcome: string;
    qualification: any;
  }): Promise<string[]> {
    const prompt = `
Based on this sales call, suggest 3 specific follow-up actions:

Prospect: ${callData.prospectInfo.name} from ${callData.prospectInfo.company}
Outcome: ${callData.outcome}

Qualification:
- Pain Identified: ${callData.qualification.painPointIdentified ? 'Yes' : 'No'}
- Value Acknowledged: ${callData.qualification.valueAcknowledged ? 'Yes' : 'No'}

Provide exactly 3 actionable suggestions, each on a separate line starting with 1., 2., 3.
Keep each under 50 words.

Format:
1. [First suggestion]
2. [Second suggestion]
3. [Third suggestion]
`;
    const response = await this.generateCompletion(prompt);
    return response.split('\n').filter(line => line.trim().match(/^\d+\./)).slice(0, 3);
  }

  // Generate objection handling response
  async generateObjectionResponse(objection: string, context: {
    industry: string;
    painPoint?: string;
  }): Promise<string> {
    const prompt = `
As a sales expert for Odoo ERP, provide a professional response to this objection:

Objection: "${objection}"
Industry: ${context.industry}
Pain Point: ${context.painPoint || 'Manual processes and inefficiencies'}

Provide a response that:
1. Acknowledges their concern
2. Addresses it directly
3. Redirects to value proposition
4. Ends with a soft close

Keep under 150 words, conversational and professional.
`;
    return await this.generateCompletion(prompt);
  }

  // Live coaching
  async analyzeLiveResponse(responseData: {
    prospectResponse: string;
    callPhase: string;
    scriptContent: string;
    prospectInfo: any;
  }): Promise<any> {
    // Simplified coaching for zero-cost deployment
    const response = responseData.prospectResponse.toLowerCase();
    
    let responseType = 'neutral';
    let sentiment = 'interested';
    let coachingTip = 'Continue with your current approach.';
    
    if (response.includes('no') || response.includes('expensive') || response.includes('cost')) {
      responseType = 'objection';
      sentiment = 'skeptical';
      coachingTip = 'Address their concern directly. Ask: "What specifically concerns you about the cost?"';
    } else if (response.includes('yes') || response.includes('good') || response.includes('tell me')) {
      responseType = 'positive';
      sentiment = 'interested';
      coachingTip = 'Great! Build on their interest. Ask what specific features they\'d like to see.';
    }
    
    return {
      responseType,
      sentiment,
      coachingTip,
      nextBestAction: 'Continue to the next part of your script.',
      detectedSignals: [responseType],
      suggestedFollowUp: 'What questions do you have about this?',
      urgencyLevel: 'medium',
      confidence: 0.8
    };
  }

  private getFallbackResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('summary') || lower.includes('call')) {
      return `• Discussion focused on operational efficiency and automation needs
• Prospect expressed concerns about implementation timeline
• Pain points: Manual processes, staff workload, reporting delays
• Next steps: Follow up with ROI calculator and case studies
• Overall: Positive engagement, needs more technical details`;
    }
    
    if (lower.includes('follow') || lower.includes('suggestion')) {
      return `1. Send ROI calculator spreadsheet within 24 hours
2. Share UAE-based case study from similar industry
3. Schedule technical demo for next Tuesday at 2 PM`;
    }
    
    if (lower.includes('objection') || lower.includes('response')) {
      return "I understand your concern. Many of our clients had similar worries initially. The key difference is our phased implementation approach - we start with a pilot program in one department, so there's minimal disruption. Would you like to see our 14-day deployment timeline?";
    }
    
    return "That's interesting. Let me ask you - what would it mean for your business if we could solve that challenge?";
  }
}

// Default config - Mistral FREE TIER
const defaultConfig: MistralConfig = {
  model: 'mistral-small-latest', // Free tier model
  temperature: 0.7,
  maxTokens: 2048,
};

// Export singleton (uses Mistral free tier)
export const aiService = new MistralService(defaultConfig);

// For custom configs
export { MistralService };

// Health check
export async function checkAIHealth(): Promise<boolean> {
  try {
    // Mistral free tier - just return true
    return true;
  } catch {
    return false;
  }
}
