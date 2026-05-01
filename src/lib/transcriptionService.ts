/**
 * Transcription Service - FREE Speech-to-Text
 * Primary: Gemini 3.1 Flash Speech-to-Text (FREE tier)
 * Backup: Local Whisper.cpp on Contabo GPU (FREE)
 * Upload to Contabo for processing
 */

export interface TranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
  segments?: TranscriptionSegment[];
  duration?: number;
}

export interface TranscriptionSegment {
  start: number; // seconds
  end: number;
  text: string;
  confidence?: number;
}

export interface TranscriptionOptions {
  language?: string; // e.g., 'en', 'ar' (Arabic for UAE)
  prompt?: string; // Context hint for Gemini
  temperature?: number;
}

export class TranscriptionService {
  private geminiApiKey: string;
  private contaboUrl: string;
  private useWhisperBackup: boolean;

  constructor() {
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.contaboUrl = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://80.241.218.108:11434';
    this.useWhisperBackup = false;
  }

  /**
   * Transcribe audio file using Gemini 3.1 Flash (FREE)
   * Supports: WAV, MP3, MPEG, AAC
   */
  async transcribeWithGemini(
    audioBlob: Blob,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    const {
      language = 'en',
      prompt = 'This is a sales call recording in UAE. Include business terminology, company names (EIGER MARVEL HR, SGC TECH AI), and numbers.',
      temperature = 0.3
    } = options;

    try {
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `Transcribe the following audio. Language: ${language}. Context: ${prompt}. Return only the transcription text, no additional commentary.`
                },
                {
                  inlineData: {
                    mimeType: audioBlob.type || 'audio/wav',
                    data: base64Audio
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: temperature,
              maxOutputTokens: 2048
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini STT failed: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const transcribedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        text: transcribedText.trim(),
        language: language,
        confidence: 0.9, // Gemini doesn't return confidence, estimate
        duration: 0 // Gemini doesn't return duration
      };

    } catch (error) {
      console.error('Gemini transcription error:', error);
      throw error;
    }
  }

  /**
   * Upload and transcribe using Whisper.cpp on Contabo (FREE, local)
   * Requires: Whisper.cpp container running on Contabo
   */
  async transcribeWithWhisper(
    audioBlob: Blob,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    const { language = 'en' } = options;

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      formData.append('model', 'whisper-1'); // OpenAI-compatible API
      formData.append('language', language);
      formData.append('response_format', 'verbose_json');

      const response = await fetch(`${this.contaboUrl}/v1/audio/transcriptions`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Whisper STT failed: ${error.error || response.statusText}`);
      }

      const data = await response.json();

      // Parse Whisper response
      const segments: TranscriptionSegment[] = (data.segments || []).map((seg: any) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text,
        confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : undefined
      }));

      return {
        text: data.text || '',
        language: data.language || language,
        confidence: data.confidence,
        segments: segments,
        duration: data.duration
      };

    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Smart transcribe: Try Gemini first, fallback to Whisper
   */
  async transcribe(audioBlob: Blob, options: TranscriptionOptions = {}): Promise<TranscriptionResult> {
    // Try Gemini first (FREE tier)
    if (!this.useWhisperBackup && this.geminiApiKey) {
      try {
        return await this.transcribeWithGemini(audioBlob, options);
      } catch (error) {
        console.warn('Gemini STT failed, falling back to Whisper:', error);
        this.useWhisperBackup = true;
      }
    }

    // Fallback to Whisper on Contabo
    try {
      return await this.transcribeWithWhisper(audioBlob, options);
    } catch (error) {
      console.error('Both transcription methods failed:', error);
      throw new Error('Transcription failed. Please check your connection and try again.');
    }
  }

  /**
   * Upload recording to Contabo for storage
   */
  async uploadRecording(
    audioBlob: Blob,
    metadata: {
      userId: string;
      callId?: string;
      company?: string;
      persona?: string;
    }
  ): Promise<{ url: string; fileId: string }> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording-${Date.now()}.wav`);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch(`${this.contaboUrl.replace(':11434', ':8787')}/api/recordings/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload recording. Please try again.');
    }
  }

  /**
   * Convert Blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data:*;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Check if Gemini STT is available
   */
  isGeminiAvailable(): boolean {
    return !!this.geminiApiKey;
  }

  /**
   * Check if Whisper is available on Contabo
   */
  async isWhisperAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.contaboUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton
export const transcriptionService = new TranscriptionService();
