import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import helmet from "helmet";
import { redis } from "../lib/redis";

/**
 * 1. Professional Security Headers (Helmet)
 */
export const securityMiddleware = helmet();

/**
 * 2. Distributed Rate Limiter
 * Uses Redis to track request counts across multiple server instances.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // Much higher in dev
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});

/**
 * 3. Stricter Limiter for sensitive routes (Auth, Newsletter)
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: process.env.NODE_ENV === "production" ? 20 : 1000, // Much higher in dev
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  message: {
    success: false,
    message: "Too many attempts. Please try again in an hour.",
  },
});
