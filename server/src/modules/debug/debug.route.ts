import { Request, Response, NextFunction, Router } from "express";
import status from "http-status";
import { logger } from "../../lib/logger";

const router = Router();

/**
 * GET /api/v1/debug/error
 * Intentional crash to demonstrate Sentry + Winston
 */
router.get("/error", (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Log some useful breadcrumbs first
    logger.info("Demo: User is attempting to access the high-security debug vault.");
    logger.debug("Demo: Checking authorization levels...", { authType: "Senior-Demo" });
    
    // 2. Trigger an intentional error
    throw new Error("🚀 Sentry Demo: Simulated System Meltdown!");

  } catch (error) {
    // 3. Log with metadata and ship to Sentry
    logger.error("Demo: A critical failure occurred in the debug vault!", error, {
      demoMode: true,
      userSecret: "Nothing-to-see-here",
      timestamp: new Date().toISOString()
    });
    
    // Pass to global error handler to send the standard JSON response
    next(error);
  }
});

/**
 * GET /api/v1/debug/info
 * Demonstrate structured info logging
 */
router.get("/info", (req: Request, res: Response) => {
  logger.info("Demo: This is a structured info log. System is healthy.", {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().rss
  });
  
  res.status(status.OK).json({
    success: true,
    message: "Check your server console for a beautiful green log!"
  });
});

export const debugRouter = router;
