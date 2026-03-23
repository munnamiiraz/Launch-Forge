"use client";

import { motion } from "framer-motion";
import {
  UserPlus, TrendingUp, TrendingDown, XCircle,
  Globe, AlertCircle, CheckCircle2, MinusCircle,
  Zap, ExternalLink, Database, Mail,
  Activity, ArrowUpRight, Trophy, Share2, Users,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }    from "@/src/components/ui/badge";
import { Button }   from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import { cn }       from "@/src/lib/utils";
import type { AdminActivity, SystemHealth, TopWaitlist } from "../_types";

/* ── Activity feed ───────────────────────────────────────────────── */

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  signup:    <UserPlus   size={12} className="text-emerald-400" />,
  upgrade:   <TrendingUp size={12} className="text-indigo-400"  />,
  downgrade: <TrendingDown size={12} className="text-amber-400" />,
  cancel:    <XCircle    size={12} className="text-red-400"     />,
  waitlist:  <Globe      size={12} className="text-cyan-400"    />,
  alert:     <AlertCircle size={12} className="text-orange-400" />,
};
const ACTIVITY_DOT: Record<string, string> = {
  signup:    "bg-emerald-500",
  upgrade:   "bg-indigo-500",
  downgrade: "bg-amber-500",
  cancel:    "bg-red-500",
  waitlist:  "bg-cyan-500",
  alert:     "bg-orange-500",
};
const AVATAR_GRADS = [
  "from-indigo-500 to-violet-600", "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",     "from-violet-500 to-purple-600",
  "from-zinc-500 to-zinc-600",     "from-orange-600 to-red-600",
];

export function AdminActivityFeed({ activities }: { activities: AdminActivity[] }) {
  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/20 to-transparent" />
      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-200">Recent activity</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </div>
        </div>
      </CardHeader>
      <div className="divide-y divide-zinc-800/40">
        {activities.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-900/30 transition-colors"
          >
            <div className="relative mt-0.5 shrink-0">
              <Avatar className="h-7 w-7 rounded-lg">
                <AvatarFallback className={cn("rounded-lg bg-linear-to-br text-[9px] font-bold text-white", AVATAR_GRADS[i % AVATAR_GRADS.length])}>
                  {a.user.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className={cn("absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-zinc-900 text-white", ACTIVITY_DOT[a.type])}>
                {ACTIVITY_ICON[a.type]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">{a.user}</p>
              <p className="text-[11px] text-zinc-600 truncate">{a.message}</p>
            </div>
            <span className="shrink-0 text-[10px] text-zinc-700">{a.time}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

/* ── System health ───────────────────────────────────────────────── */

const SERVICE_ICON: Record<string, React.ReactNode> = {
  api:      <Activity   size={13} />,
  database: <Database   size={13} />,
  stripe:   <Zap        size={13} />,
  email:    <Mail       size={13} />,
};
const HEALTH_CONFIG = {
  operational: { label: "Operational", dot: "bg-emerald-400", text: "text-emerald-400", icon: <CheckCircle2 size={12} /> },
  degraded:    { label: "Degraded",    dot: "bg-amber-400",   text: "text-amber-400",   icon: <MinusCircle  size={12} /> },
  down:        { label: "Down",        dot: "bg-red-500",      text: "text-red-400",     icon: <XCircle      size={12} /> },
};

export function AdminSystemHealth({ health }: { health: SystemHealth }) {
  const services: { key: keyof SystemHealth; label: string }[] = [
    { key: "api",      label: "API"      },
    { key: "database", label: "Database" },
    { key: "stripe",   label: "Stripe"   },
    { key: "email",    label: "Email"    },
  ];

  const allOperational = services.every((s) => health[s.key] === "operational");

  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-zinc-700/50 to-transparent" />
      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-200">System health</p>
          <Badge className={cn(
            "gap-1 rounded-full px-2.5 text-[10px] font-semibold",
            allOperational
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/25 bg-amber-500/10 text-amber-400",
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", allOperational ? "bg-emerald-400" : "bg-amber-400")} />
            {allOperational ? "All systems normal" : "Degraded"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-5">
        {services.map(({ key, label }) => {
          const status = health[key] as "operational" | "degraded" | "down";
          const cfg    = HEALTH_CONFIG[status];
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                <span className="text-zinc-700">{SERVICE_ICON[key]}</span>
                {label}
              </div>
              <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold", cfg.text)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                {cfg.label}
              </div>
            </div>
          );
        })}

        <Separator className="bg-zinc-800/60" />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2">
            <p className="text-[10px] text-zinc-600">Uptime (30d)</p>
            <p className="text-sm font-black text-emerald-300">{health.uptime}%</p>
          </div>
          <div className="flex flex-col gap-0.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2">
            <p className="text-[10px] text-zinc-600">P99 latency</p>
            <p className="text-sm font-black text-zinc-200">{health.p99Latency}ms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Top waitlists ───────────────────────────────────────────────── */

const WL_GRADS = [
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
];

export function AdminTopWaitlists({ waitlists }: { waitlists: TopWaitlist[] }) {
  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />
      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-amber-400" />
          <p className="text-sm font-semibold text-zinc-200">Top waitlists</p>
        </div>
        <p className="text-[11px] text-zinc-600">Highest subscriber counts platform-wide</p>
      </CardHeader>
      <div className="divide-y divide-zinc-800/40">
        {waitlists.map((wl, i) => (
          <motion.div
            key={wl.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="group flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-900/30 transition-colors"
          >
            <span className={cn(
              "w-4 shrink-0 text-center text-xs font-black tabular-nums",
              i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-300" : "text-zinc-600",
            )}>
              {i + 1}
            </span>

            <Avatar className="h-7 w-7 shrink-0 rounded-lg">
              <AvatarFallback className={cn("rounded-lg bg-linear-to-br text-[9px] font-bold text-white", WL_GRADS[i % WL_GRADS.length])}>
                {wl.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-medium text-zinc-300">{wl.name}</p>
                {!wl.isOpen && <Badge className="border-zinc-700/60 bg-zinc-800/40 px-1 py-0 text-[8px] text-zinc-600">Closed</Badge>}
              </div>
              <p className="truncate text-[10px] text-zinc-600">{wl.ownerName} · {wl.ownerEmail}</p>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                <Users size={9} /><span className="font-semibold tabular-nums">{wl.subscribers.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-zinc-600">
                <Share2 size={8} />{wl.referrals.toLocaleString()} · {wl.viralScore}×
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}