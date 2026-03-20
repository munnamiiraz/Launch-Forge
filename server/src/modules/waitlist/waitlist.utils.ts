import { WAITLIST_PAGINATION } from "./waitlist.constants";
import { PaginationMeta, GetWaitlistsQuery, WaitlistDetail } from "./waitlist.interface";

/**
 * Normalise and clamp pagination query values.
 */
export function normalisePagination(query: GetWaitlistsQuery): {
  page: number;
  limit: number;
  skip: number;
} {
  const page  = Math.max(1, query.page  ?? WAITLIST_PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    WAITLIST_PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? WAITLIST_PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build the PaginationMeta object returned in every list response.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages      = Math.ceil(total / limit);
  const hasNextPage     = page < totalPages;
  const hasPreviousPage = page > 1;

  return { total, page, limit, totalPages, hasNextPage, hasPreviousPage };
}

/**
 * Convert a human-readable name into a URL-safe slug.
 * Used when the client does not supply an explicit slug.
 *
 * Example: "My Awesome Product!" → "my-awesome-product"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")   // strip non-alphanumeric
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-")             // collapse consecutive hyphens
    .replace(/^-|-$/g, "");          // trim leading/trailing hyphens
}

/**
 * Build the public subscriber sign-up URL for a given waitlist slug.
 */
export function buildWaitlistUrl(workspaceSlug: string, waitlistSlug: string): string {
  return `${workspaceSlug}.launchforge.com/${waitlistSlug}`;
}


/**
 * Assert that the fetched waitlist actually belongs to the workspace
 * in the URL. Defends against IDOR — a user guessing IDs across
 * workspaces they don't own.
 *
 * Throws a typed error object the service can forward to AppError.
 */
export function assertWaitlistBelongsToWorkspace(
  waitlist: Pick<WaitlistDetail, "workspaceId">,
  workspaceId: string,
): void {
  if (waitlist.workspaceId !== workspaceId) {
    throw new CrossWorkspaceAccessError();
  }
}

export class CrossWorkspaceAccessError extends Error {
  constructor() {
    super("Cross-workspace access attempted.");
    this.name = "CrossWorkspaceAccessError";
  }
}

/**
 * Returns true when a WorkspaceMember row has the OWNER role.
 * Centralises the role-check logic so the service never hard-codes strings.
 */
export function isWorkspaceOwner(role: string): boolean {
  return role === "OWNER";
}