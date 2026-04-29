# Upgrade Plan: Interactive Sales App → Production Call + AI Training Platform

**Created:** 2026-04-29  
**Repository:** `interactive-sales-ca`  
**Reference document:** Comprehensive Upgrade Document (provided in chat)

---

## Phase 0 — Codebase Audit Findings (DONE)

### Sources consulted
- `functions/index.ts`, `functions/api/recordings.ts`, `functions/api/calls.ts`, `functions/api/auth.ts`, `functions/api/leads.ts`
- `src/App.tsx`, `src/lib/types.ts`, `src/lib/audioRecordingManager.ts`, `src/lib/transcriptionApi.ts`
- `src/lib/ollamaService.ts`, `src/lib/openaiService.ts`, `src/lib/aiRolePlayService.ts`, `src/lib/ttsService.ts`
- `migrations/0001_initial_schema.sql`, `package.json`, `vite.config.ts`, `.env.production`
- `.github/workflows/jekyll-gh-pages.yml`

### Confirmed existing assets
| Asset | Location | State |
|-------|----------|-------|
| R2 upload/download/delete | `functions/api/recordings.ts` | Has a **bug**: delete uses `put(key, null)` — must be `.delete(key)` |
| R2 URL generation | `recordings.ts:50` | Hardcoded Cloudflare account ID `5ca87478...` — must be env var |
| Browser MediaRecorder | `src/lib/audioRecordingManager.ts` | Works locally; no server upload flow yet wired end-to-end |
| Transcription stub | `src/lib/transcriptionApi.ts` | Frontend calls `/api/calls/{id}/transcribe` — **backend handler missing** |
| Ollama integration | `src/lib/ollamaService.ts` | Full client; uses ngrok URL from `VITE_OLLAMA_BASE_URL` |
| OpenAI integration | `src/lib/openaiService.ts` | Full client; key from `VITE_OPENAI_API_KEY` (browser-visible — security risk) |
| Role-play personas | `src/lib/aiRolePlayService.ts` | 5+ persona types with objection maps; not persisted to DB |
| CI pipeline | `.github/workflows/jekyll-gh-pages.yml` | Wrong — Jekyll stub, not Vite/Wrangler |
| DB schema | `migrations/0001_initial_schema.sql` | No transcript, QA score, or practice attempt tables |
| Compiled JS artifacts | `src/**/*.js` (sibling to every `.tsx`) | Checked in alongside source — should be excluded |

### Known gaps
- No telephony (WebRTC, SIP, or CPaaS) — zero code exists
- No background job queue or retry system
- No Contabo deployment config (Docker, Nginx, etc.)
- `UserRole` only has `admin | agent`; upgrade doc adds `manager` — DB CHECK constraint must be updated
- No monitoring, alerting, or structured logging beyond `console.log`

---

## Phase 1 — Repo Cleanup + CI/CD

**Scope:** Remove noise, fix critical bugs, add real CI gates. Self-contained; safe to execute before any new feature work.

### Tasks

#### 1.1 Fix R2 deletion bug
- File: `functions/api/recordings.ts:139`
- Current (wrong): `await c.env.RECORDINGS.put(\`recordings/${filename}\`, null)`
- Fix: `await c.env.RECORDINGS.delete(\`recordings/${filename}\`)`
- Reference: [Cloudflare R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) — `R2Bucket.delete(key: string)`

#### 1.2 Remove hardcoded account ID
- File: `functions/api/recordings.ts:48–50`
- Replace hardcoded `accountId` with `c.env.CF_ACCOUNT_ID` (add to `Env` type in `src/lib/types.ts`)
- Add `CF_ACCOUNT_ID` to `wrangler.toml` vars block and `wrangler secret put`

#### 1.3 Remove compiled JS artifacts from source control
- All `src/**/*.js` files are build-time outputs accidentally committed alongside `.tsx` sources
- Add `src/**/*.js` to `.gitignore` (verify existing `.gitignore` first — it currently only ignores `node_modules` and `dist`)
- **Do NOT delete** `src/**/*.js` yet — confirm with `git diff` that `.gitignore` covers them before cleaning up

#### 1.4 Replace CI pipeline
- Delete `.github/workflows/jekyll-gh-pages.yml`
- Create `.github/workflows/ci.yml` with:
  ```yaml
  on: [push, pull_request]
  jobs:
    ci:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: '20', cache: 'npm' }
        - run: npm ci
        - run: npm run type-check
        - run: npm run lint
        - run: npm run build
  ```

