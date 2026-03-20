"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useRecentSignups } from "../../../../../hooks/hero-section/useWaitlist";
import type { RecentSignup } from "../../_types";

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-teal-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
];

interface RecentSignupsTickerProps {
  initialRecent?: RecentSignup[];
}

export function RecentSignupsTicker({ initialRecent }: RecentSignupsTickerProps) {
  const { data: signups } = useRecentSignups(initialRecent);
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless infinite loop
  const items = signups ? [...signups, ...signups, ...signups] : [];

  if (!signups?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.1, duration: 0.6 }}
      className="relative w-full overflow-hidden"
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-zinc-950 to-transparent" />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="flex animate-[ticker_40s_linear_infinite] gap-3 will-change-transform"
        style={{ width: "max-content" }}
      >
        {items.map((signup, i) => (
          <TickerCard key={`${signup.name}-${i}`} signup={signup} index={i % 8} />
        ))}
      </div>
    </motion.div>
  );
}

function TickerCard({
  signup,
  index,
}: {
  signup: RecentSignup;
  index: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-3.5 py-2.5 backdrop-blur-sm">
      {/* Avatar */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-[10px] font-bold text-white`}
      >
        {signup.initials}
      </div>

      {/* Info */}
      <div>
        <p className="text-xs font-medium text-zinc-300">{signup.name}</p>
        <div className="flex items-center gap-1 text-[10px] text-zinc-600">
          <MapPin size={9} />
          <span>{signup.location}</span>
          <span className="mx-0.5 text-zinc-800">·</span>
          <span>{signup.timeAgo}</span>
        </div>
      </div>

      {/* Joined badge */}
      <div className="ml-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-500">
        Joined
      </div>
    </div>
  );
}
