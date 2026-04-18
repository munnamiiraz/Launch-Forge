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
  if (redis.status === "ready") return;
  await redis.connect();
};

export const isRedisReady = (): boolean => redis.status === "ready";
