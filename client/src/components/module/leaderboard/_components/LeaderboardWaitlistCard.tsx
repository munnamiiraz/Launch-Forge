"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Share2, ArrowUpRight, Globe, Lock,
  BarChart3, TrendingUp, Trophy, ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }    from "@/src/components/ui/badge";
import { Button }   from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  TooltipProvider,
} from "@/src/components/ui/tooltip";
import { cn }           from "@/src/lib/utils";
import { ReferrerRow }  from "./ReferrerRow";
import type { WaitlistLeaderboardCard } from "../_types";

const CARD_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
];

const TOP_ACCENT_LINES = [
  "via-indigo-500/50",
  "via-violet-500/50",
  "via-cyan-500/50",
  "via-emerald-500/50",
  "via-amber-500/50",
  "via-rose-500/50",
];

interface LeaderboardWaitlistCardProps {
  data:  WaitlistLeaderboardCard;
  index: number;
}

export function LeaderboardWaitlistCard({ data, index }: LeaderboardWaitlistCardProps) {
  const gradient   = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const accentLine = TOP_ACCENT_LINES[index % TOP_ACCENT_LINES.length];
  const viralScore = data.totalSubscribers > 0
    ? (data.totalReferrals / data.totalSubscribers).toFixed(1)
    : "0.0";

  const maxReferrals = data.topReferrers[0]?.directReferrals ?? 1;

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className={cn(
          "group relative flex flex-col overflow-hidden",
          "border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm",
          "transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-black/25",
        )}>
          {/* Top accent line */}
          <div className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
            accentLine
          )} />

          {/* Corner hover glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/6 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* ── Card header ─────────────────────────────────────── */}
          <CardHeader className="relative border-b border-zinc-800/60 px-5 py-4">
            <div className="flex items-start justify-between gap-3">

              {/* Identity */}
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0 rounded-xl">
                  <AvatarFallback
                    className={cn(
                      "rounded-xl bg-gradient-to-br text-xs font-bold text-white",
                      gradient
                    )}
                  >
                    {data.waitlistName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {data.waitlistName}
                  </p>
                  <p className="text-[11px] text-zinc-600">/{data.waitlistSlug}</p>
                </div>
              </div>

              {/* Status badge */}
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold",
                  data.isOpen
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-700/60 bg-zinc-800/40 text-zinc-500"
                )}
              >
                {data.isOpen ? <Globe size={8} /> : <Lock size={8} />}
                {data.isOpen ? "Open" : "Closed"}
              </Badge>
            </div>

            {/* Quick stat row */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <QuickStat
                icon={<Users size={11} className="text-indigo-400" />}
                value={data.totalSubscribers.toLocaleString()}
                label="Subscribers"
              />
              <QuickStat
                icon={<Share2 size={11} className="text-violet-400" />}
                value={data.totalReferrals.toLocaleString()}
                label="Referrals"
              />
              <QuickStat
                icon={<TrendingUp size={11} className="text-emerald-400" />}
                value={`${viralScore}×`}
                label="Viral score"
              />
            </div>
          </CardHeader>

          {/* ── Leaderboard entries ──────────────────────────────── */}
          <CardContent className="relative flex flex-1 flex-col gap-0 p-0">
            {/* Section label */}
            <div className="flex items-center justify-between border-b border-zinc-800/40 px-5 py-2.5">
              <div className="flex items-center gap-2">
                <Trophy size={12} className="text-amber-400" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Top referrers
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <span className="font-semibold text-zinc-400">
                  {data.activeReferrers}
                </span>
                active
              </div>
            </div>

            {data.topReferrers.length === 0 ? (
              /* Empty leaderboard state */
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Trophy size={24} className="text-zinc-800" />
                <p className="text-xs text-zinc-600">No referrals yet</p>
                <p className="text-[10px] text-zinc-700">
                  Share your waitlist to start building the leaderboard.
                </p>
              </div>
            ) : (
              <div className="flex flex-col px-2 py-2">
                {data.topReferrers.map((referrer, rowIdx) => (
                  <ReferrerRow
                    key={referrer.rank}
                    referrer={referrer}
                    cardIndex={index}
                    rowIndex={rowIdx}
                    maxDirectReferrals={maxReferrals}
                  />
                ))}
              </div>
            )}

            <Separator className="bg-zinc-800/60" />

            {/* ── Footer: stat pills + navigation CTA ─────────────── */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5">
              {/* Mini stat strip */}
              <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                <span className="flex items-center gap-1">
                  <BarChart3 size={10} className="text-indigo-400" />
                  <span className="text-zinc-400 font-semibold">
                    {data.avgReferrals.toFixed(1)}
                  </span>{" "}avg refs
                </span>
                <span className="h-3 w-px bg-zinc-800" />
                <span className="flex items-center gap-1">
                  <Trophy size={10} className="text-amber-400" />
                  <span className="text-zinc-400 font-semibold">
                    {data.topReferralCount}
                  </span>{" "}top
                </span>
              </div>

              {/* Navigation button */}
              <Link href={`/dashboard/leaderboard/${data.waitlistId}`}>
                <Button
                  size="sm"
                  className={cn(
                    "group/btn h-7 gap-1.5 rounded-lg px-3 text-xs font-medium",
                    "bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-200",
                    "relative overflow-hidden"
                  )}
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
                  View waitlist
                  <ArrowUpRight
                    size={12}
                    className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}

/* ── Small stat sub-component ───────────────────────────────────── */
function QuickStat({
  icon, value, label,
}: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-800/60 bg-zinc-900/50 px-2.5 py-2">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-sm font-bold tabular-nums text-zinc-200">{value}</span>
      </div>
      <span className="text-[9px] text-zinc-600">{label}</span>
    </div>
  );
}