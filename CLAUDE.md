# CLAUDE.md - Interactive Sales Call App (B2B Voice Agent Platform)

## Project Overview

**Scholarix CRM → B2B Voice Agent Training Platform** - An interactive sales training application for EIGER MARVEL HR (HR Consultancy) and SGC TECH AI (IT/Software). Features live call management, AI-powered B2B role-play with human-like voices (Gemini 3.1 Flash TTS - FREE), and mobile call recording with transcription.

**GitHub Repo:** https://github.com/renbran/interactive-sales-ca.git

## Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite** (build tool)
- **Tailwind CSS 4** (styling)
- **Radix UI** (@radix-ui/react-*) - headless UI components
- **Clerk** (@clerk/clerk-react) - authentication
- **TanStack Query** - data fetching/caching
- **React Hook Form** - form handling
- **Recharts** - analytics dashboards
- **Phosphor Icons** / **Lucide React** - icon libraries

### Backend
- **Cloudflare Workers** + **Hono** (API framework)
- **Cloudflare D1** (SQL database)
- **Cloudflare R2** (audio file storage)
- **Wrangler** - deployment CLI

### AI Stack (Self-Hosted on Contabo VPS)
- **Ollama** (llama3.1:8b, llama3.2:3b) - local LLM on Contabo GPU
- **Gemini 3.1 Flash TTS** - FREE human-like voice synthesis (30+ voices)
- **Edge TTS** - FREE backup TTS (200+ voices, Contabo :5050)
- **Whisper.cpp** - local speech-to-text (optional)

### Deployment
- **Contabo VPS** (80.241.218.108) - Ollama GPU, Docker, Nginx
- **Cloudflare Pages** - frontend hosting
- **Cloudflare Workers** - API hosting

## Commands

```bash
# Development (run in parallel)
npm run dev              # Vite frontend on :5173
npm run worker:dev       # Cloudflare Worker API on :8787

# Build & Type Check
npm run build            # tsc + vite build
npm run type-check       # tsc --noEmit
npm run lint             # ESLint on .ts/.tsx files

# Database (Cloudflare D1)
npm run db:create         # Create D1 database
npm run db:migrate        # Apply migration to production
npm run db:migrate:dev    # Apply migration locally

# Deployment
npm run worker:deploy    # Deploy Worker to production
npm run worker:deploy:dev # Deploy Worker to dev environment

# Contabo GPU (SSH)
ssh -i ~/.ssh/contabo_80_241_218_108 root@80.241.218.108
```

## Architecture

### Frontend Structure
```
src/
├── components/        # UI components (CallApp, AIRolePlayPractice, etc.)
├── contexts/         # React contexts (AuthContext, CompanyContext)
├── hooks/            # Custom hooks (useAudioRecorder, useApi, etc.)
├── lib/              # Core logic
│   ├── b2bPersonas.ts         # B2B decision-maker personas
│   ├── companySelector.ts      # EIGER MARVEL HR / SGC TECH AI
│   ├── voiceAgentConfig.ts     # Gemini + Edge TTS voice mapping
│   ├── geminiTTSService.ts    # Gemini 3.1 Flash TTS (FREE)
│   ├── edgeTtsService.ts      # Edge TTS backup (FREE)
│   ├── aiRolePlayService.ts   # B2B role-play logic
│   └── ... (other services)
├── pages/            # Page components (RolePlayPage, AdminPanel, etc.)
├── styles/           # CSS files
├── App.tsx           # Root component with Clerk auth
└── main.tsx          # Entry point
```

### Key Components
| Component | Purpose |
|-----------|---------|
| `CompanySelector` | Select EIGER MARVEL HR or SGC TECH AI |
| `AIRolePlayPractice` | B2B role-play with voice agents |
| `CallApp` | Live call management |
| `LeadManager` | CRM lead CRUD |
| `AdvancedAnalyticsDashboard` | Charts and metrics |

### Backend API (Cloudflare Workers)
```
functions/
├── index.ts              # Hono app setup
├── api/
│   ├── auth.ts         # Clerk auth verification
│   ├── calls.ts        # Call session endpoints
│   ├── leads.ts        # Lead management
│   └── recordings.ts   # Recording metadata
└── services/
    └── transcription.ts  # STT service interface
```

## B2B Voice Agent System

