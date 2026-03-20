/* ── Response messages ───────────────────────────────────────────── */

export const WORKSPACE_MESSAGES = {
  /* Success */
  CREATED:            "Workspace created successfully.",
  FETCHED:            "Workspace fetched successfully.",
  LIST_FETCHED:       "Workspaces fetched successfully.",
  UPDATED:            "Workspace updated successfully.",
  DELETED:            "Workspace deleted successfully.",
  MEMBER_ADDED:       "Member added to workspace successfully.",
  MEMBER_REMOVED:     "Member removed from workspace successfully.",
  MEMBERS_FETCHED:    "Workspace members fetched successfully.",

  /* Auth / Access */
  UNAUTHORIZED:       "You are not a member of this workspace.",
  OWNER_ONLY:         "Only the workspace owner can perform this action.",
  FORBIDDEN:          "You do not have permission to perform this action.",

  /* Not found */
  NOT_FOUND:          "Workspace not found.",
  USER_NOT_FOUND:     "User not found.",
  MEMBER_NOT_FOUND:   "Member not found in this workspace.",

  /* Conflict */
  SLUG_TAKEN:         "A workspace with this slug already exists.",
  ALREADY_MEMBER:     "This user is already a member of the workspace.",

  /* Business rules */
  CANNOT_REMOVE_OWNER: "The workspace owner cannot be removed from the workspace.",
  CANNOT_LEAVE_AS_OWNER:"The owner cannot leave the workspace. Transfer ownership or delete it first.",
} as const;

/* ── Pagination ──────────────────────────────────────────────────── */

export const WORKSPACE_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
} as const;

export const MEMBER_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     50,
} as const;

/* ── Sort fields ─────────────────────────────────────────────────── */

export const WORKSPACE_SORT_FIELDS = [
  "createdAt",
  "name",
  "updatedAt",
] as const;

export const SORT_ORDERS = ["asc", "desc"] as const;

export const WORKSPACE_DEFAULT_SORT = {
  FIELD: "createdAt",
  ORDER: "desc",
} as const;