import { z } from "zod";
import {
  USER_SORT_FIELDS, SORT_ORDERS, STATUS_FILTERS,
  PLAN_FILTERS, ROLE_FILTERS, USERS_PAGINATION, BULK_MAX,
} from "./admin-user.constants";

/* ── Shared param: :userId ───────────────────────────────────────── */

export const userIdParamSchema = z.object({
  userId: z
    .string("userId param is required.")
    .cuid("userId must be a valid CUID."),
});

/* ── GET /api/admin/users ────────────────────────────────────────── */

export const getUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : USERS_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : USERS_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number().int()
        .min(1, "Limit must be at least 1.")
        .max(USERS_PAGINATION.MAX_LIMIT, `Limit must not exceed ${USERS_PAGINATION.MAX_LIMIT}.`),
    ),

  search: z.string().trim().max(100).optional(),

  status: z
    .enum(STATUS_FILTERS, {
      message: `status must be one of: ${STATUS_FILTERS.join(", ")}.`,
    })
    .optional()
    .default("ALL"),

  plan: z
    .enum(PLAN_FILTERS, {
      message: `plan must be one of: ${PLAN_FILTERS.join(", ")}.`,
    })
    .optional()
    .default("ALL"),

  role: z
    .enum(ROLE_FILTERS, {
      message: `role must be one of: ${ROLE_FILTERS.join(", ")}.`,
    })
    .optional()
    .default("ALL"),

  sortBy: z
    .enum(USER_SORT_FIELDS, {
      message: `sortBy must be one of: ${USER_SORT_FIELDS.join(", ")}.`,
    })
    .optional()
    .default("createdAt"),

  sortOrder: z
    .enum(SORT_ORDERS, {
      message: "sortOrder must be 'asc' or 'desc'.",
    })
    .optional()
    .default("desc"),
});

/* ── POST /api/admin/users/invite ────────────────────────────────── */

export const inviteUserSchema = z.object({
  email: z
    .string("Email is required.")
    .trim()
    .toLowerCase()
    .email("Must be a valid email address."),

  role: z
    .enum(["USER", "ADMIN"], {
      message: "role must be 'USER' or 'ADMIN'.",
    })
    .default("USER"),
});

/* ── POST /api/admin/users/bulk/suspend | bulk/delete ────────────── */

export const bulkActionSchema = z.object({
  userIds: z
    .array(z.string().cuid("Each userId must be a valid CUID."))
    .min(1, "At least one userId is required.")
    .max(BULK_MAX, `Cannot bulk-action more than ${BULK_MAX} users at once.`),
});

/* ── Inferred DTOs ───────────────────────────────────────────────── */

export type UserIdParamDto    = z.infer<typeof userIdParamSchema>;
export type GetUsersQueryDto  = z.infer<typeof getUsersQuerySchema>;
export type InviteUserDto     = z.infer<typeof inviteUserSchema>;
export type BulkActionDto     = z.infer<typeof bulkActionSchema>;