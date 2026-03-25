import {
  UsersListQuery,
  UsersPaginationMeta,
  AdminUser,
} from "./admin-user.interface";
import {
  USERS_PAGINATION,
  SortField,
} from "./admin-user.constants";

/* ── Pagination ──────────────────────────────────────────────────── */

export function normaliseUsersPagination(query: UsersListQuery): {
  page:  number;
  limit: number;
  skip:  number;
} {
  const page  = Math.max(1, query.page  ?? USERS_PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    USERS_PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? USERS_PAGINATION.DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function buildUsersPaginationMeta(
  total: number,
  page:  number,
  limit: number,
): UsersPaginationMeta {
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

/* ── MRR contribution ────────────────────────────────────────────── */

const MRR_MAP: Record<string, number> = {
  PRO_MONTHLY:    19,
  PRO_YEARLY:     13,   // 156/12
  GROWTH_MONTHLY: 49,
  GROWTH_YEARLY:  33,   // 396/12
};

export function calcMrrContrib(
  planType: string | null,
  planMode: string | null,
): number {
  if (!planType || !planMode) return 0;
  return MRR_MAP[`${planType}_${planMode}`] ?? 0;
}

/* ── Sort field → Prisma orderBy ────────────────────────────────── */

/**
 * Maps the frontend SortField to valid Prisma orderBy objects.
 * "subscribers" and "waitlists" are computed aggregates —
 * we sort on the _count of the relation.
 */
export function buildUserOrderBy(
  field:  SortField,
  order:  "asc" | "desc",
): object[] {
  switch (field) {
    case "name":
      return [{ name: order }];
    case "createdAt":
      return [{ createdAt: order }];
    case "lastActiveAt":
      /*
       * lastActiveAt is derived from the most recent Session.
       * Prisma can't directly ORDER BY a nested aggregate in findMany.
       * We sort by createdAt as a proxy — or handle in-process for
       * the lastActiveAt case after fetching. See service for approach.
       */
      return [{ createdAt: order }];
    case "waitlists":
      return [{ ownedWorkspaces: { _count: order } }];
    case "subscribers":
      /* Cannot order by nested nested count in one query —
         fallback to createdAt. Real sorting handled in-process. */
      return [{ createdAt: order }];
    default:
      return [{ createdAt: "desc" }];
  }
}

/* ── Where clause builder ────────────────────────────────────────── */

export function buildUsersWhere(query: UsersListQuery): object {
  const where: Record<string, unknown> = {};

  /* Status filter */
  if (query.status && query.status !== "ALL") {
    if (query.status === "DELETED") {
      where.isDeleted = true;
    } else {
      where.isDeleted = false;
      where.status    = query.status;
    }
  }

  /* Role filter */
  if (query.role && query.role !== "ALL") {
    where.role = query.role;
  }

  /* Plan filter — scoped to Payment table */
  if (query.plan && query.plan !== "ALL") {
    if (query.plan === "FREE") {
      /* FREE = no PAID payment record */
      where.payments = { 
        isNot: { status: "PAID" } 
      };
    } else {
      where.payments = {
        is: { status: "PAID", planType: query.plan },
      };
    }
  }

  /* Search — name OR email */
  if (query.search?.trim()) {
    const q = query.search.trim();
    where.OR = [
      { name:  { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { id:    { contains: q } },
    ];
  }

  return where;
}