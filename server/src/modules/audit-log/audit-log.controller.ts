import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { auditLogService } from "./audit-log.service";

export const auditLogController = {
  async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await auditLogService.getLogs(req.query);
      res.status(status.OK).json({
        success: true,
        message: "Audit logs fetched successfully",
        data:    result.data,
        meta:    result.meta,
      });
    } catch (error) {
      next(error);
    }
  },
};
