import { type Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  Users,
  Share2,
  Zap,
  Globe,
  Lock,
  CalendarDays,
  Trophy,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
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
    ownerMessage: null,
    logoUrl: data.logoUrl || null,
    logoInitials: getInitials(data.name),
    logoGradient: "from-blue-600 to-indigo-600",
    websiteUrl: null,
    category: data.category || "Technology",
    tags: [],
    isOpen: data.isOpen,
    totalSubscribers: data.totalSubscribers,
    recentJoins: 0,
    referralCount: data.topReferrers?.reduce((acc: number, r: any) => acc + r.referralCount, 0) || 0,
    viralScore: 0,
    endDate: data.endDate || null,
    expiresAt: null,
    ownerName: "Founder",
    ownerAvatarInitials: "F",
    prizes: prizes,
    leaderboard: 
      data.topReferrers?.map((r: any, idx: number) => ({
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

  const endDate = wl.endDate ? new Date(wl.endDate) : null;
  const endDateStr = endDate
    ? endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const daysRemaining = endDate
    ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isEndingSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

  return (
    <div className="flex min-h-screen flex-col items-center overflow-x-hidden bg-[#020202] text-zinc-100 selection:bg-indigo-500/30">
      {/* ── Background & Ambient ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-[0.03]" />
        <div className="absolute -left-1/4 top-0 h-[600px] w-[800px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute -right-1/4 top-1/4 h-[600px] w-[800px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6 pb-32 pt-28">
        
        {/* Header Section */}
        <section className="animate-in fade-in slide-in-from-top-4 flex flex-col items-center text-center duration-1000 ease-out fill-mode-both">
          
          <div className="group relative mb-8">
             <div className="absolute -inset-1.5 rounded-[2.2rem] bg-gradient-to-r from-blue-500/20 to-indigo-600/20 blur opacity-40 transition duration-1000 group-hover:opacity-60"></div>
             <Avatar className="relative h-20 w-20 rounded-[1.8rem] border border-zinc-800/80 bg-black/80 p-1">
               {wl.logoUrl ? (
                 <AvatarImage src={wl.logoUrl} alt={wl.name} className="rounded-[1.6rem] object-cover" />
               ) : (
                 <AvatarFallback className={cn("rounded-[1.6rem] bg-gradient-to-br text-xl font-black text-white", wl.logoGradient)}>
                   {wl.logoInitials}
                 </AvatarFallback>
               )}
             </Avatar>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <Badge className={cn(
              "rounded-full border px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md",
              wl.isOpen ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
            )}>
              {wl.isOpen ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                  Live Access
                </span>
              ) : "Closed"}
            </Badge>

            {endDateStr && (
              <Badge className={cn(
                "rounded-full border px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md",
                isEndingSoon ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
              )}>
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={10} className={isEndingSoon ? "text-orange-400" : "text-indigo-400"} />
                  {isEndingSoon ? `Ends in ${daysRemaining}d` : `Ends ${endDateStr}`}
                </div>
              </Badge>
            )}
          </div>

          <h1 className="mb-6 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            {wl.name}
          </h1>

          <p className="mb-10 max-w-xl text-[15px] leading-relaxed text-zinc-400 md:text-base">
            {wl.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="group h-12 rounded-full bg-indigo-600 px-10 text-[14px] font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-95">
                  {wl.isOpen ? "Reserve My Spot" : "Join Waitlist"}
                  <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:max-w-md sm:rounded-3xl">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-bold">Claim early access</DialogTitle>
                  <DialogDescription className="text-zinc-500">
                    Be the first in line for {wl.name}.
                  </DialogDescription>
                </DialogHeader>
                <JoinSection waitlist={wl as unknown as PublicWaitlistData} />
              </DialogContent>
            </Dialog>

            {wl.websiteUrl && (
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-zinc-800 bg-zinc-900/40 px-8 text-[14px] text-zinc-300 backdrop-blur-sm hover:bg-zinc-800 hover:text-white">
                <a href={wl.websiteUrl} target="_blank" rel="noreferrer">
                  <Globe size={14} className="mr-2 opacity-60" />
                  Website
                </a>
              </Button>
            )}
          </div>
        </section>

        {/* Stats Grid */}
        <section className="animate-in fade-in slide-in-from-bottom-8 mt-20 grid w-full grid-cols-1 gap-4 duration-1000 ease-out fill-mode-both sm:grid-cols-3">
          {[
            { label: "Subscribers", value: wl.totalSubscribers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/10" },
            { label: "Referrals", value: wl.referralCount, icon: Share2, color: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/10" },
            { label: "Potential", value: wl.viralScore, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" }
          ].map((stat, i) => (
            <div key={i} className={cn("flex flex-col items-center justify-center rounded-3xl border p-6 backdrop-blur-md", stat.bg, stat.border)}>
              <div className="mb-3">
                <stat.icon size={16} className={stat.color} />
              </div>
              <p className="text-2xl font-black tabular-nums text-white">
                {typeof stat.value === 'number' && stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value.toLocaleString()}
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Dynamic Detail Sections */}
        <div className="mt-28 flex w-full flex-col gap-28">
          
          {/* Rewards */}
          {hasPrizes && (
            <section id="prizes" className="scroll-mt-24">
              <div className="mb-10 flex flex-col items-center text-center">
                <h2 className="mb-2 text-xl font-black tracking-tight text-white uppercase">Waitlist Rewards</h2>
                <div className="h-1 w-12 rounded-full bg-indigo-500/40 mb-3" />
                <p className="text-xs text-zinc-500">Climb the leaderboard to unlock these exclusive early perks.</p>
              </div>
              <div className="rounded-[2rem] border border-zinc-800/80 bg-zinc-900/20 p-8 sm:p-12 backdrop-blur-xl shadow-2xl shadow-black/50">
                <PrizePoolSection prizes={wl.prizes.map((p, i) => ({ ...p, id: String(i) })) as any} />
              </div>
            </section>
          )}

          {/* Leaderboard */}
          {(wl.leaderboard && wl.leaderboard.length > 0) && (
            <section>
              <div className="mb-10 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
                <div className="text-center sm:text-left">
                  <h2 className="mb-2 text-xl font-black tracking-tight text-white uppercase">Top Referrers</h2>
                  <div className="h-1 w-12 rounded-full bg-blue-500/40 mb-3 ml-auto sm:ml-0" />
                  <p className="text-xs text-zinc-500">Active contributors fueling the growth of {wl.name}.</p>
                </div>
                <Button asChild variant="ghost" className="group h-10 rounded-full text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                  <Link href={`/explore/${wl.slug}/leaderboard`} className="flex items-center">
                    Full Leaderboard
                    <ArrowLeft size={14} className="ml-2 rotate-180 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="rounded-[2rem] border border-zinc-800/80 bg-zinc-900/20 p-8 sm:p-12 backdrop-blur-xl shadow-2xl shadow-black/50">
                <PublicLeaderboard
                  entries={wl.leaderboard as any}
                  prizes={wl.prizes as any}
                  waitlistName={wl.name}
                />
              </div>
            </section>
          )}

        </div>

        {/* Platform Badge */}
        <div className="mt-32 flex items-center gap-2.5 rounded-full border border-zinc-900 bg-zinc-950/50 px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 shadow-xl">
           <ShieldCheck size={12} className="text-indigo-500" />
           Verified by LaunchForge
        </div>

      </main>

      <footer className="mt-10 w-full border-t border-zinc-900 px-6 pb-20 pt-16 text-center">
        <p className="text-[11px] text-zinc-600">
          Powered by <Link href="/" className="font-bold text-zinc-400 transition-colors hover:text-white">LaunchForge</Link>
          <br />
          Built for teams who build remarkable products.
        </p>
      </footer>
    </div>
  );
}