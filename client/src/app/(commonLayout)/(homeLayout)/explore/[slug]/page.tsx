import { type Metadata } from "next";
import { notFound }       from "next/navigation";
import Link               from "next/link";
import {
  ExternalLink, Users, Share2, Zap,
  Globe, Lock, Calendar, ArrowLeft, Trophy,
} from "lucide-react";

import { Badge }    from "@/src/components/ui/badge";
import { Button }   from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/src/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import { cn }       from "@/src/lib/utils";

import { JoinSection }        from "@/src/components/module/individual-waitlist/_components/JoinSection";
import { PrizePoolSection }   from "@/src/components/module/individual-waitlist/_components/PrizePoolSection";
import { PublicLeaderboard }  from "@/src/components/module/individual-waitlist/_components/PublicLeaderboard";
import { fetchPublicWaitlist } from "@/src/services/public-waitlist/public-waitlist.services";
import { fetchPublicPrizes }   from "@/src/services/prizes/prizes.service";
import type { PublicWaitlistData } from "@/src/components/module/individual-waitlist/_lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

function mapToPublicWaitlist(data: any, prizes: any[] = []): PublicWaitlistData {
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
    totalSubscribers: data.totalSubscribers,
    recentJoins: 0,
    referralCount: data.topReferrers?.reduce((acc: number, r: any) => acc + r.referralCount, 0) || 0,
    viralScore: 0,
    expiresAt: null,
    ownerName: "Founder",
    ownerAvatarInitials: "F",
    prizes: prizes,
    leaderboard: data.topReferrers?.map((r: any, idx: number) => ({
      rank: r.rank ?? idx + 1,
      maskedName: r.maskedName,
      referralCount: r.referralCount,
      isTop3: (r.rank ?? idx + 1) <= 3
    })) || []
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const wlRaw = await fetchPublicWaitlist(slug);
  if (!wlRaw) return { title: "Not found" };
  const wl = mapToPublicWaitlist(wlRaw);
  return {
    title:       `Join ${wl.name} — LaunchForge`,
    description: wl.tagline,
    openGraph: {
      title:       `${wl.name} — Join the waitlist`,
      description: wl.tagline,
      type:        "website",
    },
  };
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/30 px-3.5 py-2.5">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-black tabular-nums text-foreground/90">{value}</p>
        <p className="text-[10px] text-muted-foreground/60">{label}</p>
      </div>
    </div>
  );
}

