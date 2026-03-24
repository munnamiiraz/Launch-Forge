import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  ArrowLeft, Globe, Lock, Trophy,
  Users, ExternalLink,
} from "lucide-react";

import { Badge }          from "@/src/components/ui/badge";
import { Button }         from "@/src/components/ui/button";
import { DashboardHeader } from "@/src/components/module/dashboard/_components/DashboardHeader";
import { LeaderboardQueryProvider }   from "@/src/components/module/leaderboard/waitlistId/_components/LeaderboardQueryProvider";
import { WaitlistLeaderboardClient }  from "@/src/components/module/leaderboard/waitlistId/_components/WaitlistLeaderboardClient";
import { fetchLeaderboard, fetchWaitlistInfo } from "@/src/services/leaderboard/leaderboard.action";
import { leaderboardKeys }  from "@/src/components/module/leaderboard/waitlistId/_lib/queryKeys";

interface PageProps {
  params: Promise<{ waitlistId: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { waitlistId } = await params;
  const info = await fetchWaitlistInfo(waitlistId).catch(() => null);
  return {
    title:       `${info?.name ?? "Leaderboard"} — LaunchForge`,
    description: `Top referrers for the ${info?.name ?? ""} waitlist.`,
  };
}

const DEFAULT_PARAMS = {
  page: 1, limit: 15, tier: "all" as const,
  search: "", countMode: "all" as const,
};

export default async function WaitlistLeaderboardPage({ params }: PageProps) {
  const { waitlistId } = await params;

  /* ── Parallel server fetch ───────────────────────────────────── */
  const [waitlistInfo, initialLeaderboard] = await Promise.all([
    fetchWaitlistInfo(waitlistId).catch(() => null),
    fetchLeaderboard(waitlistId, DEFAULT_PARAMS).catch(() => null),
  ]);

  if (!waitlistInfo) notFound();

  /* ── Prefill TanStack Query cache (hydration pattern) ─────────
   *
   * We prefetch on the server and dehydrate the cache.
   * HydrationBoundary rehydrates it on the client so:
   * - zero loading spinner on first paint
   * - TanStack Query takes over for pagination / filters / polling
   * ──────────────────────────────────────────────────────────── */
  const queryClient = new QueryClient();

  if (initialLeaderboard) {
    await queryClient.prefetchQuery({
      queryKey: leaderboardKeys.entries(waitlistId, DEFAULT_PARAMS),
      queryFn:  () => Promise.resolve(initialLeaderboard),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="flex flex-col">
      {/* {console.log("hiii")} */}
      hii
      {/* ── Sticky header ────────────────────────────────────── */}
      {/* <DashboardHeader
        title={waitlistInfo.name}
        subtitle="Leaderboard"
      >
        <Link href={`https://launchforge.app/${waitlistInfo.slug}`} target="_blank">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-zinc-700/80 bg-transparent text-xs text-muted-foreground hover:border-zinc-600 hover:bg-muted/60 hover:text-foreground/90"
          >
            <ExternalLink size={12} />
            Public page
          </Button>
        </Link>
      </DashboardHeader> */}

      {/* ── Page body ────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 p-6">

        {/* Breadcrumb + waitlist identity */}
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard/leaderboard"
            className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            <ArrowLeft size={13} />
            All leaderboards
          </Link>

          {/* Identity band */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 px-6 py-5">
            {/* Ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/6 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-8 bottom-0 h-32 w-64 rounded-full bg-indigo-500/5 blur-3xl"
            />

            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                  <Trophy size={20} className="text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold tracking-tight text-foreground">
                      {waitlistInfo.name}
                    </h1>
                    <Badge
                      variant="outline"
                      className={
                        waitlistInfo.isOpen
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-700/60 bg-muted/40 text-muted-foreground/80"
                      }
                    >
                      {waitlistInfo.isOpen
                        ? <><Globe size={9} className="mr-1" />Open</>
                        : <><Lock  size={9} className="mr-1" />Closed</>
                      }
                    </Badge>
                  </div>
                  {waitlistInfo.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground/80">
                      {waitlistInfo.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground/60">
                    launchforge.app/{waitlistInfo.slug}
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/waitlists/${waitlistId}`}
                className="hidden sm:block"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-zinc-700/60 bg-transparent text-xs text-muted-foreground hover:border-zinc-600 hover:bg-muted/60 hover:text-foreground/90"
                >
                  <Users size={12} />
                  Manage waitlist
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── TanStack Query hydrated client ─────────────────── */}
        <LeaderboardQueryProvider dehydratedState={dehydratedState}>
          <WaitlistLeaderboardClient
            waitlistId={waitlistId}
            initialData={initialLeaderboard ?? {
              data:    [],
              meta:    { total: 0, page: 1, limit: 15, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
              summary: { totalSubscribers: 0, totalReferrals: 0, activeReferrers: 0, avgReferralsPerReferrer: 0, topReferralCount: 0, newestSubscriberAt: null },
            }}
          />
        </LeaderboardQueryProvider>
      </div>
    </div>
  );
}