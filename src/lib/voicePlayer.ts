/**
 * Voice Player Utility - Playback for B2B Voice Agents
 * Supports Gemini TTS (primary) and Edge TTS (backup)
 * Includes waveform visualization and playback controls
 */

import { geminiTTS } from '@/lib/geminiTTSService';
import { edgeTTS } from '@/lib/edgeTtsService';
import type { VoiceAgent } from '@/lib/voiceAgentConfig';

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  duration: number;
  currentTime: number;
  waveformData: number[];
}

export class VoicePlayer {
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private animationFrame: number | null = null;
  
  // Callbacks
  private onPlay?: () => void;
  private onPause?: () => void;
  private onEnded?: () => void;
  private onTimeUpdate?: (currentTime: number) => void;
  private onWaveformUpdate?: (data: number[]) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play text as speech using voice agent
   */
  async playText(
    text: string,
    voiceAgent: VoiceAgent,
    useGemini: boolean = true
  ): Promise<void> {
    this.stop(); // Stop any current playback

    try {
      let audioBlob: Blob;

      if (useGemini) {
        // Primary: Gemini 3.1 Flash TTS (FREE)
        try {
          audioBlob = await geminiTTS.generateSpeech(text, {
            voice: voiceAgent.voice,
            stylePrompt: voiceAgent.stylePrompt,
            temperature: 0.8
          });
        } catch (error) {
          console.warn('Gemini TTS failed, falling back to Edge TTS:', error);
          audioBlob = await edgeTTS.generateSpeech(text, {
            voice: voiceAgent.fallbackVoice || 'en-US-AriaNeural'
          });
        }
      } else {
        // Backup: Edge TTS (FREE)
        audioBlob = await edgeTTS.generateSpeech(text, {
          voice: voiceAgent.fallbackVoice || 'en-US-AriaNeural'
        });
      }

      return this.playAudioBlob(audioBlob);
    } catch (error) {
      console.error('Voice playback failed:', error);
      throw error;
    }
  }

  /**
   * Play audio from blob
   */
  private async playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(blob);
      this.audioElement = new Audio(audioUrl);

      // Set up audio analysis for waveform
      if (this.audioContext && this.audioElement) {
        this.source = this.audioContext.createMediaElementSource(this.audioElement);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        // Start waveform visualization
        this.startWaveformAnalysis();
      }

      this.audioElement.onplay = () => {
        this.onPlay?.();
      };

      this.audioElement.onpause = () => {
        this.onPause?.();
      };

      this.audioElement.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.stopWaveformAnalysis();
        this.onEnded?.();
        resolve();
      };

      this.audioElement.ontimeupdate = () => {
        if (this.audioElement) {
          this.onTimeUpdate?.(this.audioElement.currentTime);
        }
      };

      this.audioElement.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        this.stopWaveformAnalysis();
        reject(error);
      };

      this.audioElement.play().catch(reject);
    });
  }

  /**
   * Start waveform analysis
   */
  private startWaveformAnalysis() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateWaveform = () => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Downsample to 50 data points for visualization
      const step = Math.floor(bufferLength / 50);
      const waveform: number[] = [];
      for (let i = 0; i < bufferLength; i += step) {
        waveform.push(dataArray[i] / 255); // Normalize to 0-1
      }
      
      this.onWaveformUpdate?.(waveform);
      this.animationFrame = requestAnimationFrame(updateWaveform);
    };

    updateWaveform();
  }

  /**
   * Stop waveform analysis
   */
  private stopWaveformAnalysis() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
  }

  /**
   * Resume playback
   */
  resume() {
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play();
    }
  }

  /**
   * Stop playback
   */
  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement.src = '';
      this.stopWaveformAnalysis();
    }
  }

  /**
   * Seek to position (in seconds)
   */
  seek(time: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  /**
   * Get current playback state
   */
  getState(): PlaybackState {
    if (!this.audioElement) {
      return {
        isPlaying: false,
        isPaused: false,
        duration: 0,
        currentTime: 0,
        waveformData: []
      };
    }

    return {
      isPlaying: !this.audioElement.paused,
      isPaused: this.audioElement.paused && this.audioElement.currentTime > 0,
      duration: this.audioElement.duration || 0,
      currentTime: this.audioElement.currentTime,
      waveformData: [] // Updated via callback
    };
  }

  /**
   * Set event callbacks
   */
  setCallbacks({
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onWaveformUpdate
  }: {
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
    onWaveformUpdate?: (data: number[]) => void;
  }) {
    this.onPlay = onPlay;
    this.onPause = onPause;
    this.onEnded = onEnded;
    this.onTimeUpdate = onTimeUpdate;
    this.onWaveformUpdate = onWaveformUpdate;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stop();
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

// Export singleton
export const voicePlayer = new VoicePlayer();
