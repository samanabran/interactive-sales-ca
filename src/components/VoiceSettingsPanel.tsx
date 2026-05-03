/**
 * VoiceSettingsPanel — In-app TTS configuration
 * Enter your Edge TTS (Cloudflare Tunnel) URL once → stored in localStorage → permanent
 * Microsoft neural voices — 200+ options, completely free, no API key
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EdgeTTSService, edgeTTS } from '@/lib/edgeTtsService';
import { SpeakerHigh, Gear, CheckCircle, XCircle, X, Info } from '@phosphor-icons/react';

interface ProviderStatus {
  name: string;
  quality: string;
  available: boolean;
  note: string;
}

function getProviderStatuses(): ProviderStatus[] {
  const hasEdge = EdgeTTSService.isAvailable();
  const hasDeepgram = !!import.meta.env.VITE_DEEPGRAM_API_KEY;

  return [
    {
      name: 'Edge TTS (Microsoft Neural)',
      quality: '⭐⭐⭐⭐ Human-like, 200+ voices',
      available: hasEdge,
      note: hasEdge
        ? 'Active — primary voice (Cloudflare Tunnel)'
        : 'Enter your tunnel URL below to activate',
    },
    {
      name: 'Deepgram Aura-2',
      quality: '⭐⭐⭐ Professional backup',
      available: hasDeepgram,
      note: hasDeepgram ? 'Active — backup voice' : 'No Deepgram key configured',
    },
    {
      name: 'Browser Speech',
      quality: '⭐ Robotic last resort',
      available: true,
      note: 'Always available — used only if others fail',
    },
  ];
}

interface VoiceSettingsPanelProps {
  onClose: () => void;
}

export default function VoiceSettingsPanel({ onClose }: VoiceSettingsPanelProps) {
  const [serverUrl, setServerUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testError, setTestError] = useState('');
  const [statuses, setStatuses] = useState<ProviderStatus[]>([]);

  useEffect(() => {
    const stored = EdgeTTSService.getServerUrl();
    setServerUrl(stored || '');
    setStatuses(getProviderStatuses());
  }, []);

  const handleSave = () => {
    const url = serverUrl.trim();
    if (!url) return;
    EdgeTTSService.saveServerUrl(url);
    setSaved(true);
    setStatuses(getProviderStatuses());
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    EdgeTTSService.clearServerUrl();
    setServerUrl('');
    setStatuses(getProviderStatuses());
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError('');
    try {
      await edgeTTS.playText('Hello, I am your AI sales training partner.', 'en-US-AriaNeural');
      setTestResult('success');
    } catch (err) {
      setTestResult('error');
      setTestError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  const hasStoredUrl = !!EdgeTTSService.getServerUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-lg">
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

          <div>
            <h3 className="text-sm font-medium mb-1">
              Edge TTS Server URL <span className="text-green-600 text-xs">(Free — Microsoft Neural Voices)</span>
            </h3>
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 mb-3 text-xs text-blue-800 space-y-1">
              <p className="font-semibold flex items-center gap-1"><Info className="h-3 w-3" /> One-time Contabo setup (SSH):</p>
              <pre className="bg-blue-100 rounded p-2 text-xs overflow-x-auto">{`# Install cloudflared
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Expose Edge TTS as HTTPS (copy the URL it prints)
cloudflared tunnel --url http://localhost:5050`}</pre>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={serverUrl}
                onChange={(e) => { setServerUrl(e.target.value); setSaved(false); }}
                placeholder="https://xxxxx.trycloudflare.com"
                className="flex-1 text-sm rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <Button size="sm" onClick={handleSave} disabled={!serverUrl.trim()}>
                {saved ? '✓ Saved' : 'Save'}
              </Button>
              {hasStoredUrl && (
                <Button size="sm" variant="outline" onClick={handleClear}>Clear</Button>
              )}
            </div>
            {hasStoredUrl && (
              <div className="mt-3 flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={handleTest} disabled={testing}>
                  {testing ? 'Testing...' : '▶ Test Voice'}
                </Button>
                {testResult === 'success' && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Edge TTS working! Human voices active.
                  </span>
                )}
                {testResult === 'error' && (
                  <span className="text-xs text-red-600">✗ {testError || 'Check the URL'}</span>
                )}
              </div>
            )}
          </div>

          {hasStoredUrl && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Edge TTS URL saved. Microsoft neural voices active for all personas.
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

export function VoiceSettingsButton() {
  const [open, setOpen] = useState(false);
  const hasEdge = EdgeTTSService.isAvailable();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Voice Settings"
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm border border-border hover:bg-accent transition-colors"
      >
        <Gear className="h-4 w-4" />
        <span className={`text-xs font-medium ${hasEdge ? 'text-green-600' : 'text-amber-500'}`}>
          {hasEdge ? '● Human Voice' : '● Setup Voice'}
        </span>
      </button>
      {open && <VoiceSettingsPanel onClose={() => setOpen(false)} />}
    </>
  );
}
