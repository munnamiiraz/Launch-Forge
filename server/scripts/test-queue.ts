// scripts/test-queue.ts
import { emailQueue } from '../src/lib/queue';

async function runTest() {
  console.log('🚀 Enqueuing a test email job...');

  const job = await emailQueue.add('Manual-Test-Email', {
    to: 'munnamiiraz@gmail.com',
    subject: 'BullMQ is Working! 📬',
    templateName: 'otp', // uses your existing otp.ejs template
    templateData: { 
        name: 'LaunchForge Developer', 
        otp: '999999', 
        type: 'test-verification' 
    },
  });

  console.log(`✅ Job enqueued successfully! ID: ${job.id}`);
  console.log('👉 Check your dashboard at: http://localhost:5000/admin/queues');
  
  // Note: We don't call process.exit() here immediately 
  // so the log has time to reach the console if needed.
  setTimeout(() => process.exit(0), 2000);
}

runTest().catch((err) => {
  console.error('❌ Failed to enqueue job:', err);
  process.exit(1);
});
