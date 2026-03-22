import { z } from "zod";
import { TX_TYPES, TX_PAGINATION } from "./admin-review.constants";

/* ── GET /api/admin/revenue/transactions ────────────────────────── */

export const transactionsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : TX_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : TX_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number().int()
        .min(1, "Limit must be at least 1.")
        .max(TX_PAGINATION.MAX_LIMIT, `Limit must not exceed ${TX_PAGINATION.MAX_LIMIT}.`),
    ),

  search: z.string().trim().max(100).optional(),

  type: z
    .enum(TX_TYPES, {
        message: `type must be one of: ${TX_TYPES.join(", ")}.`,
    })
    .optional()
    .default("all"),
});

export type TransactionsQueryDto = z.infer<typeof transactionsQuerySchema>;