/**
 * Gemini 2.5 Flash TTS Service - Google's most realistic human-like TTS
 * Competes with ElevenLabs - Free tier available
 * 30+ expressive voices, style control via systemInstruction
 * 
 * Get free API key: https://ai.google.dev/
 * Model: gemini-2.5-flash-preview-tts
 */

export interface GeminiTTSOptions {
  voice?: string;
  speaker1Voice?: string;  // For multi-speaker
  speaker2Voice?: string;  // For multi-speaker
  stylePrompt?: string;    // Natural language style control
  temperature?: number;     // 0.0 - 1.0 (control randomness)
}

export interface MultiSpeakerConfig {
  speaker1: {
    voice: string;
    text: string;
  };
  speaker2: {
    voice: string;
    text: string;
  };
  stylePrompt?: string;
}

export class GeminiTTSService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string = '') {
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  /**
   * Generate speech using Gemini 3.1 Flash TTS (single speaker)
   * @param text - Text to synthesize
   * @param options - Voice and style options
   * @returns Promise<Blob> - Audio data
   */
  async generateSpeech(text: string, options: GeminiTTSOptions = {}): Promise<Blob> {
    const {
      voice = 'Charon',
      stylePrompt,
      temperature = 1.0
    } = options;

    try {
      const requestBody: Record<string, unknown> = {
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          temperature,
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice }
            }
          }
        }
      };

      // Style prompts via systemInstruction produce far more realistic, character-driven speech
      if (stylePrompt) {
        requestBody.systemInstruction = { parts: [{ text: stylePrompt }] };
      }

      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.5-flash-preview-tts:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini TTS failed: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

      if (!inlineData?.data) {
        throw new Error('No audio data in Gemini TTS response');
      }

      const audioBytes = Uint8Array.from(atob(inlineData.data), c => c.charCodeAt(0));
      return new Blob([audioBytes], { type: inlineData.mimeType || 'audio/wav' });
    } catch (error) {
      console.error('Gemini TTS error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate multi-speaker dialogue (perfect for role-play)
   * @param config - Multi-speaker configuration
   * @returns Promise<Blob> - Audio with multiple voices
   */
  async generateMultiSpeaker(config: MultiSpeakerConfig): Promise<Blob> {
    const {
      speaker1,
      speaker2,
      stylePrompt = 'Natural conversation between two people'
    } = config;

    const dialogueText = `
[Speaker 1 - ${speaker1.voice}]: ${speaker1.text}

[Speaker 2 - ${speaker2.voice}]: ${speaker2.text}
    `.trim();

    try {
      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.5-flash-preview-tts:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `[Style: ${stylePrompt}]\n${dialogueText}`
              }]
            }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                multiSpeakerVoiceConfig: {
                  speaker1VoiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker1.voice }
                  },
                  speaker2VoiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker2.voice }
                  }
                }
              }
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Multi-speaker TTS failed: ${error.error?.message}`);
      }

      const data = await response.json();
      const multiInlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!multiInlineData?.data) throw new Error('No audio data in multi-speaker response');
      const audioBytes = Uint8Array.from(atob(multiInlineData.data), c => c.charCodeAt(0));
      return new Blob([audioBytes], { type: multiInlineData.mimeType || 'audio/wav' });
    } catch (error) {
      console.error('Multi-speaker TTS error:', error);
      throw error;
    }
  }

  /**
   * Play audio from text (for AI role-play)
   */
  async playText(text: string, options?: GeminiTTSOptions): Promise<void> {
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
      console.error('Playback error:', error);
      throw error;
    }
  }

  /**
   * Get recommended voices for different personas (30+ available)
   */
  /** Verified Gemini 2.5 Flash TTS voices mapped to B2B persona types */
  getPersonaVoices(): Record<string, { voice: string; description: string }[]> {
    return {
      'hr-manager': [
        { voice: 'Charon', description: 'Professional male, measured and authoritative' },
        { voice: 'Orus', description: 'Efficient male, brisk and results-driven' }
      ],
      'finance-decider': [
        { voice: 'Algenib', description: 'Gravelly authoritative male, deliberate pacing' },
        { voice: 'Schedar', description: 'Precise female, cool and measured' }
      ],
      'skeptical-buyer': [
        { voice: 'Puck', description: 'Thoughtful male, guarded but engaged' },
        { voice: 'Leda', description: 'Careful female, needs convincing' }
      ],
      'it-manager': [
        { voice: 'Algenib', description: 'Technical male, analytical precision' },
        { voice: 'Alnilam', description: 'Firm male, probing questions' }
      ],
      'business-owner': [
        { voice: 'Mintaka', description: 'Deep urgent male, visionary CEO energy' },
        { voice: 'Fenrir', description: 'Excitable male, competitive and decisive' }
      ],
      'operations-manager': [
        { voice: 'Sulafat', description: 'Warm professional female, practical focus' },
        { voice: 'Vindemiatrix', description: 'Gentle female, collaborative tone' }
      ]
    };
  }

  /**
   * Generate role-play conversation (AI prospect response)
   * @param persona - Persona type
   * @param message - User's message
   * @param context - Conversation context
   */
  async generateProspectResponse(
    persona: string,
    message: string,
    context: string = ''
  ): Promise<Blob> {
    const personaVoices = this.getPersonaVoices()[persona] || this.getPersonaVoices()['friendly-neighbor'];
    const voice = personaVoices[0].voice;
    
    const prompt = `
${context}

User: ${message}

Respond as a realistic sales prospect. Be natural, use filler words, pauses, and natural speech patterns. Keep responses under 50 words.
    `.trim();

    return this.generateSpeech(prompt, {
      voice: voice,
      stylePrompt: `Speak as ${persona}. Be natural, use conversational tone, include natural pauses and filler words.`
    });
  }
}

// Export singleton instance
export const geminiTTS = new GeminiTTSService();
