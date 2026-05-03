/**
 * Kokoro TTS Service - High-quality open-source TTS (self-hosted on Contabo)
 * Near-ElevenLabs quality, 100% free, runs on CPU
 * 
 * Docker: ghcr.io/remsky/kokoro-fastapi-cpu:latest
 * Port: 8880 (OpenAI-compatible /v1/audio/speech endpoint)
 * Voices: American + British, male + female
 */

export interface KokoroTTSOptions {
  voice?: string;  // e.g. 'af_heart', 'am_michael', 'bm_george'
  speed?: number;  // 0.5 - 2.0, default 1.0
  lang?: string;   // 'en-us' | 'en-gb'
}

// All verified Kokoro voice IDs
export const KOKORO_VOICES = {
  // American Female
  af_heart:   { gender: 'female', accent: 'American', quality: 'warm, expressive' },
  af_bella:   { gender: 'female', accent: 'American', quality: 'bright, energetic' },
  af_nicole:  { gender: 'female', accent: 'American', quality: 'clear, professional' },
  af_sarah:   { gender: 'female', accent: 'American', quality: 'calm, authoritative' },
  // American Male
  am_adam:    { gender: 'male',   accent: 'American', quality: 'deep, confident' },
  am_michael: { gender: 'male',   accent: 'American', quality: 'professional, measured' },
  // British Female
  bf_emma:    { gender: 'female', accent: 'British',  quality: 'refined, clear' },
  bf_isabella:{ gender: 'female', accent: 'British',  quality: 'warm, sophisticated' },
  // British Male
  bm_george:  { gender: 'male',   accent: 'British',  quality: 'authoritative, deep' },
  bm_lewis:   { gender: 'male',   accent: 'British',  quality: 'energetic, engaging' },
} as const;

export type KokoroVoiceId = keyof typeof KOKORO_VOICES;

export class KokoroTTSService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl
      || import.meta.env.VITE_KOKORO_TTS_URL
      || 'http://80.241.218.108:8880';
  }

  isAvailable(): boolean {
    return !!import.meta.env.VITE_KOKORO_TTS_URL
      || this.baseUrl.includes('80.241.218.108');
  }

  /**
   * Generate speech blob from text
   */
  async generateSpeech(text: string, options: KokoroTTSOptions = {}): Promise<Blob> {
    const {
      voice = 'am_michael',
      speed = 1.0,
      lang = 'en-us',
    } = options;

    const response = await fetch(`${this.baseUrl}/v1/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'kokoro',
        input: text,
        voice,
        speed,
        response_format: 'mp3',
        lang_code: lang,
      }),
    });

    if (!response.ok) {
      const msg = await response.text().catch(() => response.statusText);
      throw new Error(`Kokoro TTS error ${response.status}: ${msg}`);
    }

    return response.blob();
  }

  /**
   * Play text via Kokoro TTS
   */
  async playText(text: string, options: KokoroTTSOptions = {}): Promise<void> {
    const blob = await this.generateSpeech(text, options);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return new Promise((resolve, reject) => {
      audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      audio.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      audio.play().catch(reject);
    });
  }

  /**
   * Pick the best Kokoro voice for a B2B persona
   */
  getVoiceForPersona(gender: 'male' | 'female', style: 'authoritative' | 'warm' | 'professional' | 'energetic' = 'professional'): KokoroVoiceId {
    if (gender === 'female') {
      if (style === 'authoritative') return 'af_sarah';
      if (style === 'warm') return 'bf_isabella';
      if (style === 'energetic') return 'af_bella';
      return 'af_heart';
    }
    // male
    if (style === 'authoritative') return 'bm_george';
    if (style === 'warm') return 'am_michael';
    if (style === 'energetic') return 'bm_lewis';
    return 'am_adam';
  }
}

export const kokoroTTS = new KokoroTTSService();
