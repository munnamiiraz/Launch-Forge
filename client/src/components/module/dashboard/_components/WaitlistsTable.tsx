"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ExternalLink, MoreHorizontal, Pencil, Trash2, Copy,
  Users, Share2, TrendingUp, Globe, Lock, Search,
} from "lucide-react";

import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import type { DashboardWaitlist } from "../_types";

const GRADIENT_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
];

interface WaitlistsTableProps {
  waitlists: DashboardWaitlist[];
}

export function WaitlistsTable({ waitlists }: WaitlistsTableProps) {
  const [search, setSearch] = useState("");

  const filtered = waitlists.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search waitlists…"
          className="h-9 border-zinc-800 bg-card/60 pl-8 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-0"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-border/80 bg-card/40">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] border-b border-border/60 bg-card/60 px-4 py-2.5">
          {["Waitlist", "Subscribers", "Referrals", "Status", ""].map((h) => (
            <p key={h} className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {h}
            </p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Users size={32} className="text-zinc-800" />
            <p className="text-sm text-muted-foreground/60">
              {search ? "No waitlists match your search." : "No waitlists yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map((wl, i) => (
              <motion.div
                key={wl.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="group grid grid-cols-[2fr_1fr_1fr_1fr_80px] items-center px-4 py-3.5 hover:bg-card/40 transition-colors"
              >
                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                    <AvatarFallback
                      className={cn(
                        "rounded-lg bg-gradient-to-br text-xs font-bold text-white",
                        GRADIENT_COLORS[i % GRADIENT_COLORS.length]
                      )}
                    >
                      {wl.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                      {wl.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">/{wl.slug}</p>
                  </div>
                </div>

                {/* Subscribers */}
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-muted-foreground/40" />
                  <span className="text-sm font-medium text-foreground/80">
                    {Number(wl.subscribers ?? 0).toLocaleString()}
                  </span>
                </div>

                {/* Referrals */}
                <div className="flex items-center gap-1.5">
                  <Share2 size={12} className="text-muted-foreground/40" />
                  <span className="text-sm text-muted-foreground">
                    {Number(wl.referrals ?? 0).toLocaleString()}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <Badge
                    className={cn(
                      "gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                      wl.isOpen
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-700/60 bg-muted/40 text-muted-foreground/80"
                    )}
                    variant="outline"
                  >
                    {wl.isOpen ? <Globe size={9} /> : <Lock size={9} />}
                    {wl.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/waitlists/${wl.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-muted-foreground/60 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted/60 hover:text-foreground/80"
                    >
                      <TrendingUp size={13} />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-muted-foreground/60 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted/60 hover:text-foreground/80"
                      >
                        <MoreHorizontal size={13} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-44 border-zinc-800 bg-background/95 backdrop-blur-xl"
                    >
                      <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60">
                        <Link href={`/dashboard/waitlists/${wl.id}`}>
                          <TrendingUp size={12} />View details
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
                      <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-red-400 hover:bg-red-500/8 hover:text-red-400 focus:bg-red-500/8">
                        <Trash2 size={12} />Delete waitlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
