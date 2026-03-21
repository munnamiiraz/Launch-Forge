import { type Metadata } from "next";
import { Trophy } from "lucide-react";

import { DashboardHeader }          from "@/src/components/module/dashboard/_components/DashboardHeader";
import { LeaderboardSummaryStrip }  from "@/src/components/module/leaderboard/_components/LeaderboardSummaryStrip";
import { LeaderboardsClient }       from "@/src/components/module/leaderboard/_components/LeaderboardsClient";
import { fetchLeaderboardCards, fetchLeaderboardDashboardStats } from "@/src/services/leaderboard/leaderboard.action";

export const metadata: Metadata = {
  title:       "Leaderboard — LaunchForge",
  description: "Track top referrers across all your waitlists.",
};

export default async function LeaderboardPage() {
  const [leaderboards, stats] = await Promise.all([
    fetchLeaderboardCards().catch(() => []),
    fetchLeaderboardDashboardStats().catch(() => ({
      totalWaitlists: 0,
      totalReferrals: 0,
      totalReferrers: 0,
      topViralScore:  0,
    })),
  ]);

  return (
    <div className="flex flex-col">

      {/* ── Sticky header ───────────────────────────────────────── */}
      <DashboardHeader
        title="Leaderboards"
        subtitle={`${stats.totalWaitlists} waitlist${stats.totalWaitlists !== 1 ? "s" : ""} · ${stats.totalReferrers.toLocaleString()} active referrers`}
      />

      {/* ── Page body ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 p-6">

        {/* Page title block with ambient glow */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/30 px-6 py-5">
          {/* Ambient */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/6 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 bottom-0 h-32 w-64 rounded-full bg-indigo-500/5 blur-3xl"
          />

          <div className="relative flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
              <Trophy size={18} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-100">
                All leaderboards
              </h1>
              <p className="mt-0.5 text-xs text-zinc-500">
                Each card shows your top 5 referrers per waitlist.
                Click{" "}
                <span className="text-indigo-400">View waitlist</span>{" "}
                to open the full leaderboard with search, tier filters, and chain referral counts.
              </p>
            </div>
          </div>
        </div>

        {/* Summary stats strip */}
        <LeaderboardSummaryStrip stats={stats} />

        {/* Interactive grid */}
        <LeaderboardsClient leaderboards={leaderboards} />
      </div>
    </div>
  );
}