// src/lib/queue/setup.ts
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { emailQueue } from './queues/email.queue';

// Create an Express adapter for Bull‑Board UI
export const serverAdapter = new ExpressAdapter();

// Register queues you want to monitor. Add more queues here as you create them.
createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});

// Optional: set a base path for the UI (default "/admin/queues")
serverAdapter.setBasePath('/admin/queues');
