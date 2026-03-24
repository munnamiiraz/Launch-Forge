"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Zap, ArrowRight, Loader2, Star,
} from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { Badge }   from "@/src/components/ui/badge";
import { Button }  from "@/src/components/ui/button";
import { Switch }  from "@/src/components/ui/switch";
import { Separator } from "@/src/components/ui/separator";
import { cn }      from "@/src/lib/utils";
import { PLANS }   from "@/src/components/module/billing/_lib/data";
import { createCheckoutAction } from "@/src/services/billing/billing.actions";
import type { PlanTier, BillingMode } from "@/src/components/module/billing/_types";

interface PlanCardsProps {
  currentPlan: PlanTier;
}

export function PlanCards({ currentPlan }: PlanCardsProps) {
  const [yearly,       setYearly]    = useState(false);
  const [loadingTier,  setLoading]   = useState<PlanTier | null>(null);
  const [isPending,    startTx]      = useTransition();

  const mode: BillingMode = yearly ? "YEARLY" : "MONTHLY";

  const handleSelect = (tier: PlanTier) => {
    if (tier === "FREE" || tier === currentPlan) return;
    setLoading(tier);
    startTx(async () => {
      const res = await createCheckoutAction(tier, mode);
      if (res.success && res.url) window.location.href = res.url;
      setLoading(null);
    });
  };

  return (
    <div id="plans" className="flex flex-col gap-6">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground/90">Plans</h3>
          <p className="text-xs text-muted-foreground/60">
            {currentPlan === "FREE"
              ? "Upgrade to unlock more waitlists, subscribers, and features."
              : "Switch plans or change billing cycle at any time."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/40 px-3.5 py-2">
          <span className={cn("text-xs font-medium", !yearly ? "text-foreground/90" : "text-muted-foreground/60")}>
            Monthly
          </span>
          <Switch
            checked={yearly}
            onCheckedChange={setYearly}
            className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-zinc-700"
          />
          <span className={cn("text-xs font-medium", yearly ? "text-foreground/90" : "text-muted-foreground/60")}>
            Yearly
          </span>
          <AnimatePresence>
            {yearly && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
              >
                <Badge className="border-emerald-500/25 bg-emerald-500/10 px-2 py-0 text-[9px] text-emerald-400">
                  Save 20%
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Plan grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan, i) => {
          const isCurrent = plan.tier === currentPlan;
          const isPopular = plan.tier === "PRO";
          const isPro     = plan.tier === "PRO";
          const isGrowth  = plan.tier === "GROWTH";
          const isLoading = loadingTier === plan.tier && isPending;
          const price     = yearly ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
              className={cn(isPopular && "relative")}
            >
              {/* Popular pill */}
              {isPopular && (
                <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
                  <span className="flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/20 px-3 py-0.5 text-[10px] font-bold text-indigo-300">
                    <Star size={9} />Most popular
                  </span>
                </div>
              )}

              <Card className={cn(
                "relative overflow-hidden transition-all duration-300",
                "flex flex-col h-full",
                isCurrent
                  ? isPro    ? "border-indigo-500/50 shadow-lg shadow-indigo-500/8"
                  : isGrowth ? "border-violet-500/50 shadow-lg shadow-violet-500/8"
                             : "border-zinc-700/60"
                  : isPopular  ? "border-indigo-500/30 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5"
                  : isGrowth   ? "border-violet-500/20 hover:border-violet-500/40"
                               : "border-border/80 hover:border-zinc-700/60",
                "bg-card/40",
                isPopular && "mt-3",
              )}>
                {/* Top accent line */}
                <div className={cn(
                  "h-0.5 w-full",
                  isPro    ? "bg-gradient-to-r from-transparent via-indigo-500 to-transparent" :
                  isGrowth ? "bg-gradient-to-r from-transparent via-violet-500 to-transparent" :
                             "bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent",
                )} />

                <CardContent className="flex flex-1 flex-col p-5">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-sm font-bold",
                        isPro    ? "text-indigo-300" :
                        isGrowth ? "text-violet-300" :
                                   "text-muted-foreground",
                      )}>
                        {plan.name}
                      </p>
                      {isCurrent && (
                        <Badge className={cn(
                          "rounded-full px-2 py-0 text-[9px] font-semibold",
                          isPro    ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-400" :
                          isGrowth ? "border-violet-500/30 bg-violet-500/15 text-violet-400" :
                                     "border-zinc-700 bg-zinc-800 text-muted-foreground/80",
                        )}>
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/60">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-5 flex items-baseline gap-1.5">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${plan.tier}-${yearly}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "text-3xl font-black tracking-tight tabular-nums",
                          isPro    ? "text-indigo-300" :
                          isGrowth ? "text-violet-300" :
                                     "text-muted-foreground",
                        )}
                      >
                        {price === 0 ? "Free" : `$${price}`}
                      </motion.span>
                    </AnimatePresence>
                    {price > 0 && (
                      <span className="text-xs text-muted-foreground/60">
                        /mo{yearly && <span className="text-[10px]"> · billed yearly</span>}
                      </span>
                    )}
                  </div>

                  {/* Feature list */}
                  <div className="mb-5 flex flex-1 flex-col gap-2">
                    {plan.features.map((f) => {
                      const included = f.included !== false;
                      return (
                        <div
                          key={f.label}
                          className={cn(
                            "flex items-start gap-2 text-xs",
                            included ? "text-muted-foreground" : "text-muted-foreground/40",
                          )}
                        >
                          {included
                            ? <Check size={12} className={cn("mt-0.5 shrink-0", f.highlight ? "text-indigo-400" : "text-emerald-500")} />
                            : <X     size={12} className="mt-0.5 shrink-0 text-zinc-800" />
                          }
                          <span className={cn(
                            "leading-tight",
                            f.highlight && included ? "font-medium text-foreground/80" : "",
                          )}>
                            {typeof f.included === "string" ? f.included : f.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={() => handleSelect(plan.tier)}
                    disabled={isCurrent || plan.tier === "FREE" || isLoading}
                    className={cn(
                      "w-full gap-2 font-semibold transition-all duration-200",
                      isCurrent
                        ? "border border-zinc-700 bg-transparent text-muted-foreground/60 cursor-default"
                        : plan.tier === "FREE"
                          ? "border border-zinc-700 bg-transparent text-muted-foreground/60 cursor-default"
                          : isPro
                            ? "bg-indigo-600 text-white hover:bg-indigo-500"
                            : "bg-violet-600 text-white hover:bg-violet-500",
                    )}
                  >
                    {isLoading ? (
                      <><Loader2 size={14} className="animate-spin" />Redirecting…</>
                    ) : isCurrent ? (
                      "Current plan"
                    ) : plan.tier === "FREE" ? (
                      "Free forever"
                    ) : (
                      <>
                        {currentPlan === "FREE" ? "Upgrade" : "Switch"} to {plan.name}
                        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}