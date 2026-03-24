import { type Metadata } from "next";
import { notFound }       from "next/navigation";
import Link               from "next/link";
import {
  ArrowLeft, ExternalLink, Users, Share2, Trophy,
  Zap, Globe, Lock, Calendar,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge }    from "@/src/components/ui/badge";
import { Button }   from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { cn }       from "@/src/lib/utils";

import { PodiumSection }      from "@/src/components/module/public-leaderboard/_components/PodiumSection";
import { LeaderboardTable }   from "@/src/components/module/public-leaderboard/_components/LeaderboardTable";
import { FindMyRankWidget }   from "@/src/components/module/public-leaderboard/_components/FindMyRankWidget";
import { fetchLeaderboardBySlug, fetchWaitlistBySlug } from "@/src/services/leaderboard/leaderboard-public.action";
import type { FullLeaderboardEntry } from "@/src/components/module/public-leaderboard/_lib/data";
import type { PublicWaitlistData, PublicPrize } from "@/src/components/module/individual-waitlist/_lib/data";

interface Props { params: Promise<{ slug: string }> }

/**
 * Transform API response to component expected format
 */
function transformLeaderboardEntries(entries: any[]): FullLeaderboardEntry[] {
  return entries.map((entry) => ({
    rank: entry.rank,
    maskedName: entry.name, // Use full name from API
    referralCount: entry.directReferrals,
    joinedAt: "recently", // API doesn't provide this, use placeholder
    tier: entry.tier,
    sharePercent: entry.sharePercent,
    isConfirmed: true, // API doesn't provide this
  }));
}

/**
 * Transform waitlist API response to component expected format
 */
