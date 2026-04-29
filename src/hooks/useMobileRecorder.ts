/**
 * Mobile Recording Hook - RecordRTC + MediaStream API
 * Supports iOS Safari, Android Chrome, Desktop
 * Output: WAV format (16kHz, mono, 16-bit) for Whisper/Gemini STT
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // seconds
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export interface UseMobileRecorderReturn extends RecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
}

export function useMobileRecorder(): UseMobileRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check browser support
  const isSupported = useCallback((): boolean => {
    return !!(navigator.mediaDevices && 
                  navigator.mediaDevices.getUserMedia && 
                  (window as any).MediaRecorder);
  }, []);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported()) {
      setError('Your browser does not support audio recording. Try Chrome, Edge, or Safari.');
      return;
    }

    try {
      setError(null);
      chunksRef.current = [];

      // Request microphone with mobile-friendly constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Mobile-specific: lower sample rate for smaller files
          sampleRate: 16000 // 16kHz for Whisper/Gemini
        }
      });

      streamRef.current = stream;

      // Determine best MIME type for mobile
      const mimeTypes = [
        'audio/wav',          // Best for Whisper
        'audio/webm;codecs=opus', // Chrome/Edge
        'audio/ogg;codecs=opus',   // Firefox
        'audio/mp4'              // Safari/iOS
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      // Fallback to browser default
      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: selectedMimeType || 'audio/wav' 
        });
        
        // Convert to WAV if not already (for Whisper compatibility)
        convertToWav(blob).then(wavBlob => {
          setAudioBlob(wavBlob);
          const url = URL.createObjectURL(wavBlob);
          setAudioUrl(url);
        });

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);
      };

      // Handle errors
      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event);
        setError(`Recording error: ${event.error?.message || 'Unknown error'}`);
        stopRecording();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every 1 second
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start recording:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Failed to start recording: ${err.message}`);
      }
    }
  }, [isSupported]);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        resolve(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    });
  }, []);

  // Pause recording (if supported)
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Restart timer
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 1000);
    }
  }, []);

  // Clear recording
  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
    chunksRef.current = [];
  }, [audioUrl]);

  // Convert blob to WAV format (16kHz, mono, 16-bit) for Whisper
  const convertToWav = async (blob: Blob): Promise<Blob> => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Convert to mono if stereo
      const monoData = audioBuffer.numberOfChannels > 1 
        ? mergeChannels(audioBuffer) 
        : audioBuffer.getChannelData(0);
      
      // Resample to 16kHz if needed
      const resampled = audioBuffer.sampleRate !== 16000 
        ? resample(monoData, audioBuffer.sampleRate, 16000)
        : monoData;
      
      // Convert to 16-bit PCM
      const wavBuffer = encodeWav(resampled, 16000);
      
      audioContext.close();
      return new Blob([wavBuffer], { type: 'audio/wav' });
    } catch (error) {
      console.warn('WAV conversion failed, returning original blob:', error);
      return blob; // Fallback to original
    }
  };

  // Merge stereo to mono
  const mergeChannels = (audioBuffer: AudioBuffer): Float32Array => {
    const channels: Float32Array[] = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
    
    const length = audioBuffer.length;
    const mono = new Float32Array(length);
    
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (const channel of channels) {
        sum += channel[i];
      }
      mono[i] = sum / channels.length;
    }
    
    return mono;
  };

  // Simple resampling (linear interpolation)
  const resample = (data: Float32Array, fromRate: number, toRate: number): Float32Array => {
    const ratio = fromRate / toRate;
    const newLength = Math.round(data.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const originalIndex = i * ratio;
      const index = Math.floor(originalIndex);
      const fraction = originalIndex - index;
      
      if (index + 1 < data.length) {
        result[i] = data[index] * (1 - fraction) + data[index + 1] * fraction;
      } else {
        result[i] = data[index];
      }
    }
    
    return result;
  };

  // Encode Float32Array to WAV format
  const encodeWav = (samples: Float32Array, sampleRate: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // 16-bit
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    
    // Write audio data
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return buffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording
  };
}
