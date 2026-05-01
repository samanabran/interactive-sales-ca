# B2B Voice Agents - EIGER MARVEL HR & SGC TECH AI
# ZERO COST - Using Free Google Gemini 3.1 Flash TTS + Edge TTS

## Overview
**ALL student/career references REMOVED.** This is now pure B2B sales training for:
1. **EIGER MARVEL HR** (HR Consultancy, Recruitment, Payroll, WPS Compliance)
2. **SGC TECH AI** (IT Services, Software Development, AI Solutions)

---

## B2B Decision-Maker Personas (NO Students!)

### EIGER MARVEL HR Personas (HR Consultancy/UAE)

| Persona Type | Name | Title | Voice Agent | Pain Points | Budget |
|--------------|------|-------|-------------|------------|--------|
| **hr-manager** | Ali Asghar | Charon (Professional male) | Manual recruitment, WPS penalties, scaling issues | AED 60-80k |
| **hr-business-owner** | Hania Khan | Kore (Enthusiastic female) | Competing with tech consultancies, manual work | AED 40-60k |
| **hr-finance-decider** | Katherine | Leda (Practical female) | Payroll penalties AED 5-10k/month, cash flow | AED 50-70k |

### SGC TECH AI Personas (IT/Software/AI)

| Persona Type | Name | Title | Voice Agent | Pain Points | Budget |
|--------------|------|-------|-------------|------------|--------|
| **tech-it-manager** | Technical Director | Algenib (Analytical male) | Manual CI/CD, no monitoring, security audits | AED 150-200k |
| **tech-business-owner** | CEO/Founder | Mintaka (Urgent male) | Losing enterprise deals, revenue stuck | AED 200-300k |
| **tech-operations** | Head of Operations | Fenrir (Practical male) | 3-6 month delivery, no reuse, team burnout | AED 100-150k |

---

## Voice Agents Configuration (Gemini 3.1 Flash TTS - FREE)

### Male Voices (Gemini - Human-Like)

| Voice | Persona | Style Prompt |
|-------|---------|--------------|
| **Charon** | HR Manager (Ali) | "Speak professionally and confidently, like a business executive in Dubai" |
| **Puck** | Skeptical Buyer | "Speak thoughtfully and analytically, with a measured pace" |
| **Fenrir** | Operations Manager | "Speak directly and practically, focused on value and efficiency" |
| **Algenib** | IT Manager | "Speak technically and precisely, using terms like Kubernetes, Docker, API" |
| **Mintaka** | CEO/Business Owner | "Speak with urgency and decisiveness, ready to take action" |

### Female Voices (Gemini - Human-Like)

| Voice | Persona | Style Prompt |
|-------|---------|--------------|
| **Kore** | HR Future Partner (Hania) | "Speak enthusiastically about AI in recruitment" |
| **Leda** | Finance Manager (Katherine) | "Speak with CFO mindset, demand ROI calculator and money-back guarantee" |
| **Vindemiatrix** | Business Executive | "Speak professionally and directly, business-focused" |
| **Phecda** | Technical Expert | "Speak technically about AI agents and automation" |

---

## How To Use - Company Selection

### Step 1: Choose Your Training Company
```typescript
import { CompanyType } from './companySelector';

// User selects in UI:
const selectedCompany: CompanyType = 'eiger-marvel-hr'; // or 'sgc-tech-ai'
```

### Step 2: Select Persona Type
```typescript
import { B2BPersonaType } from './aiRolePlayService';

// For EIGER MARVEL HR:
const persona: B2BPersonaType = 'hr-manager'; // or 'hr-business-owner', 'hr-finance-decider'

// For SGC TECH AI:
const persona: B2BPersonaType = 'tech-it-manager'; // or 'tech-business-owner', 'tech-operations'
```

### Step 3: Generate Voice Response
```typescript
import { geminiTTS } from './geminiTTSService';
import { getVoiceAgentForB2BPersona } from './voiceAgentConfig';

// Get voice for persona
const agent = getVoiceAgentForB2BPersona(selectedCompany, personaType);

// Generate speech
const audioBlob = await geminiTTS.generateSpeech(
  "I'm concerned about the implementation timeline. Our last ERP took 6 months.",
  {
    voice: agent.voice,
    stylePrompt: agent.stylePrompt // e.g., "Speak as a professional operations manager in Dubai"
  }
);
```

---

## Realistic B2B Scenarios (NO Students!)

### EIGER MARVEL HR Scenarios

