import {
  GetWorkspacesQuery,
  GetMembersQuery,
  WorkspacePaginationMeta,
  MemberPaginationMeta,
  WorkspaceItem,
} from "./workspace.interface";
import {
  WORKSPACE_PAGINATION,
  MEMBER_PAGINATION,
} from "./workspace.constant";

/* ── Pagination helpers ──────────────────────────────────────────── */

export function normaliseWorkspacePagination(query: GetWorkspacesQuery): {
  page:  number;
  limit: number;
  skip:  number;
} {
  const page  = Math.max(1, query.page  ?? WORKSPACE_PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    WORKSPACE_PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? WORKSPACE_PAGINATION.DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function normaliseMemberPagination(query: GetMembersQuery): {
  page:  number;
  limit: number;
  skip:  number;
} {
  const page  = Math.max(1, query.page  ?? MEMBER_PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    MEMBER_PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? MEMBER_PAGINATION.DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function buildWorkspacePaginationMeta(
  total: number,
  page:  number,
  limit: number,
): WorkspacePaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage:     page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function buildMemberPaginationMeta(
  total: number,
  page:  number,
  limit: number,
): MemberPaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage:     page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/* ── Shape helpers ───────────────────────────────────────────────── */

/**
 * Map a raw Prisma workspace row (with owner relation and _count)
 * into the clean WorkspaceItem shape returned to clients.
 */
export function toWorkspaceItem(
  raw: {
    id:        string;
    name:      string;
    slug:      string;
    logo:      string | null;
    plan:      string;
    createdAt: Date;
    updatedAt: Date;
    owner: {
      id:    string;
      name:  string;
      email: string;
    };
    _count: {
      members:   number;
      waitlists: number;
    };
  },
): WorkspaceItem {
  return {
    id:           raw.id,
    name:         raw.name,
    slug:         raw.slug,
    logo:         raw.logo,
    plan:         raw.plan,
    createdAt:    raw.createdAt,
    updatedAt:    raw.updatedAt,
    ownerInfo: {
      id:    raw.owner.id,
      name:  raw.owner.name,
      email: raw.owner.email,
    },
    memberCount:   raw._count.members,
    waitlistCount: raw._count.waitlists,
  };
}