### Companies
1. **EIGER MARVEL HR** (🇦🇪) - HR Consultancy & Recruitment
   - Target: HR Manager (Ali), Business Owner (Hania), Finance Manager (Katherine)
   - Solutions: Odoo ERP, payroll + WPS compliance, recruitment automation
   - Color: Blue (#3B82F6)

2. **SGC TECH AI** (🤖) - IT Services & AI Solutions  
   - Target: IT Manager (Technical Director), CEO/Founder, Operations Manager
   - Solutions: AI customer support, CI/CD automation, custom AI agents
   - Color: Green (#10B981)

### Voice Agents (FREE Stack)
- **Primary:** Gemini 3.1 Flash TTS (FREE tier, 30+ human-like voices)
  - Voices: Charon, Kore, Puck, Leda, Algenib, Mintaka, Fenrir, Vindemiatrix, Phecda
  - API Key: `VITE_GEMINI_API_KEY` from https://ai.google.dev/
- **Backup:** Edge TTS on Contabo (http://80.241.218.108:5050)
  - 200+ voices, no API key required
  - Fallback automatically if Gemini fails

### B2B Personas (NO Students!)
Located in `src/lib/b2bPersonas.ts`:
- 6 decision-makers (3 per company)
- Each has: name, title, goals, pain points, budget, objections
- Voice agent mapping in `voiceAgentConfig.ts`

## Environment Variables (.env)

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...

# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# AI Services (Contabo)
VITE_OLLAMA_BASE_URL=http://80.241.218.108:11434
VITE_GEMINI_API_KEY=...  # Get FREE from https://ai.google.dev/
VITE_TTS_SERVER_URL=http://80.241.218.108:5050  # Edge TTS backup

# Database
DATABASE_URL=...  # Cloudflare D1
```

## Deployment Architecture

### Contabo VPS (80.241.218.108)
```
/opt/odoo-test/
├── docker-compose.yml    # Ollama + TTS server
├── ttserver.py         # Edge TTS server (port 5050)
├── ollama/             # Ollama models & config
└── data/
    ├── ollama/         # Model storage
    └── postgres/       # (if using PostgreSQL)
```

### Cloudflare
- **Frontend:** Cloudflare Pages (from GitHub repo)
- **API:** Cloudflare Workers (wrangler.toml)
- **Database:** D1 (migrations/0001_initial_schema.sql)
- **Storage:** R2 bucket for audio recordings

## Critical Rules

### B2B Focus (NO Students!)
- ❌ NO references to "students", "schools", "education", "career counseling"
- ✅ ONLY B2B decision-makers: HR Managers, CEOs, Finance Directors, IT Managers
- ✅ Target companies: EIGER MARVEL HR & SGC TECH AI only

### Zero Cost Principle
- ✅ Use FREE tiers: Gemini 3.1 Flash TTS, Edge TTS, Ollama (self-hosted)
- ✅ Contabo VPS: Only cost for hosting (~$20/month)
- ❌ NO paid APIs: ElevenLabs, Deepgram, OpenAI (unless explicitly requested)

### Voice Agent Integration
- Always use `geminiTTSService.ts` as PRIMARY voice synthesis
- Fallback to `edgeTtsService.ts` if Gemini fails
- Voice mapping in `voiceAgentConfig.ts` - never hardcode voices
- Each B2B persona has a matching voice agent

### Code Quality
- TypeScript strict mode - NO `as any` or `@ts-ignore`
- Use existing patterns in codebase (Radix UI, Tailwind classes)
- All new components must support B2B personas
- Test on mobile (iOS Safari, Android Chrome)

## Git Workflow
- **Main branch:** `main`
- **Worktrees:** Use `git worktree` for isolated feature work
- **Commits:** Use conventional commits (feat:, fix:, chore:)
- **GitHub:** https://github.com/renbran/interactive-sales-ca.git

## Plugins & Skills to Load

When working on this project, ALWAYS load these skills:
- **omc-reference** - OMC agent catalog, tools, deployment protocols
- **canvas-design** - UI/UX design work
- **frontend-ui-ux** - Frontend component development
- **git-master** - Git operations and commits

## Active Development Priorities

1. ✅ B2B Persona System (COMPLETE)
2. ✅ Company Selection UI (COMPLETE)
3. ✅ B2B Role-Play Component (COMPLETE)
4. ✅ Voice Player Utility (COMPLETE - `src/lib/voicePlayer.ts`)
5. ✅ B2B Scenario Scripts (COMPLETE - `src/lib/b2bScenarios.ts`)
6. ✅ Mobile Call Recording & Transcription (COMPLETE - `src/hooks/useMobileRecorder.ts`, `src/lib/transcriptionService.ts`)
7. ✅ Repo Cleanup & CI/CD (COMPLETE - replaced Jekyll CI with Vite/TypeScript CI, fixed R2 deletion bug, removed hardcoded account ID)
8. 🔄 Contabo Deployment (Docker Compose + Nginx TLS + Whisper STT)
9. 🔄 Practice System Backend (`POST /api/practice/attempts`, `GET /api/practice/recommendations/:userId`)
10. 🔄 Post-Call Analysis UI (`PostCallSummary.tsx` QA score, objection list, action items)
11. 🔄 Analytics Dashboard (QA score trend chart using recharts)

## Session Continuation Context

This project transformed from student-focused "Scholarix CRM" to B2B sales training for two UAE companies:
- **EIGER MARVEL HR:** HR consultancy needing Odoo ERP + recruitment automation
- **SGC TECH AI:** IT company needing AI automation + CI/CD pipelines

All voice agents use FREE services (Gemini 3.1 Flash TTS + Edge TTS). Mobile recording and transcription are the next major features to implement.

When resuming work: check `src/components/CompanySelector.tsx`, `src/contexts/CompanyContext.tsx`, and the rewritten `src/components/AIRolePlayPractice.tsx` for the B2B system.
