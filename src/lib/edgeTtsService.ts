/**
 * Edge TTS Service - Free Text-to-Speech using Microsoft Edge TTS
 * No API key required - 200+ voices available
 * Server URL stored in localStorage so users set it once without redeployment
 */

export interface EdgeTTSOptions {
  voice?: string;
  rate?: string;  // e.g., "+0%", "+50%", "-50%"
  pitch?: string;  // e.g., "+0Hz", "+100Hz"
}

export class EdgeTTSService {
  static readonly STORAGE_KEY = 'edge_tts_url';

  static getServerUrl(): string {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(EdgeTTSService.STORAGE_KEY);
      if (stored) return stored;
    }
    return import.meta.env.VITE_TTS_SERVER_URL || '';
  }

  static saveServerUrl(url: string): void {
    localStorage.setItem(EdgeTTSService.STORAGE_KEY, url.trim().replace(/\/$/, ''));
  }

  static clearServerUrl(): void {
    localStorage.removeItem(EdgeTTSService.STORAGE_KEY);
  }

  static isAvailable(): boolean {
    return !!EdgeTTSService.getServerUrl();
  }

  private get baseUrl(): string {
    return EdgeTTSService.getServerUrl();
  }

  constructor() {}


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
      pitch = '+0Hz'
    } = options;

    try {
      if (!this.baseUrl) throw new Error('Edge TTS server URL not configured');
      const response = await fetch(`${this.baseUrl}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice, rate, pitch }),
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
   * Get recommended voices for different B2B personas
   */
  getPersonaVoices(): Record<string, string> {
    return {
      'hr-manager':        'en-AE-HamdanNeural',      // Male Arabic-accented English (UAE)
      'business-owner':    'en-US-AriaNeural',         // Female, warm
      'finance-decider':   'en-GB-SoniaNeural',        // Female, British, authoritative
      'it-manager':        'en-US-AndrewNeural',       // Male, clear
      'operations-manager':'en-AU-NatashaNeural',      // Female, professional
      'default':           'en-US-JennyNeural',        // Neutral fallback
    };
  }
}

export const edgeTTS = new EdgeTTSService();
