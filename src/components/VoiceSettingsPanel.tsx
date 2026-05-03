/**
 * VoiceSettingsPanel — In-app TTS configuration
 * Users enter their Gemini API key once → stored in localStorage → permanent
 * No rebuild or redeployment needed when adding/changing keys
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GeminiTTSService } from '@/lib/geminiTTSService';
import { SpeakerHigh, Gear, CheckCircle, XCircle, Warning, X } from '@phosphor-icons/react';

interface ProviderStatus {
  name: string;
  quality: string;
  available: boolean;
  note: string;
}

function getProviderStatuses(): ProviderStatus[] {
  const hasGemini = !!(
    (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) ||
    import.meta.env.VITE_GEMINI_API_KEY
  );
  const hasDeepgram = !!import.meta.env.VITE_DEEPGRAM_API_KEY;
  const hasKokoro = !!import.meta.env.VITE_KOKORO_TTS_URL;

  return [
    {
      name: 'Gemini 2.5 Flash',
      quality: '⭐⭐⭐⭐⭐ Most human-like',
      available: hasGemini,
      note: hasGemini ? 'Active — primary voice' : 'Needs free API key (see below)',
    },
    {
      name: 'Kokoro TTS',
      quality: '⭐⭐⭐⭐⭐ Near-ElevenLabs',
      available: hasKokoro,
      note: hasKokoro ? 'Active — self-hosted' : 'Deploy on Contabo (see setup-kokoro.sh)',
    },
    {
      name: 'Deepgram Aura-2',
      quality: '⭐⭐⭐ Professional',
      available: hasDeepgram,
      note: hasDeepgram ? 'Active — backup voice' : 'Needs Deepgram API key',
    },
    {
      name: 'Browser Speech',
      quality: '⭐ Robotic fallback',
      available: true,
      note: 'Always available — last resort',
    },
  ];
}

interface VoiceSettingsPanelProps {
  onClose: () => void;
}

export default function VoiceSettingsPanel({ onClose }: VoiceSettingsPanelProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [statuses, setStatuses] = useState<ProviderStatus[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key') || '';
    setGeminiKey(stored ? '••••••••••••••••••••••••' : '');
    setStatuses(getProviderStatuses());
  }, []);

  const handleSave = async () => {
    const key = geminiKey.trim();
    if (!key || key.startsWith('•')) return;

    GeminiTTSService.saveApiKey(key);
    setSaved(true);
    setStatuses(getProviderStatuses());
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    GeminiTTSService.clearApiKey();
    setGeminiKey('');
    setStatuses(getProviderStatuses());
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const svc = new GeminiTTSService();
      await svc.playText('Hello, I am your AI sales training partner.', {
        voice: 'Charon',
        stylePrompt: 'Speak naturally and clearly as a professional.',
      });
      setTestResult('success');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const hasStoredKey = !!localStorage.getItem('gemini_api_key');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <SpeakerHigh className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Voice Settings</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Provider Status */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Voice Provider Status</h3>
            <div className="space-y-2">
              {statuses.map((s) => (
                <div key={s.name} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  {s.available ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${s.available ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.quality}</p>
                    <p className={`text-xs mt-0.5 ${s.available ? 'text-green-600' : 'text-amber-600'}`}>{s.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini API Key Input */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              Gemini API Key <span className="text-green-600 text-xs">(Free — best quality)</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get a free key at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                aistudio.google.com/app/apikey
              </a>{' '}
              → Create API key → Copy & paste below.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={geminiKey}
                onChange={(e) => {
                  setGeminiKey(e.target.value);
                  setSaved(false);
                }}
                onFocus={() => {
                  if (geminiKey.startsWith('•')) setGeminiKey('');
                }}
                placeholder="AIza..."
                className="flex-1 text-sm rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <Button size="sm" onClick={handleSave} disabled={!geminiKey || geminiKey.startsWith('•')}>
                {saved ? '✓ Saved' : 'Save'}
              </Button>
              {hasStoredKey && (
                <Button size="sm" variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>

            {/* Test button */}
            {hasStoredKey && (
              <div className="mt-3 flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={handleTest} disabled={testing}>
                  {testing ? 'Testing...' : '▶ Test Voice'}
                </Button>
                {testResult === 'success' && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Gemini TTS working!
                  </span>
                )}
                {testResult === 'error' && (
                  <span className="text-xs text-red-600 flex items-center gap-1">
                    <Warning className="h-3 w-3" /> Check your API key
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Key is saved notice */}
          {hasStoredKey && !saved && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Gemini API key saved in browser. Human-like voices are active.
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          <Button className="w-full" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

/** Small gear icon button to open the settings panel */
export function VoiceSettingsButton() {
  const [open, setOpen] = useState(false);
  const hasGemini = !!(
    (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) ||
    import.meta.env.VITE_GEMINI_API_KEY
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Voice Settings"
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm border border-border hover:bg-accent transition-colors"
      >
        <Gear className="h-4 w-4" />
        <span className={`text-xs font-medium ${hasGemini ? 'text-green-600' : 'text-amber-500'}`}>
          {hasGemini ? '● Human Voice' : '● Setup Voice'}
        </span>
      </button>
      {open && <VoiceSettingsPanel onClose={() => setOpen(false)} />}
    </>
  );
}
