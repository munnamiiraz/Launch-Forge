import { Workspace, WorkspaceMember, User } from "../../../generated/client";

/* ─────────────────────────────────────────────────────────────────
   Query / filter types
   ──────────────────────────────────────────────────────────────── */

export type WorkspaceSortField = "createdAt" | "name" | "updatedAt";
export type SortOrder          = "asc" | "desc";

export interface GetWorkspacesQuery {
  page?:      number;
  limit?:     number;
  search?:    string;
  sortBy?:    WorkspaceSortField;
  sortOrder?: SortOrder;
}

export interface GetMembersQuery {
  page?:  number;
  limit?: number;
}

/* ─────────────────────────────────────────────────────────────────
   Service payload types
   Every service method receives a single typed payload object.
   ──────────────────────────────────────────────────────────────── */

export interface CreateWorkspacePayload {
  requestingUserId: string;
  name:             string;
  slug:             string;
  logo?:            string | null;
}

export interface GetWorkspacesPayload {
  requestingUserId: string;
  query:            GetWorkspacesQuery;
}

export interface GetWorkspacePayload {
  workspaceId:      string;
  requestingUserId: string;
}

export interface UpdateWorkspacePayload {
  workspaceId:      string;
  requestingUserId: string;
  name?:            string;
  slug?:            string;
  logo?:            string | null;
}

export interface DeleteWorkspacePayload {
  workspaceId:      string;
  requestingUserId: string;
}

export interface AddMemberPayload {
  workspaceId:      string;
  requestingUserId: string;
  /** Email of the user to add */
  email:            string;
}

export interface GetDashboardOverviewPayload {
  requestingUserId: string;
}

export interface RemoveMemberPayload {
  workspaceId:      string;
  requestingUserId: string;
  /** ID of the WorkspaceMember record to remove */
  memberId:         string;
}

export interface GetMembersPayload {
  workspaceId:      string;
  requestingUserId: string;
  query:            GetMembersQuery;
}

/* ─────────────────────────────────────────────────────────────────
   Response shapes
   ──────────────────────────────────────────────────────────────── */

/**
 * Core workspace fields returned on every response.
 * Does NOT include internal ownerId — we embed ownerInfo instead.
 */
export interface WorkspaceItem {
  id:           string;
  name:         string;
  slug:         string;
  logo:         string | null;
  plan:         string;
  createdAt:    Date;
  updatedAt:    Date;
  ownerInfo:    OwnerInfo;
  memberCount:  number;
  waitlistCount:number;
}

export interface OwnerInfo {
  id:    string;
  name:  string;
  email: string;
}

export interface PaginatedWorkspaces {
  data: WorkspaceItem[];
  meta: WorkspacePaginationMeta;
}

export interface WorkspacePaginationMeta {
  total:          number;
  page:           number;
  limit:          number;
  totalPages:     number;
  hasNextPage:    boolean;
  hasPreviousPage:boolean;
}

/**
 * Member row returned in GET /members.
 * Never exposes sensitive account fields.
 */
export interface MemberRow {
  /** WorkspaceMember.id */
  id:       string;
  role:     string;
  joinedAt: Date;
  user: {
    id:    string;
    name:  string;
    email: string;
    image: string | null;
  };
}

export interface PaginatedMembers {
  data: MemberRow[];
  meta: MemberPaginationMeta;
}

export interface MemberPaginationMeta {
  total:          number;
  page:           number;
  limit:          number;
  totalPages:     number;
  hasNextPage:    boolean;
  hasPreviousPage:boolean;
}