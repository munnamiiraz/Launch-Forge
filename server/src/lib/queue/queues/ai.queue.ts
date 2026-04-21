// src/lib/queue/queues/ai.queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { bullRedis } from '../connection';
import { AiInsightsService } from '../../../modules/ai-chat/ai-insights.service';

/**
 * AI Insight Queue
 * Handles long-running AI analysis calls to OpenRouter/Gemini.
 */
export const aiQueue = new Queue('ai-insights', {
  connection: bullRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

import { logger } from '../../../lib/logger';

export const aiWorker = new Worker(
  'ai-insights',
  async (job: Job) => {
    const { workspaceId, userId } = job.data;
    
    logger.info(`[AI-Worker] Generating insights for workspace: ${workspaceId}`, {
      workspaceId,
      userId,
      jobId: job.id
    });
    
    // Call the background processor
    const result = await AiInsightsService.generateAndCacheInsights(workspaceId, userId);
    
    return result;
  },
  {
    connection: bullRedis,
    concurrency: 2, // AI APIs often have strict rate limits, so we keep this low
  }
);

aiWorker.on('completed', (job) => {
  logger.info(`[AI-Worker] Insight generation completed for job ${job.id}`, {
    jobId: job.id,
    queueName: 'ai-insights'
  });
});

aiWorker.on('failed', (job, err) => {
  logger.error(`[AI-Worker] Insight generation failed for job ${job?.id}`, err, {
    jobId: job?.id,
    queueName: 'ai-insights',
    data: job?.data
  });
});
