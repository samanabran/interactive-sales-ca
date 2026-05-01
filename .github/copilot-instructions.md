# Copilot Instructions - Interactive Sales Call App

This document helps Copilot (and other AI assistants) work effectively in this repository. For detailed project context, see [`CLAUDE.md`](../CLAUDE.md) and [`README.md`](../README.md).

## Architecture Overview

**Interactive Sales Call App** is a B2B voice agent training platform for two UAE companies: EIGER MARVEL HR (HR consultancy) and SGC TECH AI (IT services).

### Full Stack
- **Frontend**: React 19 + TypeScript + Vite, Tailwind CSS 4, Radix UI components
- **Backend**: Cloudflare Workers (serverless) + Hono framework + Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (audio recordings)
- **Auth**: Clerk.dev (JWT-based authentication)
- **AI Services**: 
  - **LLM**: Ollama (llama3.1:8b, llama3.2:3b) on Contabo VPS (80.241.218.108)
  - **Voice Synthesis**: Gemini 3.1 Flash TTS (primary, FREE) + Edge TTS (backup, Contabo :5050)
  - **Speech-to-Text**: Whisper.cpp (optional, self-hosted)

### Directory Structure
```
src/
├── components/        # React components (UI, CallApp, AIRolePlayPractice, etc.)
├── contexts/          # React Context providers (AuthContext, CompanyContext)
├── hooks/             # Custom React hooks
├── lib/               # Core business logic
│   ├── b2bPersonas.ts          # B2B decision-maker profiles (6 total: 3 per company)
│   ├── voiceAgentConfig.ts     # Voice-to-persona mapping
│   ├── geminiTTSService.ts     # Gemini 3.1 Flash TTS service (FREE)
│   ├── edgeTtsService.ts       # Edge TTS fallback (Contabo backup)
│   ├── aiRolePlayService.ts    # B2B role-play conversation logic
│   ├── types.ts                # Global TypeScript types
│   └── [other-services].ts
├── pages/             # Page-level components (RolePlayPage, etc.)
└── main.tsx           # Entry point

functions/            # Cloudflare Workers (Backend)
├── index.ts          # Hono app setup
├── api/
│   ├── auth.ts       # Clerk auth verification
│   ├── calls.ts      # Call session endpoints
│   ├── leads.ts      # Lead management CRUD
│   └── recordings.ts # Recording metadata
└── services/
    └── transcription.ts  # STT service interface

migrations/
└── 0001_initial_schema.sql  # D1 database schema (users, leads, calls, conversations, etc.)
```

## Build, Test, and Lint Commands

### Development
```bash
npm run dev              # Start Vite frontend (localhost:5173)
npm run worker:dev       # Start Cloudflare Worker locally (localhost:8787)
npm run build            # tsc + vite build (type-check + minify)
```

### Type Checking & Linting
```bash
npm run type-check       # tsc --noEmit (no emit, just check types)
npm run lint             # ESLint on .ts/.tsx files (max-warnings: 0)
```

### Database
```bash
npm run db:create        # Create D1 database (one-time setup)
npm run db:migrate       # Apply migrations to production D1
npm run db:migrate:dev   # Apply migrations locally for development
npm run db:query         # Execute custom query on production D1
```

### Deployment
```bash
npm run worker:deploy    # Deploy Worker + functions to production
npm run worker:deploy:dev # Deploy Worker to dev environment
npm run r2:create        # Create R2 bucket for recording storage
```

### Project Setup
- **Node**: >=18.0.0
- **Package Manager**: npm (lockfile: package-lock.json)

## Key Conventions

