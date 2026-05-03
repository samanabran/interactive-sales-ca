// functions/api/calls.ts
// Call management API routes

import { Hono } from 'hono';
import type { Env, AuthContext } from '../../src/lib/types';
import { createActivityLog, getPaginationParams, buildWhereClause } from '../index';
import { createTranscriptionService } from '../services/transcription';

export const callRoutes = new Hono<{ Bindings: Env; Variables: { auth: AuthContext } }>();

// =====================================================
// GET ALL CALLS
// =====================================================

callRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const url = new URL(c.req.url);
  const { page, limit, offset } = getPaginationParams(url);

  try {
    const filters: Record<string, any> = {};

    // Agents see only their calls, admins see all
    if (auth.role === 'agent') {
      filters.user_id = auth.userId;
    } else if (url.searchParams.get('user_id')) {
      filters.user_id = parseInt(url.searchParams.get('user_id')!);
    }

    if (url.searchParams.get('lead_id')) {
      filters.lead_id = parseInt(url.searchParams.get('lead_id')!);
    }
    if (url.searchParams.get('outcome')) {
      filters.outcome = url.searchParams.get('outcome');
    }

    const { where, params } = buildWhereClause(filters);

    // Get total count
    const countQuery = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM calls ${where}`
    ).bind(...params).first();

    const total = (countQuery?.total as number) || 0;

    // Get calls with details
    const calls = await c.env.DB.prepare(`
      SELECT 
        c.*,
        l.name as lead_name,
        l.company as lead_company,
        u.full_name as user_name
      FROM calls c
      LEFT JOIN leads l ON c.lead_id = l.id
      LEFT JOIN users u ON c.user_id = u.id
      ${where}
      ORDER BY c.call_date DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    return c.json({
      data: calls.results,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return c.json({ error: 'Failed to fetch calls' }, 500);
  }
});

// =====================================================
// GET CALL BY ID
// =====================================================

callRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    const call = await c.env.DB.prepare(`
      SELECT 
        c.*,
        l.name as lead_name,
        l.company as lead_company,
        u.full_name as user_name
      FROM calls c
      LEFT JOIN leads l ON c.lead_id = l.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).bind(id).first();

    if (!call) {
      return c.json({ error: 'Call not found' }, 404);
    }

    // Agents can only see their own calls
    if (auth.role === 'agent' && call.user_id !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json({ data: call });
  } catch (error) {
    console.error('Error fetching call:', error);
    return c.json({ error: 'Failed to fetch call' }, 500);
  }
});

// =====================================================
// CREATE CALL
// =====================================================

callRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  try {
    const {
      lead_id,
      call_date = new Date().toISOString(),
      duration = 0,
      outcome,
      notes,
      recording_url,
      recording_duration,
      script_used,
      sentiment,
      next_action,
    } = body;

    // Validation
    if (!lead_id || !outcome) {
      return c.json({ error: 'lead_id and outcome are required' }, 400);
    }

    // Check lead access
    const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?')
      .bind(lead_id)
      .first();

    if (!lead) {
      return c.json({ error: 'Lead not found' }, 404);
    }

    if (auth.role === 'agent' && lead.assigned_to !== auth.userId) {
      return c.json({ error: 'You can only log calls for your assigned leads' }, 403);
    }

    // Create call
    const result = await c.env.DB.prepare(`
      INSERT INTO calls (
        lead_id, user_id, call_date, duration, outcome, notes,
        recording_url, recording_duration, script_used, sentiment, next_action
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      lead_id,
      auth.userId,
      call_date,
      duration,
      outcome,
      notes || null,
      recording_url || null,
      recording_duration || null,
      script_used || null,
      sentiment || null,
      next_action || null
    ).run();

    const callId = result.meta.last_row_id;

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'call_logged',
      'call',
      callId,
      { lead_id, outcome, duration }
    );

    // Fetch created call
    const call = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(callId)
      .first();

    return c.json({ data: call, message: 'Call logged successfully' }, 201);
  } catch (error) {
    console.error('Error creating call:', error);
    return c.json({ error: 'Failed to log call' }, 500);
  }
});

// =====================================================
// UPDATE CALL
// =====================================================

