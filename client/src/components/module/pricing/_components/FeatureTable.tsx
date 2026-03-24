"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { COMPARISON_FEATURES, PLANS } from "../_lib/pricing-data";
import { cn } from "@/src/lib/utils";

function Cell({ value, isFeatured }: { value: boolean | string; isFeatured?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full",
          isFeatured ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-800 text-muted-foreground"
        )}
      >
        <Check size={11} strokeWidth={2.5} />
      </span>
    ) : (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-muted-foreground/40">
        <Minus size={11} strokeWidth={2} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-xs font-medium",
        isFeatured ? "text-indigo-300" : "text-muted-foreground"
      )}
    >
      {value}
    </span>
  );
}

export function FeatureTable() {
  // Group features by category
  const categories = Array.from(
    new Set(COMPARISON_FEATURES.map((f) => f.category))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full overflow-hidden rounded-2xl border border-border/80"
    >
      {/* Table header */}
      <div className="grid grid-cols-[1fr_repeat(3,_minmax(0,_160px))] items-center border-b border-border/80 bg-card/60 px-6 py-4">
        {/* Empty feature label col */}
        <div />

        {/* Plan headers */}
        {PLANS.map((plan) => (
          <div key={plan.id} className="flex flex-col items-center gap-1.5 px-2">
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-widest",
                plan.featured ? "text-indigo-300" : "text-muted-foreground/80"
              )}
            >
              {plan.name}
            </span>
            {plan.featured && (
              <Badge className="border-indigo-500/30 bg-indigo-500/15 px-2 py-0 text-[9px] font-semibold text-indigo-400">
                Popular
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Category groups */}
      {categories.map((category, catIdx) => {
        const rows = COMPARISON_FEATURES.filter((f) => f.category === category);

        return (
          <div key={category}>
            {/* Category label row */}
            <div className="border-b border-border/40 bg-card/30 px-6 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {category}
              </span>
            </div>

            {/* Feature rows */}
            {rows.map((feature, rowIdx) => {
              const isLast =
                rowIdx === rows.length - 1 && catIdx === categories.length - 1;

              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: rowIdx * 0.03, duration: 0.3 }}
                  className={cn(
                    "grid grid-cols-[1fr_repeat(3,_minmax(0,_160px))] items-center px-6 py-3.5 transition-colors hover:bg-card/40",
                    !isLast && "border-b border-zinc-800/30"
                  )}
                >
                  {/* Feature label */}
                  <span className="text-sm text-muted-foreground">{feature.label}</span>

                  {/* Cells */}
                  {[
                    { value: feature.starter,  featured: false },
                    { value: feature.pro,      featured: true  },
                    { value: feature.growth,   featured: false },
                  ].map((cell, i) => (
                    <div key={i} className="flex items-center justify-center px-2">
                      <Cell value={cell.value} isFeatured={cell.featured} />
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </motion.div>
  );
}
