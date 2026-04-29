# Contabo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the self-hosted deployment so Scholarix CRM runs at `https://train.scholarixglobal.com` on the Contabo VPS (80.241.218.108), fully migrated off Cloudflare.

**Architecture:** A new `server/` directory holds the Node.js entry point and adapters. `server/db.ts` wraps `pg.Pool` with a D1-compatible interface so the existing `functions/api/*.ts` route handlers work without modification. `server/storage.ts` replaces R2 with local filesystem writes. `server/index.ts` creates a fresh Hono app, injects these adapters into `c.env` via middleware, then mounts the existing route handlers.

**Tech Stack:** Hono + `@hono/node-server`, `pg` (node-postgres), `tsx` (TypeScript runner), Docker Compose, Nginx, Let's Encrypt/Certbot, PostgreSQL 16, Node.js 20.

---

## File Map

**Create:**
- `server/db.ts` — D1-compatible adapter wrapping `pg.Pool`
- `server/storage.ts` — Local filesystem R2 adapter
- `server/index.ts` — Node.js Hono server entry point
- `server/worker.ts` — Background worker stub
- `migrations/postgresql_schema.sql` — PostgreSQL-adapted schema
- `contabo-deployment/Dockerfile.api`
- `contabo-deployment/Dockerfile.worker`
- `contabo-deployment/nginx-web.conf` — Inner Nginx config for web container

**Modify:**
- `package.json` — add `@hono/node-server`, `pg`, `@types/pg`, `tsx`
- `src/lib/types.ts` — add `APP_URL?: string` to `Env` interface
- `functions/index.ts` — add `train.scholarixglobal.com` to CORS allowed origins
- `functions/api/recordings.ts` — use `c.env.APP_URL` for generated recording URLs
- `contabo-deployment/nginx.conf` — add domain name + SSL server blocks
- `.env.production` — update `VITE_API_BASE_URL` to new domain

---

## Task 1: Create the git worktree

**Files:** none (git operation)

- [ ] **Step 1: Create worktree for this feature**

```bash
cd D:\01_WORK_PROJECTS\odoo_apps_posting\interactive-sales-ca
git worktree add .worktrees/production-upgrade -b feature/production-upgrade
cd .worktrees/production-upgrade
npm install
```

Expected: `.worktrees/production-upgrade/` created with branch `feature/production-upgrade`.

- [ ] **Step 2: Verify clean baseline**

```bash
npm run type-check
npm run lint
```

Expected: 0 errors, 0 warnings.

---

## Task 2: Add Node.js server dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add dependencies**

In `package.json`, add to `"dependencies"`:
```json
"@hono/node-server": "^1.13.7",
"pg": "^8.13.3",
"tsx": "^4.19.2"
```

Add to `"devDependencies"`:
```json
"@types/pg": "^8.11.10"
```

Also add these scripts to `"scripts"`:
```json
"server:start": "tsx server/index.ts",
"worker:start": "tsx server/worker.ts"
```

- [ ] **Step 2: Install**

```bash
npm install
```

Expected: `package-lock.json` updated, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add node server dependencies for contabo migration"
```

---

## Task 3: Create the PostgreSQL D1 adapter

**Files:**
- Create: `server/db.ts`

- [ ] **Step 1: Create `server/db.ts`**

```typescript
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'scholarix_crm',
  user: process.env.DB_USER || 'scholarix',
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

