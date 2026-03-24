import { motion } from "framer-motion";
import { CheckCircle2, Link2 } from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { TierBadge } from "./TierBadge";
import { cn }        from "@/src/lib/utils";
import type { TopReferrer } from "../_types";

const RANK_STYLES: Record<number, { num: string; bar: string }> = {
  1: { num: "text-amber-400 font-black",  bar: "bg-amber-400"  },
  2: { num: "text-foreground/80 font-bold",    bar: "bg-zinc-500"   },
  3: { num: "text-orange-500 font-bold",  bar: "bg-orange-500" },
};
const DEFAULT_RANK = { num: "text-muted-foreground/60 font-medium", bar: "bg-indigo-500/60" };

const AVATAR_GRADIENTS = [
  "from-amber-500 to-orange-500",
  "from-zinc-500 to-zinc-600",
  "from-orange-600 to-red-600",
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-blue-600",
];

interface ReferrerRowProps {
  referrer:         TopReferrer;
  cardIndex:        number;
  rowIndex:         number;
  maxDirectReferrals: number;
}

export function ReferrerRow({
  referrer, cardIndex, rowIndex, maxDirectReferrals,
}: ReferrerRowProps) {
  const rankStyle  = RANK_STYLES[referrer.rank] ?? DEFAULT_RANK;
  const barWidth   = maxDirectReferrals > 0
    ? Math.round((referrer.directReferrals / maxDirectReferrals) * 100)
    : 0;
  const gradient   = AVATAR_GRADIENTS[rowIndex % AVATAR_GRADIENTS.length];
  const initials   = referrer.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: cardIndex * 0.06 + rowIndex * 0.05,
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/40"
    >
      {/* Rank number */}
      <span className={cn("w-5 shrink-0 text-center text-sm tabular-nums", rankStyle.num)}>
        {referrer.rank}
      </span>

      {/* Avatar */}
      <Avatar className="h-7 w-7 shrink-0 rounded-lg">
        <AvatarFallback
          className={cn(
            "rounded-lg bg-gradient-to-br text-[10px] font-bold text-white",
            gradient
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name + bar */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-medium text-foreground/80">
            {referrer.name}
          </span>
          {referrer.isConfirmed && (
            <CheckCircle2 size={11} className="shrink-0 text-emerald-500" />
          )}
          {referrer.tier === "champion" && (
            <TierBadge tier="champion" compact />
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{
              delay: cardIndex * 0.06 + rowIndex * 0.05 + 0.2,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn("h-full rounded-full", rankStyle.bar)}
          />
        </div>
      </div>

      {/* Direct referrals count */}
      <div className="flex shrink-0 flex-col items-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-default items-center gap-1">
              <Link2 size={10} className="text-muted-foreground/40" />
              <span className="text-xs font-bold tabular-nums text-foreground/80">
                {referrer.directReferrals}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80"
          >
            {referrer.directReferrals} direct · {referrer.chainReferrals} chain ·{" "}
            {referrer.sharePercent}% share
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}