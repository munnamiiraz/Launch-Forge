"use client";

import { motion } from "framer-motion";
import { ShieldX, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

import { fadeUp } from "@/src/lib/motion";

export function InvalidTokenView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-5 py-2 text-center"
    >
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8"
      >
        <ShieldX size={24} className="text-red-400" />
      </motion.div>

      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-1.5"
      >
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          Link expired or invalid
        </h2>
        <p className="text-sm text-zinc-500">
          This reset link is no longer valid. Reset links
          <br />
          expire after 30 minutes and can only be used once.
        </p>
      </motion.div>

      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        <Button
          asChild
          className={cn(
            "group relative w-full overflow-hidden",
            "bg-indigo-600 text-sm font-medium text-white",
            "hover:bg-indigo-500 transition-all duration-200"
          )}
        >
          <Link href="/reset-password">
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            Request a new link
          </Link>
        </Button>
      </motion.div>

      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-400"
        >
          <ArrowLeft size={13} />
          Back to sign in
        </Link>
      </motion.div>
    </motion.div>
  );
}
