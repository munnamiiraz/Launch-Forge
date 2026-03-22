"use client";

import { motion } from "framer-motion";
import {
  Globe, Lock, Users, Share2,
  Zap, ArrowRight, CheckCircle2,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

interface LivePreviewProps {
  name:        string;
  slug:        string;
  description: string;
  logoUrl:     string;
  isOpen:      boolean;
}

export function LivePreview({ name, slug, description, isOpen }: LivePreviewProps) {
  const displayName = name.trim()        || "Your Waitlist Name";
  const displaySlug = slug.trim()        || "your-waitlist";
  const displayDesc = description.trim() || "Your waitlist description will appear here, telling visitors what you're building and why they should join.";

  return (
    <div className="flex flex-col gap-4">
      {/* Preview label */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Live preview
        </span>
        <div className="h-px flex-1 bg-zinc-800/60" />
        <Badge
          variant="outline"
          className="border-indigo-500/25 bg-indigo-500/8 px-2 py-0.5 text-[9px] font-semibold text-indigo-400"
        >
          Public page
        </Badge>
      </div>

      {/* Browser chrome */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/95 shadow-2xl shadow-black/40">
        {/* Window bar */}
        <div className="flex items-center gap-2 border-b border-zinc-800/60 bg-zinc-900/60 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-zinc-700" />
            <div className="h-2 w-2 rounded-full bg-zinc-700" />
            <div className="h-2 w-2 rounded-full bg-zinc-700" />
          </div>
          {/* URL bar */}
          <div className="mx-auto flex min-w-0 max-w-[240px] flex-1 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1">
            {isOpen
              ? <Globe size={10} className="shrink-0 text-emerald-500" />
              : <Lock  size={10} className="shrink-0 text-zinc-600"    />
            }
            <span className="truncate text-[10px] text-zinc-500">
              launchforge.app/{displaySlug}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="relative min-h-[360px] overflow-hidden bg-zinc-950 p-6">
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-600/8 blur-[80px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px]"
          />

          <div className="relative flex flex-col items-center gap-5 text-center">
            {/* Logo mark */}
            <motion.div
              key={displayName}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15"
            >
              <Zap size={20} className="text-indigo-400" />
            </motion.div>

            {/* Status badge */}
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold",
                isOpen
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700/60 bg-zinc-800/40 text-zinc-500"
              )}
            >
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                isOpen ? "bg-emerald-400" : "bg-zinc-600"
              )} />
              {isOpen ? "Signups open" : "Signups closed"}
            </Badge>

            {/* Title */}
            <motion.h1
              key={displayName}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-xs text-xl font-bold tracking-tight text-zinc-100"
            >
              {displayName}
            </motion.h1>

            {/* Description */}
            <motion.p
              key={displayDesc.slice(0, 20)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-xs text-xs leading-relaxed text-zinc-500"
            >
              {displayDesc}
            </motion.p>

            {/* Subscriber count strip */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <Users size={11} className="text-indigo-400" />
                <span className="text-indigo-300 font-semibold">0</span> signed up
              </div>
              <div className="h-3 w-px bg-zinc-800" />
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <Share2 size={11} />
                Referral rewards active
              </div>
            </div>

            {/* Mini form */}
            <div className="w-full max-w-xs space-y-2">
              <div className="flex gap-2">
                <div className="h-8 flex-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 flex items-center">
                  <span className="text-[10px] text-zinc-600">ada@example.com</span>
                </div>
                <div className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold text-white",
                  isOpen ? "bg-indigo-600" : "bg-zinc-700 opacity-50"
                )}>
                  Join <ArrowRight size={10} />
                </div>
              </div>
              <div className="flex justify-center gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-0.5 text-[9px] text-zinc-700">
                    <CheckCircle2 size={8} />
                    {i === 1 ? "Free" : i === 2 ? "Instant" : "Referral rewards"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* URL chip */}
      <div className="flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3 py-2">
        <Globe size={12} className="shrink-0 text-zinc-700" />
        <span className="flex-1 truncate font-mono text-xs text-zinc-500">
          launchforge.app/
          <span className={cn(
            "transition-colors",
            slug.trim() ? "text-indigo-400" : "text-zinc-600"
          )}>
            {displaySlug}
          </span>
        </span>
      </div>
    </div>
  );
}