import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import helmet from "helmet";
import { redis } from "../lib/redis";
import { auditLogger } from "../lib/auditLogger";

/**
 * 1. Professional Security Headers (Helmet)
 */
export const securityMiddleware = helmet();

/**
 * 2. Distributed Rate Limiter
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === "production" ? 100 : 1000, 
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});

/**
 * 3. Stricter Limiter for sensitive routes
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: process.env.NODE_ENV === "production" ? 20 : 1000, 
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

/**
 * 4. Security Shield: Edge IP Banning Middleware
 * DROPS requests immediately if the IP is found in the Redis blacklist.
 */
export const securityShieldMiddleware = async (req: any, res: any, next: any) => {
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "";
  
  const isBanned = await auditLogger.isIpBanned(ip);
  
  if (isBanned) {
    console.error(`[SecurityShield] BLOCKING REQUEST from BANNED IP: ${ip}`);
    return res.status(403).json({
      success: false,
      message: "Access Denied. Your IP has been flagged for suspicious activity.",
      securityCode: "SHIELD_BAN_ACTIVE"
    });
  }

  next();
};