#### 1.5 Consolidate markdown docs
- Archive all `*_SUMMARY.md`, `*_COMPLETE.md`, `FIX_DEPLOYED.md`, `CORS_FIX_DEPLOYED.md`, etc. into `docs/archive/`
- Keep: `README.md`, `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, `docs/SETUP_GUIDE.md`

### Verification checklist
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run build` produces `dist/` without errors
- [ ] CI workflow green on push to `main`
- [ ] `git grep "put.*null" functions/` returns no results (deletion bug fixed)
- [ ] `git grep "5ca87478" .` returns no results (hardcoded ID removed)

### Anti-pattern guards
- Do NOT touch `src/components/` or `src/lib/` logic in this phase
- Do NOT add a linting rule that would require mass reformatting

---

## Phase 2 — Recording Pipeline Hardening

**Scope:** Make browser → R2 recording reliable, auditable, and ready for post-call processing.

### Context from codebase
- `src/lib/audioRecordingManager.ts` handles local `MediaRecorder` capture and filename generation
- `functions/api/recordings.ts` has upload/get endpoints but no chunking, no retry, no metadata beyond `userId`
- `src/lib/transcriptionApi.ts:1–26` calls `/api/calls/{id}/transcribe` — this endpoint must be created in `functions/api/calls.ts`
- DB `calls` table has `recording_url TEXT` and `sentiment TEXT` but no `transcript TEXT` or `qa_score` columns

### Tasks

#### 2.1 Add transcript + QA columns to DB
- Create `migrations/0002_transcripts_and_qa.sql`:
  ```sql
  ALTER TABLE calls ADD COLUMN transcript TEXT;
  ALTER TABLE calls ADD COLUMN transcript_status TEXT 
    CHECK(transcript_status IN ('pending','processing','done','failed')) DEFAULT NULL;
  ALTER TABLE calls ADD COLUMN qa_score REAL;
  ALTER TABLE calls ADD COLUMN action_items TEXT; -- JSON array
  ALTER TABLE calls ADD COLUMN objections_detected TEXT; -- JSON array
  ALTER TABLE calls ADD COLUMN summary TEXT;
  ALTER TABLE calls ADD COLUMN transcript_requested_at TIMESTAMP;
  ALTER TABLE calls ADD COLUMN transcript_completed_at TIMESTAMP;
  
  -- Update role check to include 'manager'
  -- Note: SQLite D1 does not support ALTER COLUMN; must recreate users table
  -- Do a safe migration: create new table, copy, drop old, rename
  ```
- Run: `npm run db:migrate` (production) and `npm run db:migrate:dev` (local)

#### 2.2 Harden R2 upload
- In `functions/api/recordings.ts`, add to upload response and R2 metadata:
  ```typescript
  customMetadata: {
    userId: auth.userId.toString(),
    leadId: leadId?.toString() || '',
    callId: callId?.toString() || '',
    uploadedAt: new Date().toISOString(),
    checksum: '', // SHA-256 of arrayBuffer — compute before upload
  }
  ```
- Add file size limit check (reject > 500 MB)
- Add content-type validation (allow only `audio/*`)

#### 2.3 Implement POST /api/calls/:id/transcribe
- In `functions/api/calls.ts`, add:
  ```typescript
  callRoutes.post('/:id/transcribe', async (c) => {
    // 1. Fetch call record from D1, verify recording_url exists
    // 2. Set transcript_status = 'pending', transcript_requested_at = now()
    // 3. Enqueue async job (see 2.4)
    // 4. Return 202 Accepted with job reference
  })
  ```

