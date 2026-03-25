"use client";

import { cn } from "@/src/lib/utils";

/* ── Base shimmer block ──────────────────────────────────────────── */
function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-zinc-800/60",
        className,
      )}
    />
  );
}

/* ── Shared top-of-page progress bar ─────────────────────────────── */
function TopProgress() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-zinc-900">
      <div className="h-full w-1/3 animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HOME / PUBLIC PAGES  
   ══════════════════════════════════════════════════════════════════ */
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <TopProgress />
      {/* Hero */}
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <Bone className="mx-auto mb-4 h-4 w-32" />
        <Bone className="mx-auto mb-3 h-10 w-[70%]" />
        <Bone className="mx-auto mb-6 h-10 w-[50%]" />
        <Bone className="mx-auto mb-8 h-5 w-[60%]" />
        <div className="mx-auto flex w-fit gap-4">
          <Bone className="h-11 w-40 rounded-xl" />
          <Bone className="h-11 w-36 rounded-xl" />
        </div>
      </div>
      {/* Stats */}
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-6 px-4 pb-16">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Bone className="h-8 w-20" />
            <Bone className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   EXPLORE PAGE  
   ══════════════════════════════════════════════════════════════════ */
export function ExplorePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <TopProgress />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <Bone className="mb-2 h-8 w-48" />
        <Bone className="mb-8 h-4 w-72" />
        {/* Filters */}
        <div className="mb-8 flex gap-3">
          <Bone className="h-10 w-64 rounded-xl" />
          {[1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-10 w-20 rounded-full" />
          ))}
        </div>
        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <Bone className="h-10 w-10 rounded-xl" />
                <div className="flex-1">
                  <Bone className="mb-1.5 h-4 w-32" />
                  <Bone className="h-3 w-48" />
                </div>
              </div>
              <Bone className="mb-3 h-3 w-full" />
              <Bone className="mb-4 h-3 w-3/4" />
              <div className="flex items-center gap-4">
                <Bone className="h-5 w-16 rounded-full" />
                <Bone className="h-5 w-20 rounded-full" />
                <Bone className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   WAITLIST DETAIL / EXPLORE [SLUG]  
   ══════════════════════════════════════════════════════════════════ */
export function WaitlistDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <TopProgress />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div>
            <div className="mb-6 flex items-center gap-4">
              <Bone className="h-16 w-16 rounded-2xl" />
              <div>
                <Bone className="mb-2 h-7 w-48" />
                <Bone className="h-4 w-72" />
              </div>
            </div>
            <Bone className="mb-3 h-4 w-full" />
            <Bone className="mb-3 h-4 w-[90%]" />
            <Bone className="mb-6 h-4 w-[70%]" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Bone key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
              <Bone className="mb-4 h-5 w-28" />
              <Bone className="mb-3 h-10 w-full rounded-xl" />
              <Bone className="mb-3 h-10 w-full rounded-xl" />
              <Bone className="h-11 w-full rounded-xl" />
            </div>
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
              <Bone className="mb-4 h-5 w-20" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Bone key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEADERBOARD PAGE  
   ══════════════════════════════════════════════════════════════════ */
