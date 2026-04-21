// src/lib/queue/queues/email.queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { bullRedis } from '../connection';
import { sendEmail } from '../../../utils/email';

// Queue name – keep it simple and descriptive.
export const emailQueue = new Queue('email', {
  connection: bullRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

import { logger } from '../../../lib/logger';

// Worker processes jobs from the email queue.
export const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    // job.data should contain the same shape as the sendEmail options.
    const { to, subject, templateName, templateData, attachments } = job.data as any;
    await sendEmail({ to, subject, templateName, templateData, attachments });
    return { success: true };
  },
  {
    connection: bullRedis,
    // Limit concurrency to avoid hitting SMTP rate limits.
    concurrency: 5,
  },
);

emailWorker.on('failed', (job, err) => {
  logger.error(`[EmailWorker] Job ${job?.id ?? 'unknown'} failed`, err, {
    jobId: job?.id,
    queueName: 'email',
    attemptsMade: job?.attemptsMade
  });
});

emailWorker.on('completed', (job) => {
  logger.info(`[EmailWorker] Job ${job?.id ?? 'unknown'} completed`, {
    jobId: job?.id,
    queueName: 'email'
  });
});
