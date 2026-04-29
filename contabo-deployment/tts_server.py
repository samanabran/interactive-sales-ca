"""
Free TTS Server using Microsoft Edge TTS
No API key required - 200+ voices available
OpenAI-compatible endpoint for easy integration
"""

import io
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import edge_tts
import uvicorn

app = FastAPI(title="Free TTS Server (Edge TTS)", version="1.0.0")

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "en-US-AriaNeural"  # Default: US female
    rate: Optional[str] = "+0%"  # Speech rate: -50% to +50%
    volume: Optional[str] = "+0%"  # Volume: -100% to +100%
    pitch: Optional[str] = "+0Hz"  # Pitch adjustment

@app.get("/")
async def root():
    return {
        "service": "Free TTS Server",
        "engine": "Microsoft Edge TTS",
        "voices_endpoint": "/voices",
        "tts_endpoint": "/v1/audio/speech",
        "cost": "$0 - Completely Free",
        "note": "No API key required"
    }

@app.get("/voices")
async def list_voices():
    """List all available voices (200+ options)"""
    voices = await edge_tts.list_voices()
    return {
        "total_voices": len(voices),
        "languages": list(set([v["Locale"] for v in voices])),
        "sample_voices": [
            {"name": v["ShortName"], "gender": v["Gender"], "locale": v["Locale"]}
            for v in voices[:10]  # Return first 10 as samples
        ],
        "all_voices": voices
    }

@app.post("/v1/audio/speech")
async def generate_speech(request: TTSRequest):
    """
    OpenAI-compatible endpoint for TTS generation
    Returns audio in MP3 format
    """
    try:
        # Create communicator
        communicate = edge_tts.Communicate(
            text=request.text,
            voice=request.voice,
            rate=request.rate,
            volume=request.volume,
            pitch=request.pitch
        )
        
        # Generate audio
        audio_data = io.BytesIO()
        async for chunk in communicate.stream_sync():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])
        
        audio_data.seek(0)
        
        return Response(
            content=audio_data.read(),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3",
                "X-Voice-Used": request.voice
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "edge-tts-server"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5050)
