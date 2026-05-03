#!/bin/bash
# Deploy Kokoro TTS on Contabo VPS (80.241.218.108)
# Run this on the Contabo server via SSH:
#   ssh root@80.241.218.108
#   bash <(curl -s https://raw.githubusercontent.com/.../setup-kokoro.sh)
#
# Or copy-paste these commands directly:

set -e

echo "=== Installing Kokoro TTS (CPU) on Contabo VPS ==="

# Pull the Kokoro FastAPI CPU image
docker pull ghcr.io/remsky/kokoro-fastapi-cpu:latest

# Stop existing container if running
docker stop kokoro-tts 2>/dev/null || true
docker rm kokoro-tts 2>/dev/null || true

# Run Kokoro TTS server on port 8880
docker run -d \
  --name kokoro-tts \
  --restart unless-stopped \
  -p 8880:8880 \
  ghcr.io/remsky/kokoro-fastapi-cpu:latest

echo "=== Waiting for Kokoro TTS to start (30s) ==="
sleep 30

# Test it
echo "=== Testing Kokoro TTS ==="
curl -s -X POST http://localhost:8880/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"kokoro","input":"Hello, this is Kokoro TTS.","voice":"am_michael","response_format":"mp3"}' \
  --output /tmp/test-kokoro.mp3 \
  && echo "✅ Kokoro TTS is working! Audio saved to /tmp/test-kokoro.mp3" \
  || echo "❌ Kokoro TTS test failed"

echo ""
echo "=== Available voices ==="
curl -s http://localhost:8880/v1/voices | python3 -m json.tool 2>/dev/null || \
  echo "af_heart, af_bella, af_nicole, af_sarah, am_adam, am_michael, bf_emma, bf_isabella, bm_george, bm_lewis"

echo ""
echo "=== Kokoro TTS deployed ==="
echo "Endpoint: http://80.241.218.108:8880"
echo "API docs: http://80.241.218.108:8880/docs"
echo ""
echo "Make sure port 8880 is open in Contabo firewall:"
echo "  ufw allow 8880/tcp"