| Scenario | Prospect | Real Objection |
|----------|----------|-----------------|
| **Recruitment Automation** | Ali (Operations Manager) | "We're using Excel for 50+ placements. How can you automate without disruption?" |
| **Payroll & WPS Compliance** | Katherine (Finance) | "We're getting AED 5-10k penalties monthly. Show me ROI calculator and money-back guarantee." |
| **Scaling Consultancy** | Hania (Future Partner) | "We want to compete with larger firms. Can AI help us screen candidates 10x faster?" |
| **14-Day Deployment** | Ali (Operations) | "You say 14 days, but our last system took 6 months. Prove it with a demo." |

### SGC TECH AI Scenarios

| Scenario | Prospect | Real Objection |
|----------|----------|-----------------|
| **AI Customer Support** | Technical Director | "Show me API docs. How does it handle 100k+ transactions? Need production reliability." |
| **Winning Enterprise Deals** | CEO (Founder) | "We're stuck at AED 1.5M revenue. How can AI agents help us win 3 enterprise clients by Q3?" |
| **CI/CD Automation** | IT Manager | "Our deployments take 3-6 months. Show me Kubernetes setup and Docker architecture." |
| **Project Delivery Speed** | Operations Head | "We need to reduce delivery from 6 months to 6 weeks. Let's do a pilot first." |

---

## Cost Breakdown (ZERO COST!)

| Service | Cost | Quality | Voices | Notes |
|---------|------|---------|--------|-------|
| **Gemini 3.1 Flash TTS** | **FREE (Tier)** | ⭐⭐⭐⭐⭐ | 30+ | Human-like, 70+ languages, 200+ audio tags |
| **Edge TTS (Backup)** | **FREE (Unlimited)** | ⭐⭐⭐ | 200+ | No API key, OpenAI-compatible API |
| **Ollama (Contabo GPU)** | **FREE (Local)** | ⭐⭐⭐⭐ | - | llama3.1:8b for LLM, not TTS |
| **ElevenLabs** | $5-99/month | ⭐⭐⭐⭐⭐ | 1200+ | NOT USED - Too expensive |

**Total Voice Agent Cost: $0** 🎉

---

## Files Created/Modified

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/b2bPersonas.ts` | B2B personas (NO students!) | ✅ NEW |
| `src/lib/companySelector.ts` | Choose EIGER MARVEL HR or SGC TECH AI | ✅ NEW |
| `src/lib/aiRolePlayService.ts` | B2B role-play logic (REWRITTEN) | ✅ REPLACED |
| `src/lib/voiceAgentConfig.ts` | B2B voice agents (UPDATED) | ✅ UPDATED |
| `src/lib/geminiTTSService.ts` | Gemini 3.1 Flash TTS (FREE) | ✅ NEW |
| `src/lib/edgeTtsService.ts` | Backup Edge TTS (FREE) | ✅ NEW |
| `contabo-deployment/tts_server.py` | TTS server on Contabo (port 5050) | ✅ NEW |
| `contabo-deployment/docker-compose.yml` | Contabo deployment (UPDATED) | ✅ UPDATED |

**ALL student references RE MOVED.** Pure B2B training now.

---

## Next Steps

1. ✅ **Get free Gemini API key**: https://ai.google.dev/
2. ✅ **Add to `.env`**: `VITE_GEMINI_API_KEY=AIzaSy...`
3. ✅ **Deploy Edge TTS on Contabo**: `docker-compose up -d tts-server`
4. ✅ **Test B2B scenarios** in browser
5. ✅ **Select company**: EIGER MARVEL HR or SGC TECH AI
6. ✅ **Train on real objections**: "Show me ROI", "Prove 14-day deployment", "We're talking to SAP too"

---

## Voice Agent Commands (Contabo)

### Check TTS Server (Backup)
```bash
ssh -i ~/.ssh/contabo_80_241_218_108 root@80.241.218.108

# Check Edge TTS server
curl http://localhost:5050/

# View logs
docker logs -f scholarix-tts-server

# Restart if needed
docker restart scholarix-tts-server
```

### Test Gemini TTS (Primary - FREE)
```bash
# Test API directly
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "[Voice: Charon]\n[Style: Speak as Dubai operations manager]\nHello, this is Ali from EIGER MARVEL HR."}]},
    "generationConfig": {
      "responseModalities": ["AUDIO"],
      "speechConfig": {
        "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Charon"}}
      }
    }
  }'
```

---

**NO MORE STUDENTS. ONLY B2B DECISION-MAKERS.** 🎯
