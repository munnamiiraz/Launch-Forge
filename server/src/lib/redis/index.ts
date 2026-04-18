export { redis, connectRedis, isRedisReady } from "./client";
export { cacheGet, cacheSet, cacheDel, cacheGetJson, cacheSetJson } from "./cache";
export { withCache } from "./with-cache";

// Backward-compat aliases so existing imports don't break immediately
export { redis as ioRedis, redis as redisClient } from "./client";
