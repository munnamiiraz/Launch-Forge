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
  if (redis.status === "ready") return;
  await redis.connect();
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
