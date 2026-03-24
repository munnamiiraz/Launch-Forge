"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, MoreHorizontal,
  Mail, Share2, ArrowUpRight, Bell, CheckCircle2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const SUBSCRIBERS = [
  { initials: "AK", name: "Alex Kim",    email: "alex@startup.io",   pos: 1,   refs: 12, status: "early_access", gradient: "from-indigo-500 to-violet-600" },
  { initials: "SR", name: "Sofia Ruiz",  email: "sofia@design.co",   pos: 2,   refs: 8,  status: "top_referrer", gradient: "from-violet-500 to-purple-600" },
  { initials: "JL", name: "James L.",    email: "james@tech.dev",    pos: 8,   refs: 5,  status: "active",       gradient: "from-emerald-500 to-teal-600"  },
  { initials: "PK", name: "Priya K.",    email: "priya@product.co",  pos: 14,  refs: 3,  status: "active",       gradient: "from-cyan-500 to-blue-600"     },
  { initials: "MT", name: "Marcus T.",   email: "m.t@growth.io",     pos: 21,  refs: 1,  status: "new",          gradient: "from-amber-500 to-orange-500"  },
];

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  early_access: { label: "Early Access", classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  top_referrer: { label: "Top Referrer", classes: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  active:       { label: "Active",       classes: "border-indigo-500/20 bg-indigo-500/8 text-indigo-400" },
  new:          { label: "New",          classes: "border-zinc-700/60 bg-muted/40 text-muted-foreground/80" },
};

const NOTIFICATION_ITEMS = [
  { icon: <Share2 size={11} className="text-indigo-400" />,  text: "Priya invited 3 new users",  time: "2m ago",  dot: "bg-indigo-500"  },
  { icon: <Mail size={11} className="text-violet-400" />,    text: "Milestone email sent to #50", time: "5m ago",  dot: "bg-violet-500"  },
  { icon: <CheckCircle2 size={11} className="text-emerald-400" />, text: "Alex granted early access",   time: "12m ago", dot: "bg-emerald-500" },
];

export function WaitlistMockUI() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <div key={i} className="h-2 w-2 rounded-full bg-zinc-700" />)}
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md border border-zinc-800 bg-card/60 px-3 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-muted-foreground/80">launchforge.app/waitlist</span>
        </div>
        {/* Notification bell with badge */}
        <div className="relative">
          <Bell size={13} className="text-muted-foreground/60" />
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white">3</span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Subscriber list</h4>
            <p className="text-[10px] text-muted-foreground/60">2,847 total · 143 joined today</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-zinc-800 bg-card/60 text-muted-foreground/60 hover:text-foreground/80 transition-colors cursor-pointer">
              <Search size={11} />
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-zinc-800 bg-card/60 text-muted-foreground/60 hover:text-foreground/80 transition-colors cursor-pointer">
              <Filter size={11} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border/60">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 border-b border-border/60 bg-card/60 px-3 py-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            <span className="w-7">#</span>
            <span>Subscriber</span>
            <span className="hidden sm:block">Referrals</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          {SUBSCRIBERS.map((sub, i) => {
            const st = STATUS_CONFIG[sub.status];
            return (
              <motion.div
                key={sub.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-border/40 px-3 py-2.5 last:border-0 hover:bg-card/40 transition-colors"
              >
                {/* Position */}
                <span className="w-7 text-[10px] font-bold text-muted-foreground/60">
                  #{sub.pos}
                </span>

                {/* Identity */}
                <div className="flex min-w-0 items-center gap-2">
                  <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[8px] font-bold text-white", sub.gradient)}>
                    {sub.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-foreground/80">{sub.name}</p>
                    <p className="truncate text-[9px] text-muted-foreground/60">{sub.email}</p>
                  </div>
                </div>

                {/* Referrals */}
                <div className="hidden items-center gap-1 sm:flex">
                  <Share2 size={9} className="text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/80">{sub.refs}</span>
                </div>

                {/* Status chip */}
                <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-semibold", st.classes)}>
                  {st.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.55, duration: 0.45 }}
          className="rounded-xl border border-border/60 bg-card/40 p-3"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-muted-foreground/80">Live activity</p>
            <span className="flex items-center gap-1 text-[9px] text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
          </div>
          <div className="space-y-2.5">
            {NOTIFICATION_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.62 + i * 0.07, duration: 0.3 }}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900">
                  {item.icon}
                </div>
                <span className="flex-1 text-[10px] text-muted-foreground">{item.text}</span>
                <span className="text-[9px] text-muted-foreground/40">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
