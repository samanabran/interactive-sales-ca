# Claude Code Prompt - Build B2B Voice Agent System
# EIGER MARVEL HR & SGC TECH AI Training Platform
# ZERO COST - NO Student Personas!

/superpowers:writing-plans/

Create a comprehensive B2B sales training platform with voice agents for interactive-sales-ca project.

## Context
- Project: D:/01_WORK_PROJECTS/odoo_apps_posting/interactive-sales-ca
- Target Companies: EIGER MARVEL HR (HR consultancy/recruitment) & SGC TECH AI (IT/software/AI)
- NO student personas - only B2B decision-makers
- Voice Stack: Google Gemini 3.1 Flash TTS (FREE tier, 30+ human-like voices) + Edge TTS backup (FREE, 200+ voices, Contabo :5050)
- Target: Real B2B decision-makers (HR managers, Operations managers, Finance directors, IT managers, CEOs)

## Files Already Created (DO NOT recreate, just integrate):
1. `src/lib/b2bPersonas.ts` - B2B personas (6 total: 3 per company)
2. `src/lib/companySelector.ts` - Company selection (EIGER MARVEL HR / SGC TECH AI)
3. `src/lib/voiceAgentConfig.ts` - Voice agent mapping (Gemini voices + Edge TTS fallback)
4. `src/lib/aiRolePlayService.ts` - B2B role-play logic (REWRITTEN - no students!)
5. `src/lib/geminiTTSService.ts` - Gemini 3.1 Flash TTS integration (FREE)
6. `src/lib/edgeTtsService.ts` - Edge TTS backup service (FREE, no API key)
7. `contabo-deployment/docker-compose.yml` - Contabo deployment (UPDATED with TTS server)
8. `contabo-deployment/tts_server.py` - Edge TTS server (port 5050)
9. `contabo-deployment/Dockerfile.tts-server` - TTS container
10. `.env.example` - UPDATED with Gemini API key + voice server URLs
11. `.claude/settings.json` - UPDATED with B2B focus + Google Gemini MCP
12. `voice-agents-b2b-summary.md` - Documentation of all changes
13. `B2B_VOICE_AGENTS_SUMMARY.md` - Complete transformation summary

## Tasks to Execute:

### Phase 1: Frontend Company Selector UI
Create a company selector component that allows users to choose:
- [ ] `src/components/CompanySelector.tsx` - Company selection UI (EIGER MARVEL HR / SGC TECH AI)
  - Show company logo/icon (🇦🇪 / 🤖)
  - Show company description and target clients
  - Color-coded (Blue for EIGER, Green for SGC TECH)
  - Store selection in React context or state

### Phase 2: Persona Selection UI
Update existing persona selection to use B2B personas:
- [ ] Modify `src/components/AIRolePlayPractice.tsx` to:
  - Show only B2B personas based on selected company
  - For EIGER MARVEL HR: HR Manager (Ali), Business Owner (Hania), Finance Decider (Katherine)
  - For SGC TECH AI: IT Manager (Technical Director), Business Owner (CEO), Operations Manager
  - Display persona details: name, title, pain points, budget range
  - Show voice agent mapping (which Gemini voice will speak)

### Phase 3: Voice Agent Integration
Connect voice agents to role-play system:
- [ ] Update `src/lib/aiRolePlayService.ts` to:
  - Use `geminiTTSService.ts` for primary TTS (Gemini 3.1 Flash TTS)
  - Fallback to `edgeTtsService.ts` if Gemini fails
  - Pass `stylePrompt` from voice config to Gemini for realistic speech
  - Generate multi-speaker conversations (sales rep vs. prospect)

- [ ] Create `src/lib/voicePlayer.ts` utility:
  - Play audio from Gemini TTS (blob to Audio element)
  - Handle playback states (play/pause/stop)
  - Show waveform visualization during playback
  - Allow re-play of prospect responses

