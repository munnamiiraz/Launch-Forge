import { z } from "zod";
import { ENGAGEMENT_RANGES } from "./admin-analytics.constants";

/* ── GET .../engagement/timeline?range= ─────────────────────────── */

export const engagementRangeSchema = z.object({
  range: z
    .enum(ENGAGEMENT_RANGES, {
        message: `range must be one of: ${ENGAGEMENT_RANGES.join(", ")}.`
    })
    .optional()
    .default("30d"),
});

export type EngagementRangeDto = z.infer<typeof engagementRangeSchema>;