// Convert D1-style ? placeholders to PostgreSQL $1, $2, ...
function toPositional(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

class D1Statement {
  private sql: string;
  private params: unknown[] = [];

  constructor(sql: string) {
    this.sql = sql;
  }

  bind(...params: unknown[]): this {
    this.params = params;
    return this;
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const { rows } = await pool.query(toPositional(this.sql), this.params);
    return (rows[0] as T) ?? null;
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    const { rows } = await pool.query(toPositional(this.sql), this.params);
    return { results: rows as T[] };
  }

  async run(): Promise<{ success: boolean; meta: { last_row_id: number } }> {
    const pgSql = toPositional(this.sql.trim());
    const isInsert = /^INSERT\s/i.test(pgSql);

    if (isInsert) {
      // Append RETURNING id so callers can use result.meta.last_row_id.
      // Falls back gracefully for tables that have no id column (e.g. lead_tags).
      try {
        const { rows } = await pool.query(`${pgSql} RETURNING id`, this.params);
        return { success: true, meta: { last_row_id: rows[0]?.id ?? 0 } };
      } catch (err: unknown) {
        const pgErr = err as { code?: string };
        if (pgErr.code === '42703') {
          // Table has no `id` column — run without RETURNING
          await pool.query(pgSql, this.params);
          return { success: true, meta: { last_row_id: 0 } };
        }
        throw err;
      }
    }

    await pool.query(pgSql, this.params);
    return { success: true, meta: { last_row_id: 0 } };
  }
}

export const db = {
  prepare(sql: string): D1Statement {
    return new D1Statement(sql);
  },
};

export type DbAdapter = typeof db;
```

- [ ] **Step 2: Verify types**

```bash
npm run type-check
```

Expected: 0 errors (new file only, no imports yet).

- [ ] **Step 3: Commit**

```bash
git add server/db.ts
git commit -m "feat: add postgresql d1-compatible adapter"
```

---

## Task 4: Create the local filesystem storage adapter

**Files:**
- Create: `server/storage.ts`

- [ ] **Step 1: Create `server/storage.ts`**

```typescript
import { createReadStream, existsSync, mkdirSync, unlinkSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { Readable } from 'stream';

const DATA_DIR = process.env.RECORDINGS_DIR || '/data/recordings';

function ensureDir(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

interface StorageObject {
  body: ReadableStream;
  size: number;
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
}

export const storage = {
  async put(key: string, value: ArrayBuffer | null): Promise<void> {
    if (value === null) {
      // Treat put(key, null) as delete (matches original R2 usage pattern)
      return this.delete(key);
    }
    const filePath = join(DATA_DIR, key);
    ensureDir(filePath);
    writeFileSync(filePath, Buffer.from(value));
  },

  async get(key: string): Promise<StorageObject | null> {
    const filePath = join(DATA_DIR, key);
    if (!existsSync(filePath)) return null;

    const stat = statSync(filePath);
    const nodeStream = createReadStream(filePath);

    return {
      body: Readable.toWeb(nodeStream) as ReadableStream,
      size: stat.size,
      httpMetadata: { contentType: guessContentType(key) },
      customMetadata: {},
    };
  },

  async delete(key: string): Promise<void> {
    const filePath = join(DATA_DIR, key);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  },
};

function guessContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    webm: 'audio/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'audio/mp4',
  };
  return map[ext ?? ''] ?? 'application/octet-stream';
}

export type StorageAdapter = typeof storage;
```

- [ ] **Step 2: Verify types**

```bash
npm run type-check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add server/storage.ts
git commit -m "feat: add local filesystem storage adapter replacing r2"
```

---

## Task 5: Add `APP_URL` to the `Env` interface and update recordings URL generation

**Files:**
- Modify: `src/lib/types.ts` (line ~426)
- Modify: `functions/api/recordings.ts` (line ~48)

- [ ] **Step 1: Add `APP_URL` to `Env` in `src/lib/types.ts`**

Find the `Env` interface (around line 425) and add one field:

```typescript
export interface Env {
  DB: D1Database;
  RECORDINGS: R2Bucket;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  APP_URL?: string;  // Add this line
}
```

- [ ] **Step 2: Update recording URL in `functions/api/recordings.ts`**

Replace lines 46–51 (the hardcoded R2 URL block):

```typescript
    // Generate public URL
    const accountId = '5ca87478e09d6ebc6954f770ac4656e8';
    const bucketName = 'scholarix-recordings';
    const recordingUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${filename}`;
```

With:

```typescript
    // Generate public URL — use APP_URL for self-hosted, fall back to R2
    const recordingUrl = c.env.APP_URL
      ? `${c.env.APP_URL}/recordings/${filename}`
      : `https://scholarix-recordings.5ca87478e09d6ebc6954f770ac4656e8.r2.cloudflarestorage.com/${filename}`;
```

- [ ] **Step 3: Verify**

```bash
npm run type-check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts functions/api/recordings.ts
git commit -m "feat: add APP_URL env var for self-hosted recording urls"
```

---

## Task 6: Create the Node.js server entry point

**Files:**
- Create: `server/index.ts`

- [ ] **Step 1: Create `server/index.ts`**

```typescript
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AuthContext } from '../src/lib/types';
import { db } from './db';
import { storage } from './storage';
import { authRoutes } from '../functions/api/auth';
import { leadRoutes } from '../functions/api/leads';
import { callRoutes } from '../functions/api/calls';
import { recordingRoutes } from '../functions/api/recordings';

