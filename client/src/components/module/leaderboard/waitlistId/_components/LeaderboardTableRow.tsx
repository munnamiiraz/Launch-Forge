"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2, Link2, GitBranch, Share2,
  ChevronDown, ChevronUp, Mail, Copy,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge }  from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { TierBadge } from "../../_components/TierBadge";
import { cn }        from "@/src/lib/utils";
import type { LeaderboardEntry } from "../_types";

const RANK_STYLES: Record<number, { num: string; dot: string }> = {
  1: { num: "text-amber-400 font-black text-base",  dot: "bg-amber-400"  },
  2: { num: "text-zinc-300 font-bold",              dot: "bg-zinc-500"   },
  3: { num: "text-orange-500 font-bold",            dot: "bg-orange-500" },
};
const DEFAULT_RANK = { num: "text-zinc-600 font-medium text-sm", dot: "bg-indigo-500/60" };

const AVATAR_GRADIENTS = [
  "from-amber-500 to-orange-500",
  "from-zinc-500 to-zinc-600",
  "from-orange-600 to-red-600",
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
];

interface LeaderboardTableRowProps {
  entry:           LeaderboardEntry;
  index:           number;
  maxReferrals:    number;
  isLast:          boolean;
}

export function LeaderboardTableRow({
  entry, index, maxReferrals, isLast,
}: LeaderboardTableRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied,   setCopied]   = useState(false);

  const rankStyle = RANK_STYLES[entry.rank] ?? DEFAULT_RANK;
  const gradient  = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  const initials  = entry.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const barWidth  = maxReferrals > 0
    ? Math.round((entry.directReferrals / maxReferrals) * 100)
    : 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(entry.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Main row */}
      <div
        className={cn(
          "group grid items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-900/50",
          "grid-cols-[36px_1fr_auto_auto_auto_auto_auto]",
          !isLast && !expanded && "border-b border-zinc-800/40",
        )}
      >
        {/* Rank */}
        <span className={cn("text-center tabular-nums", rankStyle.num)}>
          {entry.rank}
        </span>

        {/* Avatar + name */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            <Avatar className="h-8 w-8 rounded-xl">
              <AvatarFallback
                className={cn("rounded-xl bg-gradient-to-br text-[11px] font-bold text-white", gradient)}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Rank dot */}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950",
                rankStyle.dot,
              )}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-medium text-zinc-200">
                {entry.name}
              </p>
              {entry.isConfirmed && (
                <CheckCircle2 size={12} className="shrink-0 text-emerald-500" />
              )}
            </div>
            <p className="truncate text-[11px] text-zinc-600">{entry.email}</p>
          </div>
        </div>

        {/* Tier badge */}
        <div className="hidden sm:block">
          <TierBadge tier={entry.tier} />
        </div>

        {/* Direct referrals + bar */}
        <div className="hidden w-32 flex-col gap-1 md:flex">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 tabular-nums">
              {entry.directReferrals}
            </span>
            <span className="text-[10px] text-zinc-600">{entry.sharePercent}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ delay: index * 0.04 + 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={cn("h-full rounded-full", rankStyle.dot)}
            />
          </div>
        </div>

        {/* Chain refs */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="hidden cursor-default items-center gap-1 lg:flex">
              <GitBranch size={11} className="text-zinc-700" />
              <span className="text-xs font-semibold tabular-nums text-zinc-400">
                {entry.chainReferrals}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
            {entry.chainReferrals} total in chain (up to 4 hops deep)
          </TooltipContent>
        </Tooltip>

        {/* Queue position */}
        <div className="hidden items-center gap-1 xl:flex">
          <span className="text-[10px] text-zinc-700">#</span>
          <span className="text-xs font-semibold tabular-nums text-zinc-500">
            {entry.queuePosition}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyLink}
                className="h-7 w-7 rounded-md text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800/60 hover:text-zinc-300"
              >
                {copied
                  ? <CheckCircle2 size={12} className="text-emerald-400" />
                  : <Copy         size={12} />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
              {copied ? "Copied!" : "Copy referral link"}
            </TooltipContent>
          </Tooltip>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((v) => !v)}
            className="h-7 w-7 rounded-md text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800/60 hover:text-zinc-300"
          >
            {expanded
              ? <ChevronUp   size={13} />
              : <ChevronDown size={13} />
            }
          </Button>
        </div>
      </div>

      {/* Expanded detail row */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "overflow-hidden border-t border-zinc-800/40 bg-zinc-900/20 px-5 py-4",
            !isLast && "border-b border-zinc-800/40"
          )}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Referral link */}
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Referral link
              </p>
              <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5">
                <Link2 size={11} className="shrink-0 text-indigo-400" />
                <span className="flex-1 truncate font-mono text-[11px] text-zinc-400">
                  launchforge.app/ref/{entry.referralCode}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <Copy size={11} />
                </button>
              </div>
            </div>

            {/* Referred by */}
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Referred by
              </p>
              {entry.referredBy ? (
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5">
                  <Avatar className="h-5 w-5 shrink-0 rounded-md">
                    <AvatarFallback className="rounded-md bg-indigo-500/20 text-[9px] font-bold text-indigo-400">
                      {entry.referredBy.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs text-zinc-300">{entry.referredBy.name}</span>
                  {entry.referredBy.rank && (
                    <Badge className="ml-auto shrink-0 border-zinc-700/60 bg-zinc-800/40 px-1.5 py-0 text-[9px] text-zinc-500">
                      #{entry.referredBy.rank}
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-700">Direct signup</p>
              )}
            </div>

            {/* Referral preview chain */}
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Recent recruits
              </p>
              {entry.referralPreview.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {entry.referralPreview.map((p) => (
                    <div key={p.id} className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Share2 size={10} className="text-indigo-400/60" />
                      <span className="truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-700">No recruits yet</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}