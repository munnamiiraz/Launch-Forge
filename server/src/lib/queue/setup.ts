// src/lib/queue/setup.ts
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { emailQueue } from './queues/email.queue';
import { aiQueue } from './queues/ai.queue';
import { webhookQueue } from './queues/webhook.queue';
import { newsletterQueue } from './queues/newsletter.queue';

// Create an Express adapter for Bull‑Board UI
export const serverAdapter = new ExpressAdapter();

// Register queues you want to monitor.
createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(aiQueue),
    new BullMQAdapter(webhookQueue),
    new BullMQAdapter(newsletterQueue),
  ],
  serverAdapter,
});

// Optional: set a base path for the UI
serverAdapter.setBasePath('/admin/queues');
