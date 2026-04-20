import { cacheGetJson, cacheSetJson } from "./cache";
import { isRedisReady, redis } from "./client";
import { setCacheStatus } from "./cache-tracker";

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
 * Pre-warms the cache by executing a list of functions.
 */
export async function preWarmCache(warmerTasks: (() => Promise<any>)[]) {
  console.log(`\x1b[36m[Redis PRE-WARM] Starting...\x1b[0m`);
  try {
    await Promise.all(warmerTasks.map(task => task()));
    console.log(`\x1b[36m[Redis PRE-WARM] Complete! ✅\x1b[0m`);
  } catch (error) {
    console.error(`[Redis PRE-WARM Error]:`, error);
  }
}

/**
 * Flushes all data in Redis. Use for testing/resetting.
 */
export async function flushRedis(): Promise<void> {
  if (!isRedisReady()) return;
  console.log(`\x1b[31m[Redis RESET] Flushing all keys...\x1b[0m`);
  await redis.flushall();
  hits = 0;
  misses = 0;
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

let hits = 0;
let misses = 0;

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

    const execute = async (retries = 50): Promise<TResult> => {
      let cached = await cacheGetJson<TResult>(cacheKey);
      
      if (cached) {
        hits++;
        setCacheStatus("HIT");
        console.log(`\x1b[32m[Redis HIT]\x1b[0m ${cacheKey}`);
        console.log(`Hit Rate: ${hits / (hits + misses)}`);
        return cached;
      }

      if (retries <= 0) {
        // Safe fallback to prevent infinite wait
        misses++;
        return fn(...args);
      }

      const lockKey = `lock:${cacheKey}`;
      // Attempt to acquire lock for 5 seconds
      const lock = await redis.set(lockKey, "1", "EX", 5, "NX");

      if (lock) {
        // Lock acquired, we are the ones fetching from DB
        misses++;
        setCacheStatus("MISS");
        console.log(`\x1b[33m[Redis MISS]\x1b[0m ${cacheKey}`);
        console.log(`Hit Rate: ${hits / (hits + misses)}`);
        
        try {
          const result = await fn(...args);

          if (result) {
            const finalTtl = typeof ttl === "function" ? ttl() : ttl;
            await cacheSetJson(cacheKey, result, finalTtl);
          }

          // Important: we release the lock after setting the cache
          await redis.del(lockKey);
          return result;
        } catch (err) {
          // ensure lock is cleared on error so others aren't blocked until TTL
          await redis.del(lockKey);
          throw err;
        }
      } else {
        // Someone else is fetching -> wait and retry
        console.log(`\x1b[35m[Redis LOCK] Wait and retry...\x1b[0m ${cacheKey}`);
        await new Promise(r => setTimeout(r, 100));
        return execute(retries - 1);
      }
    };

    try {
      return await execute();
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
