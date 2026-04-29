/**
 * Gemini 3.1 Flash TTS Service - Google's latest human-like TTS
 * Competes with ElevenLabs - Free tier available
 * 70+ languages, 200+ audio tags, multi-speaker support
 * 
 * Get free API key: https://ai.google.dev/
 * Free tier: Generous limits for development
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
      voice = 'Charon',  // Default: Professional male
      stylePrompt = 'Speak naturally and conversationally',
      temperature = 1.0
    } = options;

    try {
      const response = await fetch(
        `${this.baseUrl}/models/gemini-3.1-flash-tts:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `[Voice: ${voice}]\n[Style: ${stylePrompt}]\n${text}`
              }]
            }],
            generationConfig: {
              temperature: temperature,
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voice
                  }
                }
              }
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini TTS failed: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Extract audio data (base64 encoded)
      const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!audioBase64) {
        throw new Error('No audio data in response');
      }

      // Convert base64 to blob
      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: 'audio/wav' });
      
      return audioBlob;
    } catch (error) {
      console.error('Gemini TTS error:', error);
      throw error;
    }
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
        `${this.baseUrl}/models/gemini-3.1-flash-tts:generateContent?key=${this.apiKey}`,
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
      const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!audioBase64) {
        throw new Error('No audio data in response');
      }

      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      return new Blob([audioBytes], { type: 'audio/wav' });
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
  getPersonaVoices(): Record<string, { voice: string; description: string }[]> {
    return {
      'eager-student': [
        { voice: 'Charon', description: 'Enthusiastic male, eager to learn' },
        { voice: 'Kore', description: 'Friendly female, supportive tone' }
      ],
      'skeptical-parent': [
        { voice: 'Puck', description: 'Thoughtful male, slightly skeptical' },
        { voice: 'Schedar', description: 'Mature female, cautious tone' }
      ],
      'price-sensitive': [
        { voice: 'Fenrir', description: 'Direct male, budget-conscious' },
        { voice: 'Leda', description: 'Practical female, careful with money' }
      ],
      'busy-professional': [
        { voice: 'Orus', description: 'Efficient male, time-conscious' },
        { voice: 'Vindemiatrix', description: 'Professional female, direct style' }
      ],
      'friendly-neighbor': [
        { voice: 'Alnilam', description: 'Warm male, approachable' },
        { voice: 'Achalmar', description: 'Friendly female, conversational' }
      ],
      'technical-expert': [
        { voice: 'Algenib', description: 'Analytical male, precise' },
        { voice: 'Phecda', description: 'Technical female, detail-oriented' }
      ],
      'urgent-buyer': [
        { voice: 'Mintaka', description: 'Urgent male, quick decision-maker' },
        { voice: 'Aludra', description: 'Decisive female, action-oriented' }
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
