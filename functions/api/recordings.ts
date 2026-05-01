// functions/api/recordings.ts
// Recording upload API for call recordings

import { Hono } from 'hono';
import type { Env, AuthContext } from '../../src/lib/types';

export const recordingRoutes = new Hono<{ Bindings: Env; Variables: { auth: AuthContext } }>();

// =====================================================
// UPLOAD RECORDING
// =====================================================

recordingRoutes.post('/upload', async (c) => {
  const auth = c.get('auth');

  try {
    // Check if R2 binding exists
    if (!c.env.RECORDINGS) {
      console.error('R2 RECORDINGS binding not found');
      return c.json({ 
        error: 'R2 storage not configured. Please enable R2 in Cloudflare dashboard and create bucket.' 
      }, 503);
    }

    // Parse the multipart form data
    const formData = await c.req.formData();
    const file = formData.get('recording');
    const leadId = formData.get('lead_id');
    const callId = formData.get('call_id');

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No recording file provided' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'webm';
    const filename = `recordings/${auth.userId}/${timestamp}-${leadId || 'unknown'}.${extension}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to R2 - R2.put only takes key and value
    await c.env.RECORDINGS.put(filename, arrayBuffer);

    // Use route-based URL instead of direct R2 URL (enforces RBAC on playback)
    const recordingUrl = `/api/recordings/${filename.replace('recordings/', '')}`;

    console.log('Recording uploaded successfully:', filename);

    return c.json({
      success: true,
      url: recordingUrl,
      filename,
      size: arrayBuffer.byteLength,
      contentType: file.type,
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    return c.json({ 
      error: 'Failed to upload recording',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// =====================================================
// GET RECORDING
// =====================================================

recordingRoutes.get('/:filename{.+}', async (c) => {
  const auth = c.get('auth');
  const filename = c.req.param('filename');

  try {
    // Check if R2 binding exists
    if (!c.env.RECORDINGS) {
      return c.json({ error: 'R2 storage not configured' }, 503);
    }

    // Get file from R2
    const object = await c.env.RECORDINGS.get(`recordings/${filename}`);

    if (!object) {
      return c.json({ error: 'Recording not found' }, 404);
    }

    // Check access permissions
    const metadata = object.customMetadata;
    if (auth.role === 'agent' && metadata?.userId !== auth.userId.toString()) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Return the audio file
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'audio/webm',
        'Content-Length': object.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error fetching recording:', error);
    return c.json({ error: 'Failed to fetch recording' }, 500);
  }
});

// =====================================================
// DELETE RECORDING
// =====================================================

recordingRoutes.delete('/:filename{.+}', async (c) => {
  const auth = c.get('auth');
  const filename = c.req.param('filename');

  try {
    // Check if R2 binding exists
    if (!c.env.RECORDINGS) {
      return c.json({ error: 'R2 storage not configured' }, 503);
    }

    // Get file metadata first to check permissions
    const object = await c.env.RECORDINGS.get(`recordings/${filename}`);

    if (!object) {
      return c.json({ error: 'Recording not found' }, 404);
    }

    // Only admins or the owner can delete
    const metadata = object.customMetadata;
    if (auth.role === 'agent' && metadata?.userId !== auth.userId.toString()) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Delete from R2
    await c.env.RECORDINGS.delete(`recordings/${filename}`);

    console.log('Recording deleted:', filename);

    return c.json({ success: true, message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Error deleting recording:', error);
    return c.json({ error: 'Failed to delete recording' }, 500);
  }
});
