"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import type { Feature } from "../_types";
import { ACCENT_MAP } from "../_lib/accent-map";
import { cn } from "@/src/lib/utils";

interface HeroFeatureCardProps {
  feature: Feature;
  index: number;
}

export function HeroFeatureCard({ feature, index }: HeroFeatureCardProps) {
  const a = ACCENT_MAP[feature.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden border-zinc-800/80 bg-zinc-900/40",
          "backdrop-blur-sm transition-all duration-300",
          "hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-black/30",
          a.border
        )}
      >
        {/* Top gradient accent line */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
            a.topLine
          )}
        />

        {/* Large ambient glow — bottom right */}
        <div
          className={cn(
            "pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full blur-3xl",
            "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            a.glow
          )}
        />

        {/* Decorative grid overlay inside card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <CardContent className="relative grid gap-8 p-8 md:grid-cols-2 md:gap-12">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Icon + tag */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border",
                  "transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                  a.icon
                )}
              >
                {feature.icon}
              </div>
              {feature.tag && (
                <Badge
                  variant="outline"
                  className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest", a.tag)}
                >
                  {feature.tag}
                </Badge>
              )}
            </div>

            {/* Title + description */}
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold tracking-tight text-zinc-100">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {feature.description}
              </p>
            </div>

            {/* Bullet list */}
            {feature.bullets && (
              <ul className="flex flex-col gap-2.5">
                {feature.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        a.icon
                      )}
                    >
                      <Check size={10} strokeWidth={3} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right column — metric + mini visual */}
          <div className="flex flex-col items-center justify-center gap-6">
            {feature.metric && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    "text-7xl font-black tracking-tighter",
                    a.metricValue
                  )}
                >
                  {feature.metric.value}
                </span>
                <span className="text-sm font-medium text-zinc-500">
                  {feature.metric.label}
                </span>
              </motion.div>
            )}

            <Separator className="w-24 bg-zinc-800/60" />

            {/* Mini viral loop diagram */}
            <ViralLoopDiagram accent={feature.accent} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Inline mini-illustration of the viral loop ─────────────────── */
function ViralLoopDiagram({ accent }: { accent: Feature["accent"] }) {
  const a = ACCENT_MAP[accent];

  const nodes = [
    { label: "You",    delay: 0 },
    { label: "Friend", delay: 0.15 },
    { label: "Friend", delay: 0.3 },
    { label: "Friend", delay: 0.45 },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        How the loop works
      </p>
      <div className="flex items-center gap-2">
        {nodes.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + n.delay, duration: 0.4, type: "spring", stiffness: 260, damping: 18 }}
              className="flex flex-col items-center gap-1"
            >
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold text-zinc-300", a.icon)}>
                {n.label[0]}
              </div>
              <span className="text-[9px] text-zinc-700">{n.label}</span>
            </motion.div>
            {i < nodes.length - 1 && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + n.delay, duration: 0.3 }}
                className={cn("mb-4 h-px w-5 origin-left", a.bullet)}
              />
            )}
          </div>
        ))}
        {/* Loop arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.1 }}
          className="mb-4 text-[10px] text-zinc-700"
        >
          ↺
        </motion.div>
      </div>
    </div>
  );
}
