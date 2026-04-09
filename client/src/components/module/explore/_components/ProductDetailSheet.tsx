"use client";

import { motion } from "framer-motion";
import {
  X, ExternalLink, Users, Share2, Trophy,
  TrendingUp, Globe, Lock, Calendar, Tag,
  Zap, ArrowRight,
} from "lucide-react";

import {
  Sheet, SheetContent,
} from "@/src/components/ui/sheet";
import { Button }    from "@/src/components/ui/button";
import { Badge }     from "@/src/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import { cn }        from "@/src/lib/utils";
import type { PublicProduct } from "../_lib/data";

interface ProductDetailSheetProps {
  product:  PublicProduct | null;
  open:     boolean;
  onClose:  () => void;
  onJoin:   (product: PublicProduct) => void;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

export function ProductDetailSheet({ product, open, onClose, onJoin }: ProductDetailSheetProps) {
  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden border-border bg-background p-0 sm:max-w-[520px]"
      >
        {/* Gradient top accent */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent",
          "via-indigo-500/50",
        )} />

        {/* Ambient glow blob */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/6 blur-3xl" />

        {/* Sticky header */}
        <div className="relative border-b border-border/60 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <Avatar className="h-12 w-12 shrink-0 rounded-xl">
                {product.logoUrl ? (
                  <AvatarImage 
                    src={product.logoUrl} 
                    alt={product.name} 
                    className="object-cover rounded-xl"
                  />
                ) : (
                  <AvatarFallback className={cn(
                    "rounded-xl bg-linear-to-br text-base font-black text-white",
                    product.logoGradient,
                  )}>
                    {product.logoInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black tracking-tight text-foreground">
                    {product.name}
                  </h2>
                  <Badge className={cn(
                    "gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0",
                    product.isOpen
                      ? "border-emerald-500/20 dark:border-emerald-500/25 bg-emerald-500/8 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border bg-muted/40 text-muted-foreground/80",
                  )}>
                    {product.isOpen ? <><Globe size={9} />Open</> : <><Lock size={9} />Closed</>}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground/80 leading-snug">{product.tagline}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Category + tags */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge className="border-indigo-500/20 dark:border-indigo-500/25 bg-indigo-500/8 dark:bg-indigo-500/10 text-[10px] text-indigo-700 dark:text-indigo-400">
              {product.category}
            </Badge>
            {product.tags.map((tag) => (
              <Badge key={tag} className="border-border bg-card/60 text-[10px] text-muted-foreground/70">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative flex flex-col gap-6 px-6 py-5">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatBox
                icon={<Users size={14} className="text-indigo-600 dark:text-indigo-400" />}
                label="Joined"
                value={product.totalSubscribers.toLocaleString()}
              />
              <StatBox
                icon={<Share2 size={14} className="text-violet-600 dark:text-violet-400" />}
                label="Referrals"
                value={product.referralCount.toLocaleString()}
              />
              <StatBox
                icon={<Zap size={14} className="text-amber-600 dark:text-amber-400" />}
                label="Viral score"
                value={`${product.viralScore}×`}
              />
            </div>

            {/* Today's activity */}
            {product.recentJoins > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/6 px-4 py-2.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  <span className="font-bold">{product.recentJoins}</span> people joined in the last 24 hours
                </p>
              </div>
            )}

            {/* Description */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">About</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            {/* Prizes */}
            {product.prizes.length > 0 && (
              <>
                <Separator className="bg-muted/60" />
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    🏆 Prize pool
                  </p>
                  <div className="flex flex-col gap-2">
                    {product.prizes.map((prize, i) => (
                      <motion.div
                        key={prize.rank}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
                          i === 0
                            ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/8 shadow-sm shadow-amber-500/5"
                            : "border-border bg-card/50",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{prize.emoji}</span>
                          <div>
                            <p className={cn("text-xs font-semibold", i === 0 ? "text-amber-700 dark:text-amber-200" : "text-foreground")}>
                              {prize.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70">{prize.rank} place</p>
                          </div>
                        </div>
                        {prize.value && (
                          <span className={cn(
                            "text-sm font-black tabular-nums",
                            i === 0 ? "text-amber-600 dark:text-amber-300" : "text-foreground/90",
                          )}>
                            {prize.value}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Top referrers */}
            {product.topReferrers.length > 0 && (
              <>
                <Separator className="bg-muted/60" />
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Top referrers
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {product.topReferrers.map((ref, i) => (
                      <div key={ref.rank} className="flex items-center gap-3">
                        <span className="w-5 text-center text-sm">{RANK_MEDAL[i] ?? `#${ref.rank}`}</span>
                        <div className="flex-1">
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(ref.referralCount / product.topReferrers[0].referralCount) * 100}%` }}
                              transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full rounded-full bg-indigo-500/70"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground/80">{ref.maskedName}</p>
                        <p className="w-10 text-right text-xs font-bold tabular-nums text-foreground/90">{ref.referralCount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator className="bg-muted/60" />
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { icon: <Calendar size={11} />, label: "Listed", value: fmtDate(product.createdAt) },
                { icon: <Users    size={11} />, label: "By",      value: product.ownerName },
                ...(product.expiresAt ? [{ icon: <Calendar size={11} />, label: "Closes", value: fmtDate(product.expiresAt) }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-1.5 text-muted-foreground/60">
                  {row.icon}
                  <span>{row.label}:</span>
                  <span className="text-muted-foreground truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky footer CTA */}
        <div className="border-t border-border bg-background px-6 py-5">
          <div className="flex gap-3">
            {product.websiteUrl && (
              <Button
                asChild
                variant="outline"
                className="gap-2 border-border bg-transparent text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              >
                <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={13} />
                  Product page
                </a>
              </Button>
            )}
            {product.isOpen ? (
              <Button
                onClick={() => { onClose(); onJoin(product); }}
                className="group relative flex-1 overflow-hidden bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/10"
              >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
                <ArrowRight size={15} />
                Join waitlist
              </Button>
            ) : (
              <div className="flex-1 rounded-xl border border-border bg-muted/40 py-2.5 text-center text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-tight">
                Waitlist closed
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5">{icon}<span className="text-[10px] text-muted-foreground/60">{label}</span></div>
      <p className="text-base font-black tabular-nums text-foreground/90">{value}</p>
    </div>
  );
}