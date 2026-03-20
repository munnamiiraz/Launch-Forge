import { Waitlist, Workspace } from "../../../generated/client";

/* ── Request payloads ────────────────────────────────────────────── */

export interface CreateWaitlistInput {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  theme?: string;
  isOpen?: boolean;
}

export interface GetWaitlistsQuery {
  page?: number;
  limit?: number;
  search?: string;
  isOpen?: boolean;
}

/* ── Service-layer types ─────────────────────────────────────────── */

export interface CreateWaitlistPayload extends CreateWaitlistInput {
  workspaceId: string;
  requestingUserId: string;
}

export interface GetWaitlistsPayload {
  workspaceId: string;
  requestingUserId: string;
  query: GetWaitlistsQuery;
}

/* ── Response shapes ─────────────────────────────────────────────── */

export type WaitlistItem = Pick<
  Waitlist,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "logoUrl"
  | "isOpen"
  | "createdAt"
  | "updatedAt"
> & {
  _count: { subscribers: number };
};

export interface PaginatedWaitlists {
  data: WaitlistItem[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/* ── Auth user attached by checkAuth middleware ──────────────────── */

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}


/* ── Service-layer payloads ──────────────────────────────────────── */

export interface GetWaitlistByIdPayload {
  waitlistId:        string;
  workspaceId:       string;
  requestingUserId:  string;
}

export interface DeleteWaitlistPayload {
  waitlistId:        string;
  workspaceId:       string;
  requestingUserId:  string;
}

/* ── Response shapes ─────────────────────────────────────────────── */

/**
 * GET /:id returns the full detail view — superset of WaitlistItem
 * (adds workspaceId + theme so the dashboard can render the full page).
 */
export type WaitlistDetail = Pick<
  Waitlist,
  | "id"
  | "workspaceId"
  | "name"
  | "slug"
  | "description"
  | "logoUrl"
  | "theme"
  | "isOpen"
  | "createdAt"
  | "updatedAt"
> & {
  _count: {
    subscribers: number;
  };
};

/**
 * DELETE /:id returns a lightweight confirmation object —
 * no sensitive data, just enough for the client to update its cache.
 */
export interface DeletedWaitlistAck {
  id:        string;
  name:      string;
  deletedAt: Date;
}