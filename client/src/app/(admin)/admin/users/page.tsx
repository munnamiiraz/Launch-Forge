import { type Metadata } from "next";
import { Users } from "lucide-react";

import { UsersStatsStrip } from "@/src/components/module/admin-users/_components/UsersStatsStrip";
import { UsersTable }      from "@/src/components/module/admin-users/_components/UsersTable";
import { getAllUsers, computeUsersPageStats } from "@/src/components/module/admin-users/_lib/users-data";

export const metadata: Metadata = {
  title:       "Users — Admin · LaunchForge",
  description: "Manage all registered users on the LaunchForge platform.",
};

export default async function AdminUsersPage() {
  const users = getAllUsers();
  const stats = computeUsersPageStats(users);

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Page header ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-zinc-900/30 px-6 py-5">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-500/5 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-24 w-48 rounded-full bg-indigo-500/4 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10">
            <Users size={18} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-100">
              User management
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              View, search, filter and manage every registered account on the platform.
              Click any row to open the full user detail drawer. Use the checkboxes for bulk actions.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-zinc-600">
              {[
                `${stats.total} total`,
                `${stats.active} active`,
                `${stats.suspended} suspended`,
                `${stats.pro + stats.growth} paid`,
                `+${stats.newToday} today`,
              ].map((s) => (
                <span key={s} className="rounded-full border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────── */}
      <UsersStatsStrip stats={stats} />

      {/* ── Full users table ──────────────────────────────── */}
      <UsersTable users={users} />

    </div>
  );
}