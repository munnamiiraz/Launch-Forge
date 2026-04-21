// scripts/broadcast.ts
import { newsletterQueue } from '../src/lib/queue';

/**
 * CLI tool to trigger a Newsletter Broadcast.
 * Usage: npx tsx scripts/broadcast.ts "Subject" "Message Body"
 */
async function run() {
  const subject = process.argv[2];
  const body = process.argv[3];

  if (!subject || !body) {
    console.log('❌ Error: Missing arguments.');
    console.log('Usage: npx tsx scripts/broadcast.ts "Subject" "Body"');
    process.exit(1);
  }

  console.log(`📡 Preparing to broadcast: "${subject}"`);
  
  const job = await newsletterQueue.add(`cli-broadcast-${Date.now()}`, {
    subject,
    body,
    templateName: 'newsletter' // uses your newsletter template
  });

  console.log(`✅ Broadcast Job enqueued!`);
  console.log(`🆔 Job ID: ${job.id}`);
  console.log(`👉 Monitor progress at: http://localhost:5000/admin/queues`);

  // Wait a moment for the enqueue to flush
  setTimeout(() => process.exit(0), 1000);
}

run().catch((err) => {
  console.error('❌ Failed to trigger broadcast:', err);
  process.exit(1);
});
