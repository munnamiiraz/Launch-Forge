import { z } from "zod";
import {
  FEEDBACK_FIELD,
  FEEDBACK_PAGINATION,
  FEEDBACK_SORT_FIELDS,
  SORT_ORDERS,
  FEATURE_REQUEST_STATUSES,
  FEEDBACK_DEFAULT_SORT,
} from "./feedback.constants";

/* ─────────────────────────────────────────────────────────────────
   URL params
   ──────────────────────────────────────────────────────────────── */

export const feedbackBoardIdParamSchema = z.object({
  /** boardId used in GET /api/feedback/:boardId */
  boardId: z
    .string("Board ID is required.")
    .cuid("Board ID must be a valid CUID."),
});

export const featureRequestIdParamSchema = z.object({
  /** featureRequest ID used in POST /api/feedback/:id/vote */
  id: z
    .string("Feature request ID is required.")
    .cuid("Feature request ID must be a valid CUID."),
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/feedback   — submit a feature request
   ──────────────────────────────────────────────────────────────── */

export const submitFeedbackSchema = z.object({
  boardId: z
    .string("Board ID is required.")
    .cuid("Board ID must be a valid CUID."),

  title: z
    .string("Title is required.")
    .trim()
    .min(
      FEEDBACK_FIELD.TITLE_MIN,
      `Title must be at least ${FEEDBACK_FIELD.TITLE_MIN} characters.`,
    )
    .max(
      FEEDBACK_FIELD.TITLE_MAX,
      `Title must not exceed ${FEEDBACK_FIELD.TITLE_MAX} characters.`,
    ),

  description: z
    .string()
    .trim()
    .max(
      FEEDBACK_FIELD.DESCRIPTION_MAX,
      `Description must not exceed ${FEEDBACK_FIELD.DESCRIPTION_MAX} characters.`,
    )
    .optional(),

  authorEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address.")
    .max(
      FEEDBACK_FIELD.EMAIL_MAX,
      `Email must not exceed ${FEEDBACK_FIELD.EMAIL_MAX} characters.`,
    )
    .optional(),

  authorName: z
    .string()
    .trim()
    .max(
      FEEDBACK_FIELD.AUTHOR_NAME_MAX,
      `Name must not exceed ${FEEDBACK_FIELD.AUTHOR_NAME_MAX} characters.`,
    )
    .optional(),
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/feedback/:boardId  — query params
   ──────────────────────────────────────────────────────────────── */

export const getFeedbackQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : FEEDBACK_PAGINATION.DEFAULT_PAGE))
    .pipe(z.number().int().min(1, "Page must be at least 1.")),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : FEEDBACK_PAGINATION.DEFAULT_LIMIT))
    .pipe(
      z.number()
        .int()
        .min(1, "Limit must be at least 1.")
        .max(
          FEEDBACK_PAGINATION.MAX_LIMIT,
          `Limit must not exceed ${FEEDBACK_PAGINATION.MAX_LIMIT}.`,
        ),
    ),

  status: z
    .enum(FEATURE_REQUEST_STATUSES, {
      message: `status must be one of: ${FEATURE_REQUEST_STATUSES.join(", ")}.`,
    })
    .optional(),

  search: z
    .string()
    .trim()
    .optional(),

  sortBy: z
    .enum(FEEDBACK_SORT_FIELDS, {
      message: `sortBy must be one of: ${FEEDBACK_SORT_FIELDS.join(", ")}.`,
    })
    .default(FEEDBACK_DEFAULT_SORT.FIELD),

  sortOrder: z
    .enum(SORT_ORDERS, {
      message: "sortOrder must be 'asc' or 'desc'.",
    })
    .default(FEEDBACK_DEFAULT_SORT.ORDER),
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/feedback/:id/vote  — vote body
   ──────────────────────────────────────────────────────────────── */

export const voteSchema = z.object({
  voterEmail: z
    .string("Voter email is required.")
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address.")
    .max(
      FEEDBACK_FIELD.EMAIL_MAX,
      `Email must not exceed ${FEEDBACK_FIELD.EMAIL_MAX} characters.`,
    ),
});

/* ─────────────────────────────────────────────────────────────────
   Inferred DTOs
   ──────────────────────────────────────────────────────────────── */

export type SubmitFeedbackDto     = z.infer<typeof submitFeedbackSchema>;
export type GetFeedbackQueryDto   = z.infer<typeof getFeedbackQuerySchema>;
export type VoteDto               = z.infer<typeof voteSchema>;