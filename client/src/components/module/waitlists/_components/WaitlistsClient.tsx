"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card }              from "@/src/components/ui/card";
import { WaitlistFilterBar } from "@/src/components/module/waitlists/_components/WaitlistFilterBar";
import { WaitlistCard }      from "@/src/components/module/waitlists/_components/WaitlistCard";
import { WaitlistListRow }   from "@/src/components/module/waitlists/_components/WaitlistListRow";
import { WaitlistsEmptyState } from "@/src/components/module/waitlists/_components/WaitlistsEmptyState";
import type { DashboardWaitlist, FilterTab, ViewMode } from "@/src/components/module/waitlists/_types";

interface WaitlistsClientProps {
  waitlists: DashboardWaitlist[];
}

export function WaitlistsClient({ waitlists }: WaitlistsClientProps) {
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [viewMode,  setViewMode]  = useState<ViewMode>("grid");

  /* ── Derived counts for tab badges ─────────────────────────── */
  const counts = useMemo(() => ({
    total:  waitlists.length,
    open:   waitlists.filter((w) => w.isOpen).length,
    closed: waitlists.filter((w) => !w.isOpen).length,
  }), [waitlists]);

  /* ── Filtered list ──────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = [...waitlists];

    if (activeTab === "open")   list = list.filter((w) =>  w.isOpen);
    if (activeTab === "closed") list = list.filter((w) => !w.isOpen);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.slug.toLowerCase().includes(q)
      );
    }

    return list;
  }, [waitlists, activeTab, search]);

  const hasFilters = search.trim() !== "" || activeTab !== "all";

  return (
    <div className="flex flex-col gap-5">
      {/* Filter bar */}
      <WaitlistFilterBar
        search={search}
        onSearch={setSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        viewMode={viewMode}
        onViewMode={setViewMode}
        counts={counts}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WaitlistsEmptyState hasFilters={hasFilters} />
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filtered.map((wl, i) => (
              <WaitlistCard key={wl.id} waitlist={wl} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden border-border/80 bg-card/40">
              {/* List header */}
              <div className="hidden grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 border-b border-border/60 bg-card/60 px-5 py-2.5 sm:grid">
                <div className="w-8" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Waitlist</p>
                <p className="hidden w-24 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 sm:block">Subscribers</p>
                <p className="hidden w-20 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 md:block">Referrals</p>
                <p className="hidden text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 lg:block">Viral</p>
                <div className="w-32" />
              </div>
              {filtered.map((wl, i) => (
                <WaitlistListRow
                  key={wl.id}
                  waitlist={wl}
                  index={i}
                  isLast={i === filtered.length - 1}
                />
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result count */}
      {filtered.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground/40">
          Showing {filtered.length} of {waitlists.length} waitlist{waitlists.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}