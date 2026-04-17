import { Request, Response, NextFunction } from "express";
import { redisClient } from "../lib/redis";

/**
 * Cache Middleware
 * Caches the JSON response of an endpoint in Redis.
 *
 * @param duration TTL in seconds for the cached data
 * @param keyPrefix Optional string to prefix the auto-generated URL-based key
 */
export const cacheMiddleware = (duration: number = 60, keyPrefix: string = "") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip if Redis is not connected to prevent stalling
    if (!redisClient.isOpen) {
      return next();
    }

    try {
      // Create a unique cache key based on the request URL and prefixed string
      const cacheKey = `${keyPrefix}__cache:${req.originalUrl}`;
      
      // Check Redis for cached data
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        // Cache Hit: Return the stored JSON directly
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cachedData));
      }

      // Cache Miss: Capture the outgoing JSON response
      res.setHeader("X-Cache", "MISS");

      // Override the default res.json to capture the payload
      const originalJson = res.json.bind(res);
      
      res.json = (body: any) => {
        // Only cache successful HTTP responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.set(cacheKey, JSON.stringify(body), { EX: duration }).catch((err) => {
            console.error("[CacheMiddleware] Error setting cache for", cacheKey, err);
          });
        }
        
        // Pass control back to original res.json
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("[CacheMiddleware] Unexpected error:", error);
      // Fail open so the request still processes even if caching crashes
      next();
    }
  };
};
