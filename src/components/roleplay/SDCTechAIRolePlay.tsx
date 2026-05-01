// SGC TECH AI — Specialized Roleplay Component
// Green-themed enterprise IT/AI sales training

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
  ArrowLeft,
  Info,
} from '@phosphor-icons/react';
import { useRolePlaySession } from '@/hooks/useRolePlaySession';
import { getVoiceAgentForB2BPersona } from '@/lib/voiceAgentConfig';
import type { B2BPersonaType, AIMessage } from '@/lib/aiRolePlayService';
import {
  SDC_TECH_AI_CALL_FLOW,
  getSDCTechStageLabel,
  getSDCTechStageProgress,
  type SDCTechCallStage,
} from '@/lib/callScripts/sdcTechAICallFlow';
import { detectTechObjectionType, getTechBestResponse } from '@/lib/objections/sdcTechAIObjections';
import type { B2BPersona } from '@/lib/b2bPersonas';

const SDC_STAGES = SDC_TECH_AI_CALL_FLOW.stages;

function getSGCMetrics(messages: AIMessage[], objectionsHandled: string[]) {
  const hasRoi = messages.some(m => m.role === 'user' && (m.content.toLowerCase().includes('roi') || m.content.toLowerCase().includes('payback')));
  const hasTech = messages.some(m => m.role === 'user' && (m.content.toLowerCase().includes('api') || m.content.toLowerCase().includes('kubernetes') || m.content.toLowerCase().includes('uptime')));
  const hasPoc = messages.some(m => m.role === 'user' && (m.content.toLowerCase().includes('poc') || m.content.toLowerCase().includes('pilot') || m.content.toLowerCase().includes('proof of concept')));
  const adherence = 58 + (hasRoi ? 12 : 0) + (hasTech ? 15 : 0) + (hasPoc ? 10 : 0) + Math.random() * 10;
  return {
    overallScore: adherence * 0.82 + (objectionsHandled.length * 5),
    scriptAdherence: Math.min(adherence, 100),
    strengths: [
      ...(hasTech ? ['Demonstrated technical depth — IT Managers respond to this'] : []),
      ...(hasPoc ? ['Proposed PoC approach — essential for enterprise sales'] : []),
      ...(hasRoi ? ['Quantified ROI with financial model'] : []),
      objectionsHandled.length > 0 ? `Addressed ${objectionsHandled.length} enterprise objection(s)` : 'Kept the conversation technical and relevant',
    ],
    improvements: [
      !hasPoc ? 'Propose the PoC earlier — enterprise buyers need a risk-free entry point' : 'Define PoC success metrics more specifically',
      !hasTech ? 'Include technical architecture details — this is enterprise IT sales' : 'Reference specific UAE compliance requirements',
      'Map your solution to each decision-maker (IT, Finance, Operations) separately',
    ],
  };
}

