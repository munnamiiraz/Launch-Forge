import { cn } from "@/src/lib/utils";
import type { LeaderboardTier } from "../_types";

const TIER_CONFIG: Record<
  LeaderboardTier,
  { label: string; classes: string; emoji: string }
> = {
  champion: {
    label:   "Champion",
    emoji:   "🥇",
    classes: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  },
  top10: {
    label:   "Top 10",
    emoji:   "🥈",
    classes: "border-zinc-400/30 bg-zinc-400/8 text-foreground/80",
  },
  top25: {
    label:   "Top 25",
    emoji:   "🥉",
    classes: "border-orange-600/30 bg-orange-600/8 text-orange-400",
  },
  rising: {
    label:   "Rising",
    emoji:   "✨",
    classes: "border-indigo-500/25 bg-indigo-500/8 text-indigo-400",
  },
};

interface TierBadgeProps {
  tier:  LeaderboardTier;
  /** Show only emoji, no text label */
  compact?: boolean;
}

export function TierBadge({ tier, compact = false }: TierBadgeProps) {
  const cfg = TIER_CONFIG[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        cfg.classes
      )}
    >
      {cfg.emoji}
      {!compact && cfg.label}
    </span>
  );
}