"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Users, Share2, BarChart3 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface WaitlistsEmptyStateProps {
  hasFilters: boolean;
}

export function WaitlistsEmptyState({ hasFilters }: WaitlistsEmptyStateProps) {
  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-3 py-20 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-card/60">
          <Users size={22} className="text-muted-foreground/40" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">No waitlists match your search</p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">Try adjusting your filters or search terms.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-8 py-20 text-center"
    >
      {/* Icon cluster */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ delay: 0.3, duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl bg-indigo-500/10"
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/25 bg-indigo-500/10">
          <Zap size={26} className="text-indigo-400" />
        </div>
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          No waitlists yet
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground/80">
          Create your first waitlist and start building an audience before you launch.
          Viral referrals, real-time leaderboards — all ready in 2 minutes.
        </p>
      </div>

      {/* Feature hints */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { icon: <Users  size={13} />, text: "Viral referrals" },
          { icon: <Share2 size={13} />, text: "Leaderboards"    },
          { icon: <BarChart3 size={13} />, text: "Analytics"    },
        ].map((f) => (
          <div
            key={f.text}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground/80"
          >
            <span className="text-indigo-400">{f.icon}</span>
            {f.text}
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link href="/dashboard/waitlists/new">
        <Button
          size="lg"
          className="group relative overflow-hidden bg-indigo-600 px-7 font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          <Zap size={15} className="text-indigo-300" />
          Create your first waitlist
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </Link>
    </motion.div>
  );
}