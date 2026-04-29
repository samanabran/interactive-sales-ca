#!/usr/bin/env python3
"""
Whisper.cpp OpenAI-Compatible API Server
Provides /v1/audio/transcriptions endpoint (same as OpenAI Whisper API)
"""

import os
import subprocess
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('whisper-api')

# Configuration
WHISPER_BINARY = '/app/whisper.cpp/main'
MODEL_PATH = os.environ.get('MODEL_PATH', '/app/whisper.cpp/models/ggml-base.en.bin')
LANGUAGE = os.environ.get('WHISPER_LANGUAGE', 'en')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model': os.path.basename(MODEL_PATH)})

@app.route('/v1/audio/transcriptions', methods=['POST'])
def transcribe():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        audio_file = request.files['file']
        language = request.form.get('language', LANGUAGE)
        prompt = request.form.get('prompt', '')
        
        # Save uploaded file to temp
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            audio_file.save(tmp.name)
            temp_path = tmp.name
    
        logger.info(f'Transcribing: {temp_path}')
    
        # Build whisper command
        cmd = [
            WHISPER_BINARY,
            '-m', MODEL_PATH,
            '-f', temp_path,
            '-l', language,
            '--output-json',
            '-oj'
        ]
    
        if prompt:
            cmd.extend(['-initial-prompt', prompt])
    
        # Run whisper
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    
        # Cleanup temp file
        os.unlink(temp_path)
    
        if result.returncode != 0:
            logger.error(f'Whisper error: {result.stderr}')
            return jsonify({'error': result.stderr}), 500
    
        # Parse JSON output
        import json
        try:
            output = json.loads(result.stdout)
            return jsonify({
                'text': output.get('text', '').strip(),
                'language': language,
                'duration': output.get('duration', 0),
                'segments': output.get('segments', [])
            })
        except json.JSONDecodeError:
            # Fallback: return raw text
            return jsonify({
                'text': result.stdout.strip(),
                'language': language
            })
    
    except subprocess.TimeoutExpired:
        logger.error('Transcription timeout')
        return jsonify({'error': 'Transcription timeout (5 min limit)'}), 500
    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/v1/models', methods=['GET'])
def list_models():
    return jsonify({
        'data': [
            {
                'id': os.path.basename(MODEL_PATH),
                'object': 'model',
                'created': 1234567890,
                'owned_by': 'whisper.cpp'
            }
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 9000))
    logger.info(f'Starting Whisper API on port {port}')
    app.run(host='0.0.0.0', port=port)