const PORT = parseInt(process.env.PORT || '8787');
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const app = new Hono<{ Bindings: any; Variables: { auth: AuthContext } }>();

// ── Inject Node.js service bindings into c.env ──────────────────────────────
// Route handlers access DB and RECORDINGS via c.env (Cloudflare Workers pattern).
// This middleware populates c.env before any handler runs.
app.use('*', async (c, next) => {
  c.env = {
    DB: db,
    RECORDINGS: storage,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY!,
    APP_URL,
    ENVIRONMENT: process.env.NODE_ENV || 'production',
  };
  await next();
});

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://interactive-sales-ca.pages.dev',
      'https://train.scholarixglobal.com',
    ];
    return allowed.includes(origin) ? origin : allowed[0];
  },
  credentials: true,
}));

app.use('*', logger());

// ── Auth middleware ───────────────────────────────────────────────────────────
app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/auth/sync' || c.req.path === '/api/auth/webhook') {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const response = await fetch('https://api.clerk.dev/v1/verify_token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
    }

    const clerkUser = await response.json() as { sub: string };

    const user = await db.prepare('SELECT * FROM users WHERE clerk_id = ?')
      .bind(clerkUser.sub)
      .first<{ id: number; clerk_id: string; email: string; role: 'admin' | 'agent' }>();

    if (!user) {
      return c.json({ error: 'User not found', message: 'Please sync your account first' }, 404);
    }

    c.set('auth', {
      userId: user.id,
      clerkId: user.clerk_id,
      email: user.email,
      role: user.role,
    });

    await db.prepare('UPDATE users SET last_login = NOW() WHERE id = ?').bind(user.id).run();

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized', message: 'Token verification failed' }, 401);
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (c) => c.json({ message: 'Scholarix CRM API', version: '1.0.0' }));
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.route('/api/auth', authRoutes);
app.route('/api/leads', leadRoutes);
app.route('/api/calls', callRoutes);
app.route('/api/recordings', recordingRoutes);

// ── Error handler ─────────────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  }, 500);
});

app.notFound((c) =>
  c.json({ error: 'Not Found', message: `Route ${c.req.path} not found` }, 404)
);

// ── Start server ──────────────────────────────────────────────────────────────
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Scholarix API running on port ${PORT}`);
});

export default app;
```

- [ ] **Step 2: Verify types**

```bash
npm run type-check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add server/index.ts
git commit -m "feat: add node.js hono server entry point for contabo"
```

---

## Task 7: Create the worker stub

**Files:**
- Create: `server/worker.ts`

- [ ] **Step 1: Create `server/worker.ts`**

```typescript
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'scholarix_crm',
  user: process.env.DB_USER || 'scholarix',
  password: process.env.DB_PASSWORD,
});

async function main() {
  await pool.query('SELECT 1'); // verify db connection
  console.log('Scholarix worker connected to database, waiting for jobs...');
  // Background job processing will be implemented here
}

main().catch((err) => {
  console.error('Worker startup error:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify types**

```bash
npm run type-check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add server/worker.ts
git commit -m "feat: add background worker stub"
```

---

## Task 8: Convert schema to PostgreSQL

**Files:**
- Create: `migrations/postgresql_schema.sql`

- [ ] **Step 1: Create `migrations/postgresql_schema.sql`**

```sql
-- Scholarix CRM — PostgreSQL Schema
-- Converted from Cloudflare D1 (SQLite)

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'agent')) DEFAULT 'agent',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- LEADS
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    company TEXT,
    position TEXT,
    status TEXT CHECK(status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')) DEFAULT 'new',
    source TEXT CHECK(source IN ('website', 'referral', 'cold-call', 'email', 'social-media', 'event', 'other')) DEFAULT 'other',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    estimated_value NUMERIC(10,2) DEFAULT 0,
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    next_follow_up TIMESTAMPTZ,
    last_contact TIMESTAMPTZ,
    notes TEXT,
    tags TEXT
);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_by ON leads(created_by);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up);
CREATE INDEX idx_leads_priority ON leads(priority);

