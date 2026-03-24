"use client";

import { motion } from "framer-motion";
import { Search, LayoutGrid, List, Globe, Lock, Layers } from "lucide-react";
import { Input }  from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { cn }     from "@/src/lib/utils";
import type { FilterTab, ViewMode } from "../_types";

interface WaitlistFilterBarProps {
  search:         string;
  onSearch:       (v: string) => void;
  activeTab:      FilterTab;
  onTabChange:    (t: FilterTab) => void;
  viewMode:       ViewMode;
  onViewMode:     (m: ViewMode) => void;
  counts: { total: number; open: number; closed: number };
}

const TABS: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: "all",    label: "All",    icon: <Layers size={13} /> },
  { id: "open",   label: "Open",   icon: <Globe  size={13} /> },
  { id: "closed", label: "Closed", icon: <Lock   size={13} /> },
];

export function WaitlistFilterBar({
  search, onSearch,
  activeTab, onTabChange,
  viewMode, onViewMode,
  counts,
}: WaitlistFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card/40 p-1">
        {TABS.map((tab) => {
          const count =
            tab.id === "all"    ? counts.total  :
            tab.id === "open"   ? counts.open   : counts.closed;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                active
                  ? "text-foreground"
                  : "text-muted-foreground/80 hover:text-foreground/80"
              )}
            >
              {active && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-md bg-zinc-800"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {tab.icon}
                {tab.label}
                <span className={cn(
                  "ml-0.5 rounded-full px-1.5 py-0 text-[9px] font-bold tabular-nums",
                  active
                    ? "bg-zinc-700 text-foreground/80"
                    : "bg-muted/60 text-muted-foreground/60"
                )}>
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + view toggle */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search waitlists…"
            className="h-8 w-52 border-zinc-800 bg-card/60 pl-8 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-0"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border/80 bg-card/40 p-0.5">
          {(["grid", "list"] as ViewMode[]).map((m) => (
            <Button
              key={m}
              variant="ghost"
              size="icon"
              onClick={() => onViewMode(m)}
              className={cn(
                "h-7 w-7 rounded-md",
                viewMode === m
                  ? "bg-zinc-800 text-foreground/90"
                  : "text-muted-foreground/60 hover:bg-zinc-800/50 hover:text-muted-foreground"
              )}
            >
              {m === "grid" ? <LayoutGrid size={13} /> : <List size={13} />}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}