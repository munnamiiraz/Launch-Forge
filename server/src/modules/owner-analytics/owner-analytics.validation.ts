import { z } from "zod";
import { TIME_RANGES } from "./owner-analytics.constants";

/* ── Shared: workspaceId param ───────────────────────────────────── */

export const analyticsParamSchema = z.object({
  workspaceId: z
    .string("workspaceId param is required.")
    .cuid("workspaceId must be a valid CUID."),
});

/* ── Shared query (range + optional waitlistId filter) ───────────── */

export const analyticsQuerySchema = z.object({
  range: z
    .enum(TIME_RANGES, {
      message: `range must be one of: ${TIME_RANGES.join(", ")}.`,
    })
    .optional()
    .default("30d"),

  waitlistId: z
    .string()
    .cuid("waitlistId must be a valid CUID.")
    .optional(),
});

export type AnalyticsParamDto = z.infer<typeof analyticsParamSchema>;
export type AnalyticsQueryDto = z.infer<typeof analyticsQuerySchema>;