export default async function PublicWaitlistPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch waitlist data first (we need the ID to fetch prizes)
  const wlRaw = await fetchPublicWaitlist(slug);
  
  if (!wlRaw) {
    notFound();
  }

  // Fetch prizes using the waitlist ID from the API response
  const prizes = await fetchPublicPrizes(wlRaw.id);
  
  // Transform prizes to match the expected format
  const transformedPrizes = prizes.map((p: any) => ({
    id: p.id,
    rankFrom: p.rankFrom,
    rankTo: p.rankTo,
    rankLabel: p.rankLabel,
    title: p.title,
    description: p.description,
    prizeType: p.prizeType,
    value: p.value,
    currency: p.currency,
    emoji: p.prizeType === "PRODUCT" ? "📦" : p.prizeType === "CASH" ? "💵" : p.prizeType === "GIFT_CARD" ? "🎁" : "🏆",
    expiresAt: p.expiresAt,
  }));

  const wl = mapToPublicWaitlist(wlRaw, transformedPrizes);

  const hasPrizes  = wl.prizes.length > 0;
  const expiryDate = wl.expiresAt
    ? new Date(wl.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-[#070707]">

      {/* ── Background grid texture ───────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.011)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.011)_1px,transparent_1px)] bg-[size:52px_52px]"
      />

      {/* ── Ambient glow ─────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed -left-40 top-0 h-[500px] w-[500px] rounded-full bg-indigo-500/6 blur-[120px]" />
      <div aria-hidden className="pointer-events-none fixed -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[100px]" />

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

          {/* ════════════════════════════════════════════════
              LEFT COLUMN — product info
              ════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-10">

            {/* ── Product hero ──────────────────────────── */}
            <section className="flex flex-col gap-5">

              {/* Logo + name */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 shrink-0 rounded-2xl shadow-xl shadow-black/30">
                  <AvatarFallback className={cn(
                    "rounded-2xl bg-gradient-to-br text-xl font-black text-white",
                    wl.logoGradient,
                  )}>
                    {wl.logoInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                      {wl.name}
                    </h1>
                    <Badge className={cn(
                      "gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                      wl.isOpen
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-700/60 bg-muted/40 text-muted-foreground/80",
                    )}>
                      {wl.isOpen ? <><Globe size={10} />Open</> : <><Lock size={10} />Closed</>}
                    </Badge>
                  </div>
                  <p className="mt-1 text-base text-muted-foreground">{wl.tagline}</p>

                  {/* Action buttons */}
                  <div className="mt-4 flex items-center gap-2">
                    {wl.websiteUrl && (
                      <a
                        href={wl.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-xs font-medium text-muted-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
                      >
                        <ExternalLink size={14} />
                        Visit product website
                      </a>
                    )}
                    <Link
                      href={`/explore/${wl.slug}/leaderboard`}
                      className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
                    >
                      <Trophy size={14} />
                      Leaderboard
                    </Link>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-400 transition-colors hover:bg-indigo-500/20">
                          <Trophy size={14} />
                          Prizes
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                              <Trophy size={16} className="text-amber-400" />
                            </div>
                            <h2 className="text-lg font-bold">Prizes</h2>
                          </div>
                          {hasPrizes ? (
                            <div className="flex flex-col gap-3">
                              {wl.prizes.map((prize, idx) => {
                                const isTop = prize.rankFrom === 1;
                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-start gap-3 rounded-xl border p-4 ${
                                      isTop ? 'border-amber-500/25 bg-amber-500/8' : 'border-border/60 bg-card/40'
                                    }`}
                                  >
                                    <span className="text-2xl">{isTop ? '🥇' : prize.emoji}</span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          isTop 
                                            ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                                            : 'border-zinc-700/60 bg-muted/40 text-muted-foreground'
                                        }`}>
                                          {prize.rankLabel} place
                                        </span>
                                      </div>
                                      <p className="text-sm font-semibold text-foreground">{prize.title}</p>
                                      {prize.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{prize.description}</p>
                                      )}
                                      {prize.value && (
                                        <p className="text-sm font-bold text-emerald-300 mt-1">
                                          {prize.prizeType === 'DISCOUNT' 
                                            ? `${prize.value}% off`
                                            : `${prize.currency ?? ""}${prize.value.toLocaleString()}`
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No prizes available for this waitlist.</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Category + tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge className="border-indigo-500/25 bg-indigo-500/10 text-xs text-indigo-400">
                      {wl.category}
                    </Badge>
                    {wl.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} className="border-zinc-800 bg-card/60 text-xs text-muted-foreground/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-3">
                <StatPill
                  icon={<Users   size={14} className="text-indigo-400" />}
                  value={wl.totalSubscribers >= 1000 ? `${(wl.totalSubscribers / 1000).toFixed(1)}k` : wl.totalSubscribers.toLocaleString()}
                  label="in queue"
                />
                <StatPill
                  icon={<Share2  size={14} className="text-violet-400" />}
                  value={wl.referralCount >= 1000 ? `${(wl.referralCount / 1000).toFixed(1)}k` : wl.referralCount.toLocaleString()}
                  label="referrals"
                />
                <StatPill
                  icon={<Zap     size={14} className="text-amber-400"  />}
                  value={`${wl.viralScore}×`}
                  label="viral score"
                />
              </div>

              {/* Expiry notice */}
              {expiryDate && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/6 px-4 py-2.5">
                  <Calendar size={13} className="shrink-0 text-amber-400" />
                  <p className="text-xs text-amber-300">
                    Waitlist closes <span className="font-bold">{expiryDate}</span> — join before it's too late
                  </p>
                </div>
              )}

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground">{wl.description}</p>

              {/* Website link */}
              {wl.websiteUrl && (
                <a
                  href={wl.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-fit items-center gap-2 rounded-xl border border-border/80 bg-card/40 px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-zinc-700 hover:bg-muted/60 hover:text-foreground/90"
                >
                  <ExternalLink size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  Visit {wl.websiteUrl.replace(/https?:\/\//, "")}
                </a>
              )}
            </section>

            <Separator className="bg-muted/60" />

            {/* ── Owner message ─────────────────────────── */}
            {wl.ownerMessage && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0 rounded-xl">
                    <AvatarFallback className={cn(
                      "rounded-xl bg-gradient-to-br text-xs font-black text-white",
                      wl.logoGradient,
                    )}>
                      {wl.ownerAvatarInitials || wl.logoInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground/90">{wl.ownerName}</p>
                    <p className="text-[11px] text-muted-foreground/60">Founder of {wl.name}</p>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-border/60 bg-card/30 px-5 py-4">
                  {/* Quote mark */}
                  <div className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-2xl leading-none text-indigo-500/50">
                    "
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{wl.ownerMessage}</p>
                </div>
              </section>
            )}

            {/* ── Prize pool ────────────────────────────── */}
            {hasPrizes && (
              <>
                <Separator className="bg-muted/60" />
                <PrizePoolSection prizes={wl.prizes.map((p, i) => ({ id: String(i), rankFrom: p.rankFrom, rankTo: p.rankTo, rankLabel: p.rankLabel, title: p.title, description: p.description, prizeType: p.prizeType as any, value: p.value, currency: p.currency, emoji: p.emoji, expiresAt: p.expiresAt }))} />
              </>
            )}

            {/* ── Public leaderboard ────────────────────── */}
            <Separator className="bg-muted/60" />
            <PublicLeaderboard
              entries={wl.leaderboard as any}
              prizes={wl.prizes.map((p, i) => ({ id: p.id || String(i), rankFrom: p.rankFrom, rankTo: p.rankTo, rankLabel: p.rankLabel, title: p.title, description: p.description, prizeType: p.prizeType as any, value: p.value, currency: p.currency, emoji: p.emoji, expiresAt: p.expiresAt }))}
              waitlistName={wl.name}
            />

          </div>

          {/* ════════════════════════════════════════════════
              RIGHT COLUMN — sticky join panel
              ════════════════════════════════════════════════ */}
          <div className="lg:self-start lg:sticky lg:top-20">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-[#0d0d0d] p-6 shadow-2xl shadow-black/40">

              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

              {/* Glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/8 blur-3xl" />

              <div className="relative flex flex-col gap-5">
                {/* Panel header */}
                <div>
                  <h2 className="text-lg font-black tracking-tight text-foreground">
                    {wl.isOpen ? "Reserve your spot" : "Waitlist closed"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {wl.isOpen
                      ? "Join now and refer friends to move up the queue."
                      : "This waitlist is no longer accepting signups."}
                  </p>
                </div>

                {/* Prize teaser */}
                {hasPrizes && wl.isOpen && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/6 px-3.5 py-2.5">
                    <Trophy size={14} className="shrink-0 text-amber-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-300">Prizes up for grabs</p>
                      <p className="truncate text-[10px] text-muted-foreground/60">
                        {wl.prizes[0].emoji} {wl.prizes[0].title}
                        {wl.prizes.length > 1 && ` + ${wl.prizes.length - 1} more`}
                      </p>
                    </div>
                    <a
                      href="#prizes"
                      className="shrink-0 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      View →
                    </a>
                  </div>
                )}

                {/* Join section */}
                <JoinSection waitlist={wl as unknown as PublicWaitlistData} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative mt-16 border-t border-border/50 bg-[#070707] px-4 py-8 text-center">
        <p className="text-xs text-muted-foreground/40">
          Powered by{" "}
          <Link href="#" className="font-semibold text-muted-foreground/80 hover:text-muted-foreground transition-colors">
            LaunchForge
          </Link>
          {" "}· The viral waitlist platform for product launches
        </p>
      </footer>
    </div>
  );
}