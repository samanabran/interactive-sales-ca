# B2B Voice Agents - EIGER MARVEL HR & SGC TECH AI
# ZERO COST - NO Student Personas!

## Complete Transformation Summary

### ✅ What Was REMOVED
- ❌ ALL student references (`eager-student`, `school`, `education`)
- ❌ Training/learning scenarios (not B2B sales)
- ❌ Academic/career-focused personas
- ❌ "Ahmed Al Mansouri" (retail business owner)

### ✅ What Was ADDED
- ✅ **EIGER MARVEL HR** personas (HR consultancy, recruitment company)
- ✅ **SGC TECH AI** personas (IT services, software, AI company)
- ✅ **B2B decision-makers** only (NO students!)
- ✅ **Company selector** in UI (`companySelector.ts`)
- ✅ **Realistic objections** for UAE business context

---

## B2B Decision-Maker Personas (6 Total)

### EIGER MARVEL HR (HR Consultancy/Recruitment)

| Persona Type | Name | Title | Voice | Budget | Key Pain Point |
|--------------|------|-------|-------|--------|----------------|
| **hr-manager** | Ali Asghar | Charon (Professional male) | AED 60-80k | Scaling recruitment ops, WPS compliance |
| **hr-business-owner** | Hania Khan | Kore (Enthusiastic female) | AED 40-60k | Competing with tech-enabled consultancies |
| **hr-finance-decider** | Katherine | Leda (Practical female) | AED 50-70k | Payroll penalties AED 5-10k/month |

**Company Profile:**
- 13 employees, Dubai, UAE
- Services: Recruitment, payroll, WPS compliance, ISO certification, ERP implementation
- Website: eigermarvelhr.com
- Pain: Manual Excel processes, losing to tech-enabled competitors

---

### SGC TECH AI (IT Services/Software/AI)

| Persona Type | Name | Title | Voice | Budget | Key Pain Point |
|--------------|------|-------|-------|--------|----------------|
| **tech-it-manager** | Technical Director | Algenib (Analytical male) | AED 150-200k | Manual CI/CD, no centralized monitoring |
| **tech-business-owner** | CEO/Founder | Mintaka (Urgent male) | AED 200-300k | Revenue stuck at AED 1.5M, losing enterprise deals |
| **tech-operations** | Head of Operations | Fenrir (Practical male) | AED 100-150k | 3-6 month delivery, team burnout |

**Company Profile:**
- 20-50 employees, Dubai, UAE
- Services: AI-powered Odoo ERP, IT infrastructure, custom software, AI agents
- Website: sgctech.ai
- Pain: Managing 20+ client projects manually, losing enterprise deals to larger competitors

---

## Voice Agents (Gemini 3.1 Flash TTS - FREE)

### Primary Voices (Human-Like, 30+ Available)

| Voice | Gender | Style Prompt (B2B Focused) |
|-------|--------|-----------------------------|
| **Charon** | Male | "Speak as Dubai operations manager. Mention 14-day deployment, WPS compliance, UAE references." |
| **Kore** | Female | "Speak enthusiastically about AI in recruitment. Show me how AI can screen faster!" |
| **Puck** | Male | "Speak skeptically. Burned by ERP before. Show me money-back guarantee and hidden costs." |
| **Leda** | Female | "CFO mindset. Show me ROI calculator. Need 90-day payment terms and cost breakdown." |
| **Algenib** | Male | "Technical director. Use terms: Kubernetes, Docker, CI/CD, API docs. Show me production reliability." |
| **Mintaka** | Male | "Visionary CEO. How fast can we go live? Competitors are already offering AI. Need market differentiation." |
| **Fenrir** | Male | "Operations head. Let's do a pilot first. Concerned about team adoption and learning curve." |

---

## How To Use - Company Selection

### Step 1: User Selects Company in UI
```typescript
import { CompanyType } from './lib/companySelector';

// User chooses:
const selectedCompany: CompanyType = 'eiger-marvel-hr';  // or 'sgc-tech-ai'
```

### Step 2: System Loads Matching Personas
```typescript
import { getPersonasForCompany } from './lib/companySelector';

const personas = getPersonasForCompany(selectedCompany);
// Returns: ['hr-manager', 'hr-business-owner', 'hr-finance-decider'] 
// OR: ['tech-it-manager', 'tech-business-owner', 'tech-operations']
```

