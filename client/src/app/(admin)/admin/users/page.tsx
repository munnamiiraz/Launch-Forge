import { type Metadata } from "next";
import { Users } from "lucide-react";

import { UsersStatsStrip } from "@/src/components/module/admin-users/_components/UsersStatsStrip";
import { UsersTable }      from "@/src/components/module/admin-users/_components/UsersTable";
import { getPaginatedUsers, getUsersStats } from "@/src/components/module/admin-users/_lib/users-data";

export const metadata: Metadata = {
  title:       "Users — Admin · LaunchForge",
  description: "Manage all registered users on the LaunchForge platform.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Extract query params for server-side fetching
  const query = {
    page:      params.page ? parseInt(params.page as string, 10) : 1,
    limit:     params.limit ? parseInt(params.limit as string, 10) : 10,
    search:    (params.search as string) || "",
    status:    (params.status as any) || "ALL",
    plan:      (params.plan as any) || "ALL",
    sortBy:    (params.sortBy as any) || "createdAt",
    sortOrder: (params.sortOrder as any) || "desc",
  };

  // Parallel data fetching
  const [paginated, stats] = await Promise.all([
    getPaginatedUsers(query),
    getUsersStats(),
  ]);

  const { data: users, meta } = paginated;

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Page header ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-card/30 px-6 py-5">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-500/5 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-24 w-48 rounded-full bg-indigo-500/4 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10">
            <Users size={18} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              User management
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80">
              View, search, filter and manage every registered account on the platform.
              Click any row to open the full user detail drawer. Use the checkboxes for bulk actions.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────── */}
      <UsersStatsStrip stats={stats} />

      {/* ── Full users table ──────────────────────────────── */}
      <UsersTable 
        users={users} 
        meta={meta}
        currentQuery={query}
      />
    </div>
  );
}