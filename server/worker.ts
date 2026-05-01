import { db } from './db.js';

async function main() {
  console.log('[worker] Scholarix CRM worker starting...');

  // Verify database connectivity
  try {
    await db.prepare('SELECT 1').first();
    console.log('[worker] Database connected');
  } catch (err) {
    console.error('[worker] Database connection failed:', err);
    process.exit(1);
  }

  console.log('[worker] Worker ready — background job queue not yet implemented');

  // Keep alive
  setInterval(() => {
    // placeholder for future job polling
  }, 60_000);
}

main().catch((err) => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});