### TypeScript
- **Strict mode enforced**: `strict: true` in tsconfig.json
- **No implicit any**: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` all enabled
- **No type assertions**: Avoid `as any` and `@ts-ignore` — fix type errors properly
- **Path alias**: Use `@/*` for imports (e.g., `import { Component } from '@/components/...`)
- Use `@/lib/types.ts` for shared type definitions, component-local types for component-scoped interfaces

### React Components
- **Default export**: All components are default exports (e.g., `export default function ComponentName()`)
- **Props interface**: Define `interface ComponentNameProps` immediately before component
- **Hooks**: Use React 19 features (hooks, concurrent rendering)
- **No `<>` fragments in className concatenation**: Use proper template literals or clsx
- Example pattern:
  ```tsx
  interface ButtonProps {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
  }
  
  export default function Button({ variant = 'primary', children }: ButtonProps) {
    return <button className={`btn btn-${variant}`}>{children}</button>;
  }
  ```

### Styling
- **Tailwind CSS 4** with CSS variables (`@theme` directive in `src/index.css`)
- Use **Tailwind classes** for all styling (no inline `style` prop unless dynamic values)
- Responsive: Use `md:`, `lg:`, `xs:`, `sm:`, `touch:`, `mouse:` breakpoints from config
- Custom screens: `coarse` (touch), `fine` (pointer), `pwa` (PWA), `touch`/`mouse` combinations
- Color classes: Use Tailwind defaults + CSS variables for theming
- **Radix UI components**: Import from `@radix-ui/react-*` (pre-integrated in package.json)

### B2B Personas & Company System
- **NO student-focused content**: ❌ Avoid "students", "schools", "education", "career"
- **Only B2B decision-makers**: HR Managers, CEOs, Finance Directors, IT Managers
- **Two companies only**: EIGER MARVEL HR (Blue #3B82F6) and SGC TECH AI (Green #10B981)
- **Persona mapping**: Each of 6 personas (3 per company) has specific:
  - Name, title, goals, pain points, budget, objections
  - Voice agent mapping (in `voiceAgentConfig.ts`)
  - Located in `src/lib/b2bPersonas.ts`

### Voice Agent Integration
- **Primary TTS**: `geminiTTSService.ts` — Gemini 3.1 Flash (FREE, 30+ voices)
  - API key: `VITE_GEMINI_API_KEY` from https://ai.google.dev/
  - Voices: Charon, Kore, Puck, Leda, Algenib, Mintaka, Fenrir, Vindemiatrix, Phecda
- **Fallback TTS**: `edgeTtsService.ts` — Edge TTS on Contabo (http://80.241.218.108:5050)
  - 200+ voices, auto-fallback if Gemini fails
- **Never hardcode voices**: Use `voiceAgentConfig.ts` for all voice-to-persona mappings
- **LLM**: Ollama on Contabo (llama3.1:8b for reasoning, llama3.2:3b for speed)
  - Base URL: `VITE_OLLAMA_BASE_URL=http://80.241.218.108:11434`

### API & Backend (Cloudflare Workers)
- **Framework**: Hono (lightweight, Cloudflare-optimized)
- **Auth**: All endpoints require Clerk JWT in `Authorization: Bearer <token>` header
- **Database**: Cloudflare D1 (SQLite)
  - Binding in wrangler.toml: `DB`
  - Access pattern: `env.DB.prepare(sql).bind(...).all()` / `.first()` / `.run()`
- **Storage**: Cloudflare R2
  - Binding in wrangler.toml: `RECORDINGS`
  - Access pattern: `env.RECORDINGS.put(key, body, options)`
- **Environment**:
  - Production: `scholarix-crm-db` with prod CORS origin
  - Development: `scholarix-crm-db-dev` with localhost CORS origin

### Environment Variables
```bash
# Frontend (.env)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_GEMINI_API_KEY=...              # FREE from https://ai.google.dev/
VITE_OLLAMA_BASE_URL=http://80.241.218.108:11434
VITE_TTS_SERVER_URL=http://80.241.218.108:5050

# Backend (wrangler secrets)
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

### File Naming & Organization
- **Components**: PascalCase (e.g., `CompanySelector.tsx`, `AIRolePlayPractice.tsx`)
- **Services/utils**: camelCase (e.g., `geminiTTSService.ts`, `aiRolePlayService.ts`)
- **Interfaces/Types**: PascalCase (e.g., `interface PersonaProfile`, `interface CallSession`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `COMPANY_PROFILES`, `API_ENDPOINTS`)

### Code Quality Standards
- **No console logs in production**: Use logger.ts for structured logging
- **Error handling**: Try-catch with typed errors; fallback to UI error boundaries
- **Mobile-first**: Always test components on iOS Safari and Android Chrome
- **Accessibility**: Use Radix UI components (built-in a11y) + semantic HTML
- **Git commits**: Conventional commits (feat:, fix:, chore:) with `Co-authored-by: Copilot` trailer

### Testing & Validation
- Currently no Jest/Vitest suite; manual testing on browsers
- Type-check before committing: `npm run type-check`
- Lint before push: `npm run lint`
- Test B2B personas locally with mock data before deploying

## Important Context

### Project Evolution
- Original: Scholarix CRM (student-focused)
- Current: B2B sales training platform (HR and IT companies only)
- **Migration note**: Some old code references "students" — if found, replace with B2B personas

### Deployment Architecture
- **Contabo VPS** (80.241.218.108): Docker-hosted Ollama + Edge TTS server
- **Cloudflare**: Frontend (Pages), API (Workers), DB (D1), Storage (R2)
- **GitHub**: Automatic Pages deployment on push to `main`

### Zero-Cost Principle
- ✅ All services on FREE tiers: Gemini TTS, Edge TTS, Ollama (self-hosted), Cloudflare
- ✅ Contabo VPS only cost (~$20/month)
- ❌ No paid APIs: ElevenLabs, Deepgram, OpenAI (unless explicitly requested)

## When to Reference CLAUDE.md

For deeper context, see [`CLAUDE.md`](../CLAUDE.md) for:
- Complete tech stack details
- B2B persona definitions
- Voice agent voice mappings
- Deployment procedures
- Git workflow (worktrees, commits)
- Active development priorities
