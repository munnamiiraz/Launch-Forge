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
 * Shut down all workers and Redis connections gracefully.
 */
export async function closeQueues() {
  console.log('[BullMQ] Closing workers...');
  await Promise.all([
    emailWorker.close(),
    aiWorker.close(),
    webhookWorker.close(),
    newsletterWorker.close(),
  ]);
  console.log('[BullMQ] Workers closed.');
  
  await bullRedis.quit();
  console.log('[BullMQ] Redis connection closed.');
}
