import { Request, Response, NextFunction } from "express";
import { cacheGet, cacheSetJson, isRedisReady } from "../lib/redis";

/**
 * Caches the JSON response of a GET endpoint in Redis.
 * @param duration TTL in seconds (default: 60)
 * @param keyPrefix Optional prefix for the cache key
 */
export const cacheMiddleware = (duration: number = 60, keyPrefix: string = "") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();
    if (!isRedisReady()) return next();

    try {
      const cacheKey = `${keyPrefix}__cache:${req.originalUrl}`;
      const cachedData = await cacheGet(cacheKey);

      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cachedData));
      }

      res.setHeader("X-Cache", "MISS");

      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheSetJson(cacheKey, body, duration).catch((err: unknown) =>
            console.error("[Cache] Error setting cache for", cacheKey, err)
          );
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("[Cache] Unexpected error:", error);
      next();
    }
  };
};
