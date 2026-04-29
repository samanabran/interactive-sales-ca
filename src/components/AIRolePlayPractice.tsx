import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Stop,
  Microphone,
  MicrophoneSlash,
  CheckCircle,
  SpeakerHigh,
  SpeakerSlash,
  Building,
  ArrowLeft
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  getPersonasForCompany,
  generateProspectResponse,
  B2BPersonaType,
  ConversationContext,
  AIMessage
} from '@/lib/aiRolePlayService';
import { getVoiceAgentForB2BPersona } from '@/lib/voiceAgentConfig';
import { geminiTTS } from '@/lib/geminiTTSService';
import { edgeTTS } from '@/lib/edgeTtsService';
import { deepgramService } from '@/lib/deepgramService';
import { useCompany } from '@/contexts/CompanyContext';
import { COMPANY_PROFILES } from '@/lib/companySelector';
import type { B2BPersona } from '@/lib/b2bPersonas';

export default function AIRolePlayPractice() {
  // Company context
  const { selectedCompany, setSelectedCompany, clearCompany } = useCompany();
  
  // Persona state
  const [personas, setPersonas] = useState<B2BPersona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<B2BPersona | null>(null);
  
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // UI state
  const [showSetup, setShowSetup] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsProvider, setTtsProvider] = useState<'gemini' | 'edge' | 'deepgram'>('gemini'); // Default: Gemini (free, human-like)
    
  // Performance tracking
  const [sessionMetrics, setSessionMetrics] = useState<{
    overallScore: number;
    scriptAdherence: number;
    objectionHandling: number;
    rapport: number;
    closing: number;
    strengths: string[];
    improvements: string[];
  } | null>(null);
    
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load personas when company changes
  useEffect(() => {
    if (selectedCompany) {
      const companyPersonas = getPersonasForCompany(selectedCompany);
      setPersonas(companyPersonas);
      setSelectedPersona(null);
      setMessages([]);
      setContext(null);
      setSessionMetrics(null);
      setIsSessionActive(false);
      setCurrentMessage('');
      setShowSetup(true);
    }
  }, [selectedCompany]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setCurrentMessage(prev => prev + ' ' + finalTranscript.trim());
          setIsListening(false);
        } else if (interimTranscript) {
          setCurrentMessage(prev => prev + interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
        switch (event.error) {
          case 'no-speech':
            toast.error('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            toast.error('Microphone not found. Please check your device.');
            break;
          case 'not-allowed':
            toast.error('Microphone permission denied. Please allow microphone access.');
            break;
          default:
            toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Speak text with selected TTS provider (Gemini/Edge/Deepgram)
  const speakWithVoice = useCallback(async (text: string, persona: B2BPersona) => {
    if (!ttsEnabled) return;
    
    const voiceAgent = getVoiceAgentForB2BPersona(persona.company, persona.type as B2BPersonaType);
    
    try {
      if (ttsProvider === 'gemini') {
        // Option 1: Gemini 3.1 Flash TTS (FREE, 30+ voices)
        setIsSpeaking(true);
        await geminiTTS.playText(text, {
          voice: voiceAgent.voice,
          stylePrompt: voiceAgent.stylePrompt,
          temperature: 0.8
        });
        setIsSpeaking(false);
      } else if (ttsProvider === 'edge') {
        // Option 2: Edge TTS (FREE unlimited, 200+ voices)
        setIsSpeaking(true);
        await edgeTTS.playText(text, voiceAgent.fallbackVoice || 'en-US-AriaNeural');
        setIsSpeaking(false);
      } else if (ttsProvider === 'deepgram') {
        // Option 3: Deepgram Aura-2 (FREE $200 credit, then $0.030/1K chars, 40+ voices)
        if (!deepgramService.isAvailable()) {
          toast.error('Deepgram API key not configured. Check VITE_DEEPGRAM_API_KEY in .env');
          return;
        }
        setIsSpeaking(true);
        const deepgramVoice = voiceAgent.deepgramVoice || 'aura-2-asteria-en';
        await deepgramService.playText(text, { model: deepgramVoice });
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      
      // Auto-fallback chain: Gemini → Edge → Deepgram
      if (ttsProvider === 'gemini') {
        try {
          toast.info('Gemini TTS failed, falling back to Edge TTS...');
          setIsSpeaking(true);
          await edgeTTS.playText(text, voiceAgent.fallbackVoice || 'en-US-AriaNeural');
          setIsSpeaking(false);
        } catch (fallbackError) {
          console.error('Edge TTS fallback failed:', fallbackError);
        }
      } else if (ttsProvider === 'deepgram' && deepgramService.isAvailable()) {
        try {
          toast.info('Deepgram TTS failed, falling back to Edge TTS...');
          setIsSpeaking(true);
          await edgeTTS.playText(text, voiceAgent.fallbackVoice || 'en-US-AriaNeural');
          setIsSpeaking(false);
        } catch (fallbackError) {
          console.error('Edge TTS fallback failed:', fallbackError);
        }
      }
    }
  }, [ttsEnabled, ttsProvider]);

  // Start session with selected persona
  const startSession = async (persona: B2BPersona) => {
    // Generate initial greeting based on persona
    const initialGreeting = generatePersonaGreeting(persona);
    
    const initialMessage: AIMessage = {
      id: `prospect-${Date.now()}`,
      role: 'prospect',
      content: initialGreeting,
      timestamp: Date.now(),
      sentiment: 'neutral'
    };

    const newContext: ConversationContext = {
      company: persona.company,
      personaType: persona.type as B2BPersonaType,
      messages: [initialMessage],
      currentGoal: `Pitch ${persona.company === 'eiger-marvel-hr' ? 'Odoo ERP' : 'AI automation solutions'} to ${persona.name}`,
      objectionsHandled: [],
      talkativeLevel: persona.personality.talkative,
      emotionalLevel: persona.personality.emotional,
      skepticalLevel: persona.personality.skeptical
    };

    setContext(newContext);
    setMessages([initialMessage]);
    setSelectedPersona(persona);
    setIsSessionActive(true);
    setShowSetup(false);

    // Speak the greeting
    await speakWithVoice(initialGreeting, persona);

    toast.success(`B2B session started with ${persona.name} (${persona.title})`);
  };

  // Generate persona-specific greeting
  const generatePersonaGreeting = (persona: B2BPersona): string => {
    const companyName = persona.company === 'eiger-marvel-hr' ? 'EIGER MARVEL HR' : 'SGC TECH AI';
    
    switch (persona.type) {
      case 'hr-manager':
        return `Hello, this is ${persona.name}, Operations Manager at ${companyName}. We're currently using Excel for everything and it's costing us AED 40k monthly in errors. I have 14 days to fix our recruitment system before the peak season. What can you do?`;
      
      case 'business-owner':
        if (persona.company === 'eiger-marvel-hr') {
          return `Hi, I'm ${persona.name} at ${companyName}. We're a 13-person team trying to compete with larger consultancies. I've heard about AI in recruitment but I'm worried about team adoption. Show me how your system works.`;
        }
        return `This is ${persona.name}, CEO of ${companyName}. We're stuck at AED 1.5M revenue and our competitors are already offering AI. I need to scale to AED 5M in 2 years. How fast can you deploy? What's your competitive advantage?`;

      case 'finance-decider':
        return `This is ${persona.name} from ${companyName}. Before we discuss anything, I need to see your ROI calculator. Our budget is ${persona.budget}, but I need 90-day payment terms and a money-back guarantee. What's the total cost?`;

      case 'it-manager':
        return `Hey, ${persona.name} here, IT Manager at ${companyName}. I've evaluated 20+ AI solutions and most can't handle production workloads. Show me your API documentation and tell me about Kubernetes integration. I need enterprise-grade reliability.`;

      case 'operations-manager':
        return `Hi, ${persona.name}, Head of Operations at ${companyName}. Our project delivery takes 3-6 months because everything is custom. I want a pilot program first - show me how your AI tools can standardize our delivery and reduce time to 6-8 weeks.`;

      default:
        return `Hello, this is ${persona.name} from ${companyName}. Tell me about your solution.`;
    }
  };

  // Send user message
  const sendMessage = async () => {
    if (!currentMessage.trim() || !context || !selectedPersona || isProcessing) return;

    setIsProcessing(true);
    setIsTyping(true);

    // Add user message
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage('');

    try {
      // Simulate AI thinking time (based on persona's personality)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Generate prospect response
      const response = await generateProspectResponse(
        context,
        currentMessage
      );

      setIsTyping(false);

      // Add prospect response
      const prospectMessage: AIMessage = {
        id: `prospect-${Date.now()}-${updatedMessages.length}`,
        role: 'prospect',
        content: response,
        timestamp: Date.now(),
        sentiment: 'neutral'
      };

      const finalMessages = [...updatedMessages, prospectMessage];
      setMessages(finalMessages);
      
      // Update context
      setContext({
        ...context,
        messages: finalMessages
      });

      // Speak the response
      await speakWithVoice(response, selectedPersona);

    } catch (error) {
      console.error('Failed to generate response:', error);
      toast.error('Failed to get prospect response.');
      setIsTyping(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // End session
  const endSession = () => {
    if (!context || !selectedPersona) return;

    // Calculate mock metrics based on conversation
    const metrics = {
      overallScore: 65 + Math.random() * 30,
      scriptAdherence: 60 + Math.random() * 35,
      objectionHandling: 55 + Math.random() * 40,
      rapport: 70 + Math.random() * 25,
      closing: 50 + Math.random() * 45,
      strengths: [
        'Good rapport building with B2B decision-maker',
        'Handled budget objection professionally',
        'Used company-specific terminology'
      ],
      improvements: [
        'Address timeline concerns earlier',
        'Provide more UAE-specific references',
        'Quantify ROI more clearly'
      ]
    };

    setSessionMetrics(metrics);
    setIsSessionActive(false);
    toast.success(`Session ended! Score: ${Math.round(metrics.overallScore)}%`);
  };

  // Toggle speech recognition
  const toggleListening = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported. Try Chrome, Edge, or Safari.');
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
      } catch (error: any) {
        console.error('Microphone error:', error);
        toast.error('Microphone access denied. Please allow in settings.');
        setIsListening(false);
      }
    }
  };

  // Go back to company selection
  const handleBackToCompany = () => {
    clearCompany();
    setSelectedPersona(null);
    setMessages([]);
    setContext(null);
    setIsSessionActive(false);
    setSessionMetrics(null);
    setShowSetup(true);
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Difficulty color helper
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // ========== RENDER: Company Not Selected ==========
  if (!selectedCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6 pt-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Building className="h-8 w-8 text-white" weight="fill" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              B2B Sales Training
            </h1>
            <p className="text-base md:text-lg text-gray-800 font-semibold max-w-md mx-auto">
              Select your company to practice sales conversations with real decision-makers
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Choose Training Company</CardTitle>
              <CardDescription>
                Practice B2B sales with EIGER MARVEL HR or SGC TECH AI personas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {COMPANY_PROFILES.map((company) => (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompany(company.id)}
                  className="cursor-pointer p-6 border-2 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="text-5xl p-3 rounded-xl"
                      style={{ backgroundColor: `${company.color}20` }}
                    >
                      {company.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{company.domain}</p>
                      <p className="text-sm text-gray-700 mt-2">{company.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {company.solutions.slice(0, 3).map((solution, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {solution}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ========== RENDER: Show Setup (Persona Selection) ==========
  if (showSetup && !isSessionActive && !sessionMetrics) {
    const companyProfile = COMPANY_PROFILES.find(c => c.id === selectedCompany);
    
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border-2">
            <Button variant="outline" onClick={handleBackToCompany} className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Change Company
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {companyProfile?.icon} {companyProfile?.name} - Select Persona
              </h1>
              <p className="text-sm text-gray-700 mt-1">
                Choose a B2B decision-maker to practice your sales conversation
              </p>
            </div>
          </div>

          {/* Voice Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Voice Agent Settings</CardTitle>
              <CardDescription>
                Choose TTS provider: Gemini (FREE), Edge (FREE), or Deepgram (Aura-2, $200 free credit)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                <div className="flex items-center gap-3">
                  {ttsEnabled ? (
                    <SpeakerHigh className="h-6 w-6 text-blue-600" weight="fill" />
                  ) : (
                    <SpeakerSlash className="h-6 w-6 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Realistic Voice Agents</p>
                    <p className="text-xs text-gray-700">
                      {ttsProvider === 'gemini' && 'Gemini 3.1 Flash TTS (FREE, 30+ voices)'}
                      {ttsProvider === 'edge' && 'Edge TTS (FREE unlimited, 200+ voices)'}
                      {ttsProvider === 'deepgram' && 'Deepgram Aura-2 (FREE $200 credit, 40+ voices)'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={ttsEnabled}
                  onCheckedChange={setTtsEnabled}
                />
              </div>

              {ttsEnabled && (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={ttsProvider === 'gemini' ? 'default' : 'outline'}
                    onClick={() => setTtsProvider('gemini')}
                    className="flex-col h-auto py-3 gap-1"
                    size="sm"
                  >
                    <span className="text-lg">🎤</span>
                    <span className="text-xs font-semibold">Gemini</span>
                    <span className="text-[10px] text-muted-foreground">FREE</span>
                  </Button>
                  <Button
                    variant={ttsProvider === 'edge' ? 'default' : 'outline'}
                    onClick={() => setTtsProvider('edge')}
                    className="flex-col h-auto py-3 gap-1"
                    size="sm"
                  >
                    <span className="text-lg">🔊</span>
                    <span className="text-xs font-semibold">Edge TTS</span>
                    <span className="text-[10px] text-muted-foreground">FREE</span>
                  </Button>
                  <Button
                    variant={ttsProvider === 'deepgram' ? 'default' : 'outline'}
                    onClick={() => setTtsProvider('deepgram')}
                    className="flex-col h-auto py-3 gap-1"
                    size="sm"
                  >
                    <span className="text-lg">🎧</span>
                    <span className="text-xs font-semibold">Deepgram</span>
                    <span className="text-[10px] text-muted-foreground">$200 FREE</span>
                  </Button>
                </div>
              )}

              <Button 
                onClick={() => setShowSetup(false)} 
                className="w-full h-12 text-base font-semibold"
              >
                Continue to Persona Selection →
              </Button>
            </CardContent>
          </Card>

          {/* Persona Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {personas.map((persona) => {
              const voiceAgent = getVoiceAgentForB2BPersona(persona.company, persona.type as B2BPersonaType);
              
              return (
                <Card 
                  key={persona.id}
                  className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 bg-white border-2 hover:border-blue-500"
                  onClick={() => startSession(persona)}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{persona.name}</CardTitle>
                        <CardDescription className="text-sm mt-1 font-semibold">
                          {persona.title}
                        </CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(persona.difficulty) + ' font-bold'}>
                        {persona.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{persona.responseStyle}</p>
                    
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs font-bold mb-2 text-blue-900">Goals:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.goals.slice(0, 2).map((goal, idx) => (
                          <Badge key={idx} className="text-xs font-bold bg-blue-600 text-white">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-xs font-bold text-green-900">Budget: <span className="text-green-700 font-extrabold">{persona.budget}</span></p>
                    </div>

                    {ttsEnabled && (
                      <div className="pt-2 border-t-2">
                        <p className="text-xs italic text-gray-700 font-medium">
                          🎤 Voice: {voiceAgent.name} ({voiceAgent.gender})
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER: Session Metrics ==========
  if (sessionMetrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="shadow-xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mx-auto mb-2">
                <CheckCircle className="h-10 w-10 text-white" weight="fill" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                Session Complete! 🎉
              </CardTitle>
              <CardDescription className="text-base text-gray-800 font-semibold">
                B2B practice with <span className="font-bold text-blue-700">{selectedPersona?.name}</span> ({selectedPersona?.title})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-md">
                <p className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Overall Performance</p>
                <p className={`text-6xl md:text-7xl font-bold ${getScoreColor(sessionMetrics.overallScore)} mb-2`}>
                  {Math.round(sessionMetrics.overallScore)}%
                </p>
                <p className="text-base text-gray-800 font-semibold">
                  {sessionMetrics.overallScore >= 80 ? '🌟 Excellent!' : 
                   sessionMetrics.overallScore >= 60 ? '👍 Good job!' : 
                   '💪 Keep practicing!'}
                </p>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
                  <p className="text-sm font-bold mb-3 text-gray-900">📝 B2B Pitch Quality</p>
                  <Progress value={sessionMetrics.scriptAdherence} className="h-3 mb-2" />
                  <p className="text-lg font-bold text-gray-900">{Math.round(sessionMetrics.scriptAdherence)}%</p>
                </div>
                <div className="p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
                  <p className="text-sm font-bold mb-3 text-gray-900">🛡️ Objection Handling</p>
                  <Progress value={sessionMetrics.objectionHandling} className="h-3 mb-2" />
                  <p className="text-lg font-bold text-gray-900">{Math.round(sessionMetrics.objectionHandling)}%</p>
                </div>
                <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                  <p className="text-sm font-semibold mb-3 text-gray-700">🤝 Rapport Building</p>
                  <Progress value={sessionMetrics.rapport} className="h-3 mb-2" />
                  <p className="text-lg font-bold text-gray-900">{Math.round(sessionMetrics.rapport)}%</p>
                </div>
                <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                  <p className="text-sm font-semibold mb-3 text-gray-700">🎯 B2B Closing</p>
                  <Progress value={sessionMetrics.closing} className="h-3 mb-2" />
                  <p className="text-lg font-bold text-gray-900">{Math.round(sessionMetrics.closing)}%</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={() => {
                    setSessionMetrics(null);
                    setContext(null);
                    setMessages([]);
                  }}
                  className="flex-1 h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  Practice Again with {selectedPersona?.name}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBackToCompany}
                  className="flex-1 h-12 text-base font-semibold"
                >
                  Choose Different Company
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ========== RENDER: Active Session ==========
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b-2 border-gray-300 bg-white shadow-sm p-3 md:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-lg font-bold truncate text-gray-900">
                {selectedPersona?.name} - {selectedPersona?.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-800 font-semibold truncate">
                {selectedCompany === 'eiger-marvel-hr' ? '🇦🇪 EIGER MARVEL HR' : '🤖 SGC TECH AI'} • B2B Decision-Maker
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {isSpeaking && (
                <Badge variant="secondary" className="animate-pulse">
                  <SpeakerHigh className="h-3 w-3 mr-1" weight="fill" />
                  Speaking...
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 md:px-3"
                onClick={() => setTtsEnabled(!ttsEnabled)}
              >
                {ttsEnabled ? <SpeakerHigh className="h-4 w-4" /> : <SpeakerSlash className="h-4 w-4" />}
                <span className="hidden md:inline ml-2">Voice</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-2 md:px-3"
                onClick={endSession}
              >
                <Stop className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">End</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl p-3 md:p-4 shadow-md ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md font-semibold'
                      : 'bg-white border-2 border-gray-300 rounded-bl-md text-gray-900'
                  }`}
                >
                  {message.role === 'prospect' && isSpeaking && 
                   message === messages[messages.length - 1] && (
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <SpeakerHigh className="h-4 w-4 animate-pulse" weight="fill" />
                      <span className="text-xs font-bold">Speaking...</span>
                    </div>
                  )}
                  <p className="text-sm md:text-base leading-relaxed font-medium">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && selectedPersona && (
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
                  <div className="bg-gray-100 rounded-2xl p-4 border-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-600">{selectedPersona.name} is typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white shadow-lg p-3 md:p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleListening}
                className={`shrink-0 h-10 w-10 md:h-11 md:w-11 ${isListening ? 'bg-red-50 border-red-300' : ''}`}
              >
                {isListening ? (
                  <MicrophoneSlash className="h-5 w-5 text-red-600" weight="fill" />
                ) : (
                  <Microphone className="h-5 w-5" />
                )}
              </Button>
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type your B2B sales response..."
                className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all"
                disabled={isProcessing}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isProcessing}
                className="shrink-0 h-10 md:h-11 px-4 md:px-6 bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? '...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
