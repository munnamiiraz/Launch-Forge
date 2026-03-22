import {
  SortField, SortOrder,
  StatusFilter, PlanFilter, RoleFilter,
} from "./admin-user.constants";

/* ─────────────────────────────────────────────────────────────────
   Query / filter types
   ──────────────────────────────────────────────────────────────── */

export interface UsersListQuery {
  page?:      number;
  limit?:     number;
  search?:    string;
  status?:    StatusFilter;
  plan?:      PlanFilter;
  role?:      RoleFilter;
  sortBy?:    SortField;
  sortOrder?: SortOrder;
}

/* ─────────────────────────────────────────────────────────────────
   Service payload types
   ──────────────────────────────────────────────────────────────── */

export interface AdminUsersBasePayload {
  requestingUserId: string;
}

export interface GetUsersPayload extends AdminUsersBasePayload {
  query: UsersListQuery;
}

export interface GetUserByIdPayload extends AdminUsersBasePayload {
  targetUserId: string;
}

export interface UserMutationPayload extends AdminUsersBasePayload {
  targetUserId: string;
}

export interface InviteUserPayload extends AdminUsersBasePayload {
  email: string;
  role:  "USER" | "ADMIN";
}

export interface BulkActionPayload extends AdminUsersBasePayload {
  userIds: string[];
}

/* ─────────────────────────────────────────────────────────────────
   Response shapes
   ──────────────────────────────────────────────────────────────── */

/**
 * Full admin user row — every field the table + detail drawer needs.
 */
export interface AdminUser {
  id:           string;
  name:         string;
  email:        string;
  role:         "USER" | "ADMIN";
  status:       "ACTIVE" | "SUSPENDED" | "INACTIVE";
  plan:         "FREE" | "PRO" | "GROWTH";
  planMode:     "MONTHLY" | "YEARLY" | null;
  /** MRR contribution in USD */
  mrrContrib:   number;
  waitlists:    number;
  subscribers:  number;
  totalReferrals: number;
  createdAt:    string;   // ISO
  lastActiveAt: string | null;
  emailVerified: boolean;
  isDeleted:    boolean;
}

/**
 * Stat strip at the top of the page.
 * Matches UsersPageStats in the frontend lib.
 */
export interface UsersPageStats {
  total:     number;
  active:    number;
  suspended: number;
  deleted:   number;
  paid:      number;
  free:      number;
  pro:       number;
  growth:    number;
  newToday:  number;
  newWeek:   number;
}

export interface PaginatedUsers {
  data: AdminUser[];
  meta: UsersPaginationMeta;
}

export interface UsersPaginationMeta {
  total:           number;
  page:            number;
  limit:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}