import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { db } from './db.js';
import { storage } from './storage.js';
import { authRoutes } from '../functions/api/auth.js';
import { leadRoutes } from '../functions/api/leads.js';
import { callRoutes } from '../functions/api/calls.js';
import { recordingRoutes } from '../functions/api/recordings.js';
import type { AuthContext } from '../src/lib/types.js';

const PORT = parseInt(process.env.PORT || '8787');
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const app = new Hono<{ Bindings: any; Variables: { auth: AuthContext } }>();

// Inject Cloudflare-compatible env bindings
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

// CORS
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://interactive-sales-ca.pages.dev',
      'https://train.scholarixglobal.com',
    ];
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  credentials: true,
}));

// Logger
app.use('*', logger());

// Auth middleware (Clerk JWT verification)
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
        'Authorization': `Bearer ${c.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
    }

    const clerkUser = await response.json() as any;
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE clerk_id = ?')
      .bind(clerkUser.sub)
      .first() as any;

    if (!user) {
      return c.json({ error: 'User not found', message: 'Please sync your account first' }, 404);
    }

    c.set('auth', {
      userId: user.id as number,
      clerkId: user.clerk_id as string,
      email: user.email as string,
      role: user.role as 'admin' | 'agent',
    });

    await c.env.DB.prepare('UPDATE users SET last_login = NOW() WHERE id = ?')
      .bind(user.id)
      .run();

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized', message: 'Token verification failed' }, 401);
  }
});

// Routes
app.get('/', (c) => c.json({
  message: 'Scholarix CRM API',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.route('/api/auth', authRoutes as any);
app.route('/api/leads', leadRoutes as any);
app.route('/api/calls', callRoutes as any);
app.route('/api/recordings', recordingRoutes as any);

app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    ...(c.env.ENVIRONMENT === 'development' && { stack: err.stack }),
  }, 500);
});

app.notFound((c) => c.json({
  error: 'Not Found',
  message: `Route ${c.req.path} not found`,
}, 404));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Scholarix CRM API running on http://localhost:${info.port}`);
});
