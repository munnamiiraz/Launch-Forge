"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Share2, Globe, Lock, MoreHorizontal,
  Pencil, Trash2, Copy, ExternalLink, TrendingUp, ArrowUpRight,
} from "lucide-react";

import { Badge }  from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import type { DashboardWaitlist } from "@/src/components/module/waitlists/_types";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
];

interface WaitlistListRowProps {
  waitlist: DashboardWaitlist;
  index:    number;
  isLast:   boolean;
}

export function WaitlistListRow({ waitlist, index, isLast }: WaitlistListRowProps) {
  const gradient   = GRADIENTS[index % GRADIENTS.length];
  const viralCoeff = waitlist.subscribers > 0
    ? (waitlist.referrals / waitlist.subscribers).toFixed(1)
    : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group grid items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-900/40",
        "grid-cols-[auto_1fr_auto_auto_auto_auto]",
        !isLast && "border-b border-zinc-800/40"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0 rounded-lg">
        <AvatarFallback className={cn("rounded-lg bg-gradient-to-br text-[11px] font-bold text-white", gradient)}>
          {waitlist.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name + slug */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-zinc-100">
          {waitlist.name}
        </p>
        <p className="text-[11px] text-zinc-600">/{waitlist.slug}</p>
      </div>

      {/* Subscribers */}
      <div className="hidden items-center gap-1.5 sm:flex">
        <Users size={12} className="text-zinc-700" />
        <span className="w-16 text-right text-sm font-medium text-zinc-300 tabular-nums">
          {waitlist.subscribers.toLocaleString()}
        </span>
      </div>

      {/* Referrals */}
      <div className="hidden items-center gap-1.5 md:flex">
        <Share2 size={12} className="text-zinc-700" />
        <span className="w-14 text-right text-sm text-zinc-400 tabular-nums">
          {waitlist.referrals.toLocaleString()}
        </span>
      </div>

      {/* Viral score */}
      <div className="hidden items-center lg:flex">
        <span className="text-xs font-semibold text-indigo-400 tabular-nums">{viralCoeff}×</span>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold",
            waitlist.isOpen
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-700/60 bg-zinc-800/40 text-zinc-500"
          )}
        >
          {waitlist.isOpen ? <Globe size={8} /> : <Lock size={8} />}
          {waitlist.isOpen ? "Open" : "Closed"}
        </Badge>

        <Link href={`/dashboard/waitlists/${waitlist.id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800/60 hover:text-zinc-300"
          >
            <ArrowUpRight size={13} />
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800/60 hover:text-zinc-300"
            >
              <MoreHorizontal size={13} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
            <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60">
              <Link href={`/dashboard/waitlists/${waitlist.id}`}>
                <TrendingUp size={12} />View analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60">
              <Pencil size={12} />Edit waitlist
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60">
              <Copy size={12} />Copy public link
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60">
              <ExternalLink size={12} />Open public page
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800/60" />
            <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-red-400 hover:bg-red-500/8 focus:bg-red-500/8 focus:text-red-400">
              <Trash2 size={12} />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}