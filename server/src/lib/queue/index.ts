export * from './queues/email.queue';
export * from './queues/ai.queue';
export * from './queues/webhook.queue';
export * from './queues/newsletter.queue';
export * from './setup';
 
import { emailWorker } from './queues/email.queue';
import { aiWorker } from './queues/ai.queue';
import { webhookWorker } from './queues/webhook.queue';
import { newsletterWorker } from './queues/newsletter.queue';
import { bullRedis } from './connection';

/**
 * Initialize all workers. This is separate from queue creation
 * so we can run them in a separate process in production.
 */
export async function initWorkers() {
  const mode = process.env.APP_MODE || 'all';
  
  if (mode === 'web') {
    console.log('[BullMQ] Running in WEB mode. Workers will be paused.');
    await Promise.all([
      emailWorker.pause(),
      aiWorker.pause(),
      webhookWorker.pause(),
      newsletterWorker.pause(),
    ]);
    return;
  }

  console.log(`[BullMQ] Starting workers (Mode: ${mode})...`);
  await Promise.all([
    emailWorker.resume(),
    aiWorker.resume(),
    webhookWorker.resume(),
    newsletterWorker.resume(),
  ]);
}

/**
 * Shut down all workers and Redis connections gracefully.
 */
export async function closeQueues() {
  console.log('[BullMQ] Closing workers and connections...');
  await Promise.all([
    emailWorker.close(),
    aiWorker.close(),
    webhookWorker.close(),
    newsletterWorker.close(),
  ]);
  
  await bullRedis.quit();
  console.log('[BullMQ] Queue system shutdown complete.');
}