callRoutes.put('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  try {
    // Check if call exists and user has access
    const existingCall = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(id)
      .first();

    if (!existingCall) {
      return c.json({ error: 'Call not found' }, 404);
    }

    if (existingCall.user_id !== auth.userId && auth.role !== 'admin') {
      return c.json({ error: 'You can only edit your own calls' }, 403);
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    const allowedFields = ['duration', 'outcome', 'notes', 'sentiment', 'next_action'];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(body[field]);
      }
    });

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    params.push(id);

    await c.env.DB.prepare(`
      UPDATE calls SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'call_updated',
      'call',
      id,
      body
    );

    // Fetch updated call
    const call = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(id)
      .first();

    return c.json({ data: call, message: 'Call updated successfully' });
  } catch (error) {
    console.error('Error updating call:', error);
    return c.json({ error: 'Failed to update call' }, 500);
  }
});

// =====================================================
// DELETE CALL
// =====================================================

callRoutes.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    const call = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(id)
      .first();

    if (!call) {
      return c.json({ error: 'Call not found' }, 404);
    }

    // Only allow user to delete their own calls, or admin to delete any
    if (call.user_id !== auth.userId && auth.role !== 'admin') {
      return c.json({ error: 'You can only delete your own calls' }, 403);
    }

    await c.env.DB.prepare('DELETE FROM calls WHERE id = ?').bind(id).run();

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'call_deleted',
      'call',
      id,
      { lead_id: call.lead_id }
    );

    return c.json({ message: 'Call deleted successfully' });
  } catch (error) {
    console.error('Error deleting call:', error);
    return c.json({ error: 'Failed to delete call' }, 500);
  }
});

// =====================================================
// UPLOAD CALL RECORDING
// =====================================================

callRoutes.post('/:id/recording', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    // Check if call exists and user has access
    const call = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(id)
      .first();

    if (!call) {
      return c.json({ error: 'Call not found' }, 404);
    }

    if (call.user_id !== auth.userId && auth.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get file from request
    const formData = await c.req.formData();
    const file = formData.get('recording') as File;

    if (!file) {
      return c.json({ error: 'No recording file provided' }, 400);
    }

    // Upload to R2
    const fileKey = `recordings/${call.lead_id}/${id}-${Date.now()}.${file.name.split('.').pop()}`;
    await c.env.RECORDINGS.put(fileKey, file.stream());

    // Generate public URL
    const recordingUrl = `https://recordings.scholarix.com/${fileKey}`;

    // Update call with recording URL
    await c.env.DB.prepare('UPDATE calls SET recording_url = ? WHERE id = ?')
      .bind(recordingUrl, id)
      .run();

    // Log activity
    await createActivityLog(
      c.env.DB,
      auth.userId,
      'recording_uploaded',
      'call',
      id,
      { url: recordingUrl }
    );

    return c.json({ 
      data: { url: recordingUrl }, 
      message: 'Recording uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    return c.json({ error: 'Failed to upload recording' }, 500);
  }
});

// =====================================================
// TRANSCRIBE CALL RECORDING
// =====================================================

callRoutes.post('/:id/transcribe', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));
  const transcriptionSvc = createTranscriptionService(c.env);

  try {
    // Check if call exists and user has access
    const call = await c.env.DB.prepare('SELECT * FROM calls WHERE id = ?')
      .bind(id)
      .first();

    if (!call) {
      return c.json({ error: 'Call not found' }, 404);
    }

    if (call.user_id !== auth.userId && auth.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    if (!call.recording_url) {
      return c.json({ error: 'No recording found for this call' }, 400);
    }

    // Update call status to processing
    await c.env.DB.prepare('UPDATE calls SET transcription_status = ? WHERE id = ?')
      .bind('processing', id)
      .run();

    // Return 202 Accepted immediately; processing continues async
    c.executionCtx?.waitUntil(
      (async () => {
        try {
          // Normalize recording URL to an R2 object key.
          // Recordings stored via the upload endpoint use route-based URLs (/api/recordings/<path>).
          // Older recordings may already be stored as bare R2 keys (e.g. recordings/user/file.wav).
          // Full HTTP URLs (e.g. from a previous public-bucket setup) are not supported; they will
          // produce a failed status rather than silently return incorrect data.
          const rawUrl = String(call.recording_url);
          let recordingKey: string;
          if (rawUrl.startsWith('/api/recordings/')) {
            recordingKey = `recordings/${rawUrl.slice('/api/recordings/'.length)}`;
          } else if (rawUrl.startsWith('recordings/')) {
            recordingKey = rawUrl;
          } else if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
            console.error(`Unsupported recording URL format for call ${id}: ${rawUrl}`);
            await c.env.DB.prepare('UPDATE calls SET transcription_status = ? WHERE id = ?')
              .bind('failed', id)
              .run();
            return;
          } else {
            // Best-effort: treat as a bare key
            recordingKey = rawUrl;
          }

          const r2Object = await c.env.RECORDINGS.get(recordingKey);
          if (!r2Object) {
            await c.env.DB.prepare('UPDATE calls SET transcription_status = ? WHERE id = ?')
              .bind('failed', id)
              .run();
            return;
          }

          const audioBuffer = await r2Object.arrayBuffer();

          const result = await transcriptionSvc.processCallRecording(id, audioBuffer, 'en');

          // Store transcription in calls table (uses schema columns from 0002_add_transcription.sql)
          await c.env.DB.prepare(`
            UPDATE calls
            SET transcription = ?,
                transcription_status = 'done',
                transcription_summary = ?,
                transcription_key_points = ?,
                transcription_sentiment_analysis = ?,
                transcription_processed_at = ?
            WHERE id = ?
          `).bind(
            result.transcription,
            result.summary,
            JSON.stringify(result.key_points),
            JSON.stringify(result.sentiment_analysis),
            new Date().toISOString(),
            id
          ).run();

          // Store segments as individual rows
          for (const segment of result.segments) {
            await c.env.DB.prepare(`
              INSERT INTO transcription_segments
              (call_id, segment_index, start_time, end_time, speaker, text, confidence)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id,
              segment.segment_index,
              segment.start_time,
              segment.end_time,
              segment.speaker,
              segment.text,
              segment.confidence
            ).run();
          }

          // Store analytics
          const analytics = result.analytics;
          await c.env.DB.prepare(`
            INSERT INTO call_analytics
            (call_id, talk_time_agent, talk_time_customer, interruptions_count,
             silence_duration, sentiment_score, engagement_score, key_topics,
             action_items, objections_raised, buying_signals, next_steps, call_quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id,
            analytics.talk_time_agent,
            analytics.talk_time_customer,
            analytics.interruptions_count,
            analytics.silence_duration,
            analytics.sentiment_score,
            analytics.engagement_score,
            JSON.stringify(analytics.key_topics),
            JSON.stringify(analytics.action_items),
            JSON.stringify(analytics.objections_raised),
            JSON.stringify(analytics.buying_signals),
            analytics.next_steps,
            analytics.call_quality_score
          ).run();

          await createActivityLog(
            c.env.DB,
            auth.userId,
            'transcription_completed',
            'call',
            id,
            {
              sentiment: result.sentiment_analysis.overall_sentiment,
              topics: result.key_points.length,
              quality: analytics.call_quality_score
            }
          );
        } catch (bgError) {
          console.error(`Background transcription failed for call ${id}:`, bgError);
          await c.env.DB.prepare('UPDATE calls SET transcription_status = ? WHERE id = ?')
            .bind('failed', id)
            .run();
        }
      })()
    );

    return c.json(
      { message: 'Transcription started', callId: id, status: 'processing' },
      202
    );

  } catch (error) {
    console.error('Error starting transcription:', error);
    return c.json({ error: 'Failed to start transcription' }, 500);
  }
});


