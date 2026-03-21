import { z } from "zod";
import {
  WORKSPACE_PAGINATION,
  MEMBER_PAGINATION,
  WORKSPACE_SORT_FIELDS,
  SORT_ORDERS,
  WORKSPACE_DEFAULT_SORT,
} from "./workspace.constant";

/* ── Shared param schemas ────────────────────────────────────────── */

export const workspaceIdParamSchema = z.object({
  workspaceId: z
    .string("workspaceId param is required.")
    .cuid("workspaceId must be a valid CUID."),
});

export const memberIdParamSchema = z.object({
  workspaceId: z
    .string("workspaceId param is required.")
    .cuid("workspaceId must be a valid CUID."),
  memberId: z
    .string("memberId param is required.")
    .cuid("memberId must be a valid CUID."),
});

/* ── POST /api/workspaces ────────────────────────────────────────── */

export const createWorkspaceSchema = z.object({
  name: z
    .string("Workspace name is required.")
    .trim()
    .min(2,  "Name must be at least 2 characters.")
    .max(60, "Name must not exceed 60 characters."),

  slug: z
    .string("Workspace slug is required.")
    .trim()
    .min(2,  "Slug must be at least 2 characters.")
    .max(40, "Slug must not exceed 40 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, digits, and hyphens, and must not start or end with a hyphen.",
    ),

  logo: z
    .string()
    .url("Logo must be a valid URL.")
    .nullable()
    .optional(),
});

/* ── PATCH /api/workspaces/:workspaceId ──────────────────────────── */

export const updateWorkspaceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2,  "Name must be at least 2 characters.")
      .max(60, "Name must not exceed 60 characters.")
      .optional(),

    slug: z
      .string()
      .trim()
      .min(2,  "Slug must be at least 2 characters.")
      .max(40, "Slug must not exceed 40 characters.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug may only contain lowercase letters, digits, and hyphens.",
      )
      .optional(),

    logo: z
      .string()
      .url("Logo must be a valid URL.")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update." },
  );

/* ── GET /api/workspaces ─────────────────────────────────────────── */

export const getWorkspacesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : WORKSPACE_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : WORKSPACE_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number()
        .int()
        .min(1,  "Limit must be at least 1.")
        .max(WORKSPACE_PAGINATION.MAX_LIMIT, `Limit must not exceed ${WORKSPACE_PAGINATION.MAX_LIMIT}.`),
    ),

  search: z.string().trim().optional(),

  sortBy: z
    .enum(WORKSPACE_SORT_FIELDS, {
      message: `sortBy must be one of: ${WORKSPACE_SORT_FIELDS.join(", ")}`,
    })
    .default(WORKSPACE_DEFAULT_SORT.FIELD),

  sortOrder: z
    .enum(SORT_ORDERS, {
      message: "sortOrder must be 'asc' or 'desc'.",
    })
    .default(WORKSPACE_DEFAULT_SORT.ORDER),
});

/* ── GET /api/workspaces/:workspaceId/members ────────────────────── */

export const getMembersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : MEMBER_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : MEMBER_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number()
        .int()
        .min(1, "Limit must be at least 1.")
        .max(MEMBER_PAGINATION.MAX_LIMIT, `Limit must not exceed ${MEMBER_PAGINATION.MAX_LIMIT}.`),
    ),
});

/* ── POST /api/workspaces/:workspaceId/members ───────────────────── */

export const addMemberSchema = z.object({
  email: z
    .string("Email is required.")
    .trim()
    .email("Must be a valid email address."),
});

/* ── Inferred DTO types ──────────────────────────────────────────── */

export type WorkspaceIdParamDto    = z.infer<typeof workspaceIdParamSchema>;
export type MemberIdParamDto       = z.infer<typeof memberIdParamSchema>;
export type CreateWorkspaceDto     = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceDto     = z.infer<typeof updateWorkspaceSchema>;
export type GetWorkspacesQueryDto  = z.infer<typeof getWorkspacesQuerySchema>;
export type GetMembersQueryDto     = z.infer<typeof getMembersQuerySchema>;
export type AddMemberDto           = z.infer<typeof addMemberSchema>;