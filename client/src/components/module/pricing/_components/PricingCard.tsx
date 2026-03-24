"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import type { PricingPlan, BillingCycle } from "../_types";
import { cn } from "@/src/lib/utils";

interface PricingCardProps {
  plan: PricingPlan;
  cycle: BillingCycle;
  index: number;
}

export function PricingCard({ plan, cycle, index }: PricingCardProps) {
  const price = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const isYearly = cycle === "yearly";
  const isFree = price === 0;
  const isFeatured = plan.featured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        delay: index * 0.1,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "relative flex flex-col h-full",
        isFeatured && "md:scale-[1.04] md:z-10"
      )}
    >
      {/* Featured outer glow */}
      {isFeatured && (
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/40 via-indigo-500/20 to-violet-500/20 blur-sm" />
      )}

      <Card
        className={cn(
          "group relative flex h-full flex-col overflow-hidden transition-all duration-300",
          isFeatured
            ? "border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 via-zinc-900/80 to-zinc-900/60 shadow-2xl shadow-indigo-500/10 hover:border-indigo-500/70 hover:shadow-indigo-500/15"
            : "border-border/80 bg-card/40 hover:border-zinc-700/70 hover:bg-card/60 hover:shadow-xl hover:shadow-black/20"
        )}
      >
        {/* Top accent line */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
            isFeatured ? "via-indigo-400/80" : "via-border group-hover:via-zinc-600/50"
          )}
        />

        {/* Hover glow — non-featured only */}
        {!isFeatured && (
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/5 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}

        <CardHeader className="relative flex flex-col gap-4 p-7 pb-5">
          {/* Badge row */}
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {plan.name}
            </span>

            {plan.badge && (
              <Badge className="gap-1 border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                <Sparkles size={9} />
                {plan.badge}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-1.5">
            {!isFree && (
              <span className="text-sm font-medium text-muted-foreground/80 mb-1.5">$</span>
            )}
            <AnimatePresence mode="wait">
              <motion.span
                key={`${plan.id}-${price}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "text-5xl font-black tracking-tighter",
                  isFeatured ? "text-white" : "text-foreground"
                )}
              >
                {isFree ? "Free" : price}
              </motion.span>
            </AnimatePresence>
            {!isFree && (
              <span className="mb-1.5 text-sm text-muted-foreground/80">
                / {isYearly ? "mo, billed yearly" : "month"}
              </span>
            )}
          </div>

          {/* Tagline */}
          <p className="text-sm leading-relaxed text-muted-foreground/80">{plan.tagline}</p>

          {/* Yearly savings callout */}
          {isYearly && !isFree && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.25 }}
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-3 py-2"
            >
              <p className="text-xs text-emerald-400">
                Billed as <span className="font-semibold">${price * 12}/year</span>
                {" — "}
                saves ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/yr
              </p>
            </motion.div>
          )}
        </CardHeader>

        <Separator className="mx-7 w-auto bg-muted/60" />

        <CardContent className="relative flex flex-1 flex-col gap-3 p-7 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
            What's included
          </p>

          <ul className="flex flex-col gap-2.5">
            {plan.features.map((feature, i) => (
              <motion.li
                key={feature.label}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 + i * 0.04, duration: 0.3 }}
                className="flex items-start gap-2.5"
              >
                {feature.included ? (
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                      isFeatured
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "bg-zinc-800 text-muted-foreground"
                    )}
                  >
                    <Check size={10} strokeWidth={2.5} />
                  </span>
                ) : (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-muted-foreground/40">
                    <Minus size={10} strokeWidth={2} />
                  </span>
                )}
                <span
                  className={cn(
                    "text-sm leading-relaxed",
                    feature.included
                      ? isFeatured ? "text-foreground/80" : "text-muted-foreground"
                      : "text-muted-foreground/40"
                  )}
                >
                  {feature.label}
                </span>
              </motion.li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="relative p-7 pt-3">
          <Button
            asChild
            className={cn(
              "group/btn relative w-full overflow-hidden font-semibold transition-all duration-200",
              isFeatured
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "border-zinc-600 bg-zinc-800 text-foreground hover:border-zinc-500 hover:bg-zinc-700"
            )}
            variant={isFeatured ? "default" : "outline"}
            size="lg"
          >
            <Link href={plan.ctaHref}>
              {isFeatured && (
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
              )}
              {isFeatured ? <Zap size={14} className="text-indigo-300" /> : null}
              {plan.cta}
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
              />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