export default function SDCTechAIRolePlay() {
  const session = useRolePlaySession({
    company: 'sgc-tech-ai',
    detectObjection: detectTechObjectionType,
    getCompanyMetrics: getSGCMetrics,
  });

  const stageHint = SDC_TECH_AI_CALL_FLOW[session.currentStage as keyof typeof SDC_TECH_AI_CALL_FLOW];
  const interpolateHint = (script: string) =>
    script
      .replace(/\[NAME\]/g, session.selectedPersona?.name ?? 'Prospect')
      .replace(/\[YOUR_NAME\]/g, 'You')
      .replace(/\[ROLE\]/g, session.selectedPersona?.title ?? 'the role');
  const currentObjId = session.currentMessage ? detectTechObjectionType(session.currentMessage) : null;
  const objCoach = currentObjId ? getTechBestResponse(currentObjId) : null;

  const getDifficultyColor = (d: string) => ({ easy: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', hard: 'bg-red-100 text-red-800' }[d] ?? 'bg-gray-100 text-gray-800');
  const getScoreColor = (s: number) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-600';

  // ===== Session Metrics View =====
  if (session.sessionMetrics) {
    return (
      <div className="min-h-screen bg-emerald-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="shadow-xl border-2 border-emerald-200">
            <CardHeader className="text-center space-y-2 pb-6 bg-emerald-600 text-white rounded-t-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-2">
                <CheckCircle className="h-10 w-10 text-white" weight="fill" />
              </div>
              <CardTitle className="text-2xl font-bold">Session Complete! 🎉</CardTitle>
              <CardDescription className="text-emerald-100 font-semibold">
                SGC TECH AI practice with <span className="font-bold text-white">{session.selectedPersona?.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center p-8 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                <p className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">Overall Performance</p>
                <p className={`text-7xl font-bold ${getScoreColor(session.sessionMetrics.overallScore)} mb-2`}>
                  {Math.round(session.sessionMetrics.overallScore)}%
                </p>
                <p className="text-base text-gray-600 font-semibold">
                  {session.sessionMetrics.overallScore >= 80 ? '🌟 Excellent enterprise pitch!' :
                   session.sessionMetrics.overallScore >= 60 ? '👍 Good progress, refine the PoC approach!' :
                   '💪 Keep practicing the technical discovery!'}
                </p>
              </div>

              {/* SGC-Specific KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '🔧 Technical Depth', value: session.sessionMetrics.scriptAdherence },
                  { label: '🛡️ Risk Handling', value: session.sessionMetrics.objectionHandling },
                  { label: '🤝 Executive Rapport', value: session.sessionMetrics.rapport },
                  { label: '🧪 PoC Closing', value: session.sessionMetrics.closing },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 bg-white rounded-xl border-2 border-emerald-100 shadow-sm text-center">
                    <p className="text-xs font-bold mb-2 text-gray-700">{label}</p>
                    <Progress value={value} className="h-2 mb-2" />
                    <p className="text-lg font-bold text-gray-900">{Math.round(value)}%</p>
                  </div>
                ))}
              </div>

              {session.sessionMetrics.objectionsEncountered.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-sm font-bold text-orange-800 mb-2">Enterprise Objections Encountered:</p>
                  <div className="flex flex-wrap gap-2">
                    {session.sessionMetrics.objectionsEncountered.map(id => (
                      <Badge key={id} variant="secondary" className="bg-orange-100 text-orange-800">{id.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm font-bold text-green-800 mb-2">✅ Strengths:</p>
                  <ul className="space-y-1">{session.sessionMetrics.strengths.filter(Boolean).map((s, i) => <li key={i} className="text-sm text-green-700">• {s}</li>)}</ul>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-sm font-bold text-emerald-800 mb-2">📈 Improvements:</p>
                  <ul className="space-y-1">{session.sessionMetrics.improvements.map((s, i) => <li key={i} className="text-sm text-emerald-700">• {s}</li>)}</ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={session.resetSession} className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700">
                  Practice Again with {session.selectedPersona?.name}
                </Button>
                <Button variant="outline" onClick={session.resetSession} className="flex-1 h-12 border-emerald-300">
                  Choose Different Persona
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== Setup View =====
  if (session.showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 bg-emerald-600 text-white p-4 rounded-xl shadow-md">
            <Button variant="ghost" onClick={session.resetSession} className="text-white hover:bg-white/20 shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">🤖 SGC TECH AI — Enterprise Sales Training</h1>
              <p className="text-emerald-100 text-sm mt-0.5">Practice AI/ERP enterprise pitches with C-suite and IT decision-makers</p>
            </div>
          </div>

          {/* Stage Guide */}
          <Card className="border-2 border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-emerald-800">🔧 SGC TECH AI Enterprise Sales Stages</CardTitle>
              <CardDescription>Longer enterprise cycle — qualify early, PoC is the pivot point</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SDC_STAGES.map((stage, idx) => (
                  <div key={stage} className="flex items-center gap-1">
                    <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">{idx + 1}. {getSDCTechStageLabel(stage as SDCTechCallStage)}</Badge>
                    {idx < SDC_STAGES.length - 1 && <span className="text-emerald-300">→</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card className="border-2 border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-800">🎤 Voice Agent Settings</CardTitle>
              <CardDescription>Gemini (FREE) · Edge TTS (FREE) · Deepgram (Aura-2, $200 free)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <div className="flex items-center gap-3">
                  {session.ttsEnabled ? <SpeakerHigh className="h-6 w-6 text-emerald-600" weight="fill" /> : <SpeakerSlash className="h-6 w-6 text-gray-400" />}
                  <div>
                    <p className="text-sm font-semibold">Realistic Enterprise Prospect Voices</p>
                    <p className="text-xs text-gray-500">
                      {session.ttsProvider === 'gemini' ? 'Gemini 3.1 Flash TTS (FREE)' : session.ttsProvider === 'edge' ? 'Edge TTS (FREE)' : 'Deepgram Aura-2'}
                    </p>
                  </div>
                </div>
                <Switch checked={session.ttsEnabled} onCheckedChange={session.setTtsEnabled} />
              </div>
              {session.ttsEnabled && (
                <div className="grid grid-cols-3 gap-2">
                  {(['gemini', 'edge', 'deepgram'] as const).map(p => (
                    <Button key={p} variant={session.ttsProvider === p ? 'default' : 'outline'}
                      onClick={() => session.setTtsProvider(p)}
                      className={`flex-col h-auto py-3 gap-1 ${session.ttsProvider === p ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                      size="sm"
                    >
                      <span className="text-lg">{p === 'gemini' ? '🎤' : p === 'edge' ? '🔊' : '🎧'}</span>
                      <span className="text-xs font-semibold capitalize">{p === 'deepgram' ? 'Deepgram' : p === 'gemini' ? 'Gemini' : 'Edge TTS'}</span>
                      <span className="text-[10px] text-muted-foreground">{p === 'deepgram' ? '$200 FREE' : 'FREE'}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Persona Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {session.personas.map((persona: B2BPersona) => {
              const voice = getVoiceAgentForB2BPersona(persona.company, persona.type as B2BPersonaType);
              return (
                <Card key={persona.id} className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2 hover:border-emerald-500"
                  onClick={() => session.startSession(persona)}>
                  <CardHeader className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold">{persona.name}</CardTitle>
                        <CardDescription className="font-semibold mt-0.5">{persona.title}</CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(persona.difficulty)}>{persona.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{persona.responseStyle}</p>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <p className="text-xs font-bold mb-1.5 text-emerald-700">Goals:</p>
                      <div className="flex flex-wrap gap-1">
                        {persona.goals.slice(0, 2).map((g, i) => (
                          <Badge key={i} className="text-xs bg-emerald-600 text-white">{g}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                      <p className="text-xs font-bold text-green-700">Budget: <span className="font-extrabold">{persona.budget}</span></p>
                    </div>
                    {session.ttsEnabled && (
                      <p className="text-xs italic text-gray-400 pt-1 border-t">
                        🎤 {voice.name} ({voice.gender})
                      </p>
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

  // ===== Active Session View =====
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b-2 border-emerald-200 bg-emerald-600 text-white shadow-sm p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold truncate">{session.selectedPersona?.name} — {session.selectedPersona?.title}</h2>
            <p className="text-xs text-emerald-100 font-semibold">🤖 SGC TECH AI · Stage: {getSDCTechStageLabel(session.currentStage as SDCTechCallStage)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Stage dots */}
            <div className="hidden md:flex items-center gap-1">
              {SDC_STAGES.map((s, i) => (
                <div key={s} className={`h-2 w-5 rounded-full transition-colors ${session.stagesReached.includes(s) ? 'bg-white' : i === SDC_STAGES.indexOf(session.currentStage as SDCTechCallStage) ? 'bg-emerald-200 animate-pulse' : 'bg-emerald-400/40'}`} />
              ))}
            </div>
            {session.isSpeaking && <Badge className="bg-white/20 text-white animate-pulse"><SpeakerHigh className="h-3 w-3 mr-1" weight="fill" />Speaking</Badge>}
            <Button variant="ghost" size="sm" className="h-8 text-white hover:bg-white/20" onClick={() => session.setTtsEnabled(!session.ttsEnabled)}>
              {session.ttsEnabled ? <SpeakerHigh className="h-4 w-4" /> : <SpeakerSlash className="h-4 w-4" />}
            </Button>
            <Button variant="destructive" size="sm" className="h-8 bg-red-500 hover:bg-red-600" onClick={session.endSession}>
              <Stop className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">End</span>
            </Button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-2">
          <Progress value={getSDCTechStageProgress(session.currentStage as SDCTechCallStage)} className="h-1.5 bg-emerald-400/40" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
            {session.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-md font-semibold'
                    : 'bg-white border-2 border-emerald-100 rounded-bl-md text-gray-800'
                }`}>
                  {msg.role === 'prospect' && session.isSpeaking && msg === session.messages[session.messages.length - 1] && (
                    <div className="flex items-center gap-1 mb-1 text-emerald-500">
                      <SpeakerHigh className="h-3 w-3 animate-pulse" weight="fill" />
                      <span className="text-xs font-bold">Speaking...</span>
                    </div>
                  )}
                  <p className="text-sm md:text-base leading-relaxed font-medium">{msg.content}</p>
                </div>
              </div>
            ))}

            {session.isTyping && session.selectedPersona && (
              <div className="flex justify-start">
                <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      {[0, 0.1, 0.2].map((d, i) => <div key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                    </div>
                    <span className="text-xs text-gray-500">{session.selectedPersona.name} is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={session.messagesEndRef} />
          </div>

          {/* Objection Coach */}
          {objCoach && (
            <div className="mx-3 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Enterprise Objection Coach — {objCoach.approach}:</p>
                  <p className="text-xs text-amber-700 mt-0.5 line-clamp-3">{objCoach.script.substring(0, 150)}...</p>
                </div>
              </div>
            </div>
          )}

          {/* Stage Hint */}
          {stageHint && 'script' in stageHint && (
            <div className="mx-3 mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
              <Info className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700 line-clamp-2">
                <span className="font-bold">Stage hint:</span> {interpolateHint((stageHint as { script: string }).script).substring(0, 120)}...
              </p>
            </div>
          )}

          {/* Input */}
          <div className="border-t bg-white shadow-lg p-3">
            <div className="max-w-4xl mx-auto flex gap-2">
              <Button variant="outline" size="icon" onClick={session.toggleListening}
                className={`shrink-0 h-10 w-10 ${session.isListening ? 'bg-red-50 border-red-300' : ''}`}>
                {session.isListening ? <MicrophoneSlash className="h-5 w-5 text-red-500" weight="fill" /> : <Microphone className="h-5 w-5" />}
              </Button>
              <input type="text" value={session.currentMessage}
                onChange={e => session.setCurrentMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && session.sendMessage()}
                placeholder="Type your enterprise AI/ERP sales pitch..."
                className="flex-1 px-4 py-2 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                disabled={session.isProcessing}
              />
              <Button onClick={session.sendMessage} disabled={!session.currentMessage.trim() || session.isProcessing}
                className="shrink-0 h-10 px-4 bg-emerald-600 hover:bg-emerald-700">
                {session.isProcessing ? '...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
