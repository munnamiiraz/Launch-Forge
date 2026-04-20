// src/lib/queue/queues/webhook.queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { bullRedis } from '../connection';
import { paymentService } from '../../../modules/payment/payment.service';

/**
 * Webhook Queue
 * Ensures Stripe events are processed reliably. If your DB is busy or
 * the server restarts, BullMQ will retry the event so you never miss a payment.
 */
export const webhookQueue = new Queue('stripe-webhooks', {
  connection: bullRedis,
  defaultJobOptions: {
    attempts: 5, // Payments are critical, so we retry more times
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true, // Clean up successful webhooks to save Redis space
  },
});

export const webhookWorker = new Worker(
  'stripe-webhooks',
  async (job: Job) => {
    const { event } = job.data;
    
    console.log(`[Webhook-Worker] Processing Stripe event: ${event.type} (${event.id})`);
    
    // Call the refactored logic in the payment service
    await paymentService.processWebhookEvent(event);
    
    return { success: true };
  },
  {
    connection: bullRedis,
    concurrency: 10,
  }
);

webhookWorker.on('failed', (job, err) => {
  console.error(`[Webhook-Worker] CRITICAL: Webhook job ${job?.id} failed after retries:`, err);
});