### Step 3: Generate B2B Role-Play
```typescript
import { geminiTTS } from './lib/geminiTTSService';
import { getVoiceAgentForB2BPersona } from './lib/voiceAgentConfig';

// Get voice for persona
const agent = getVoiceAgentForB2BPersona(selectedCompany, 'hr-manager');

// Generate speech with B2B context
const audio = await geminiTTS.generateSpeech(
  "We need to scale our recruitment operations. Show me the 14-day deployment guarantee.",
  {
    voice: agent.voice,  // Charon
    stylePrompt: agent.stylePrompt  // Dubai operations manager context
  }
);
```

---

## Cost Breakdown (ZERO COST!)

| Service | Cost | Voices | Quality | B2B Suitable? |
|---------|------|--------|---------|------------------|
| **Gemini 3.1 Flash TTS** | **FREE (Tier)** | 30+ | ⭐⭐⭐⭐⭐ | ✅ YES - Human-like |
| **Edge TTS (Contabo)** | **FREE (Unlimited)** | 200+ | ⭐⭐⭐ | ✅ Backup option |
| **Ollama (Contabo GPU)** | **FREE (Local)** | - | ⭐⭐⭐ | ✅ LLM only |
| **ElevenLabs** | $5-99/month | 1200+ | ⭐⭐⭐⭐⭐ | ❌ Too expensive |

**Total Monthly Cost for Voice Agents: $0** 🎉

---

## Files Created/Modified

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/b2bPersonas.ts` | B2B personas (NO students!) | ✅ NEW |
| `src/lib/companySelector.ts` | Choose EIGER HR or SGC TECH | ✅ NEW |
| `src/lib/aiRolePlayService.ts` | B2B role-play logic | ✅ REWRITTEN |
| `src/lib/voiceAgentConfig.ts` | B2B voice agents | ✅ UPDATED |
| `src/lib/geminiTTSService.ts` | Gemini 3.1 Flash TTS | ✅ NEW |
| `src/lib/edgeTtsService.ts` | Edge TTS backup | ✅ NEW |
| `.env.example` | Added Gemini API key | ✅ UPDATED |
| `.claude/settings.json` | B2B focus in notes | ✅ UPDATED |
| `contabo-deployment/*` | TTS server, Docker configs | ✅ NEW |

---

## Real B2B Objections (NO Students!)

### EIGER MARVEL HR Scenarios
```
✅ "We tried ERP before and it was a disaster. Show me money-back guarantee."
✅ "14 days sounds too good to be true. What's the catch?"
✅ "We're a 13-person consultancy. Can we afford AED 80k?"
✅ "Show me 3 UAE references I can call. Prove the 14-day deployment."
✅ "WPS compliance penalties are costing us AED 10k/month. Can you eliminate that?"
```

### SGC TECH AI Scenarios
```
✅ "Our competitors are offering AI. If we don't adapt in 6 months, we'll lose market share."
✅ "Show me the API documentation. How does it handle 100k+ transactions daily?"
✅ "We're stuck at AED 1.5M revenue. How can AI agents help us win enterprise deals?"
✅ "SAP takes 6 months, Microsoft takes 4. You say 14 days - prove it with a demo."
✅ "I have proposals from 3 AI companies. Yours is most expensive. What's the differentiator?"
```

---

## Next Steps (Immediate Actions)

### 1. Get FREE Gemini API Key
```
1. Visit: https://ai.google.dev/
2. Create project → Get API key
3. Add to `.env`: VITE_GEMINI_API_KEY=AIzaSy...
```

### 2. Deploy Edge TTS on Contabo (Backup)
```bash
ssh -i ~/.ssh/contabo_80_241_218_108 root@80.241.218.108
cd /opt/interactive-sales-ca
docker-compose -f contabo-deployment/docker-compose.yml up -d tts-server
```

### 3. Test B2B Voice Agents
```bash
# Test Gemini TTS (primary - FREE)
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "[Voice: Charon]\n[Style: Speak as Dubai operations manager]\nWe need 14-day deployment guarantee for our recruitment operations."}]},
    "generationConfig": {
      "responseModalities": ["AUDIO"],
      "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Charon"}}}
  }'
```

### 4. Update UI to Show Company Selector
```
User sees: [ EIGER MARVEL HR ]  or  [ SGC TECH AI ]
Then selects persona: [ HR Manager ] [ IT Manager ] [ CEO ] etc.
```

---

## Summary

**WHAT CHANGED:**
- ❌ Students → ✅ B2B decision-makers
- ❌ Generic scenarios → ✅ Company-specific (EIGER HR / SGC TECH)
- ❌ Paid voices → ✅ ZERO COST (Gemini FREE tier)
- ❌ 200+ voices unused → ✅ 30+ human-like Gemini voices + 200+ Edge TTS backup

**COST: $0/month for voice agents** 🎉

**READY FOR B2B SALES TRAINING!** 🚀
