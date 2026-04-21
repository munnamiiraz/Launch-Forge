import { prisma } from "./prisma";
import { Request } from "express";
import { redis } from "./redis/index";
import { appEvents, EVENTS } from "./events";

export const auditLogger = {
  /**
   * Logs a system action to the AuditLog table.
   */
  async log(
    req: Request, 
    action: string, 
    entity: string, 
    entityId?: string | null, 
    details?: any
  ) {
    try {
      const user = (req as any).user;
      const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || null;
      
      await prisma.auditLog.create({
        data: {
          userId: user?.id || null,
          userEmail: user?.email || null,
          action,
          entity,
          entityId: entityId || null,
          details: details ? JSON.parse(JSON.stringify(details)) : null,
          ipAddress: ip,
          userAgent: req.headers["user-agent"] || null,
        },
      });
    } catch (error) {
      console.error("[AuditLogger] Failed to record audit log:", error);
    }
  },

  /**
   * Bans an IP address dynamically in Redis and logs the event.
   */
  async banIp(ip: string, reason: string, durationMin: number = 60) {
    if (!ip) return;
    const key = `blacklist:ip:${ip}`;
    
    // Set ban in Redis with TTL (seconds)
    await redis.set(key, reason, "EX", durationMin * 60);

    // Create a system audit log for the ban
    await prisma.auditLog.create({
      data: {
        action: "SECURITY_BAN_ISSUED",
        entity: "System",
        entityId: ip,
        details: { reason, durationMin },
        ipAddress: ip,
        userAgent: "SecurityShield/1.0",
      },
    });

    // Emit event for real-time notifications
    appEvents.emit(EVENTS.SYSTEM.SECURITY_SHIELD_BAN, { ip, reason });

    console.warn(`[SecurityShield] IP BANNED: ${ip} | Reason: ${reason} | Duration: ${durationMin}m`);
  },

  /**
   * Checks if an IP is currently blacklisted in Redis.
   */
  async isIpBanned(ip: string): Promise<boolean> {
    if (!ip) return false;
    const exists = await redis.exists(`blacklist:ip:${ip}`);
    return exists === 1;
  }
};
