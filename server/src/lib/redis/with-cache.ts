import { cacheGetJson, cacheSetJson } from "./cache";
import { isRedisReady } from "./client";

/**
 * Helper to flatten arguments into a clean string for Redis keys.
 * Uses a single colon for the folder prefix, and joins parameters with underscores.
 */
function generateKey(prefix: string, args: any[]): string {
  const parts: string[] = [];

  const flatten = (obj: any) => {
    if (obj === null || obj === undefined) return;
    if (typeof obj !== "object") {
      parts.push(String(obj));
      return;
    }

    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      const val = obj[key];
      if (val === null || val === undefined || val === "") continue;

      if (typeof val === "object") {
        flatten(val);
      } else {
        parts.push(`${key}_${val}`);
      }
    }
  };

  args.forEach(flatten);

  // Return "folder:key_content" structure
  return `${prefix}:${parts.join("_")}`;
}

/**
 * Higher-order function to wrap a service method with Redis caching.
 * @param key The primary key or folder prefix (e.g., "explore" or "leaderboard")
 * @param ttl TTL in seconds (default: 300)
 * @param fn The service method to wrap
 * @returns A wrapped function that checks cache before executing
 */
export function withCache<TArgs extends any[], TResult>(
  keyPrefix: string,
  ttl: number = 300,
  fn: (...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    if (!isRedisReady()) {
      return fn(...args);
    }

    // Generate a clean folder-based cache key
    const cacheKey = generateKey(keyPrefix, args);

    try {
      const cached = await cacheGetJson<TResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await fn(...args);

      if (result) {
        await cacheSetJson(cacheKey, result, ttl);
      }

      return result;
    } catch (error) {
      console.error(`[Redis Cache Error] ${keyPrefix}:`, error);
      return fn(...args);
    }
  };
}
