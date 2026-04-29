# Contabo Migration Design
**Date:** 2026-04-29  
**Project:** Scholarix CRM — Cloudflare → Contabo VPS  
**Domain:** train.scholarixglobal.com  
**VPS:** 194.163.151.204 (Ollama + Edge TTS already running)

---

## Goal

Complete the self-hosted deployment on Contabo so the app runs fully at `https://train.scholarixglobal.com`. No data migration needed — fresh PostgreSQL database.

---

## Architecture

```
train.scholarixglobal.com (DNS A → 194.163.151.204)
        │
      Nginx :443  (Let's Encrypt SSL via Certbot)
        ├── /           → web :3000   (Nginx serving Vite build)
        ├── /api/*      → api :8787   (Hono on Node.js + PostgreSQL)
        └── /recordings/* → static files from recordings volume

Internal (contabo-network Docker bridge):
  api     → postgres :5432
  api     → redis :6379
  worker  → postgres, redis, ollama :11434
  ollama  (GPU-accelerated, pre-running)
  tts-server :5050 (pre-running)
```

---

## What's Being Built

| Item | Status | Action |
|------|--------|--------|
| `Dockerfile.api` | ❌ missing | Create — Node.js 20 + `@hono/node-server` |
| `Dockerfile.worker` | ❌ missing | Create — minimal Node.js background runner |
| `server/index.ts` | ❌ missing | New Node.js entry point for the API |
| `server/db.ts` | ❌ missing | D1-compatible adapter wrapping `pg.Pool` |
| `server/storage.ts` | ❌ missing | Local filesystem adapter replacing R2 |
| `migrations/postgresql_schema.sql` | ❌ missing | SQLite schema converted to PostgreSQL |
| `nginx.conf` | ⚠️ generic | Update with domain + SSL blocks |
| `contabo-deployment/nginx-web.conf` | ❌ missing | Inner Nginx config for the web container |
| `functions/index.ts` CORS | ⚠️ hardcoded | Add `train.scholarixglobal.com` to allowed origins |
| `.env.contabo` | ⚠️ template only | Document which values must be filled in |
| Frontend `.env.production` | ⚠️ stale | Point `VITE_API_BASE_URL` to new domain |

---

## Core Technical Approach: D1 Adapter

The route handlers in `functions/api/*.ts` all use the Cloudflare D1 API:

```typescript
c.env.DB.prepare(sql).bind(...params).first()   // single row
c.env.DB.prepare(sql).bind(...params).all()     // { results: Row[] }
c.env.DB.prepare(sql).bind(...params).run()     // mutation
```

Rather than rewriting every route, `server/db.ts` wraps `pg.Pool` to expose an identical interface. Two differences to handle:
1. D1 uses `?` positional placeholders → PostgreSQL uses `$1`, `$2`
2. D1's `.all()` returns `{ results: rows }` → wrap `pool.query()` result

The adapter converts `?` → `$N` at query time, so **zero changes are needed in `functions/api/*.ts`**.

`buildWhereClause()` in `functions/index.ts` also produces `?` placeholders — the adapter handles this automatically.

---

## Recordings Storage

D1's `c.env.RECORDINGS` (R2) is replaced by local filesystem writes to `/data/recordings/` (Docker volume `recordings-data`). `server/storage.ts` exposes:
- `put(key, buffer)` → writes file to disk
- `get(key)` → reads file from disk, returns stream
- `delete(key)` → unlinks file

Nginx serves `/recordings/*` as static files from the same volume.

---

## PostgreSQL Schema Changes

The SQLite schema needs these adaptations:
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- `BOOLEAN DEFAULT TRUE` → `BOOLEAN DEFAULT TRUE` (compatible, no change)
- `REAL` → `NUMERIC(10,2)`
- `TEXT CHECK(...)` → `TEXT CHECK(...)` (compatible)
- SQLite triggers (`AFTER UPDATE`) → PostgreSQL `CREATE OR REPLACE FUNCTION` + `CREATE TRIGGER`
- `CURRENT_TIMESTAMP` → `NOW()` (both work, but use `NOW()` consistently)

---

## Nginx Changes

The existing `nginx.conf` serves HTTP only with `server_name _`. It needs:
1. HTTP → HTTPS redirect block
2. HTTPS server block for `train.scholarixglobal.com` with Let's Encrypt cert paths
3. WebSocket upgrade headers on `/api/*` (for future WebSocket support)
4. `/recordings/*` static file serving from the Docker volume

SSL certs are provisioned on the VPS (outside Docker) via Certbot, then bind-mounted into the Nginx container.

---

## Clerk Production Setup

1. Create new Clerk production app at `dashboard.clerk.com`
2. Add `https://train.scholarixglobal.com` as allowed origin + redirect URL
3. Copy `CLERK_PUBLISHABLE_KEY` (pk_live_...) and `CLERK_SECRET_KEY` (sk_live_...) into `.env.contabo`
4. Update `VITE_CLERK_PUBLISHABLE_KEY` in the frontend build

---

## Worker Service

The `docker-compose.yml` worker service handles background processing (transcription, analysis). For the initial migration a minimal stub is sufficient — it connects to Postgres + Redis + Ollama but runs no jobs until the queue logic is implemented. A simple `node server/worker.ts` process that logs "worker ready" keeps the container healthy.

---

## Deployment Sequence (on VPS)

```bash
# 1. On VPS: Install Certbot + get cert (before starting Nginx container)
certbot certonly --standalone -d train.scholarixglobal.com

# 2. Copy repo + .env.contabo to VPS
# 3. Build and start all containers
docker-compose -f contabo-deployment/docker-compose.yml up -d --build

# 4. Run PostgreSQL schema
docker exec -i scholarix-postgres psql -U scholarix -d scholarix_crm < migrations/postgresql_schema.sql

# 5. Verify
curl https://train.scholarixglobal.com/api/health
```

---

## Out of Scope

- Migrating existing Cloudflare data (none to migrate)
- Redis queue job implementations (worker stub only)
- CI/CD pipeline
- Monitoring / alerting setup
