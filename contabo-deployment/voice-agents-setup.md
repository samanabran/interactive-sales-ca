# Voice Agents Setup Guide - Zero Cost

## Overview
This project uses **FREE voice agents** for AI role-play and practice calls. No ElevenLabs or paid TTS services needed!

## Voice Agents Available (30+ Human-Like Voices)

### Primary: Google Gemini 3.1 Flash TTS (FREE TIER)
- **Cost:** $0 - Free tier with generous limits
- **Quality:** Human-like, competes with ElevenLabs
- **Voices:** 30+ prebuilt voices
- **Languages:** 70+ supported
- **Features:**
  - 200+ audio tags for emotion control
  - Multi-speaker dialogue support
  - Natural language style prompts
  - 24kHz PCM output

### Backup: Microsoft Edge TTS (COMPLETELY FREE)
- **Cost:** $0 - No API key required
- **Voices:** 200+ voices
- **Languages:** 40+ languages
- **Endpoint:** `http://80.241.218.108:5050`
- **API:** OpenAI-compatible `/v1/audio/speech`

### Local: Ollama (Your Contabo GPU)
- **Cost:** $0 - Unlimited local usage
- **Models:** llama3.1:8b, llama3.2:3b
- **Endpoint:** `http://80.241.218.108:11434`

---

## Quick Setup

### 1. Get Gemini API Key (FREE)
```bash
# Visit: https://ai.google.dev/
# Create project → Get API key
# Free tier: Generous limits for development
```

Add to `.env`:
```env
VITE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
```

### 2. Deploy TTS Server on Contabo (Backup)
```bash
# SSH to Contabo
ssh -i ~/.ssh/contabo_80_241_218_108 root@80.241.218.108

# Deploy Edge TTS server
cd /opt/interactive-sales-ca
docker-compose -f contabo-deployment/docker-compose.yml up -d tts-server

# Verify
curl http://localhost:5050/
```

### 3. Test Voices
```bash
# List Gemini voices (via code)
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Hello, this is a test."}]},
    "generationConfig": {
      "responseModalities": ["AUDIO"],
      "speechConfig": {
        "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Charon"}}
      }
    }
  }'
```

---

## Voice Agent Configuration

### Persona → Voice Mapping

| Persona | Voice Agent | Gender | Style |
|---------|-------------|--------|-------|
| **eager-student** | Kore (Enthusiastic female) | Female | Supportive, eager to learn |
| **skeptical-parent** | Schedar (Mature female) | Female | Cautious, thoughtful |
| **price-sensitive** | Fenrir (Direct male) | Male | Budget-conscious, practical |
| **busy-professional** | Orus (Efficient male) | Male | Time-conscious, results-driven |
| **friendly-neighbor** | Alnilam (Warm male) | Male | Approachable, neighborly |
| **technical-expert** | Algenib (Analytical male) | Male | Precise, detail-oriented |
| **urgent-buyer** | Mintaka (Urgent male) | Male | Quick decision-maker |

### Voice Agents Available (17 Preconfigured)

**Male Voices (Gemini):**
1. **Charon** - Professional, confident (Business executive)
2. **Puck** - Thoughtful, analytical (Skeptical prospect)
3. **Fenrir** - Direct, practical (Price-conscious)
4. **Orus** - Efficient, results-driven (Busy professional)
5. **Alnilam** - Warm, approachable (Friendly neighbor)
6. **Algenib** - Analytical, precise (Technical expert)
7. **Mintaka** - Urgent, decisive (Fast buyer)

**Female Voices (Gemini):**
1. **Kore** - Enthusiastic, supportive (Eager student)
2. **Schedar** - Mature, cautious (Skeptical parent)
3. **Leda** - Practical, value-focused (Budget-conscious)
4. **Vindemiatrix** - Professional, direct (Executive)
5. **Achalmar** - Friendly, conversational (Warm neighbor)
6. **Phecda** - Technical, precise (Expert)
7. **Aludra** - Decisive, action-oriented (Urgent buyer)

---

## Usage in Code

### Generate Speech with Voice Agent
```typescript
import { geminiTTS } from '../lib/geminiTTSService';
import { getVoiceAgentForPersona } from '../lib/voiceAgentConfig';

// Get voice for persona
const agent = getVoiceAgentForPersona('skeptical-parent');

// Generate speech
const audioBlob = await geminiTTS.generateSpeech(
  "I'm not sure this is the right time for us to invest.",
  {
    voice: agent.voice,
    stylePrompt: agent.stylePrompt
  }
);
```

### Multi-Speaker Role-Play
```typescript
import { geminiTTS } from '../lib/geminiTTSService';

// Sales rep (you) + Prospect (AI)
const dialogue = await geminiTTS.generateMultiSpeaker({
  speaker1: {
    voice: 'Charon',  // Rep
    text: "Hi! I'd love to show you how Scholarix can help."
  },
  speaker2: {
    voice: 'Schedar',  // Prospect
    text: "I'm quite busy, but okay, what's this about?"
  },
  stylePrompt: 'Natural conversation between sales rep and prospect'
});
```

---

## Cost Comparison

| Service | Cost | Quality | Setup |
|---------|------|---------|-------|
| **Gemini 3.1 Flash TTS** | **FREE (tier)** | ⭐⭐⭐⭐⭐⭐ | Easy (API key) |
| **Edge TTS (Backup)** | **FREE (unlimited)** | ⭐⭐⭐⭐ | Medium (Contabo) |
| **ElevenLabs** | $5-99/month | ⭐⭐⭐⭐⭐ | Easy |
| **OpenAI TTS** | Pay per character | ⭐⭐⭐⭐ | Easy |

---

## Deployment Checklist

- [ ] Get free Gemini API key from https://ai.google.dev/
- [ ] Add `VITE_GEMINI_API_KEY` to `.env`
- [ ] Deploy Edge TTS server on Contabo (port 5050)
- [ ] Test voice generation in browser
- [ ] Configure `voiceAgentConfig.ts` for your personas
- [ ] Update `aiRolePlayService.ts` to use new voice agents
- [ ] Test multi-speaker role-play conversations

---

## Troubleshooting

### Gemini TTS not working
```bash
# Check API key
echo $VITE_GEMINI_API_KEY

# Test API directly
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
```

### Edge TTS server not responding
```bash
# Check container
docker ps | grep tts-server
docker logs scholarix-tts-server

# Restart if needed
docker restart scholarix-tts-server
```

### Voice sounds robotic
- Check you're using Gemini 3.1 Flash TTS (not older models)
- Adjust `stylePrompt` for more natural speech
- Try different voice agents for variety
- Use `temperature: 1.0` for more expressiveness

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/geminiTTSService.ts` | Gemini 3.1 Flash TTS integration |
| `src/lib/edgeTtsService.ts` | Backup Edge TTS service |
| `src/lib/voiceAgentConfig.ts` | Voice agent configuration |
| `contabo-deployment/Dockerfile.tts-server` | TTS server container |
| `contabo-deployment/tts_server.py` | Python TTS server (Edge TTS) |
| `contabo-deployment/voice-agents-setup.md` | This guide |

---

## Next Steps

1. Get your free Gemini API key today
2. Test the 30+ voices in AI Studio: https://aistudio.google.com/
3. Deploy TTS server on Contabo for backup
4. Update your role-play system to use voice agents
5. Enjoy **ZERO COST** human-like voice generation!

---

**Total Cost for Voice Agents: $0** 🎉
