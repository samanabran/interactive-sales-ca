# Contabo Deployment Guide

## Overview
This directory contains all configuration files for deploying the Interactive Sales Call App to your Contabo VPS (80.241.218.108) with full AI capabilities.

## Pre-Configured on Contabo
- **Docker & Docker Compose** - Container runtime
- **Nginx** - Reverse proxy with TLS termination
- **Ollama** - Local LLM service with GPU acceleration
  - Available models: `llama3.1:8b`, `llama3.2:3b`, `mxbai-embed-large`, `whisper`
  - Endpoint: `http://80.241.218.108:11434`

## Quick Start

### 1. Prepare Environment
```bash
# Copy template
cp contabo-deployment/.env.contabo.template contabo-deployment/.env

# Edit with your actual values
nano contabo-deployment/.env
```

### 2. Transfer Files to Contabo
```bash
# From your local machine
scp -r -i ~/.ssh/contabo_80_241_218_108 ./ interactive-sales-ca root@80.241.218.108:/opt/

# SSH to Contabo
ssh -i ~/.ssh/contabo_80_241_218_108 root@80.241.218.108
```

### 3. Deploy on Contabo
```bash
cd /opt/interactive-sales-ca

# Create external network if not exists
docker network create contabo-network

# Deploy all services
docker-compose -f contabo-deployment/docker-compose.yml up -d

# Check status
docker ps
docker logs -f scholarix-api
```

### 4. Initialize Database
```bash
# Run migrations
docker exec -it scholarix-api npm run db:migrate

# (Optional) Load sample data
docker exec -it scholarix-api npm run db:seed
```

## Services Deployed

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **web** | scholarix-web | 3000 | React frontend (built with Vite) |
| **api** | scholarix-api | 8787 | Node.js API (migrated from Cloudflare Workers) |
| **ollama** | scholarix-ollama | 11434 | Local LLM with GPU acceleration |
| **postgres** | scholarix-postgres | 5432 | PostgreSQL database |
| **redis** | scholarix-redis | 6379 | Queue & cache |
| **nginx** | scholarix-nginx | 80/443 | Reverse proxy with TLS |

## Architecture Changes from Cloudflare

| Component | Cloudflare (Current) | Contabo (Target) |
|-----------|----------------------|-------------------|
| **Frontend** | Cloudflare Pages | Docker + Nginx |
| **API** | Cloudflare Workers (Hono) | Node.js + Express/Hono |
| **Database** | D1 (SQLite) | PostgreSQL 16 |
| **Storage** | R2 (Cloudflare) | Local filesystem or MinIO |
| **Cache/Queue** | None | Redis |
| **AI** | OpenAI API only | Ollama (local) + OpenAI fallback |

## Monitoring & Logs

```bash
# View logs for all services
docker-compose -f contabo-deployment/docker-compose.yml logs -f

# Specific service logs
docker logs -f scholarix-ollama  # AI service
docker logs -f scholarix-api      # API errors
docker logs -f scholarix-web      # Frontend

# Resource usage
docker stats

# Ollama model management
docker exec -it scholarix-ollama ollama list
docker exec -it scholarix-ollama ollama pull <model-name>
```

## SSL/TLS Configuration

1. **Obtain SSL certificates** (using Let's Encrypt):
```bash
# Install certbot on Contabo
apt update && apt install certbot

# Generate certificates
certbot certonly --standalone -d your-domain.com
```

2. **Update nginx.conf** to use SSL:
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    # ... rest of config
}
```

3. **Restart Nginx**:
```bash
docker exec scholarix-nginx nginx -s reload
```

## Troubleshooting

### Ollama not using GPU
```bash
# Check if GPU is visible
docker exec scholarix-ollama nvidia-smi

# If not, ensure NVIDIA Container Toolkit is installed on Contabo
# https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
```

### Database connection issues
```bash
# Test PostgreSQL connection
docker exec -it scholarix-postgres psql -U scholarix -d scholarix_crm

# Check environment variables
docker exec scholarix-api env | grep DB_
```

### API can't reach Ollama
```bash
# Test from API container
docker exec scholarix-api curl http://ollama:11434/api/tags

# Check network
docker network inspect contabo-network
```

## Next Steps

1. Complete Phase 1 (Cleanup) using Claude Code with `/superpowers:autopilot`
2. Migrate database schema from D1 to PostgreSQL
3. Update API to use PostgreSQL instead of D1
4. Test AI features with local Ollama on Contabo
5. Configure DNS to point to Contabo VPS
6. Enable SSL/TLS with Let's Encrypt

## Cost Comparison

| Service | Cloudflare (Free Tier) | Contabo VPS (80.241.218.108) |
|---------|------------------------|-------------------------------|
| **Monthly Cost** | $0 | ~$30-50 (already paid) |
| **AI Models** | OpenAI API (pay-per-call) | Ollama (unlimited, free) |
| **Database** | D1 (5GB free) | PostgreSQL (387GB SSD) |
| **Storage** | R2 (10GB free) | Local (387GB available) |
| **Compute** | Limited (50ms/request) | 8 CPU, 23GB RAM |
| **GPU for AI** | ❌ No | ✅ Yes (pre-configured) |

## References

- GitHub Repo: https://github.com/renbran/interactive-sales-ca
- Ollama Docs: https://ollama.com/docs
- Docker Compose: https://docs.docker.com/compose/
- Nginx Config: https://nginx.org/en/docs/
