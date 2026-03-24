"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import type { Feature } from "../_types";
import { ACCENT_MAP } from "../_lib/accent-map";
import { cn } from "@/src/lib/utils";

interface DefaultFeatureCardProps {
  feature: Feature;
  index: number;
}

export function DefaultFeatureCard({ feature, index }: DefaultFeatureCardProps) {
  const a = ACCENT_MAP[feature.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Card
        className={cn(
          "group relative h-full cursor-default overflow-hidden border-border/80 bg-card/40",
          "backdrop-blur-sm transition-all duration-300",
          "hover:bg-card/60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20",
          a.border
        )}
      >
        {/* Top accent line */}
        <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.topLine)} />

        {/* Corner glow */}
        <div className={cn("pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100", a.glow)} />

        {/* Arrow — appears on hover */}
        <div className="absolute right-4 top-4 text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
          <ArrowUpRight size={14} />
        </div>

        <CardContent className="relative flex h-full flex-col gap-5 p-6">
          {/* Icon + tag */}
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border",
                "transition-all duration-300 group-hover:scale-110",
                a.icon
              )}
            >
              {feature.icon}
            </div>

            {feature.tag && (
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
                  a.tag
                )}
              >
                {feature.tag}
              </Badge>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-white">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground/80 line-clamp-3">
              {feature.description}
            </p>
          </div>

          {/* Bottom accent bar */}
          <div className="mt-auto flex items-center gap-2 pt-1">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "24px" }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 + 0.4, duration: 0.4 }}
              className={cn("h-px rounded-full", a.bullet)}
            />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/80">
              {feature.title.split(" ")[0]}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
