// src/lib/queue/connection.ts
import IORedis from 'ioredis';
import { envVars } from '../../config/env';

/**
 * Dedicated Redis connection for BullMQ. BullMQ expects the client to be
 * configured with `maxRetriesPerRequest: null` to avoid warnings when the
 * connection drops. We reuse the same REDIS_URL that the rest of the app
 * already uses, falling back to a local instance if the env var is missing.
 */
export const bullRedis = new IORedis(envVars.REDIS_URL ?? 'redis://localhost:6379', {
  // BullMQ recommends disabling the retry per request behaviour.
  maxRetriesPerRequest: null,
  // Enable auto-reconnect with exponential back‑off.
  enableReadyCheck: true,
});

bullRedis.on('error', (err) => {
  console.error('[BullMQ] Redis connection error:', err);
});

bullRedis.on('connect', () => {
  console.log('[BullMQ] Connected to Redis');
});
