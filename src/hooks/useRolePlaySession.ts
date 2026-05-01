// Shared hook for B2B roleplay session state and logic
// Used by EigerMarvelRolePlay and SDCTechAIRolePlay components

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  generateProspectResponse,
  getPersonasForCompany,
  type B2BPersonaType,
  type ConversationContext,
  type AIMessage,
} from '@/lib/aiRolePlayService';
import { getVoiceAgentForB2BPersona } from '@/lib/voiceAgentConfig';
import { geminiTTS } from '@/lib/geminiTTSService';
import { edgeTTS } from '@/lib/edgeTtsService';
import { deepgramService } from '@/lib/deepgramService';
import type { B2BPersona } from '@/lib/b2bPersonas';
import type { CompanyType } from '@/lib/companySelector';

export type TTSProvider = 'gemini' | 'edge' | 'deepgram';

export interface SessionMetrics {
  overallScore: number;
  scriptAdherence: number;
  objectionHandling: number;
  rapport: number;
  closing: number;
  strengths: string[];
  improvements: string[];
  objectionsEncountered: string[];
  stagesReached: string[];
}

export interface UseRolePlaySessionOptions {
  company: CompanyType;
  detectObjection?: (message: string) => string | null;
  generateCompanyGreeting?: (persona: B2BPersona) => string;
  getCompanyMetrics?: (messages: AIMessage[], objectionsHandled: string[]) => Partial<SessionMetrics>;
}

// Web Speech API — not fully typed in all TypeScript DOM versions
interface SpeechRecognitionResultItem {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionClass(): SpeechRecognitionConstructor | undefined {
  const w = window as unknown as Record<string, unknown>;
  return (w['webkitSpeechRecognition'] as SpeechRecognitionConstructor | undefined) ||
         (w['SpeechRecognition'] as SpeechRecognitionConstructor | undefined);
}

function defaultGreeting(persona: B2BPersona): string {
  const co = persona.company === 'eiger-marvel-hr' ? 'EIGER MARVEL HR' : 'SGC TECH AI';
  switch (persona.type) {
    case 'hr-manager':
      return `Hello, this is ${persona.name}, Operations Manager at ${co}. We're using Excel for everything and it's costing us AED 40k monthly. I have 14 days to fix our recruitment before peak season. What can you do?`;
    case 'business-owner':
      return persona.company === 'eiger-marvel-hr'
        ? `Hi, I'm ${persona.name} at ${co}. We're a 13-person team trying to compete with larger consultancies. I'm interested in AI recruitment but worried about team adoption.`
        : `This is ${persona.name}, CEO of ${co}. We're at AED 1.5M revenue and competitors are using AI. I need to scale to AED 5M in 2 years. How fast can you deliver?`;
    case 'finance-decider':
      return `This is ${persona.name} from ${co}. Before anything else, I need to see your ROI calculator. Budget is ${persona.budget}, but I need 90-day payment terms and a money-back guarantee.`;
    case 'it-manager':
      return `Hey, ${persona.name} here, IT Manager at ${co}. I've evaluated 20+ AI solutions. Most can't handle production workloads. Show me your API docs and Kubernetes integration details.`;
    case 'operations-manager':
      return `Hi, ${persona.name}, Head of Operations at ${co}. Project delivery takes 3–6 months because everything is custom. I want a pilot first — show me how AI tools can get us to 6–8 weeks.`;
    default:
      return `Hello, this is ${persona.name} from ${co}. Tell me about your solution.`;
  }
}

export function useRolePlaySession({
  company,
  detectObjection,
  generateCompanyGreeting,
  getCompanyMetrics,
}: UseRolePlaySessionOptions) {
  const [personas] = useState<B2BPersona[]>(() => getPersonasForCompany(company));
  const [selectedPersona, setSelectedPersona] = useState<B2BPersona | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsProvider, setTtsProvider] = useState<TTSProvider>('gemini');
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [currentStage, setCurrentStage] = useState('greeting');
  const [objectionsHandled, setObjectionsHandled] = useState<string[]>([]);
  const [stagesReached, setStagesReached] = useState<string[]>(['greeting']);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const ttsEnabledRef = useRef(ttsEnabled);
  const ttsProviderRef = useRef(ttsProvider);

