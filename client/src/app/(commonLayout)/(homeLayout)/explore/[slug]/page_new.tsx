import { type Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  Users,
  Share2,
  Zap,
  Globe,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/src/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";

import { JoinSection } from "@/src/components/module/individual-waitlist/_components/JoinSection";
import { PrizePoolSection } from "@/src/components/module/individual-waitlist/_components/PrizePoolSection";
import { PublicLeaderboard } from "@/src/components/module/individual-waitlist/_components/PublicLeaderboard";
import { fetchPublicWaitlist } from "@/src/services/public-waitlist/public-waitlist.services";
import { fetchPublicPrizes } from "@/src/services/prizes/prizes.service";
import type { PublicWaitlistData } from "@/src/components/module/individual-waitlist/_lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-3.5 transition-colors hover:bg-white/8">
      <div className="mb-2">{icon}</div>
      <p className="text-sm font-black text-foreground">{value}</p>
      <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">{label}</p>
    </div>
  );
}

function mapToPublicWaitlist(data: any, prizes: any[] = []): PublicWaitlistData {
  const getInitials = (n: string) =>
    n
      .split(" ")
      .map((x: string) => x[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    tagline: data.description?.split(".")[0] || "Early access joining soon",
    description: data.description || "",
    ownerMessage: data.ownerMessage || null,
    logoUrl: data.logoUrl || null,
    logoInitials: getInitials(data.name),
    logoGradient: "from-blue-600 to-indigo-600",
    websiteUrl: data.websiteUrl || null,
    category: data.category || "Technology",
    tags: data.tags || [],
    isOpen: data.isOpen,
    totalSubscribers: data.totalSubscribers,
    recentJoins: 0,
    referralCount: data.referralCount || 0,
    viralScore: data.viralScore || 1.2,
    endDate: data.endDate || null,
    expiresAt: null,
    ownerName: data.ownerName || "Founder",
    ownerAvatarInitials: data.ownerName ? getInitials(data.ownerName) : "F",
    prizes: prizes,
    leaderboard: 
      data.leaderboard?.map((r: any, idx: number) => ({
        rank: r.rank ?? idx + 1,
        maskedName: r.maskedName,
        referralCount: r.referralCount,
        isTop3: (r.rank ?? idx + 1) <= 3,
      })) || [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const wlRaw = await fetchPublicWaitlist(slug);
  if (!wlRaw) return { title: "Not found" };
  const wl = mapToPublicWaitlist(wlRaw);
  return {
    title: `Join ${wl.name} — LaunchForge`,
    description: wl.tagline,
  };
}

export default async function PublicWaitlistPage({ params }: Props) {
  const { slug } = await params;
  const wlRaw = await fetchPublicWaitlist(slug);

  if (!wlRaw) notFound();

  const prizes = await fetchPublicPrizes(wlRaw.id);
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
  const hasPrizes = wl.prizes.length > 0;

  const expiryDate = wl.endDate 
    ? new Date(wl.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-[#050505] text-foreground selection:bg-indigo-500/30">
      <div className="mx-auto max-w-[1100px] px-6 py-12 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-10">
            
            {/* ── Waitlist Info ─────────────────────────── */}
            <section className="flex flex-col gap-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                {/* Logo */}
                <div className="group relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                  <div className="absolute -inset-1 rounded-3xl bg-linear-to-tr from-indigo-500/20 to-violet-500/20 blur-lg transition-all group-hover:opacity-100" />
                  <Avatar className="h-full w-full rounded-3xl border border-white/10 p-1.5 backdrop-blur-sm">
                    {wl.logoUrl ? (
                      <AvatarImage src={wl.logoUrl} className="rounded-2xl object-cover" />
                    ) : (
                      <AvatarFallback className={cn(
                        "rounded-2xl bg-linear-to-br text-3xl font-black text-white",
                        wl.logoGradient
                      )}>
                        {wl.logoInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                {/* Title and tags */}
                <div className="flex flex-col mt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {wl.name}
                    </h1>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 rounded-full bg-amber-500/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:bg-amber-500/20 hover:text-amber-300">
                          {hasPrizes ? "View Prizes" : "No Rewards"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-border/60 bg-[#0a0a0a] p-0 sm:max-w-lg sm:rounded-[2.5rem]">
                        <div className="p-8">
                          <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-black">Waitlist Rewards</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                              Exclusive perks for the top contributors of {wl.name}.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {hasPrizes ? (
                            <div className="grid gap-4">
                              {wl.prizes.map((prize, idx) => {
                                return (
                                  <div key={idx} className="flex gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                                      {prize.emoji}
                                    </div>
                                    <div className="flex flex-col">
                                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{prize.rankLabel}</p>
                                      <p className="font-bold text-foreground">{prize.title}</p>
                                      {prize.value !== null && prize.value > 0 && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          Value: {prize.currency ?? ''}{prize.value.toLocaleString()}
                                        </p>
                                      )}
                                      {prize.expiresAt && (
                                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                                          Ends {new Date(prize.expiresAt).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No prizes available for this waitlist.</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Category + tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/5 text-xs text-indigo-400 font-medium">
                      {wl.category}
                    </Badge>
                    {wl.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-zinc-800 bg-zinc-900/50 text-xs text-muted-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl">
                <StatPill
                  icon={<Users size={16} className="text-indigo-400" />}
                  value={wl.totalSubscribers >= 1000 ? `${(wl.totalSubscribers / 1000).toFixed(1)}k` : wl.totalSubscribers.toLocaleString()}
                  label="in queue"
                />
                <StatPill
                  icon={<Share2 size={16} className="text-violet-400" />}
                  value={wl.referralCount >= 1000 ? `${(wl.referralCount / 1000).toFixed(1)}k` : wl.referralCount.toLocaleString()}
                  label="referrals"
                />
                <StatPill
                  icon={<Zap size={16} className="text-amber-400" />}
                  value={`${wl.viralScore}×`}
                  label="viral score"
                />
              </div>

              {/* Expiry notice */}
              {expiryDate && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-500/10 bg-amber-500/5 px-4 py-3">
                  <Calendar size={14} className="shrink-0 text-amber-500" />
                  <p className="text-sm text-amber-200/80">
                    Waitlist closes <span className="font-bold text-amber-400">{expiryDate}</span> — join before it's too late
                  </p>
                </div>
              )}

              {/* Description */}
              <p className="text-base leading-relaxed text-muted-foreground max-w-2xl">{wl.description}</p>

              {/* Website link */}
              {wl.websiteUrl && (
                <a
                  href={wl.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-fit items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm text-muted-foreground transition-all hover:bg-white/10 hover:text-white"
                >
                  <ExternalLink size={14} className="opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  Visit {wl.websiteUrl.replace(/https?:\/\//, "")}
                </a>
              )}
            </section>

            <Separator className="bg-white/5" />

            {/* ── Owner message ─────────────────────────── */}
            {wl.ownerMessage && (
              <section className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 shrink-0 rounded-2xl">
                    <AvatarFallback className={cn(
                      "rounded-2xl bg-linear-to-br text-xs font-black text-white",
                      wl.logoGradient,
                    )}>
                      {wl.ownerAvatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-white">{wl.ownerName}</p>
                    <p className="text-[11px] text-muted-foreground/60">Founder of {wl.name}</p>
                  </div>
                </div>

                <div className="relative rounded-3xl border border-white/5 bg-white/5 px-6 py-5">
                  <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-3xl font-serif text-indigo-500/30">
                    "
                  </div>
                  <p className="text-sm italic leading-relaxed text-muted-foreground">{wl.ownerMessage}</p>
                </div>
              </section>
            )}

            {/* ── Prize pool ────────────────────────────── */}
            {hasPrizes && (
              <>
                <Separator className="bg-white/5" />
                <div id="prizes" className="scroll-mt-24">
                  <h2 className="mb-8 text-xl font-black uppercase tracking-widest text-white">Waitlist Rewards</h2>
                  <PrizePoolSection prizes={wl.prizes.map((p, i) => ({ ...p, id: String(i) })) as any} />
                </div>
              </>
            )}

            {/* ── Public leaderboard ────────────────────── */}
            <Separator className="bg-white/5" />
            <section id="leaderboard" className="scroll-mt-24">
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-white">Leaderboard</h2>
                  <p className="mt-1 text-xs text-muted-foreground/60">Top performers earning their spot in {wl.name}.</p>
                </div>
                <Link 
                  href={`/explore/${wl.slug}/leaderboard`}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                >
                  Full Ranking →
                </Link>
              </div>
              <PublicLeaderboard
                entries={wl.leaderboard as any}
                prizes={wl.prizes as any}
                waitlistName={wl.name}
              />
            </section>
          </div>

          {/* RIGHT COLUMN — sticky join panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white">
                    {wl.isOpen ? "Reserve your spot" : "Waitlist closed"}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground/80">
                    {wl.isOpen
                      ? "The launch is approaching fast. Secure your position and move up by referring friends."
                      : "This waitlist is no longer accepting new signups."}
                  </p>
                </div>

                {hasPrizes && wl.isOpen && (
                  <div className="flex items-center gap-4 rounded-2xl border border-amber-500/10 bg-amber-500/5 px-4 py-3.5">
                    <Trophy size={18} className="shrink-0 text-amber-400" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Prizes active</p>
                      <p className="truncate text-sm font-semibold text-white/90">
                        {wl.prizes[0].emoji} {wl.prizes[0].title}
                      </p>
                    </div>
                  </div>
                )}

                <JoinSection waitlist={wl as unknown as PublicWaitlistData} />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 text-center">
              <ShieldCheck size={14} className="text-emerald-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                Verified by LaunchForge
              </p>
            </div>
          </div>

        </div>
      </div>

      <footer className="mt-20 border-t border-white/5 bg-[#030303] py-12 text-center">
        <p className="text-xs text-muted-foreground/30">
          Powered by <Link href="/" className="font-bold text-muted-foreground/50 transition-colors hover:text-white">LaunchForge</Link>
          <br />
          The viral growth engine for product launches.
        </p>
      </footer>
    </div>
  );
}
