"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Share2, Globe, Lock, MoreHorizontal,
  Pencil, Trash2, Copy, ExternalLink, TrendingUp,
  ArrowUpRight, BarChart3,
} from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { Badge }   from "@/src/components/ui/badge";
import { Button }  from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import type { DashboardWaitlist } from "../_types";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
];

/* Tiny sparkline bars — purely decorative */
const SPARKLINE = [30, 55, 42, 70, 58, 88, 75, 95, 82, 100];

interface WaitlistCardProps {
  waitlist: DashboardWaitlist;
  index:    number;
}

export function WaitlistCard({ waitlist, index }: WaitlistCardProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  const viralCoeff = waitlist.subscribers > 0
    ? (waitlist.referrals / waitlist.subscribers).toFixed(1)
    : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className={cn(
        "group relative overflow-hidden border-border/80 bg-card/40 backdrop-blur-sm",
        "transition-all duration-300 hover:border-zinc-700/60 hover:bg-card/60 hover:shadow-xl hover:shadow-black/20",
        "hover:-translate-y-0.5"
      )}>
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent transition-all duration-300 group-hover:via-indigo-500/30" />

        {/* Corner glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardContent className="relative flex flex-col gap-4 p-5">

          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0 rounded-xl">
                <AvatarFallback className={cn("rounded-xl bg-linear-to-br text-xs font-bold text-white", gradient)}>
                  {waitlist.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {waitlist.name}
                </p>
                <p className="text-[11px] text-muted-foreground/60">/{waitlist.slug}</p>
              </div>
            </div>

            {/* Status + actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold",
                  waitlist.isOpen
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-700/60 bg-muted/40 text-muted-foreground/80"
                )}
              >
                {waitlist.isOpen ? <Globe size={8} /> : <Lock size={8} />}
                {waitlist.isOpen ? "Open" : "Closed"}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreHorizontal size={13} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 border-zinc-800 bg-background/95 backdrop-blur-xl">
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60">
                    <Link href={`/dashboard/waitlists/${waitlist.slug}`}>
                      <TrendingUp size={12} />View analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60">
                    <Pencil size={12} />Edit waitlist
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60">
                    <Copy size={12} />Copy public link
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60">
                    <ExternalLink size={12} />Open public page
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-muted/60" />
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-red-400 hover:bg-red-500/8 focus:bg-red-500/8 focus:text-red-400">
                    <Trash2 size={12} />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mini sparkline */}
          <div className="flex h-10 items-end gap-0.5">
            {SPARKLINE.map((h, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.06 + i * 0.03, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: `${h}%`, originY: 1 }}
                className={cn(
                  "flex-1 rounded-sm",
                  i === SPARKLINE.length - 1
                    ? "bg-indigo-500"
                    : i >= SPARKLINE.length - 3
                      ? "bg-indigo-500/50"
                      : "bg-zinc-800"
                )}
              />
            ))}
          </div>

          <Separator className="bg-muted/60" />

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <Metric
              icon={<Users size={11} className="text-indigo-400" />}
              value={waitlist.subscribers.toLocaleString()}
              label="Subscribers"
            />
            <Metric
              icon={<Share2 size={11} className="text-violet-400" />}
              value={waitlist.referrals.toLocaleString()}
              label="Referrals"
            />
            <Metric
              icon={<BarChart3 size={11} className="text-emerald-400" />}
              value={`${viralCoeff}×`}
              label="Viral score"
            />
          </div>

          {/* CTA */}
          <Link href={`/dashboard/waitlists/${waitlist.slug}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full gap-1.5 border border-border/60 text-xs text-muted-foreground/80 hover:border-zinc-700 hover:bg-zinc-800/50 hover:text-foreground/90 transition-all duration-150"
            >
              View details
              <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-sm font-bold text-foreground/90">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground/60">{label}</span>
    </div>
  );
}