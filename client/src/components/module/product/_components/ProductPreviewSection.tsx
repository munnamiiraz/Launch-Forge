"use client";

import { motion } from "framer-motion";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Sparkles } from "lucide-react";

import { PreviewPanelLayout } from "@/src/components/module/product/_components/PreviewPanelLayout";
import { AnalyticsMockUI }    from "@/src/components/module/product/_components/AnalyticsMockUI";
import { WaitlistMockUI }     from "@/src/components/module/product/_components/WaitlistMockUI";
import { PREVIEW_PANELS }     from "../_lib/panels-data";

const MOCK_UIS = [<AnalyticsMockUI key="analytics" />, <WaitlistMockUI key="waitlist" />];

export function ProductPreviewSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-24 md:py-32">

      {/* ── Ambient layers ───────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/5 dark:bg-indigo-600/6 blur-[150px]" />
      <div aria-hidden className="pointer-events-none absolute -right-64 top-1/4 h-[400px] w-[500px] rounded-full bg-violet-500/5 dark:bg-violet-600/5 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -left-64 bottom-1/4 h-[400px] w-[500px] rounded-full bg-cyan-500/5 dark:bg-cyan-600/4 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-size-[72px_72px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-24 px-4 sm:px-6 lg:px-8 md:gap-32">

        {/* ── Section header ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <div className="mx-auto flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-3 py-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground/80">launchforge.app/analytics</span>
          </div>
          <Badge
            variant="outline"
            className="gap-2 border-indigo-500/20 dark:border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
          >
            <Sparkles size={11} className="text-indigo-500" />
            Product Preview
          </Badge>

          <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            See exactly{" "}
            <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-500 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
              what you're getting
            </span>
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground/80">
            No blurry screenshots or marketing mockups. This is the real product — the exact
            dashboard your subscribers see from day one.
          </p>
        </motion.div>

        {/* ── Panels ──────────────────────────────────────────── */}
        {PREVIEW_PANELS.map((panel, i) => (
          <div key={panel.id}>
            <PreviewPanelLayout
              panel={panel}
              mockUI={MOCK_UIS[i]}
              index={i}
            />

            {/* Separator between panels */}
            {i < PREVIEW_PANELS.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mt-24 md:mt-32"
              >
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
