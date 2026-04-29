/**
 * Edge TTS Service - Free Text-to-Speech using Microsoft Edge TTS
 * No API key required - 200+ voices available
 * Server endpoint: http://localhost:5050 (Contabo TTS server)
 */

export interface EdgeTTSOptions {
  voice?: string;
  rate?: string;  // e.g., "+0%", "+50%", "-50%"
  volume?: string;  // e.g., "+0%", "+100%"
  pitch?: string;  // e.g., "+0Hz", "+100Hz"
}

export class EdgeTTSService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5050') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate speech from text using Edge TTS (free)
   * @param text - Text to synthesize
   * @param options - Voice and audio options
   * @returns Promise<Blob> - Audio data as blob
   */
  async generateSpeech(text: string, options: EdgeTTSOptions = {}): Promise<Blob> {
    const {
      voice = 'en-US-AriaNeural',
      rate = '+0%',
      volume = '+0%',
      pitch = '+0Hz'
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'edge-tts',  // OpenAI-compatible field (ignored by Edge TTS)
          input: text,
          voice: voice,
          rate: rate,
          volume: volume,
          pitch: pitch
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`TTS generation failed: ${error.detail || response.statusText}`);
      }

      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error('Edge TTS error:', error);
      throw error;
    }
  }

  /**
   * Get list of available voices
   * @returns Promise with voice list
   */
  async listVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`);
      const data = await response.json();
      return data.all_voices || [];
    } catch (error) {
      console.error('Failed to list voices:', error);
      return [];
    }
  }

  /**
   * Play audio from text (for AI role-play)
   * @param text - Text to speak
   * @param voice - Voice to use
   */
  async playText(text: string, voice?: string): Promise<void> {
    try {
      const audioBlob = await this.generateSpeech(text, { voice });
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
   * Get recommended voices for different personas
   */
  getPersonaVoices(): Record<string, string[]> {
    return {
      'eager-student': ['en-US-AriaNeural', 'en-US-DavisNeural'],
      'skeptical-parent': ['en-GB-SoniaNeural', 'en-GB-RyanNeural'],
      'price-sensitive': ['en-US-JennyNeural', 'en-US-TonyNeural'],
      'busy-professional': ['en-US-SaraNeural', 'en-US-BrandonNeural'],
      'friendly-neighbor': ['en-AU-NatashaNeural', 'en-AU-WilliamNeural'],
      'technical-expert': ['en-IN-NeerjaNeural', 'en-IN-PrabhatNeural'],
      'urgent-buyer': ['en-US-EmmaNeural', 'en-US-AndrewNeural'],
      'silent-type': ['en-US-AnaNeural', 'en-US-GuyNeural']
    };
  }
}

// Export singleton instance
export const edgeTTS = new EdgeTTSService(
  import.meta.env.VITE_TTS_SERVER_URL || 'http://localhost:5050'
);
