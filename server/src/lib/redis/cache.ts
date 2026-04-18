import { redis, isRedisReady } from "./client";

export const cacheGet = async (key: string): Promise<string | null> => {
  if (!isRedisReady()) return null;
  return redis.get(key);
};

export const cacheSet = async (
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> => {
  if (!isRedisReady()) return;
  if (ttlSeconds) {
    await redis.set(key, value, "EX", ttlSeconds);
  } else {
    await redis.set(key, value);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  if (!isRedisReady()) return;
  await redis.del(key);
};

export const cacheGetJson = async <T>(key: string): Promise<T | null> => {
  const raw = await cacheGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const cacheSetJson = async (
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> => {
  await cacheSet(key, JSON.stringify(value), ttlSeconds);
};
