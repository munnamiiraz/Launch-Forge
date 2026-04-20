// src/lib/queue/queues/newsletter.queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { bullRedis } from '../connection';
import { prisma } from '../../prisma';
import { emailQueue } from './email.queue';

/**
 * Newsletter Broadcast Queue
 * This handles the "Discovery" phase: finding all subscribers 
 * and enqueuing individual email jobs.
 */
export const newsletterQueue = new Queue('newsletter-broadcaster', {
  connection: bullRedis,
});

export const newsletterWorker = new Worker(
  'newsletter-broadcaster',
  async (job: Job) => {
    const { subject, body, templateName } = job.data;
    
    console.log(`[Newsletter-Worker] Starting broadcast: ${subject}`);
    
    // 1. Fetch all subscribers in batches to save memory
    // (Senior move: Batch processing for large datasets)
    const batchSize = 1000;
    let skip = 0;
    let processedCount = 0;

    while (true) {
      const subscribers = await prisma.user.findMany({
        where: { newsLadder: true, isDeleted: false },
        select: { email: true, name: true },
        take: batchSize,
        skip: skip,
      });

      if (subscribers.length === 0) break;

      // 2. Fan-out: Push each subscriber to the email queue
      const emailJobs = subscribers.map((sub) => ({
        name: 'newsletter-email',
        data: {
          to: sub.email,
          subject: subject,
          templateName: templateName || 'newsletter', // You can create a newsletter.ejs later
          templateData: { 
            name: sub.name || 'Subscriber', 
            content: body 
          },
        },
      }));

      // Bulk add for efficiency
      await emailQueue.addBulk(emailJobs);
      
      processedCount += subscribers.length;
      skip += batchSize;
      
      // Update job progress for UI visibility
      await job.updateProgress(processedCount);
      console.log(`[Newsletter-Worker] Enqueued ${processedCount} emails...`);
    }

    return { totalSent: processedCount };
  },
  {
    connection: bullRedis,
    concurrency: 1, // Only one broadcast at a time to keep DB pressure low
  }
);
