import { Redis } from "ioredis";
import { envVars } from "../../config/env";

const redisUrl = envVars.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  enableReadyCheck: true,
});

redis.on("connect", () => console.log("[Redis] Connecting..."));
redis.on("ready", () => console.log("[Redis] Connected and ready."));
redis.on("error", (err) => console.error("[Redis] Error:", err.message));
redis.on("close", () => console.warn("[Redis] Connection closed."));
redis.on("reconnecting", () => console.log("[Redis] Reconnecting..."));

export const connectRedis = async (): Promise<void> => {
  if (process.env.CACHE_DISABLED === "true") {
    console.log("\x1b[31m[Redis] CONNECTION ABORTED: Caching is EXPLICITLY DISABLED via .env\x1b[0m");
    return;
  }
  
  // Prevent calling connect() if we are already ready, connecting, or reconnecting
  const status = redis.status;
  if (status === "ready" || status === "connecting" || status === "reconnecting") {
    return;
  }
  
  await redis.connect();

  // Check Redis Eviction Policy (Critical for BullMQ)
  try {
    const memoryRes = await redis.config("GET", "maxmemory-policy") as string[];
    if (memoryRes && memoryRes[1] !== "noeviction") {
      console.warn(`\x1b[33mIMPORTANT! Redis eviction policy is ${memoryRes[1]}. For background jobs, it should be "noeviction" to prevent data loss.\x1b[0m`);
    }
  } catch (e) { /* Ignore config get errors (e.g. on managed Redis) */ }
};

let disableLogShown = false;

export const isRedisReady = (): boolean => {
  if (process.env.CACHE_DISABLED === "true") {
    if (!disableLogShown) {
      console.log("\x1b[31m[Redis] Caching is EXPLICITLY DISABLED via environment variable.\x1b[0m");
      disableLogShown = true;
    }
    return false;
  }
  return redis.status === "ready";
};
