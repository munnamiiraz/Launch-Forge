"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, Share2, ExternalLink, ArrowRight,
  Trophy, TrendingUp, Globe, Lock, Zap,
} from "lucide-react";
import { Badge }   from "@/src/components/ui/badge";
import { Button }  from "@/src/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { cn }      from "@/src/lib/utils";
import type { PublicProduct } from "../_lib/data";

interface ProductCardProps {
  product: PublicProduct;
  index:   number;
  onJoin:  (p: PublicProduct) => void;
  onDetail:(p: PublicProduct) => void;
}

export function ProductCard({ product, index, onJoin, onDetail }: ProductCardProps) {
  const router = useRouter();
  const hasPrizes   = product.prizes.length > 0;
  const isTrending  = product.recentJoins >= 100;

  const handleClick = () => {
    router.push(`/explore/${product.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-[#0d0d0d] backdrop-blur-sm cursor-pointer",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40",
        hasPrizes
          ? "border-amber-500/20 hover:border-amber-500/35"
          : "border-zinc-800/70 hover:border-zinc-700/60",
      )}>
        {/* Top gradient accent */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-px",
          hasPrizes
            ? "bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
            : "bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent",
          "transition-all duration-300",
          "group-hover:via-indigo-500/40",
        )} />

        {/* Subtle hover glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

        {/* ── Card body ───────────────────────────────── */}
        <div 
          className="relative flex flex-1 flex-col gap-4 p-5"
          onClick={handleClick}
        >

          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {/* Logo */}
              <Avatar className="h-11 w-11 shrink-0 rounded-xl">
                {product.logoUrl ? (
                  <AvatarImage 
                    src={product.logoUrl} 
                    alt={product.name} 
                    className="object-cover rounded-xl"
                  />
                ) : (
                  <AvatarFallback className={cn(
                    "rounded-xl bg-gradient-to-br text-sm font-black text-white",
                    product.logoGradient,
                  )}>
                    {product.logoInitials}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    {product.name}
                  </h3>
                  {isTrending && (
                    <Badge className="border-orange-500/25 bg-orange-500/10 px-1.5 py-0 text-[9px] text-orange-400">
                      🔥 Trending
                    </Badge>
                  )}
                  {hasPrizes && (
                    <Badge className="border-amber-500/25 bg-amber-500/10 px-1.5 py-0 text-[9px] text-amber-400">
                      <Trophy size={8} className="mr-0.5" />Prizes
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/60">
                  {product.tagline}
                </p>
              </div>
            </div>

            {/* Open / Closed */}
            <Badge className={cn(
              "shrink-0 gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold",
              product.isOpen
                ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
                : "border-zinc-700/60 bg-zinc-800/30 text-muted-foreground/60",
            )}>
              {product.isOpen ? <Globe size={8} /> : <Lock size={8} />}
              {product.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>

          {/* Category + tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className="border-indigo-500/20 bg-indigo-500/8 px-2 py-0.5 text-[10px] text-indigo-400">
              {product.category}
            </Badge>
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} className="border-zinc-800 bg-card/60 px-2 py-0.5 text-[10px] text-muted-foreground/60">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
            {product.description}
          </p>

          {/* Prizes preview (compact) */}
          {hasPrizes && (
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2">
              <Trophy size={11} className="shrink-0 text-amber-400" />
              <p className="truncate text-[11px] text-amber-300/80">
                {product.prizes[0].emoji} {product.prizes[0].title}
                {product.prizes.length > 1 && ` + ${product.prizes.length - 1} more prizes`}
              </p>
            </div>
          )}

          {/* Activity strip */}
          {product.recentJoins > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="font-semibold text-emerald-400">{product.recentJoins}</span>
              <span>joined in the last 24h</span>
            </div>
          )}
        </div>

        {/* ── Footer stats + actions ───────────────────── */}
        <div className="border-t border-border/50 bg-zinc-900/20 px-5 py-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Stats */}
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <Users  size={10} className="text-muted-foreground/40" />
                <span className="font-semibold tabular-nums text-muted-foreground">
                  {product.totalSubscribers >= 1000
                    ? `${(product.totalSubscribers / 1000).toFixed(1)}k`
                    : product.totalSubscribers.toLocaleString()}
                </span>
              </span>
              <span className="h-3 w-px bg-zinc-800" />
              <span className="flex items-center gap-1">
                <Zap size={10} className="text-amber-600" />
                <span className="font-semibold text-muted-foreground">{product.viralScore}×</span>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onDetail(product); }}
                className="h-7 gap-1 px-2.5 text-xs text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground/80"
              >
                Details
              </Button>

              {product.isOpen ? (
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onJoin(product); }}
                  className="group/btn relative h-7 overflow-hidden bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
                  Join
                  <ArrowRight size={11} className="transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                </Button>
              ) : (
                <span className="h-7 rounded-lg border border-zinc-800 px-3 flex items-center text-xs text-muted-foreground/40">
                  Closed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}