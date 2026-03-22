import {
  FeedbackPaginationMeta,
  GetFeedbackQuery,
  FeedbackSortField,
  SortOrder,
} from "./feedback.interface";
import { FEEDBACK_PAGINATION } from "./feedback.constants";

/* ─────────────────────────────────────────────────────────────────
   Pagination
   ──────────────────────────────────────────────────────────────── */

export function normaliseFeedbackPagination(query: GetFeedbackQuery): {
  page:  number;
  limit: number;
  skip:  number;
} {
  const page  = Math.max(1, query.page  ?? FEEDBACK_PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    FEEDBACK_PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? FEEDBACK_PAGINATION.DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function buildFeedbackPaginationMeta(
  total: number,
  page:  number,
  limit: number,
): FeedbackPaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage:     page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/* ─────────────────────────────────────────────────────────────────
   Sort builder
   Returns a Prisma-compatible orderBy array.
   votesCount sorts always add createdAt DESC as a stable tiebreaker.
   ──────────────────────────────────────────────────────────────── */

export function buildFeedbackOrderBy(
  sortBy:    FeedbackSortField | undefined,
  sortOrder: SortOrder        | undefined,
): object[] {
  const field = sortBy    ?? "createdAt";
  const order = sortOrder ?? "desc";

  if (field === "votesCount") {
    return [
      { votesCount: order },
      { createdAt:  "desc" as const },
    ];
  }

  return [{ [field]: order }];
}

/* ─────────────────────────────────────────────────────────────────
   Title normalisation
   Strips excess whitespace and lowercases for duplicate detection.
   The stored title is NOT lowercased — only the comparison key is.
   ──────────────────────────────────────────────────────────────── */

export function normaliseTitleForComparison(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

/* ─────────────────────────────────────────────────────────────────
   Search filter builder
   ──────────────────────────────────────────────────────────────── */

export function buildFeedbackSearchFilter(
  search: string | undefined,
): object {
  if (!search) return {};

  return {
    OR: [
      { title:       { contains: search, mode: "insensitive" as const } },
      { description: { contains: search, mode: "insensitive" as const } },
      { authorName:  { contains: search, mode: "insensitive" as const } },
    ],
  };
}