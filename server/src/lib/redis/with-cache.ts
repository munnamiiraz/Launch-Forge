import { cacheGetJson, cacheSetJson } from "./cache";
import { isRedisReady, redis } from "./client";

/**
 * Calculates the number of seconds remaining until the next midnight (00:00:00).
 * Useful for caching daily analytics that should refresh at the start of a new day.
 */
export function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next midnight
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

/**
 * Helper to flatten arguments into a clean string for Redis keys.
 * Uses a single colon for the folder prefix, and joins parameters with underscores.
 */
function generateKey(prefix: string, args: any[]): string {
  const parts: string[] = [];

  const IGNORE_KEYS = ["requestingUserId", "ownerEmail", "workspaceId"];

  const flatten = (obj: any) => {
    if (obj === null || obj === undefined) return;
    if (typeof obj !== "object") {
      parts.push(String(obj));
      return;
    }

    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      if (IGNORE_KEYS.includes(key)) continue;

      const val = obj[key];
      if (val === null || val === undefined || val === "") continue;

      if (typeof val === "object") {
        flatten(val);
      } else {
        // Use colon for folder structure
        parts.push(`${key}:${val}`);
      }
    }
  };

  args.forEach(flatten);

  // Return "folder:subfolder:subfolder" structure. 
  if (parts.length === 0) return prefix;
  return `${prefix}:${parts.join(":")}`;
}

/**
 * Higher-order function to wrap a service method with Redis caching.
 * @param keyPrefix String or function to generate the primary key folder prefix
 * @param ttl TTL in seconds or function to generate TTL
 * @param fn The service method to wrap
 */
export function withCache<TArgs extends any[], TResult>(
  keyPrefix: string | ((...args: TArgs) => string),
  ttl: number | (() => number) = 300,
  fn: (...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    if (!isRedisReady()) {
      return fn(...args);
    }

    const finalPrefix = typeof keyPrefix === "function" ? keyPrefix(...args) : keyPrefix;
    const cacheKey = generateKey(finalPrefix, args);

    try {
      const cached = await cacheGetJson<TResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await fn(...args);

      if (result) {
        const finalTtl = typeof ttl === "function" ? ttl() : ttl;
        await cacheSetJson(cacheKey, result, finalTtl);
      }

      return result;
    } catch (error) {
      console.error(`[Redis Cache Error] ${finalPrefix}:`, error);
      return fn(...args);
    }
  };
}
/**
 * Manually invalidate cache entries starting with a specific prefix/pattern.
 * @param pattern The key pattern to delete (e.g., "workspace:dashboard:overview:*")
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!isRedisReady()) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`[Redis Invalidate Error] ${pattern}:`, error);
  }
}
