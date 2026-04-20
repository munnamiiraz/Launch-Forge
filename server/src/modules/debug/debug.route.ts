import { Router } from "express";
import { flushRedis, preWarmCache } from "../../lib/redis/with-cache";
import { exploreService } from "../explore/explore.service";

const router = Router();

/**
 * Resets all Redis data and metrics.
 * GET /api/v1/__debug/reset
 */
router.get("/reset", async (req, res) => {
  try {
    await flushRedis();
    res.status(200).json({
      success: true,
      message: "Redis cache flushed and hit/miss metrics reset.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Pre-warms high-traffic endpoints.
 * GET /api/v1/__debug/warmup
 */
router.get("/warmup", async (req, res) => {
  try {
    await preWarmCache([
      () => exploreService.getExploreWaitlists({ query: {} }), // Warm up explore page
      // Add other heavy functions here as needed
    ]);
    res.status(200).json({
      success: true,
      message: "Cache pre-warming initiated.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const debugRouter = router;