### Phase 4: B2B Scenario Scripts
Create realistic B2B training scenarios:
- [ ] `src/lib/b2bScenarios.ts`:
  - For EIGER MARVEL HR:
    - "Recruitment automation pitch" (target: Ali - Operations Manager)
    - "Payroll + WPS compliance demo" (target: Katherine - Finance)
    - "14-day deployment guarantee" (target: Ali)
    - "ROI calculator for HR consultancy" (target: Katherine)
  - For SGC TECH AI:
    - "AI customer support automation" (target: Technical Director)
    - "Winning enterprise deals with AI" (target: CEO/Founder)
    - "CI/CD pipeline automation" (target: IT Manager)
    - "Custom AI agent development" (target: Operations Manager)

### Phase 5: Update Existing Components
Modify current components to use B2B system:
- [ ] `src/components/CallApp.tsx` - Add company context to calls
- [ ] `src/components/ScriptDisplay.tsx` - Show B2B scripts based on company
- [ ] `src/components/TranscriptionDisplay.tsx` - Analyze B2B conversations
- [ ] `src/pages/RolePlayPage.tsx` - Route to B2B role-play only

### Phase 6: Environment & Config
Ensure all configs are properly set:
- [ ] Verify `.env.example` has all needed vars:
  - `VITE_GEMINI_API_KEY=` (free from https://ai.google.dev/)
  - `VITE_TTS_SERVER_URL=http://80.241.218.108:5050` (Contabo Edge TTS)
  - `VITE_OLLAMA_BASE_URL=http://80.241.218.108:11434` (Contabo GPU)
- [ ] Update `CLAUDE.md` to reflect B2B focus (already partially done)
- [ ] Create `.env` from `.env.example` (user must add real Gemini API key)

### Phase 7: Contabo Deployment
Prepare Contabo for voice agents:
- [ ] Ensure `contabo-deployment/docker-compose.yml` has:
  - TTS server (Edge TTS on port 5050)
  - Ollama (GPU LLM on port 11434)
  - All services on `contabo-network`
- [ ] Add deployment instructions to `contabo-deployment/README.md`:
  - How to deploy TTS server: `docker-compose up -d tts-server`
  - How to verify: `curl http://localhost:5050/`
  - How to test Gemini TTS: `curl -X POST ...`

### Phase 8: Mobile Call Recording & Transcription
Add real call recording for mobile with transcription:
- [ ] Create `src/hooks/useMobileRecorder.ts`:
  - Use RecordRTC or MediaStream Recording API
  - Support WAV format (16kHz, mono, 16-bit) for Whisper
  - Handle mobile browser permissions (iOS Safari, Android Chrome)
  - Stream audio to server or process locally

- [ ] Create `src/lib/transcriptionService.ts`:
  - Primary: Gemini 3.1 Flash Speech-to-Text (FREE - https://ai.google.dev/)
  - Backup: Local Whisper.cpp on Contabo GPU (FREE, no API)
  - Process uploaded audio files (WAV/MP3)
  - Return transcript with timestamps

- [ ] Update `src/components/CallApp.tsx`:
  - Add "Record Call" button for mobile
  - Show recording indicator and timer
  - Upload to Contabo for transcription (or process in browser)
  - Display transcript with prospect responses

- [ ] Create `contabo-deployment/Dockerfile.whisper`:
  - Whisper.cpp container for local transcription (FREE)
  - GPU acceleration on Contabo
  - HTTP API endpoint compatible with OpenAI Whisper API

### Phase 9: Testing & Verification
Test the complete B2B voice agent system:
- [ ] Create `src/test/voiceAgentTest.ts`:
  - Test Gemini TTS with B2B personas (Charon, Kore, Puck, Leda, etc.)
  - Test Edge TTS fallback (if Gemini fails)
  - Test multi-speaker conversations (sales rep vs. prospect)
  - Test all 6 B2B personas with their voice agents
- [ ] Verify no student references remain:
  - Search for "eager-student", "school", "education" in all files
  - Ensure ALL references replaced with B2B personas
- [ ] Test mobile recording:
  - Record audio on mobile browser
  - Upload and transcribe with Gemini (FREE)
  - Verify transcript accuracy

## Acceptance Criteria:
1. [ ] User can select EIGER MARVEL HR or SGC TECH AI as training company
2. [ ] User sees only B2B personas (NO students)
3. [ ] Voice agents use Gemini 3.1 Flash TTS (FREE, human-like)
4. [ ] Fallback to Edge TTS on Contabo (FREE, no API key)
5. [ ] Multi-speaker role-play works (sales rep vs. prospect)
6. [ ] All 6 B2B personas have matching voice agents
7. [ ] Realistic B2B objections ("Show me ROI", "14-day guarantee", "We tried ERP before")
8. [ ] Contabo deployment ready (TTS server on port 5050)
9. [ ] Mobile call recording works (RecordRTC/MediaStream API)
10. [ ] Transcription via Gemini Speech-to-Text (FREE) or local Whisper.cpp
11. [ ] Zero cost for voice agents (Gemini free tier + Edge TTS free)
12. [ ] NO student/career/school references anywhere in codebase

## Execution Order:
1. Phase 1 (Company Selector UI) - 1 hour
2. Phase 2 (Persona Selection UI) - 1 hour
3. Phase 3 (Voice Agent Integration) - 2 hours
4. Phase 4 (B2B Scenarios) - 1 hour
5. Phase 5 (Update Components) - 2 hours
6. Phase 6 (Environment Config) - 30 minutes
7. Phase 7 (Contabo Deployment) - 1 hour
8. Phase 8 (Mobile Recording & Transcription) - 3 hours
9. Phase 9 (Testing) - 1 hour

**Total Estimated Time: 11.5 hours**

## Key Notes:
- Use `/superpowers:executing-plans` to execute this plan
- Use `/superpowers:verification-before-completion` before marking complete
- All voice agents must be FREE (Gemini free tier; Edge TTS free)
- NO student personas - only B2B decision-makers
- Target companies: EIGER MARVEL HR (HR consultancy) & SGC TECH AI (IT/software)
- Mobile recording: Use RecordRTC (browser) or Whisper.cpp (Contabo GPU)
- Transcription: Gemini 3.1 Flash Speech-to-Text (FREE) or local Whisper.cpp (FREE)

## Start Execution:
Use `/superpowers:executing-plans` with this plan to build the complete B2B voice agent platform with mobile recording & transcription!

---

## Mobile Recording & Transcription Stack (FREE):

### Option 1: Browser-Based Recording (FREE)
- Library: RecordRTC (https://github.com/muaz-khan/RecordRTC)
- API: MediaStream Recording API (native browser support)
- Format: WAV (16kHz, mono, 16-bit) for Whisper
- Platforms: iOS Safari, Android Chrome, Desktop
- Cost: $0

### Option 2: Google Gemini Speech-to-Text (FREE TIER)
- API: https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite-preview
- Features: Audio transcription, 8.4 hours free per request
- Input: Audio files (MP3, WAV, MPEG)
- Cost: FREE tier (pay only after generous free limit)
- Setup: Get API key from https://ai.google.dev/

### Option 3: Local Whisper.cpp on Contabo GPU (FREE)
- Repository: https://github.com/ggerganov/whisper.cpp
- Platform: Contabo VPS with GPU (already has Ollama setup)
- Models: tiny (75MB), base (140MB), small (466MB)
- API: OpenAI-compatible HTTP endpoint
- Cost: $0 (runs locally on your GPU)

### Recommended Stack for Your Project:
1. **Recording**: RecordRTC (browser) → WAV format
2. **Transcription Primary**: Gemini 3.1 Flash (FREE tier)
3. **Transcription Backup**: Whisper.cpp on Contabo (FREE, local)
4. **Voice Agents**: Gemini 3.1 Flash TTS (FREE) + Edge TTS (FREE)

**Total Monthly Cost: $0** 🎉

---

**Ready to build?** Use `/superpowers:executing-plans` with this plan file to systematically create the entire B2B voice agent platform with mobile recording & transcription! 🚀