-- CALLS
CREATE TABLE calls (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    call_date TIMESTAMPTZ DEFAULT NOW(),
    duration INTEGER DEFAULT 0,
    outcome TEXT CHECK(outcome IN ('answered', 'no-answer', 'voicemail', 'busy', 'callback', 'meeting-scheduled', 'not-interested')) DEFAULT 'answered',
    notes TEXT,
    recording_url TEXT,
    script_used TEXT,
    sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
    next_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_call_date ON calls(call_date);

-- CONVERSATIONS
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type TEXT CHECK(message_type IN ('note', 'email', 'sms', 'call-summary', 'meeting-notes')) DEFAULT 'note',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- ACTIVITY LOGS
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- CALL SCRIPTS
CREATE TABLE call_scripts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_call_scripts_is_active ON call_scripts(is_active);
CREATE INDEX idx_call_scripts_category ON call_scripts(category);

-- TASKS
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK(status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- TAGS
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tags_name ON tags(name);

-- LEAD_TAGS (composite PK, no id column)
CREATE TABLE lead_tags (
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (lead_id, tag_id)
);
CREATE INDEX idx_lead_tags_lead_id ON lead_tags(lead_id);
CREATE INDEX idx_lead_tags_tag_id ON lead_tags(tag_id);

-- VIEWS
CREATE VIEW v_leads_detailed AS
SELECT
    l.*,
    u.full_name AS assigned_to_name,
    u.email AS assigned_to_email,
    c.full_name AS created_by_name,
    (SELECT COUNT(*) FROM calls WHERE lead_id = l.id) AS total_calls,
    (SELECT COUNT(*) FROM conversations WHERE lead_id = l.id) AS total_conversations,
    (SELECT MAX(call_date) FROM calls WHERE lead_id = l.id) AS last_call_date
FROM leads l
LEFT JOIN users u ON l.assigned_to = u.id
LEFT JOIN users c ON l.created_by = c.id;

CREATE VIEW v_user_call_stats AS
SELECT
    u.id,
    u.full_name,
    COUNT(c.id) AS total_calls,
    SUM(c.duration) AS total_duration,
    AVG(c.duration) AS avg_duration,
    COUNT(CASE WHEN c.outcome = 'answered' THEN 1 END) AS answered_calls,
    COUNT(CASE WHEN c.outcome IN ('no-answer', 'voicemail', 'busy') THEN 1 END) AS missed_calls
FROM users u
LEFT JOIN calls c ON u.id = c.user_id
GROUP BY u.id, u.full_name;

CREATE VIEW v_pipeline_summary AS
SELECT
    status,
    COUNT(*) AS count,
    SUM(estimated_value) AS total_value,
    AVG(estimated_value) AS avg_value
FROM leads
GROUP BY status;

-- TRIGGERS (PostgreSQL syntax)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_call_scripts_updated_at BEFORE UPDATE ON call_scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION increment_script_usage()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.script_used IS NOT NULL THEN
        UPDATE call_scripts SET usage_count = usage_count + 1 WHERE title = NEW.script_used;
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_increment_script_usage AFTER INSERT ON calls
    FOR EACH ROW EXECUTE FUNCTION increment_script_usage();

CREATE OR REPLACE FUNCTION update_lead_last_contact()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE leads SET last_contact = NEW.call_date WHERE id = NEW.lead_id;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_update_lead_last_contact AFTER INSERT ON calls
    FOR EACH ROW EXECUTE FUNCTION update_lead_last_contact();

-- SEED DATA
INSERT INTO call_scripts (title, content, category, description, is_active) VALUES
('Initial Cold Call', 'Hi [Name], this is [Your Name] from Scholarix. I noticed [Company] could benefit from our education solutions. Do you have a moment to discuss how we help institutions improve student outcomes?', 'cold-call', 'Standard opening for cold calls', TRUE),
('Follow-up Call', 'Hi [Name], following up on our conversation from [Date]. I wanted to discuss [Topic] and see if you had any questions about our proposal.', 'follow-up', 'Standard follow-up script', TRUE),
('Demo Scheduling', 'Hi [Name], thank you for your interest in Scholarix. I''d love to schedule a personalized demo. Are you available [Day] at [Time]?', 'demo', 'Demo scheduling script', TRUE);

INSERT INTO tags (name, color) VALUES
('Hot Lead', '#EF4444'),
('Qualified', '#10B981'),
('Decision Maker', '#8B5CF6'),
('Budget Approved', '#F59E0B'),
('Needs Nurturing', '#6B7280');
```

- [ ] **Step 2: Commit**

```bash
git add migrations/postgresql_schema.sql
git commit -m "feat: add postgresql schema converted from d1 sqlite"
```

---

## Task 9: Create missing Dockerfiles and fix Dockerfile.web

**Files:**
- Create: `contabo-deployment/Dockerfile.api`
- Create: `contabo-deployment/Dockerfile.worker`
- Modify: `contabo-deployment/Dockerfile.web`

- [ ] **Step 1: Create `contabo-deployment/Dockerfile.api`**

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8787

CMD ["npx", "tsx", "server/index.ts"]
```

- [ ] **Step 2: Create `contabo-deployment/Dockerfile.worker`**

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "tsx", "server/worker.ts"]
```

- [ ] **Step 3: Fix `contabo-deployment/Dockerfile.web`**

The existing file uses `npm ci --only=production` which skips Vite and TypeScript (devDependencies), causing the build to fail. Change the builder stage to use a full install:

Find:
```dockerfile
RUN npm ci --only=production
```

Replace with:
```dockerfile
RUN npm ci
```

- [ ] **Step 4: Commit**

```bash
git add contabo-deployment/Dockerfile.api contabo-deployment/Dockerfile.worker contabo-deployment/Dockerfile.web
git commit -m "feat: add dockerfile.api, dockerfile.worker; fix dockerfile.web devdeps"
```

---

## Task 10: Create the web container inner Nginx config

**Files:**
- Create: `contabo-deployment/nginx-web.conf`

The `Dockerfile.web` copies this file to `/etc/nginx/conf.d/default.conf` inside the web container. It serves the Vite SPA build on port 3000.

- [ ] **Step 1: Create `contabo-deployment/nginx-web.conf`**

```nginx
server {
    listen 3000;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing — all paths fall back to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

- [ ] **Step 2: Commit**

```bash
git add contabo-deployment/nginx-web.conf
git commit -m "feat: add inner nginx config for web container"
```

---

## Task 11: Update the outer Nginx config for the domain and SSL

**Files:**
- Modify: `contabo-deployment/nginx.conf`

- [ ] **Step 1: Replace `contabo-deployment/nginx.conf` with this content**

```nginx
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;
    client_max_body_size 50M;

    upstream web { server web:3000; }
    upstream api { server api:8787; }

    # HTTP → HTTPS redirect
    server {
        listen 80;
        server_name train.scholarixglobal.com;
        return 301 https://$host$request_uri;
    }

    # HTTPS main server
    server {
        listen 443 ssl;
        server_name train.scholarixglobal.com;

        ssl_certificate     /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;

        # Frontend
        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API
        location /api/ {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Recordings (served as static files from Docker volume)
        location /recordings/ {
            alias /var/www/recordings/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add contabo-deployment/nginx.conf
git commit -m "feat: configure nginx for train.scholarixglobal.com with ssl"
```

---

## Task 12: Update CORS and production environment files

**Files:**
- Modify: `functions/index.ts` (line ~29)
- Modify: `.env.production`

- [ ] **Step 1: Add the production domain to CORS in `functions/index.ts`**

Find the `allowedOrigins` array (around line 29) and add the new domain:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://interactive-sales-ca.pages.dev',
  'https://train.scholarixglobal.com',  // Add this line
];
```

- [ ] **Step 2: Update `.env.production`**

Replace the entire file content:

```
# Production Environment — train.scholarixglobal.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PRODUCTION_KEY_HERE
VITE_API_BASE_URL=https://train.scholarixglobal.com/api
VITE_PRODUCTION_API_URL=https://train.scholarixglobal.com/api
VITE_ENVIRONMENT=production

# Ollama (GPU-accelerated LLM on Contabo)
VITE_OLLAMA_BASE_URL=http://80.241.218.108:11434
VITE_OLLAMA_MODEL=llama3.1:latest
```

- [ ] **Step 3: Add `APP_URL` to the api service in `contabo-deployment/docker-compose.yml`**

Find the `api` service `environment:` block and add one line:

```yaml
  api:
    environment:
      - NODE_ENV=production
      - APP_URL=https://train.scholarixglobal.com   # Add this line
      - DB_HOST=${DB_HOST:-postgres}
```

- [ ] **Step 4: Verify types**

```bash
npm run type-check && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 5: Commit**

```bash
git add functions/index.ts .env.production contabo-deployment/docker-compose.yml
git commit -m "feat: update cors, env, and docker-compose for train.scholarixglobal.com"
```

---

## Task 13: VPS provisioning — SSL cert and docker-compose

This task runs on the **Contabo VPS** (not the local repo). Prerequisites: DNS A record for `train.scholarixglobal.com` must point to `80.241.218.108`.

- [ ] **Step 1: On VPS — install Certbot and get the cert**

```bash
ssh root@80.241.218.108
apt-get install -y certbot
# Port 80 must be free (stop any existing nginx/docker nginx)
certbot certonly --standalone -d train.scholarixglobal.com
# Certs land at: /etc/letsencrypt/live/train.scholarixglobal.com/
```

Expected: `Congratulations! Your certificate and chain have been saved at /etc/letsencrypt/live/train.scholarixglobal.com/fullchain.pem`

- [ ] **Step 2: On VPS — create .env.contabo from template**

```bash
cp /opt/scholarix-crm/contabo-deployment/.env.contabo.template /opt/scholarix-crm/.env.contabo
```

Edit `/opt/scholarix-crm/.env.contabo` and fill in:
- `CLERK_PUBLISHABLE_KEY=pk_live_...` (from Clerk dashboard)
- `CLERK_SECRET_KEY=sk_live_...`
- `DB_PASSWORD=` (choose a strong password)
- `APP_URL=https://train.scholarixglobal.com`

- [ ] **Step 3: On VPS — update docker-compose.yml to bind SSL certs**

In `contabo-deployment/docker-compose.yml`, find the `nginx` service volumes and add the cert bind mount:

```yaml
  nginx:
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt/live/train.scholarixglobal.com/fullchain.pem:/etc/nginx/ssl/fullchain.pem:ro
      - /etc/letsencrypt/live/train.scholarixglobal.com/privkey.pem:/etc/nginx/ssl/privkey.pem:ro
      - recordings-data:/var/www/recordings:ro
```

- [ ] **Step 4: On VPS — build and start all containers**

```bash
cd /opt/scholarix-crm
docker-compose -f contabo-deployment/docker-compose.yml up -d --build
```

Expected: 7 containers start (`web`, `api`, `postgres`, `redis`, `ollama`, `tts-server`, `worker`, `nginx`).

- [ ] **Step 5: On VPS — run the PostgreSQL schema**

```bash
docker exec -i scholarix-postgres psql -U scholarix -d scholarix_crm \
  < /opt/scholarix-crm/migrations/postgresql_schema.sql
```

Expected: `CREATE TABLE` repeated 9 times, `CREATE VIEW` 3 times, `CREATE TRIGGER` 6 times, `INSERT 0 3`, `INSERT 0 5`.

- [ ] **Step 6: Verify API health**

```bash
curl https://train.scholarixglobal.com/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

- [ ] **Step 7: Verify frontend loads**

```bash
curl -I https://train.scholarixglobal.com
```

Expected: `HTTP/2 200`

---

## Task 14: Final branch push

- [ ] **Step 1: Verify all commits are on the feature branch**

```bash
git log --oneline feature/production-upgrade ^main | head -20
```

Expected: Tasks 2–12 commits listed.

- [ ] **Step 2: Push the feature branch**

```bash
git push -u origin feature/production-upgrade
```

- [ ] **Step 3: Open a PR for review**

```bash
gh pr create \
  --title "feat: complete contabo vps migration" \
  --body "Completes the self-hosted deployment to train.scholarixglobal.com. Adds Node.js server entry, PostgreSQL D1 adapter, filesystem storage adapter, missing Dockerfiles, and SSL Nginx config." \
  --base main \
  --head feature/production-upgrade
```
