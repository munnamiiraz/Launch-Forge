"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";

export function SectionCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: 0.5, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-6"
    >
      <Separator className="bg-zinc-800/50" />

      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-zinc-500">
          Ready to build a waitlist that{" "}
          <span className="font-medium text-zinc-300">grows itself?</span>
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group relative overflow-hidden bg-indigo-600 px-7 font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
          >
            <Link href="/register">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <Zap size={15} className="text-indigo-300" />
              Start for free
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="px-7 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
          >
            <Link href="/demo">Watch a demo</Link>
          </Button>
        </div>

        <p className="text-xs text-zinc-700">
          No credit card · Free forever plan · Live in 2 minutes
        </p>
      </div>
    </motion.div>
  );
}
