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
        <p className="text-sm text-muted-foreground/80">
          Ready to build a waitlist that{" "}
          <span className="font-medium text-foreground/80">grows itself?</span>
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group relative overflow-hidden bg-indigo-600 px-7 font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
          >
            <Link href="/register">
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <Zap size={15} className="text-indigo-300" />
              Create your waitlist
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
