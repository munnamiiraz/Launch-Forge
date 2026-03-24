"use client";

import { motion } from "framer-motion";
import { Trophy, Clock, Star } from "lucide-react";
import { Badge }  from "@/src/components/ui/badge";
import { cn }     from "@/src/lib/utils";
import { PRIZE_TYPE_META, CURRENCIES, buildRankLabel } from "@/src/components/module/prizes/_types";
import type { Prize, CreatePrizeForm } from "@/src/components/module/prizes/_types";

interface PrizePreviewCardProps {
  form?:    CreatePrizeForm;
  prize?:   Prize;
  compact?: boolean;
}

export function PrizePreviewCard({ form, prize, compact }: PrizePreviewCardProps) {
  /* Resolve display values from either form or prize */
  const title       = form?.title        || prize?.title        || "Prize title";
  const description = form?.description  || prize?.description  || null;
  const prizeType   = form?.prizeType    || prize?.prizeType    || "CASH";
  const rankFrom    = parseInt(form?.rankFrom ?? "") || prize?.rankFrom || 1;
  const rankTo      = parseInt(form?.rankTo   ?? "") || prize?.rankTo   || 1;
  const value       = form?.value ? parseFloat(form.value) : (prize?.value ?? null);
  const currency    = form?.currency     || prize?.currency     || "USD";
  const expiresAt   = form?.expiresAt    || (prize?.expiresAt ? new Date(prize.expiresAt).toISOString().slice(0, 16) : "");

  const meta       = PRIZE_TYPE_META[prizeType];
  const sym        = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";
  const rankLabel  = buildRankLabel(rankFrom, rankTo);
  const hasExpiry  = !!expiresAt;
  const expired    = hasExpiry && new Date(expiresAt) < new Date();

  const isTop1 = rankFrom === 1 && rankTo === 1;
  const isTop3 = rankFrom === 1 && rankTo <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border",
        "bg-card/60 backdrop-blur-sm",
        isTop1
          ? "border-amber-500/40 shadow-lg shadow-amber-500/10"
          : "border-border/80",
        compact ? "text-[11px]" : "",
      )}
    >
      {/* Top gradient bar */}
      <div
        className={cn(
          "h-1 w-full",
          isTop1
            ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400"
            : "bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent",
        )}
      />

      {/* Rank badge */}
      <div className={cn("flex items-start justify-between gap-2 px-4", compact ? "pt-3" : "pt-4")}>
        <div className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-bold",
          compact ? "text-[10px]" : "text-xs",
          isTop1
            ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
            : "border-zinc-700/60 bg-muted/40 text-muted-foreground",
        )}>
          {isTop1 && <Trophy size={compact ? 9 : 11} className="text-amber-400" />}
          {rankLabel}
        </div>

        {/* Type badge */}
        <span className={cn(
          "rounded-full border px-2 py-0.5 font-semibold",
          compact ? "text-[9px]" : "text-[10px]",
          meta.accent,
        )}>
          {meta.emoji} {meta.label}
        </span>
      </div>

      {/* Content */}
      <div className={cn("flex flex-col gap-2 px-4", compact ? "pb-3 pt-2" : "pb-4 pt-3")}>
        {/* Emoji + value */}
        {value && (
          <p className={cn(
            "font-black tracking-tight tabular-nums",
            compact ? "text-xl" : "text-3xl",
            isTop1 ? "text-amber-300" : "text-foreground",
          )}>
            {sym}{value.toLocaleString()}
          </p>
        )}

        <p className={cn("font-semibold text-foreground/90 leading-tight", compact ? "text-xs" : "text-sm")}>
          {title || <span className="text-muted-foreground/60">Prize title…</span>}
        </p>

        {description && !compact && (
          <p className="text-xs leading-relaxed text-muted-foreground/80">{description}</p>
        )}

        {/* Expiry */}
        {hasExpiry && (
          <div className={cn(
            "flex items-center gap-1",
            compact ? "text-[9px]" : "text-[10px]",
            expired ? "text-red-400" : "text-muted-foreground/60",
          )}>
            <Clock size={compact ? 9 : 10} />
            {expired
              ? "Expired"
              : `Ends ${new Date(expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            }
          </div>
        )}

        {/* Motivational chip for top prize */}
        {isTop1 && !compact && (
          <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/8 px-2.5 py-1.5">
            <Star size={10} className="text-amber-400" />
            <span className="text-[10px] font-medium text-amber-400">
              Refer the most people to claim this prize
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}