  // Keep refs in sync
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);
  useEffect(() => { ttsProviderRef.current = ttsProvider; }, [ttsProvider]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition once
  useEffect(() => {
    const SR = getSpeechRecognitionClass();
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final) {
        setCurrentMessage(prev => (prev + ' ' + final.trim()).trim());
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (event.error === 'no-speech') toast.error('No speech detected. Try again.');
      else if (event.error === 'audio-capture') toast.error('Microphone not found.');
      else if (event.error === 'not-allowed') toast.error('Microphone permission denied.');
      else toast.error(`Speech error: ${event.error}`);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const speakWithVoice = useCallback(async (text: string, persona: B2BPersona): Promise<void> => {
    if (!ttsEnabledRef.current) return;
    const voiceAgent = getVoiceAgentForB2BPersona(persona.company, persona.type as B2BPersonaType);

    setIsSpeaking(true);
    try {
      const provider = ttsProviderRef.current;
      if (provider === 'gemini') {
        await geminiTTS.playText(text, {
          voice: voiceAgent.voice,
          stylePrompt: voiceAgent.stylePrompt,
          temperature: 0.8,
        });
      } else if (provider === 'edge') {
        await edgeTTS.playText(text, voiceAgent.fallbackVoice ?? 'en-US-AriaNeural');
      } else if (provider === 'deepgram') {
        if (!deepgramService.isAvailable()) {
          toast.error('Deepgram API key not configured.');
          setIsSpeaking(false);
          return;
        }
        await deepgramService.playText(text, { model: voiceAgent.deepgramVoice ?? 'aura-2-asteria-en' });
      }
    } catch {
      // Fallback: try Edge TTS if primary failed
      if (ttsProviderRef.current === 'gemini') {
        try {
          const voiceAgent = getVoiceAgentForB2BPersona(persona.company, persona.type as B2BPersonaType);
          await edgeTTS.playText(text, voiceAgent.fallbackVoice ?? 'en-US-AriaNeural');
        } catch { /* silent */ }
      }
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const startSession = useCallback(async (persona: B2BPersona): Promise<void> => {
    const greeting = generateCompanyGreeting ? generateCompanyGreeting(persona) : defaultGreeting(persona);

    const initialMessage: AIMessage = {
      id: `prospect-${Date.now()}`,
      role: 'prospect',
      content: greeting,
      timestamp: Date.now(),
      sentiment: 'neutral',
    };

    const newContext: ConversationContext = {
      company: persona.company,
      personaType: persona.type as B2BPersonaType,
      messages: [initialMessage],
      currentGoal: `Pitch ${persona.company === 'eiger-marvel-hr' ? 'Odoo ERP' : 'AI automation'} to ${persona.name}`,
      objectionsHandled: [],
      talkativeLevel: persona.personality.talkative,
      emotionalLevel: persona.personality.emotional,
      skepticalLevel: persona.personality.skeptical,
    };

    setContext(newContext);
    setMessages([initialMessage]);
    setSelectedPersona(persona);
    setIsSessionActive(true);
    setShowSetup(false);
    setCurrentStage('greeting');
    setObjectionsHandled([]);
    setStagesReached(['greeting']);
    setSessionMetrics(null);

    await speakWithVoice(greeting, persona);
    toast.success(`Session started with ${persona.name} (${persona.title})`);
  }, [generateCompanyGreeting, speakWithVoice]);

  const sendMessage = useCallback(async (): Promise<void> => {
    if (!currentMessage.trim() || !context || !selectedPersona || isProcessing) return;

    setIsProcessing(true);
    setIsTyping(true);

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: Date.now(),
    };

    // Track objections proactively
    if (detectObjection) {
      const objId = detectObjection(currentMessage);
      if (objId) {
        setObjectionsHandled(prev => prev.includes(objId) ? prev : [...prev, objId]);
      }
    }

    setMessages(prev => [...prev, userMsg]);
    setCurrentMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
      const response = await generateProspectResponse(context, userMsg.content);
      setIsTyping(false);

      const prospectMsg: AIMessage = {
        id: `prospect-${Date.now()}`,
        role: 'prospect',
        content: response,
        timestamp: Date.now(),
        sentiment: 'neutral',
      };

      setMessages(prev => {
        const updated = [...prev, prospectMsg];
        setContext(c => c ? { ...c, messages: updated } : null);
        return updated;
      });

      await speakWithVoice(response, selectedPersona);
    } catch {
      toast.error('Failed to get prospect response.');
      setIsTyping(false);
    } finally {
      setIsProcessing(false);
    }
  }, [currentMessage, context, selectedPersona, isProcessing, detectObjection, speakWithVoice]);

  const endSession = useCallback((): void => {
    if (!selectedPersona) return;

    const companyMetrics = getCompanyMetrics
      ? getCompanyMetrics(messages, objectionsHandled)
      : {};

    const metrics: SessionMetrics = {
      overallScore: 65 + Math.random() * 30,
      scriptAdherence: 60 + Math.random() * 35,
      objectionHandling: objectionsHandled.length > 0 ? 70 + Math.random() * 25 : 50 + Math.random() * 30,
      rapport: 70 + Math.random() * 25,
      closing: 50 + Math.random() * 45,
      strengths: [
        'Good rapport building with B2B decision-maker',
        'Used company-specific terminology',
        'Responded to technical questions confidently',
      ],
      improvements: [
        'Quantify ROI earlier in the conversation',
        'Address timeline concerns proactively',
        'Offer UAE-specific references',
      ],
      objectionsEncountered: objectionsHandled,
      stagesReached,
      ...companyMetrics,
    };

    setSessionMetrics(metrics);
    setIsSessionActive(false);
    toast.success(`Session complete! Score: ${Math.round(metrics.overallScore)}%`);
  }, [selectedPersona, messages, objectionsHandled, stagesReached, getCompanyMetrics]);

  const toggleListening = useCallback(async (): Promise<void> => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported. Use Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setCurrentMessage('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        toast.error('Microphone access denied.');
        setIsListening(false);
      }
    }
  }, [isListening]);

  const resetSession = useCallback((): void => {
    setSelectedPersona(null);
    setMessages([]);
    setContext(null);
    setIsSessionActive(false);
    setSessionMetrics(null);
    setCurrentMessage('');
    setCurrentStage('greeting');
    setObjectionsHandled([]);
    setStagesReached(['greeting']);
    setShowSetup(true);
  }, []);

  const advanceStage = useCallback((newStage: string): void => {
    setCurrentStage(newStage);
    setStagesReached(prev => prev.includes(newStage) ? prev : [...prev, newStage]);
  }, []);

  return {
    // State
    personas,
    selectedPersona,
    isSessionActive,
    context,
    messages,
    currentMessage, setCurrentMessage,
    isProcessing,
    isListening,
    isSpeaking,
    isTyping,
    showSetup, setShowSetup,
    ttsEnabled, setTtsEnabled,
    ttsProvider, setTtsProvider,
    sessionMetrics,
    currentStage,
    objectionsHandled,
    stagesReached,
    messagesEndRef,
    // Actions
    startSession,
    sendMessage,
    endSession,
    toggleListening,
    resetSession,
    advanceStage,
    speakWithVoice,
    company,
  };
}