// =====================================================
// GET CALL TRANSCRIPTION
// =====================================================

callRoutes.get('/:id/transcription', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));

  try {
    // Check if call exists and user has access
    const call = await c.env.DB.prepare(`
      SELECT c.*,
             GROUP_CONCAT(ts.segment_index || ':' || ts.start_time || ':' || ts.end_time || ':' || ts.speaker || ':' || ts.text || ':' || COALESCE(ts.confidence, 0), '|') as segments_raw
      FROM calls c
      LEFT JOIN transcription_segments ts ON c.id = ts.call_id
      WHERE c.id = ?
      GROUP BY c.id
    `).bind(id).first();

    if (!call) {
      return c.json({ error: 'Call not found' }, 404);
    }

    if (call.user_id !== auth.userId && auth.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get analytics
    const analytics = await c.env.DB.prepare('SELECT * FROM call_analytics WHERE call_id = ?')
      .bind(id)
      .first();

    // Parse segments. The concatenated format is:
    // `segment_index:start_time:end_time:speaker:text:confidence`
    // Since `text` may contain colons, we extract the first 4 and last 1 field
    // positionally, and treat everything in between as the text body.
    const segments = call.segments_raw ? String(call.segments_raw).split('|').map(seg => {
      const parts = seg.split(':');
      // Minimum 6 parts expected; guard against malformed rows
      if (parts.length < 6) {
        console.warn(`Malformed transcription segment for call ${id}: "${seg}"`);
        return null;
      }
      const [segIndex, start, end, speaker] = parts;
      const confidence = parts[parts.length - 1];
      const text = parts.slice(4, parts.length - 1).join(':');
      return {
        segment_index: parseInt(segIndex),
        start_time: parseFloat(start),
        end_time: parseFloat(end),
        speaker,
        text,
        confidence: parseFloat(confidence)
      };
    }).filter(Boolean) : [];

    // Parse sentiment analysis from stored JSON
    let sentimentAnalysis = null;
    if (call.transcription_sentiment_analysis) {
      try {
        sentimentAnalysis = JSON.parse(String(call.transcription_sentiment_analysis));
      } catch {
        sentimentAnalysis = null;
      }
    }

    const transcriptionData = {
      status: call.transcription_status,
      transcription: call.transcription || null,
      summary: call.transcription_summary || null,
      key_points: call.transcription_key_points ? JSON.parse(String(call.transcription_key_points)) : [],
      sentiment_analysis: sentimentAnalysis,
      processed_at: call.transcription_processed_at || null,
      segments,
      analytics
    };

    return c.json({ data: transcriptionData });
  } catch (error) {
    console.error('Error getting transcription:', error);
    return c.json({ error: 'Failed to get transcription' }, 500);
  }
});
