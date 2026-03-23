import { httpClient } from "@/src/lib/axios/httpClient";
import type { AdminUser } from "@/src/components/module/admin/_types";

export type SortField = "name" | "createdAt" | "lastActiveAt" | "subscribers" | "waitlists";
export type SortDir   = "asc" | "desc";
export type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "DELETED";
export type PlanFilter   = "ALL" | "FREE" | "PRO" | "GROWTH";
export type RoleFilter   = "ALL" | "USER" | "ADMIN";

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
  meta: {
    total:           number;
    page:            number;
    limit:           number;
    totalPages:      number;
    hasNextPage:     boolean;
    hasPreviousPage: boolean;
  };
}

/* ── Fallback data ───────────────────────────────────────────────── */

const fallbackPaginatedUsers: PaginatedUsers = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const fallbackUsersStats: UsersPageStats = {
  total: 0,
  active: 0,
  suspended: 0,
  deleted: 0,
  paid: 0,
  free: 0,
  pro: 0,
  growth: 0,
  newToday: 0,
  newWeek: 0,
};

/* ── API Calls ───────────────────────────────────────────────────── */

/**
 * Fetch paginated users from the backend
 */
export async function getPaginatedUsers(query: {
  page?:      number;
  limit?:     number;
  search?:    string;
  status?:    StatusFilter;
  plan?:      PlanFilter;
  role?:      RoleFilter;
  sortBy?:    SortField;
  sortOrder?: SortDir;
}): Promise<PaginatedUsers> {
  try {
    const response = await httpClient.get<AdminUser[]>("/admin/users", {
      params: query,
    });
    return {
      data: response.data ?? [],
      meta: (response.meta as PaginatedUsers["meta"]) ?? fallbackPaginatedUsers.meta,
    };
  } catch (error) {
    console.error("Failed to fetch paginated users:", error);
    return fallbackPaginatedUsers;
  }
}

/**
 * Fetch user stats for the dashboard strip
 */
export async function getUsersStats(): Promise<UsersPageStats> {
  try {
    const response = await httpClient.get<UsersPageStats>("/admin/users/stats");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users stats:", error);
    return fallbackUsersStats;
  }
}