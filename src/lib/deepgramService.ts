/**
 * Deepgram Voice Agent Service - Aura-2 Text-to-Speech
 * $200 free credit (45+ hours TTS), then $0.030/1K characters
 * 40+ human-like voices, sub-200ms latency
 * Supports: English, Spanish, German, French, Dutch, Italian, Japanese
 * 
 * Get FREE API key: https://deepgram.com/signup
 * Docs: https://developers.deepgram.com/docs/tts-models
 */

export interface DeepgramTTSOptions {
  model?: string;        // e.g., 'aura-2-thalia-en' (default: aura-2-asteria-en)
  encoding?: string;     // 'linear16', 'mp3', 'wav', 'ogg'
  sampleRate?: number;   // 8000, 16000, 24000, 48000
  speed?: number;        // 0.7 to 1.5 (Early Access feature)
}

export interface DeepgramVoiceInfo {
  model: string;
  name: string;
  gender: 'male' | 'female';
  age: 'adult' | 'young' | 'senior';
  accent: string;
  language: string;
  characteristics: string[];
  useCase: string[];
}

export class DeepgramService {
  private apiKey: string;
  private baseUrl: string = 'https://api.deepgram.com/v1/speak';

  constructor(apiKey: string = '') {
    this.apiKey = apiKey || import.meta.env.VITE_DEEPGRAM_API_KEY || '';
  }

