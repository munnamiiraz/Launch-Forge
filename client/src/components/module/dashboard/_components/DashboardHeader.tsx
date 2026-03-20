"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Search, X, Command } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/src/components/ui/popover";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "join",    text: "Sarah K. joined your waitlist",      time: "2m ago",  read: false },
  { id: "2", type: "referral",text: "Marcus T. referred 3 new signups",   time: "14m ago", read: false },
  { id: "3", type: "payment", text: "Payment confirmed — Pro plan active", time: "1h ago",  read: false },
  { id: "4", type: "join",    text: "James L. joined Product Alpha",       time: "3h ago",  read: true  },
];

const TYPE_DOT: Record<string, string> = {
  join:     "bg-emerald-500",
  referral: "bg-indigo-500",
  payment:  "bg-amber-500",
  system:   "bg-zinc-600",
};

interface DashboardHeaderProps {
  title:    string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800/60 bg-zinc-950/85 px-6 backdrop-blur-xl">
      {/* Page title */}
      <div className="flex flex-col">
        <h1 className="text-sm font-semibold text-zinc-100">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-zinc-600">{subtitle}</p>
        )}
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {children}

        {/* Search */}
        {searchOpen ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <Input
              autoFocus
              placeholder="Search..."
              className="h-8 border-zinc-800 bg-zinc-900/60 pl-7 pr-7 text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-0"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
            >
              <X size={12} />
            </button>
          </motion.div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="h-8 w-8 rounded-lg text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300"
          >
            <Search size={14} />
          </Button>
        )}

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-lg text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300"
            >
              <Bell size={14} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-80 border-zinc-800 bg-zinc-950/95 p-0 shadow-xl shadow-black/40 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3">
              <p className="text-xs font-semibold text-zinc-300">Notifications</p>
              {unread > 0 && (
                <Badge className="h-4 rounded-full border-indigo-500/30 bg-indigo-500/12 px-1.5 text-[9px] text-indigo-400">
                  {unread} new
                </Badge>
              )}
            </div>

            <div className="divide-y divide-zinc-800/40">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-900/40",
                    !n.read && "bg-zinc-900/20"
                  )}
                >
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", TYPE_DOT[n.type] ?? "bg-zinc-600")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300">{n.text}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-600">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800/60 px-4 py-2.5">
              <button className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                Mark all as read
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
