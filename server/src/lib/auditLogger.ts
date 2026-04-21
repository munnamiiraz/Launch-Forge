import { prisma } from "./prisma";
import { Request } from "express";

export const auditLogger = {
  /**
   * Logs a system action to the AuditLog table.
   * Extracts actor, IP, and UserAgent from the request object.
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
      
      await prisma.auditLog.create({
        data: {
          userId: user?.id || null,
          userEmail: user?.email || null,
          action,
          entity,
          entityId: entityId || null,
          details: details ? JSON.parse(JSON.stringify(details)) : null,
          ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || null,
          userAgent: req.headers["user-agent"] || null,
        },
      });
    } catch (error) {
      // Senior move: logging failure shouldn't kill the main process, 
      // but we should log it to console/winston for investigation.
      console.error("[AuditLogger] Failed to record audit log:", error);
    }
  }
};
