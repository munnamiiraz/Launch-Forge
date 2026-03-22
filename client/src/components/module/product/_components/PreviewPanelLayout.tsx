"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import type { PreviewPanel } from "../_types";
import { cn } from "@/src/lib/utils";

interface PreviewPanelProps {
  panel: PreviewPanel;
  mockUI: React.ReactNode;
  index: number;
}

export function PreviewPanelLayout({ panel, mockUI, index }: PreviewPanelProps) {
  const textFirst = panel.textSide === "left";

  const textCol = (
    <motion.div
      initial={{ opacity: 0, x: textFirst ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col justify-center gap-7"
    >
      {/* Eyebrow */}
      <Badge
        variant="outline"
        className="w-fit gap-2 border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-xs font-medium text-indigo-300"
      >
        <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
        {panel.eyebrow}
      </Badge>

      {/* Headline */}
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-100 md:text-4xl xl:text-5xl">
        {panel.title}
        {panel.titleHighlight && (
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
            {panel.titleHighlight}
          </span>
        )}
      </h2>

      {/* Description */}
      <p className="text-base leading-relaxed text-zinc-500 max-w-lg">
        {panel.description}
      </p>

      <Separator className="bg-zinc-800/60" />

      {/* Bullets */}
      <ul className="flex flex-col gap-4">
        {panel.bullets.map((bullet, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-3"
          >
            {/* Icon bubble */}
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-500/25 bg-indigo-500/10 text-indigo-400">
              {bullet.icon}
            </span>
            <span className="text-sm leading-relaxed text-zinc-400">{bullet.text}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );

  const visualCol = (
    <motion.div
      initial={{ opacity: 0, x: textFirst ? 28 : -28, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Outer glow ring */}
      <div className="absolute -inset-4 rounded-3xl bg-indigo-600/6 blur-2xl" />
      <div className="relative">{mockUI}</div>
    </motion.div>
  );

  return (
    <div
      className={cn(
        "grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20",
        // On desktop: flip column order based on textSide
        !textFirst && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
      )}
    >
      {textFirst ? (
        <>
          {textCol}
          {visualCol}
        </>
      ) : (
        <>
          {textCol}
          {visualCol}
        </>
      )}
    </div>
  );
}
