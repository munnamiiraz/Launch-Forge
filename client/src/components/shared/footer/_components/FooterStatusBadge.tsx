"use client";

import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

type Status = "operational" | "degraded" | "outage";

interface FooterStatusBadgeProps {
  /** Pass from server-fetched status, defaults to operational */
  status?: Status;
}

const STATUS_CONFIG: Record<Status, { label: string; dot: string; text: string; ring: string }> = {
  operational: {
    label: "All systems operational",
    dot:  "bg-emerald-400",
    text: "text-emerald-400",
    ring: "bg-emerald-400",
  },
  degraded: {
    label: "Degraded performance",
    dot:  "bg-amber-400",
    text: "text-amber-400",
    ring: "bg-amber-400",
  },
  outage: {
    label: "Service disruption",
    dot:  "bg-red-400",
    text: "text-red-400",
    ring: "bg-red-400",
  },
};

export function FooterStatusBadge({ status = "operational" }: FooterStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <motion.a
      href="https://status.launchforge.app"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full",
        "border border-border/60 bg-card/40 px-3 py-1.5",
        "text-[11px] transition-colors duration-150 hover:border-zinc-700 hover:bg-zinc-900/70"
      )}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-1.5 w-1.5">
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", cfg.ring)} />
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", cfg.dot)} />
      </span>
      <span className={cfg.text}>{cfg.label}</span>
    </motion.a>
  );
}
