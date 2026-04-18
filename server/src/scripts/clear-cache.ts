import { redis } from "../lib/redis/client";

async function clearRedis() {
  try {
    console.log("Connecting to Redis...");
    await redis.flushall();
    console.log("✅ Redis cache cleared successfully.");
  } catch (error) {
    console.error("❌ Failed to clear Redis:", error);
  } finally {
    process.exit(0);
  }
}

clearRedis();