export function LeaderboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <TopProgress />
      {/* Hero banner */}
      <div className="border-b border-zinc-800/60 py-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center gap-4">
            <Bone className="h-14 w-14 rounded-2xl" />
            <div>
              <Bone className="mb-2 h-7 w-48" />
              <Bone className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-8">
            {/* Podium */}
            <div className="flex items-end justify-center gap-4 py-6">
              <Bone className="h-28 w-24 rounded-xl" />
              <Bone className="h-36 w-24 rounded-xl" />
              <Bone className="h-24 w-24 rounded-xl" />
            </div>
            {/* Tier tabs */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Bone key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
            {/* Table rows */}
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Bone key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
              <Bone className="mb-3 h-5 w-28" />
              <Bone className="mb-3 h-10 w-full rounded-xl" />
              <Bone className="h-9 w-24 rounded-lg" />
            </div>
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
              <Bone className="mb-3 h-5 w-32" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Bone className="h-5 w-5 shrink-0 rounded-full" />
                    <Bone className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DASHBOARD OVERVIEW  
   ══════════════════════════════════════════════════════════════════ */
export function DashboardSkeleton() {
  return (
    <div className="flex-1 p-6">
      <TopProgress />
      <Bone className="mb-1 h-7 w-40" />
      <Bone className="mb-8 h-4 w-64" />
      {/* KPI strip */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5"
          >
            <Bone className="mb-3 h-3 w-20" />
            <Bone className="mb-1 h-8 w-24" />
            <Bone className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
          <Bone className="mb-4 h-5 w-32" />
          <Bone className="h-48 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
          <Bone className="mb-4 h-5 w-28" />
          <Bone className="h-48 w-full rounded-xl" />
        </div>
      </div>
      {/* Table */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
        <Bone className="mb-4 h-5 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bone key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DASHBOARD WAITLISTS LIST  
   ══════════════════════════════════════════════════════════════════ */
export function WaitlistsListSkeleton() {
  return (
    <div className="flex-1 p-6">
      <TopProgress />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Bone className="mb-1 h-7 w-36" />
          <Bone className="h-4 w-56" />
        </div>
        <Bone className="h-9 w-36 rounded-lg" />
      </div>
      {/* Filter bar */}
      <div className="mb-6 flex gap-3">
        <Bone className="h-10 w-56 rounded-xl" />
        <Bone className="h-10 w-16 rounded-lg" />
        <Bone className="h-10 w-16 rounded-lg" />
        <Bone className="h-10 w-16 rounded-lg" />
      </div>
      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <Bone className="h-9 w-9 rounded-lg" />
              <Bone className="h-5 w-28" />
              <Bone className="ml-auto h-5 w-14 rounded-full" />
            </div>
            <div className="mb-4 flex gap-6">
              <div>
                <Bone className="mb-1 h-6 w-12" />
                <Bone className="h-3 w-16" />
              </div>
              <div>
                <Bone className="mb-1 h-6 w-10" />
                <Bone className="h-3 w-14" />
              </div>
            </div>
            <Bone className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ADMIN OVERVIEW  
   ══════════════════════════════════════════════════════════════════ */
export function AdminOverviewSkeleton() {
  return (
    <div className="flex-1 p-6">
      <TopProgress />
      <Bone className="mb-1 h-7 w-44" />
      <Bone className="mb-8 h-4 w-72" />
      {/* KPI */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5"
          >
            <Bone className="mb-2 h-3 w-16" />
            <Bone className="mb-1 h-8 w-20" />
            <Bone className="h-3 w-24" />
          </div>
        ))}
      </div>
      {/* Charts / Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5"
          >
            <Bone className="mb-4 h-5 w-28" />
            <Bone className="h-52 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PRICING PAGE  
   ══════════════════════════════════════════════════════════════════ */
export function PricingPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <TopProgress />
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <Bone className="mx-auto mb-3 h-9 w-48" />
        <Bone className="mx-auto mb-10 h-5 w-80" />
        <Bone className="mx-auto mb-12 h-10 w-52 rounded-full" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-7"
            >
              <Bone className="mb-2 h-5 w-20" />
              <Bone className="mb-3 h-10 w-28" />
              <Bone className="mb-6 h-4 w-full" />
              <div className="mb-6 space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Bone key={j} className="h-4 w-full" />
                ))}
              </div>
              <Bone className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   BILLING PAGE  
   ══════════════════════════════════════════════════════════════════ */
export function BillingSkeleton() {
  return (
    <div className="flex-1 p-6">
      <TopProgress />
      <Bone className="mb-1 h-7 w-32" />
      <Bone className="mb-8 h-4 w-56" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
          <Bone className="mb-4 h-5 w-28" />
          <Bone className="mb-2 h-8 w-20" />
          <Bone className="mb-4 h-4 w-48" />
          <Bone className="h-10 w-32 rounded-lg" />
        </div>
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
          <Bone className="mb-4 h-5 w-20" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Bone className="h-4 w-32" />
                <Bone className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SETTINGS PAGE  
   ══════════════════════════════════════════════════════════════════ */
export function SettingsSkeleton() {
  return (
    <div className="flex-1 p-6">
      <TopProgress />
      <Bone className="mb-1 h-7 w-28" />
      <Bone className="mb-8 h-4 w-48" />
      <div className="max-w-2xl space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6"
          >
            <Bone className="mb-4 h-5 w-24" />
            <Bone className="mb-3 h-10 w-full rounded-lg" />
            <Bone className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   AUTH PAGES (Login / Register)  
   ══════════════════════════════════════════════════════════════════ */
export function AuthPageSkeleton() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <TopProgress />
      <div className="w-full max-w-md rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8">
        <Bone className="mx-auto mb-6 h-8 w-32" />
        <Bone className="mx-auto mb-8 h-4 w-56" />
        <div className="space-y-4">
          <Bone className="h-11 w-full rounded-xl" />
          <Bone className="h-11 w-full rounded-xl" />
          <Bone className="h-11 w-full rounded-xl" />
        </div>
        <Bone className="mx-auto mt-6 h-4 w-40" />
      </div>
    </div>
  );
}
