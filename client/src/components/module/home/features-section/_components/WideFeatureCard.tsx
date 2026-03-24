"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import type { Feature } from "../_types";
import { ACCENT_MAP } from "../_lib/accent-map";
import { cn } from "@/src/lib/utils";

/* Mini leaderboard rows shown inside the card */
const MOCK_ROWS = [
  { rank: 1,  name: "Sarah K.",  refs: 12, width: "w-full"   },
  { rank: 2,  name: "Marcus T.", refs: 8,  width: "w-[67%]"  },
  { rank: 3,  name: "Priya M.",  refs: 5,  width: "w-[42%]"  },
];

const RANK_COLOURS = [
  "text-amber-400",
  "text-muted-foreground",
  "text-orange-700",
];

interface WideFeatureCardProps {
  feature: Feature;
  index: number;
}

export function WideFeatureCard({ feature, index }: WideFeatureCardProps) {
  const a = ACCENT_MAP[feature.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="md:col-span-2"
    >
      <Card
        className={cn(
          "group relative overflow-hidden border-border/80 bg-card/40 h-full",
          "backdrop-blur-sm transition-all duration-300",
          "hover:bg-card/60 hover:shadow-xl hover:shadow-black/20",
          a.border
        )}
      >
        <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.topLine)} />
        <div className={cn("pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100", a.glow)} />

        <CardContent className="relative grid gap-6 p-7 sm:grid-cols-2 sm:gap-8">
          {/* Left — text */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110", a.icon)}>
                {feature.icon}
              </div>
              {feature.tag && (
                <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest", a.tag)}>
                  {feature.tag}
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold tracking-tight text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground/80">{feature.description}</p>
            </div>

            {feature.bullets && (
              <ul className="flex flex-col gap-2">
                {feature.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", a.bullet)} />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right — mini leaderboard widget */}
          <div className="flex flex-col justify-center gap-3 rounded-xl border border-border/60 bg-background/50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Top referrers · Live
            </p>
            <div className="flex flex-col gap-3">
              {MOCK_ROWS.map((row, i) => (
                <motion.div
                  key={row.rank}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                  className="flex items-center gap-2.5"
                >
                  <span className={cn("w-4 text-center text-xs font-bold", RANK_COLOURS[i])}>
                    {row.rank}
                  </span>
                  <span className="w-16 shrink-0 truncate text-xs text-muted-foreground">
                    {row.name}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className={cn("absolute inset-y-0 left-0 rounded-full", row.width, a.bullet)}
                        style={{ width: undefined }}
                      />
                    </div>
                    <span className="w-10 text-right text-[10px] text-muted-foreground/60">
                      {row.refs} refs
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