function transformWaitlistData(data: any): PublicWaitlistData {
  const getInitials = (n: string) => n.split(" ").map(x => x[0]).join("").toUpperCase().slice(0, 2);
  
  return {
    id: data.slug,
    slug: data.slug,
    name: data.name,
    tagline: data.description?.split(".")[0] || "Early access joining soon",
    description: data.description || "",
    ownerMessage: null,
    logoInitials: getInitials(data.name),
    logoGradient: "from-indigo-500 to-violet-600",
    websiteUrl: null,
    category: "Other",
    tags: [],
    isOpen: data.isOpen,
    totalSubscribers: data.totalSubscribers || 0,
    recentJoins: 0,
    referralCount: data.topReferrers?.reduce((acc: number, r: any) => acc + r.referralCount, 0) || 0,
    viralScore: 0,
    expiresAt: null,
    ownerName: "Founder",
    ownerAvatarInitials: "F",
    prizes: [],
    leaderboard: []
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const waitlist = await fetchWaitlistBySlug(slug);
  if (!waitlist) return { title: "Not found" };
  return {
    title:       `Leaderboard — ${waitlist.name}`,
    description: `See the top referrers for ${waitlist.name} and find your place in the queue.`,
  };
}

export default async function PublicLeaderboardPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch waitlist info and leaderboard data from API
  console.log("[Leaderboard Page] Fetching data for slug:", slug);
  
  const [waitlistData, leaderboardData] = await Promise.all([
    fetchWaitlistBySlug(slug).catch((e) => {
      console.error("[Leaderboard Page] Error fetching waitlist:", e);
      return null;
    }),
    fetchLeaderboardBySlug(slug, { limit: 10, page: 1 }).catch((e) => {
      console.error("[Leaderboard Page] Error fetching leaderboard:", e);
      return null;
    }),
  ]);
  
  console.log("[Leaderboard Page] Waitlist data:", waitlistData);
  console.log("[Leaderboard Page] Leaderboard data:", leaderboardData);
  
  if (!waitlistData) {
    console.log("[Leaderboard Page] Waitlist not found, calling notFound()");
    notFound();
  }
  
  const waitlist = transformWaitlistData(waitlistData);
  
  // Handle case where leaderboardData might be null or have no data
  const entries = leaderboardData?.data 
    ? transformLeaderboardEntries(leaderboardData.data) 
    : [];
    
  console.log("[Leaderboard Page] Transformed entries:", entries);
  
  const summary = leaderboardData?.summary;
  
  // Use API summary for stats
  const totalSubscribers = summary?.totalSubscribers || waitlistData.totalSubscribers || 0;
  const referralCount = summary?.totalReferrals || 0;
  
  const top3     = entries.slice(0, 3);
  const hasPrizes= waitlist.prizes.length > 0;
  const totalCash= waitlist.prizes
    .filter((p) => p.prizeType === "CASH" && p.value)
    .reduce((s, p) => s + (p.value ?? 0), 0);
  const expiryDate = waitlist.expiresAt
    ? new Date(waitlist.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-[#070707]">

      {/* Background texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.011)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.011)_1px,transparent_1px)] bg-[size:52px_52px]"
      />
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed -left-40 top-0 h-[500px] w-[500px] rounded-full bg-indigo-500/6 blur-[120px]" />
      <div aria-hidden className="pointer-events-none fixed -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px]" />

      {/* ── Hero banner ──────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-border/60">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/4 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* Product identity */}
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 shrink-0 rounded-2xl shadow-xl shadow-black/30">
                <AvatarFallback className={cn(
                  "rounded-2xl bg-gradient-to-br text-xl font-black text-white",
                  waitlist.logoGradient,
                )}>
                  {waitlist.logoInitials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                    {waitlist.name}
                  </h1>
                  <Badge className={cn(
                    "gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    waitlist.isOpen
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700/60 bg-muted/40 text-muted-foreground/80",
                  )}>
                    {waitlist.isOpen ? <><Globe size={9} />Open</> : <><Lock size={9} />Closed</>}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground/80">{waitlist.tagline}</p>

                {/* Stats strip */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground/60">
                  <span className="flex items-center gap-1.5">
                    <Users  size={12} className="text-indigo-400" />
                    <span className="font-semibold text-muted-foreground">{totalSubscribers.toLocaleString()}</span>
                    in queue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Share2 size={12} className="text-violet-400" />
                    <span className="font-semibold text-muted-foreground">{referralCount.toLocaleString()}</span>
                    referrals
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap    size={12} className="text-amber-400" />
                    <span className="font-semibold text-muted-foreground">{waitlist.viralScore}×</span>
                    viral score
                  </span>
                  {expiryDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-rose-400" />
                      Closes <span className="font-semibold text-muted-foreground">{expiryDate}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Prize pool badge */}
            {hasPrizes && (
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <div className="flex items-center gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
                  <Trophy size={16} className="text-amber-400" />
                  <div>
                    <p className="text-[10px] text-muted-foreground/60">Prize pool</p>
                    {totalCash > 0
                      ? <p className="text-lg font-black text-amber-300">${totalCash.toLocaleString()}</p>
                      : <p className="text-sm font-bold text-amber-300">{waitlist.prizes.length} prizes</p>
                    }
                  </div>
                </div>
                {!waitlist.isOpen ? null : (
                  <Link href={`/explore/${slug}`}>
                    <Button size="sm" className="gap-1.5 bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500">
                      Join waitlist →
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">

          {/* ── LEFT: podium + full board ─────────────────── */}
          <div className="flex flex-col gap-10">

            {/* Podium */}
            {top3.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                    <Trophy size={14} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Top 3 referrers</h2>
                    <p className="text-[11px] text-muted-foreground/60">The leaders competing for prizes</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-zinc-900/20 p-6">
                  <PodiumSection top3={top3} prizes={waitlist.prizes} />
                </div>
              </section>
            )}

            <Separator className="bg-muted/60" />

            {/* Full board */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10">
                    <Users size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Full leaderboard</h2>
                    <p className="text-[11px] text-muted-foreground/60">
                      {entries.length} referrers — updated every 5 minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Live
                </div>
              </div>

              <LeaderboardTable entries={entries} prizes={waitlist.prizes} />
            </section>
          </div>

          {/* ── RIGHT: sticky sidebar ─────────────────────── */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">

            {/* Find my rank */}
            <FindMyRankWidget slug={slug} />

            {/* Prize pool summary */}
            {hasPrizes && (
              <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/30 p-5">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  <p className="text-sm font-semibold text-foreground/90">Prize pool</p>
                </div>
                <div className="flex flex-col gap-2">
                  {waitlist.prizes.map((prize) => (
                    <div
                      key={prize.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{prize.emoji}</span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground/80">{prize.title}</p>
                          <p className="text-[10px] text-muted-foreground/60">{prize.rankLabel}</p>
                        </div>
                      </div>
                      {prize.value && (
                        <span className="shrink-0 text-xs font-black tabular-nums text-foreground/80">
                          {prize.prizeType === "DISCOUNT" ? `${prize.value}% off` : `$${prize.value.toLocaleString()}`}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {waitlist.isOpen && (
                  <Link href={`/explore/${slug}`}>
                    <Button className="w-full gap-2 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500">
                      Join & start referring →
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* How it works */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-zinc-900/20 p-5">
              <p className="text-xs font-semibold text-muted-foreground">How prizes are awarded</p>
              {[
                { n: "1", text: "Join the waitlist to get your referral link" },
                { n: "2", text: "Share your link — every signup moves you up" },
                { n: "3", text: "Top referrers when the waitlist closes win prizes" },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-[10px] font-bold text-muted-foreground/80">
                    {s.n}
                  </span>
                  <p className="text-xs leading-relaxed text-muted-foreground/80">{s.text}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative mt-10 border-t border-border/50 px-4 py-8 text-center">
        <p className="text-xs text-muted-foreground/40">
          Powered by{" "}
          <Link href="#" className="font-semibold text-muted-foreground/80 hover:text-muted-foreground transition-colors">
            LaunchForge
          </Link>{" "}
          · The viral waitlist platform
        </p>
      </footer>
    </div>
  );
}