#### 2.4 Async transcription job (Cloudflare Workers AI or Contabo Whisper)
- Option A (faster to ship): Use Cloudflare Workers AI `@cf/openai/whisper` binding
  - Add `AI` binding to `wrangler.toml`
  - Call `env.AI.run('@cf/openai/whisper', { audio: arrayBuffer })`
  - Reference: [Cloudflare Workers AI Speech Recognition](https://developers.cloudflare.com/workers-ai/models/speech-recognition/)
- Option B (Phase 3 dependency): POST to Contabo Whisper service (implement in Phase 3)
- **Start with Option A; swap to Option B in Phase 3**

#### 2.5 Consent banner in UI
- In `src/components/CallApp.tsx`, add a consent toast/banner that fires before `MediaRecorder.start()`
- Must be dismissible and log consent timestamp to call record

#### 2.6 Signed URL playback
- Replace direct R2 URL in `recording_url` column with a route-based approach
- Playback always goes through `GET /api/recordings/:filename` which enforces RBAC (already exists in `functions/api/recordings.ts:74`)
- Remove the public R2 URL pattern from `recordings.ts:50`

### Verification checklist
- [ ] `npm run db:migrate:dev` succeeds with new migration
- [ ] `POST /api/recordings/upload` returns `success: true` with metadata
- [ ] `POST /api/calls/1/transcribe` returns 202 and sets `transcript_status = 'pending'`
- [ ] Transcription completes and sets `transcript_status = 'done'` with `transcript` populated
- [ ] `GET /api/recordings/:filename` returns 403 for cross-agent access attempts
- [ ] `DELETE /api/recordings/:filename` uses `.delete()` not `.put(null)` (Phase 1 fix confirmed)

### Anti-pattern guards
- Do NOT store recordings as base64 in D1 — audio stays in R2, only URL/metadata in DB
- Do NOT call OpenAI Whisper directly from the browser — all AI API calls go through the Worker

---

## Phase 3 — Contabo AI Stack Deployment

**Scope:** Replace the ngrok Ollama tunnel with a stable, self-hosted AI service stack on Contabo.

### Context
- Production uses `VITE_OLLAMA_BASE_URL=https://232d0f92f309.ngrok-free.app` — this URL changes on restart
- `VITE_OPENAI_API_KEY` is browser-visible — a security vulnerability that must be eliminated
- `src/lib/ollamaService.ts` and `src/lib/openaiService.ts` make API calls directly from the browser

### Tasks

#### 3.1 Proxy all AI calls through the Cloudflare Worker
- Create `functions/api/ai.ts` as an AI proxy:
  ```typescript
  // POST /api/ai/chat → proxies to Contabo LLM
  // POST /api/ai/transcribe → proxies to Contabo Whisper
  // All routes require auth middleware (Clerk JWT)
  ```
- Move `OLLAMA_BASE_URL` and all model API keys to Worker secrets (not `VITE_` vars)
- Update `src/lib/ollamaService.ts` and `src/lib/openaiService.ts` to call `/api/ai/*` instead of external URLs directly

#### 3.2 Docker Compose for Contabo server
Create `deploy/contabo/docker-compose.yml`:
```yaml
services:
  nginx:          # Reverse proxy + TLS termination
  ollama:         # LLM inference (llama3.1, etc.)
  whisper:        # STT — use faster-whisper image
  api-proxy:      # Thin relay to CF Worker or standalone if needed
```

#### 3.3 Nginx config + TLS
- `deploy/contabo/nginx/conf.d/ai.conf`
- Use Let's Encrypt via certbot or acme.sh
- Protect all AI endpoints with a shared bearer token (set as Worker secret `CONTABO_AI_TOKEN`)

#### 3.4 Whisper STT service
- Use `ghcr.io/ahmetoner/whisper-asr-webservice:latest` or `onerahmet/openai-whisper-asr-webservice`
- API: `POST /asr?encode=true&task=transcribe&language=en` with audio binary body
- Reference: [whisper-asr-webservice docs](https://ahmetoner.com/whisper-asr-webservice/)

#### 3.5 Environment variable migration
- Remove all `VITE_OPENAI_API_KEY`, `VITE_OLLAMA_BASE_URL`, `VITE_OLLAMA_MODEL` from `.env` and frontend code
- Add `OLLAMA_BASE_URL`, `OPENAI_API_KEY`, `CONTABO_WHISPER_URL`, `CONTABO_AI_TOKEN` as Worker secrets
- Update `src/lib/types.ts` `Env` interface to include new bindings

### Verification checklist
- [ ] `docker compose up` on Contabo brings all services healthy
- [ ] `curl https://<contabo-domain>/health` returns 200 from each service
- [ ] `POST /api/ai/chat` from authenticated browser returns LLM response without exposing API key
- [ ] `grep -r "VITE_OPENAI_API_KEY" src/` returns zero results
- [ ] Ollama reachable via stable domain (no more ngrok URLs in env files)
- [ ] Worker cold start under 50ms (AI calls are async — not blocking Worker CPU budget)

### Anti-pattern guards
- Do NOT call external AI APIs directly from browser JavaScript — always proxy through Worker
- Do NOT put API keys in `VITE_` env vars (they are public)
- Do NOT run GPU-intensive workloads inside a Cloudflare Worker — offload to Contabo

---

## Phase 4 — Call Intelligence Layer

**Scope:** Turn raw transcripts into structured insights: summaries, QA scores, action items, objection maps.

### Context
- Phase 2 produces `transcript TEXT` in `calls` table
- `src/lib/aiRolePlayService.ts` has `PROSPECT_PERSONAS` with objection likelihood maps — reuse these as scoring rubrics
- `src/lib/callScript.ts` and `src/lib/scholarixScript.ts` contain the sales script structure — use as grounding docs for LLM

### Tasks

#### 4.1 Post-call analysis Worker job
In `functions/api/calls.ts`, after transcription completes, chain a second job:
```typescript
// Input: transcript text + call_script used
// LLM prompt: extract { summary, objections[], action_items[], qa_score, sentiment }
// Structured output (JSON mode): store each field to DB
```
Use the Worker AI binding (Phase 2) or Contabo LLM proxy (Phase 3) with `response_format: { type: 'json_object' }`.

#### 4.2 QA scoring rubric
Define scoring dimensions in `src/lib/callScript.ts` or a new `src/lib/qaRubric.ts`:
- Discovery depth (0–25): Did agent ask qualifying questions?
- Objection handling (0–25): Were objections addressed or deflected?
- Closing confidence (0–25): Clear next step agreed?
- Compliance (0–25): No false promises, proper disclosures?

#### 4.3 Post-call summary UI component
- New component: `src/components/PostCallSummary.tsx` (stub already exists — fill it)
- Display: transcript (searchable), summary, QA score breakdown, objection list, action items
- Wire to `GET /api/calls/:id` response (extend to return new fields)

#### 4.4 Call history analytics
- `src/components/AdvancedAnalyticsDashboard.tsx` — add QA score trend chart and objection frequency chart
- Use `recharts` (already in dependencies)

### Verification checklist
- [ ] After a call with recording, transcript auto-populates within 5 minutes
- [ ] `calls.qa_score` is non-null after analysis job completes
- [ ] PostCallSummary renders transcript, score breakdown, and action items
- [ ] Analytics dashboard shows QA score trend line
- [ ] Analysis job failure sets `transcript_status = 'failed'` and logs error to `activity_logs`

### Anti-pattern guards
- Do NOT score calls using the mock AI service — Phase 4 requires real LLM
- Do NOT block the API response waiting for LLM completion — always return 202 and process async

---

## Phase 5 — Enhanced Practice Scenario System

**Scope:** Persist practice attempts, tie practice weaknesses to real-call QA gaps, add voice-mode role-play using Contabo TTS/STT.

### Context
- `src/lib/aiRolePlayService.ts:PROSPECT_PERSONAS` has 5+ personas — currently ephemeral (no DB persistence)
- `src/pages/RolePlayPage.tsx` renders `AIRolePlayPractice` component — currently no attempt history
- `src/lib/ttsService.ts` uses browser Web Speech API — replace with Contabo TTS for consistency

### Tasks

#### 5.1 DB tables for practice
Add to `migrations/0003_practice_system.sql`:
```sql
CREATE TABLE practice_scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  persona_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  context_json TEXT,       -- JSON: lead profile snapshot
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE practice_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  scenario_id INTEGER NOT NULL REFERENCES practice_scenarios(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  transcript TEXT,
  qa_score REAL,
  feedback_json TEXT,      -- JSON: { strengths[], improvements[], coaching_notes }
  passed BOOLEAN
);
```

#### 5.2 Practice attempt persistence
- In `src/pages/RolePlayPage.tsx`, call `POST /api/practice/attempts` at session start
- On session end, `PATCH /api/practice/attempts/:id` with transcript and score
- Add `functions/api/practice.ts` route handlers

#### 5.3 Weakness-to-drill recommendation engine
- After each real call QA analysis (Phase 4), compare agent's weakest dimension to practice scenarios
- Add `GET /api/practice/recommendations/:userId` endpoint that returns top 3 recommended scenarios
- Surface recommendations on the Calls tab or Analytics tab

#### 5.4 Voice-mode role-play via Contabo
- Extend `/api/ai/tts` proxy endpoint to call a TTS service on Contabo (e.g., Coqui TTS or piper)
- In `src/lib/ttsService.ts`, add a `ContaboTTSProvider` class that calls `/api/ai/tts`
- Fall back to browser `SpeechSynthesis` if Contabo TTS is unavailable

### Verification checklist
- [ ] `POST /api/practice/attempts` creates a row and returns attempt ID
- [ ] Completed attempt has `feedback_json` with at least `strengths` and `improvements` populated
- [ ] `GET /api/practice/recommendations/:userId` returns relevant scenarios based on recent QA scores
- [ ] Voice mode plays AI response audio through Contabo TTS (not just browser synthesis)
- [ ] Practice history visible in a new "My Practice" section on the RolePlay tab

### Anti-pattern guards
- Do NOT hard-code persona list in the DB — load from `PROSPECT_PERSONAS` enum at runtime
- Do NOT mix practice transcript storage with real call transcripts — keep separate tables

---

## Phase 6 — Production Hardening (Ongoing)

**Scope:** Observability, security tightening, backup/DR, cost governance.

### Tasks

#### 6.1 Structured logging
- Replace all `console.log`/`console.error` in `functions/` with structured log entries
- Log schema: `{ level, timestamp, requestId, userId, action, durationMs, error? }`
- Route Worker logs to Cloudflare Logpush or a lightweight log drain on Contabo

#### 6.2 Monitoring and alerting
- Add `/api/health` endpoint that checks D1, R2, and Contabo AI reachability
- Set up uptime monitor (e.g., Better Uptime free tier or Cloudflare Health Checks)
- Alert on: 5xx error rate > 1%, transcript job queue depth > 50, Worker CPU > 80%

#### 6.3 Security hardening
- Add rate limiting middleware to Hono (e.g., `hono/rate-limiter` or Cloudflare rate limiting rules)
- Rotate `CLERK_SECRET_KEY` and `CONTABO_AI_TOKEN` on a 90-day schedule
- Add `Content-Security-Policy` header to Worker responses
- Quarterly dependency audit: `npm audit` and `wrangler` version updates

#### 6.4 Backup and DR
- Enable D1 point-in-time restore (Cloudflare dashboard)
- Schedule weekly R2 bucket sync to a second storage location
- Document and test restore procedure annually

#### 6.5 Cost governance
- Tag all Contabo resources with `env` (prod/staging) and `team` labels
- Set billing alerts at 80% of monthly budget
- Review GPU utilization weekly — right-size Contabo instances

### Verification checklist
- [ ] `GET /api/health` returns 200 with all service statuses in under 300ms
- [ ] Zero hardcoded secrets in any source file (`git grep -i "sk-" src/` returns nothing)
- [ ] D1 backup restore tested in staging
- [ ] `npm audit` shows zero critical vulnerabilities

---

## Execution Notes for Future Sessions

### Starting a new phase
Each phase is designed to be picked up cold. Begin every session with:
1. `git status` — confirm clean working tree
2. Read the relevant phase section above
3. Read the source files listed in that phase's "Context" block before writing code
4. Complete the verification checklist before declaring the phase done

### Skipping / reordering
- Phase 1 (cleanup) **must** come first — the R2 deletion bug and CI gap affect everything downstream
- Phase 2 and Phase 3 can partially overlap (Phase 2 ships Cloudflare Workers AI transcription; Phase 3 upgrades it to Contabo Whisper)
- Phase 4 depends on Phase 2 (needs transcripts in DB)
- Phase 5 depends on Phase 4 (needs QA scores for recommendations)
- Phase 6 is ongoing — start adding observability in Phase 2 and harden in Phase 6

### Decision points requiring user confirmation before proceeding
1. **Telephony strategy** — SIP/PBX vs CPaaS (Twilio/Plivo) vs WebRTC-only. The plan above defers telephony until a decision is made; all recording infrastructure assumes browser `MediaRecorder` for now.
2. **Contabo instance spec** — GPU instance needed for Whisper large-v3; CPU-only is fine for smaller Whisper models.
3. **TTS service choice** — Coqui TTS (open source), Piper (fast, lightweight), or a cloud TTS API.