  /**
   * Generate speech using Aura-2 TTS (single speaker)
   * Returns: Blob (audio data)
   */
  async generateSpeech(text: string, options: DeepgramTTSOptions = {}): Promise<Blob> {
    const {
      model = 'aura-2-asteria-en', // Default: clear, confident, enthusiastic
      encoding = 'mp3',            // MP3 for browser Audio compatibility
      sampleRate = 24000           // 24kHz for good quality
    } = options;

    if (!this.apiKey) {
      throw new Error('Deepgram API key required. Get free key: https://deepgram.com/signup');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?model=${model}&encoding=${encoding}&sample_rate=${sampleRate}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.apiKey}`
          },
          body: JSON.stringify({ text })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Deepgram TTS failed: ${error.err_msg || error.message || response.statusText}`);
      }

      const audioBlob = await response.blob();
      return audioBlob;

    } catch (error) {
      console.error('Deepgram TTS error:', error);
      throw error;
    }
  }

  /**
   * Play text as speech
   */
  async playText(text: string, options: DeepgramTTSOptions = {}): Promise<void> {
    try {
      const audioBlob = await this.generateSpeech(text, options);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        audio.play();
      });
    } catch (error) {
      console.error('Deepgram playback error:', error);
      throw error;
    }
  }

  /**
   * Get recommended Aura-2 voices for B2B personas
   * 40+ voices available: https://developers.deepgram.com/docs/tts-models
   */
  getB2BVoices(company: 'eiger-marvel-hr' | 'sgc-tech-ai'): DeepgramVoiceInfo[] {
    const allVoices: DeepgramVoiceInfo[] = [
      // ===== English Voices (US) =====
      {
        model: 'aura-2-thalia-en',
        name: 'Thalia',
        gender: 'female',
        age: 'adult',
        accent: 'American',
        language: 'en-US',
        characteristics: ['clear', 'confident', 'energetic', 'enthusiastic'],
        useCase: ['customer service', 'IVR', 'casual chat']
      },
      {
        model: 'aura-2-asteria-en',
        name: 'Asteria',
        gender: 'female',
        age: 'adult',
        accent: 'American',
        language: 'en-US',
        characteristics: ['warm', 'professional', 'conversational'],
        useCase: ['customer support', 'sales', 'business']
      },
      {
        model: 'aura-2-luna-en',
        name: 'Luna',
        gender: 'female',
        age: 'adult',
        accent: 'American',
        language: 'en-US',
        characteristics: ['calm', 'reassuring', 'professional'],
        useCase: ['healthcare', 'finance', 'support']
      },
      {
        model: 'aura-2-zeus-en',
        name: 'Zeus',
        gender: 'male',
        age: 'adult',
        accent: 'American',
        language: 'en-US',
        characteristics: ['deep', 'authoritative', 'confident'],
        useCase: ['executive', 'business', 'presentations']
      },
      {
        model: 'aura-2-orion-en',
        name: 'Orion',
        gender: 'male',
        age: 'adult',
        accent: 'American',
        language: 'en-US',
        characteristics: ['clear', 'articulate', 'professional'],
        useCase: ['sales', 'customer service', 'IVR']
      },
      {
        model: 'aura-2-arcas-en',
        name: 'Arcas',
        gender: 'male',
        age: 'adult',
        accent: 'American',
        language: 'en-US',
        characteristics: ['warm', 'friendly', 'conversational'],
        useCase: ['casual chat', 'customer service']
      },
      // ===== Additional English Voices =====
      {
        model: 'aura-2-solomon-en',
        name: 'Solomon',
        gender: 'male',
        age: 'senior',
        accent: 'American',
        language: 'en-US',
        characteristics: ['wise', 'authoritative', 'measured'],
        useCase: ['executive', 'finance', 'B2B sales']
      },
      {
        model: 'aura-2-atlas-en',
        name: 'Atlas',
        gender: 'male',
        age: 'adult',
        accent: 'American',
        language: 'en-US',
        characteristics: ['strong', 'confident', 'direct'],
        useCase: ['sales', 'negotiation', 'B2B']
      },
      // ===== British English =====
      {
        model: 'aura-2-lyra-en-gb',
        name: 'Lyra',
        gender: 'female',
        age: 'adult',
        accent: 'British',
        language: 'en-GB',
        characteristics: ['sophisticated', 'professional', 'clear'],
        useCase: ['business', 'executive', 'professional services']
      },
      {
        model: 'aura-2-hermes-en-gb',
        name: 'Hermes',
        gender: 'male',
        age: 'adult',
        accent: 'British',
        language: 'en-GB',
        characteristics: ['crisp', 'professional', 'articulate'],
        useCase: ['finance', 'legal', 'consulting']
      }
    ];

    // Filter by company use case
    if (company === 'eiger-marvel-hr') {
      // HR Consultancy: Professional, warm, clear voices
      return allVoices.filter(v => 
        ['aura-2-asteria-en', 'aura-2-orion-en', 'aura-2-luna-en', 'aura-2-arcas-en', 'aura-2-lyra-en-gb']
          .includes(v.model)
      );
    } else {
      // SGC TECH AI: Technical, confident, authoritative voices
      return allVoices.filter(v => 
        ['aura-2-thalia-en', 'aura-2-zeus-en', 'aura-2-solomon-en', 'aura-2-atlas-en', 'aura-2-hermes-en-gb']
          .includes(v.model)
      );
    }
  }

  /**
   * Get voice model for a specific B2B persona
   */
  getVoiceForPersona(
    company: 'eiger-marvel-hr' | 'sgc-tech-ai',
    personaType: string
  ): string {
    const voiceMap: Record<string, string> = {
      // EIGER MARVEL HR
      'hr-manager': 'aura-2-orion-en',        // Clear, professional operations manager
      'hr-business-owner': 'aura-2-thalia-en',  // Enthusiastic, energetic young professional
      'hr-finance-decider': 'aura-2-solomon-en', // Wise, authoritative finance decision-maker
      
      // SGC TECH AI
      'tech-it-manager': 'aura-2-zeus-en',      // Authoritative technical director
      'tech-business-owner': 'aura-2-atlas-en',   // Strong, confident CEO
      'tech-operations': 'aura-2-asteria-en'   // Warm, professional operations
    };

    return voiceMap[personaType] || 'aura-2-asteria-en';
  }

  /**
   * Check if API key is configured
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Calculate cost estimate (Deepgram: $0.030 per 1K characters)
   */
  estimateCost(text: string): number {
    const chars = text.length;
    return (chars / 1000) * 0.030;
  }
}

// Export singleton
export const deepgramService = new DeepgramService();
