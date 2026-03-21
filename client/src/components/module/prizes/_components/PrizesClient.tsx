"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Trophy, Plus, Eye, Users, Gift, DollarSign,
  ChevronDown, ArrowUpRight,
  Star, Layers, CheckCircle2, XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button }   from "@/src/components/ui/button";
import { Badge }    from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn }     from "@/src/lib/utils";

import { PrizeCard }        from "./PrizeCard";
import { PrizeFormDrawer }  from "./PrizeFormDrawer";
import { PrizePreviewCard } from "./PrizePreviewCard";
import type { Prize, PrizeWaitlist } from "../_types";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
];

const STATUS_TABS = [
  { id: "ACTIVE",    label: "Active",    icon: <CheckCircle2 size={12} /> },
  { id: "CANCELLED", label: "Cancelled", icon: <XCircle      size={12} /> },
  { id: "AWARDED",   label: "Awarded",   icon: <Trophy       size={12} /> },
  { id: "all",       label: "All",       icon: <Layers       size={12} /> },
] as const;

type StatusFilter = "ACTIVE" | "CANCELLED" | "AWARDED" | "all";

interface PrizesClientProps {
  waitlists:    PrizeWaitlist[];
  initialPrizes: Record<string, Prize[]>;
}

export function PrizesClient({ waitlists, initialPrizes }: PrizesClientProps) {
  const [selectedWlId, setSelectedWlId] = useState<string>(waitlists[0]?.id ?? "");
  const [prizes,       setPrizes]       = useState<Record<string, Prize[]>>(initialPrizes);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [editPrize,    setEditPrize]    = useState<Prize | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [showPreview,  setShowPreview]  = useState(true);

  const selectedWl     = waitlists.find((w) => w.id === selectedWlId);
  const allPrizes      = useMemo(() => prizes[selectedWlId] ?? [], [prizes, selectedWlId]);
  const activePrizes   = useMemo(() => allPrizes.filter((p) => p.status === "ACTIVE"), [allPrizes]);
  const MAX_PRIZES     = 10;
  const canAddMore     = activePrizes.length < MAX_PRIZES;

  const filteredPrizes = useMemo(() => {
    if (statusFilter === "all") return allPrizes;
    return allPrizes.filter((p) => p.status === statusFilter);
  }, [allPrizes, statusFilter]);

  /* ── Counts for tabs ─────────────────────────────────────────── */
  const tabCounts = useMemo(() => ({
    ACTIVE:    allPrizes.filter((p) => p.status === "ACTIVE").length,
    CANCELLED: allPrizes.filter((p) => p.status === "CANCELLED").length,
    AWARDED:   allPrizes.filter((p) => p.status === "AWARDED").length,
    all:       allPrizes.length,
  }), [allPrizes]);

  /* ── Total prize pool (ACTIVE CASH prizes) ───────────────────── */
  const prizePool = activePrizes
    .filter((p) => p.prizeType === "CASH" && p.value)
    .reduce((sum, p) => sum + (p.value ?? 0), 0);

  if (!selectedWl) {
    return (
      <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
          <Trophy size={28} className="text-zinc-800" />
          <p className="text-sm font-medium text-zinc-400">No waitlists found</p>
          <p className="text-xs text-zinc-600">Create a waitlist first to announce prizes.</p>
        </CardContent>
      </Card>
    );
  }

  /* ── Handlers ─────────────────────────────────────────────────── */
  const openCreate = () => { setEditPrize(null); setDrawerOpen(true); };
  const openEdit   = (p: Prize) => { setEditPrize(p); setDrawerOpen(true); };

  const handleSaved = (saved: Prize) => {
    setPrizes((prev) => {
      const existing = prev[selectedWlId] ?? [];
      const idx      = existing.findIndex((p) => p.id === saved.id);
      const updated  = idx >= 0
        ? existing.map((p) => p.id === saved.id ? saved : p)
        : [saved, ...existing];
      return { ...prev, [selectedWlId]: updated };
    });
  };

  const handleDelete = (id: string) => {
    setPrizes((prev) => ({
      ...prev,
      [selectedWlId]: (prev[selectedWlId] ?? []).filter((p) => p.id !== id),
    }));
  };

  const handleCancel = (id: string) => {
    setPrizes((prev) => ({
      ...prev,
      [selectedWlId]: (prev[selectedWlId] ?? []).map((p) =>
        p.id === id ? { ...p, status: "CANCELLED" as const } : p
      ),
    }));
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Waitlist selector ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-200">Manage prizes by waitlist</h2>
          <p className="text-xs text-zinc-600">
            Select a waitlist to manage its prize pool. Up to {MAX_PRIZES} active prizes per waitlist.
          </p>
        </div>

        {/* Waitlist picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-auto gap-2 border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left hover:border-zinc-700 hover:bg-zinc-800/60"
            >
              {selectedWl ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 shrink-0 rounded-lg">
                    <AvatarFallback className={cn(
                      "rounded-lg bg-gradient-to-br text-[9px] font-bold text-white",
                      GRADIENTS[waitlists.indexOf(selectedWl) % GRADIENTS.length]
                    )}>
                      {selectedWl.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-zinc-200">{selectedWl.name}</span>
                  <Badge className={cn(
                    "rounded-full px-1.5 py-0 text-[9px]",
                    selectedWl.isOpen
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700/60 bg-zinc-800/40 text-zinc-500",
                  )}>
                    {selectedWl.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
              ) : (
                <span className="text-sm text-zinc-600">Select a waitlist</span>
              )}
              <ChevronDown size={13} className="ml-2 shrink-0 text-zinc-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 border-zinc-800 bg-zinc-950/95 backdrop-blur-xl"
          >
            {waitlists.map((wl, i) => {
              const wlPrizes = prizes[wl.id] ?? [];
              const active   = wlPrizes.filter((p) => p.status === "ACTIVE").length;
              return (
                <DropdownMenuItem
                  key={wl.id}
                  onClick={() => setSelectedWlId(wl.id)}
                  className={cn(
                    "cursor-pointer gap-3 py-2.5",
                    selectedWlId === wl.id
                      ? "bg-indigo-500/10 text-indigo-300 focus:bg-indigo-500/10 focus:text-indigo-300"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60",
                  )}
                >
                  <Avatar className="h-7 w-7 shrink-0 rounded-lg">
                    <AvatarFallback className={cn("rounded-lg bg-gradient-to-br text-[10px] font-bold text-white", GRADIENTS[i % GRADIENTS.length])}>
                      {wl.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col min-w-0">
                    <span className="truncate text-sm font-medium">{wl.name}</span>
                    <span className="text-[10px] text-zinc-600">
                      {wl.subscribers.toLocaleString()} subscribers · {active} prize{active !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {selectedWlId === wl.id && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedWl && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* ── Left: prize management ──────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3">
              <SummaryPill
                icon={<Gift size={13} className="text-indigo-400" />}
                label="Active prizes"
                value={activePrizes.length.toString()}
                sub={`of ${MAX_PRIZES} max`}
                accent="border-indigo-500/20 bg-indigo-500/6"
              />
              <SummaryPill
                icon={<DollarSign size={13} className="text-emerald-400" />}
                label="Prize pool"
                value={prizePool > 0 ? `$${prizePool.toLocaleString()}` : "—"}
                sub="cash prizes"
                accent="border-emerald-500/20 bg-emerald-500/6"
              />
              <SummaryPill
                icon={<Users size={13} className="text-violet-400" />}
                label="Eligible"
                value={selectedWl.subscribers.toLocaleString()}
                sub="subscribers"
                accent="border-violet-500/20 bg-violet-500/6"
              />
            </div>

            {/* Toolbar: tabs + add button */}
            <div className="flex items-center justify-between gap-3">
              {/* Status tabs */}
              <div className="flex items-center gap-0.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-0.5">
                {STATUS_TABS.map((tab) => {
                  const active = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={cn(
                        "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                        active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="prize-status-tab"
                          className="absolute inset-0 rounded-md bg-zinc-800"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative flex items-center gap-1.5">
                        {tab.icon}
                        {tab.label}
                        <span className={cn(
                          "ml-0.5 rounded-full px-1.5 py-0 text-[9px] font-bold tabular-nums",
                          active ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800/60 text-zinc-600",
                        )}>
                          {tabCounts[tab.id]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {/* View public page */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview((v) => !v)}
                  className="hidden gap-1.5 text-xs text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300 lg:flex"
                >
                  <Eye size={12} />
                  {showPreview ? "Hide" : "Show"} preview
                </Button>

                {/* Add prize */}
                {canAddMore && (
                  <Button
                    size="sm"
                    onClick={openCreate}
                    className="group relative overflow-hidden bg-amber-500 text-xs font-semibold text-white hover:bg-amber-400 transition-all duration-200"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    <Plus size={13} />
                    Add prize
                  </Button>
                )}
                {!canAddMore && (
                  <Badge className="border-amber-500/25 bg-amber-500/10 text-[10px] text-amber-400">
                    Max {MAX_PRIZES} prizes reached
                  </Badge>
                )}
              </div>
            </div>

            {/* Prize list */}
            <AnimatePresence mode="popLayout">
              {filteredPrizes.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-800/60 py-16 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60">
                    <Trophy size={22} className="text-zinc-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      {statusFilter === "all"
                        ? "No prizes yet"
                        : `No ${statusFilter.toLowerCase()} prizes`}
                    </p>
                    <p className="mt-1 text-xs text-zinc-700">
                      {statusFilter === "ACTIVE"
                        ? "Announce your first prize to motivate referrals."
                        : "Nothing here yet."}
                    </p>
                  </div>
                  {statusFilter === "ACTIVE" && canAddMore && (
                    <Button
                      size="sm"
                      onClick={openCreate}
                      className="bg-amber-500 text-xs text-white hover:bg-amber-400"
                    >
                      <Plus size={13} />
                      Announce first prize
                    </Button>
                  )}
                </motion.div>
              ) : (
                filteredPrizes.map((prize, i) => (
                  <PrizeCard
                    key={prize.id}
                    prize={prize}
                    index={i}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onCancel={handleCancel}
                  />
                ))
              )}
            </AnimatePresence>

            {/* Link to public leaderboard */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/20 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Star size={12} className="text-amber-400" />
                Prizes are shown on the public leaderboard to motivate referrals
              </div>
              <Link href={`/dashboard/leaderboard/${selectedWlId}`}>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                  View leaderboard <ArrowUpRight size={11} />
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Right: public preview ────────────────────────── */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:flex lg:flex-col lg:gap-4"
              >
                <div className="sticky top-20 flex flex-col gap-4">
                  {/* Panel header */}
                  <div className="flex items-center gap-2">
                    <Eye size={12} className="text-zinc-700" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
                      Public prize board preview
                    </p>
                  </div>

                  {/* Browser chrome */}
                  <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-black/40">
                    <div className="flex items-center gap-2 border-b border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
                      <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                      </div>
                      <div className="flex-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5">
                        <p className="text-[9px] text-zinc-600">
                          launchforge.app/{selectedWl.slug}#prizes
                        </p>
                      </div>
                    </div>

                    <div className="relative overflow-hidden p-4">
                      {/* Background effects */}
                      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl" />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px]" />

                      <div className="relative flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Trophy size={13} className="text-amber-400" />
                          <p className="text-xs font-bold text-zinc-200">Prize Pool</p>
                          {prizePool > 0 && (
                            <Badge className="border-emerald-500/25 bg-emerald-500/10 text-[9px] text-emerald-400">
                              ${prizePool.toLocaleString()} total
                            </Badge>
                          )}
                        </div>

                        {activePrizes.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-800 py-8 text-center">
                            <p className="text-xs text-zinc-700">No prizes announced yet</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {activePrizes
                              .sort((a, b) => a.rankFrom - b.rankFrom)
                              .map((p) => (
                                <PrizePreviewCard key={p.id} prize={p} compact />
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[10px] text-zinc-700">
                    This is how participants see your prizes on the public waitlist page
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Drawer ────────────────────────────────────────────── */}
      <PrizeFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        waitlistId={selectedWlId}
        editPrize={editPrize}
        onSaved={handleSaved}
      />
    </div>
  );
}

function SummaryPill({
  icon, label, value, sub, accent,
}: { icon: React.ReactNode; label: string; value: string; sub: string; accent: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5", accent)}>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] text-zinc-600">{label}</p>
        <p className="text-base font-black tracking-tight tabular-nums text-zinc-100">{value}</p>
        <p className="text-[9px] text-zinc-700">{sub}</p>
      </div>
    </div>
  );
}
