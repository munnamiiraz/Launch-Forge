import { z } from "zod";
import { GROWTH_RANGES } from "./admin-overview.constants";

/* ── GET .../growth — accepts optional ?range= ───────────────────── */

export const growthQuerySchema = z.object({
  range: z
    .enum(GROWTH_RANGES, {
      message: `range must be one of: ${GROWTH_RANGES.join(", ")}.`,
    })
    .optional()
    .default("30d"),
});

export type GrowthQueryDto = z.infer<typeof growthQuerySchema>;