import { FeatureRequest, FeedbackBoard } from "../../../generated/client";

/* ─────────────────────────────────────────────────────────────────
   Status enum mirror
   ──────────────────────────────────────────────────────────────── */

export type FeatureRequestStatus =
  | "UNDER_REVIEW"
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DECLINED";

/* ─────────────────────────────────────────────────────────────────
   Query inputs
   ──────────────────────────────────────────────────────────────── */

export interface GetFeedbackQuery {
  page?:      number;
  limit?:     number;
  status?:    FeatureRequestStatus;
  search?:    string;
  sortBy?:    FeedbackSortField;
  sortOrder?: SortOrder;
}

export type FeedbackSortField = "createdAt" | "votesCount";
export type SortOrder         = "asc" | "desc";

/* ─────────────────────────────────────────────────────────────────
   Service-layer payloads
   ──────────────────────────────────────────────────────────────── */

export interface SubmitFeedbackPayload {
  boardId:      string;
  title:        string;
  description?: string;
  authorEmail?: string;
  authorName?:  string;
}

export interface GetFeedbackPayload {
  boardId:  string;
  query:    GetFeedbackQuery;
}

export interface VoteFeedbackPayload {
  featureRequestId: string;
  voterEmail:       string;
}

/* ─────────────────────────────────────────────────────────────────
   Response shapes
   ──────────────────────────────────────────────────────────────── */

export type FeedbackBoardPublic = Pick<
  FeedbackBoard,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "isPublic"
>;

export type FeatureRequestItem = Pick<
  FeatureRequest,
  | "id"
  | "title"
  | "description"
  | "status"
  | "votesCount"
  | "authorEmail"
  | "authorName"
  | "createdAt"
  | "updatedAt"
> & {
  /** Number of comments on this request */
  commentCount: number;
};

export interface PaginatedFeedback {
  board: FeedbackBoardPublic;
  data:  FeatureRequestItem[];
  meta:  FeedbackPaginationMeta;
}

export interface FeedbackPaginationMeta {
  total:          number;
  page:           number;
  limit:          number;
  totalPages:     number;
  hasNextPage:    boolean;
  hasPreviousPage: boolean;
}

/** Returned after a successful submit */
export interface SubmitFeedbackResult {
  id:          string;
  title:       string;
  status:      FeatureRequestStatus;
  createdAt:   Date;
}

/** Returned after a vote action */
export interface VoteResult {
  featureRequestId: string;
  votesCount:       number;
  /** true = vote added, false = vote was already present (idempotent) */
  voted:            boolean;
}