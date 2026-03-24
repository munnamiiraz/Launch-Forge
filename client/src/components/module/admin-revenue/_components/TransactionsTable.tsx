"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, TrendingUp, TrendingDown, RefreshCw,
  XCircle, Plus, ArrowLeftRight, CheckCircle2,
  AlertCircle, Clock, ExternalLink,
} from "lucide-react";

import { Card } from "@/src/components/ui/card";
import { Input }  from "@/src/components/ui/input";
import { Badge }  from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";
import { getRecentTransactions } from "../_lib/revenue-data";
import { clientHttpClient } from "@/src/lib/axios/clientHttpClient";
import type { RecentTransaction } from "../_lib/revenue-data";

const TYPE_CONFIG: Record<RecentTransaction["type"], {
  label: string; icon: React.ReactNode; classes: string;
}> = {
  new:       { label: "New",       icon: <Plus          size={10} />, classes: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" },
  renewal:   { label: "Renewal",   icon: <RefreshCw     size={10} />, classes: "border-indigo-500/25 bg-indigo-500/10 text-indigo-400"  },
  upgrade:   { label: "Upgrade",   icon: <TrendingUp    size={10} />, classes: "border-violet-500/25 bg-violet-500/10 text-violet-400"  },
  downgrade: { label: "Downgrade", icon: <TrendingDown  size={10} />, classes: "border-amber-500/25 bg-amber-500/10 text-amber-400"    },
  cancel:    { label: "Cancel",    icon: <XCircle       size={10} />, classes: "border-zinc-700/60 bg-muted/40 text-muted-foreground/80"       },
  refund:    { label: "Refund",    icon: <ArrowLeftRight size={10}/>, classes: "border-red-500/25 bg-red-500/10 text-red-400"          },
};

const STATUS_CONFIG: Record<RecentTransaction["status"], {
  label: string; icon: React.ReactNode; classes: string;
}> = {
  paid:     { label: "Paid",     icon: <CheckCircle2 size={10} />, classes: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" },
  failed:   { label: "Failed",   icon: <AlertCircle  size={10} />, classes: "border-red-500/25 bg-red-500/10 text-red-400"            },
  refunded: { label: "Refunded", icon: <ArrowLeftRight size={10}/>, classes: "border-amber-500/25 bg-amber-500/10 text-amber-400"     },
  pending:  { label: "Pending",  icon: <Clock        size={10} />, classes: "border-zinc-700/60 bg-muted/40 text-muted-foreground/80"        },
};

const AVATAR_GRADS = [
  "from-indigo-500 to-violet-600", "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",     "from-violet-500 to-purple-600",
];

type TypeFilter = "all" | RecentTransaction["type"];

const TYPE_TABS: { id: TypeFilter; label: string }[] = [
  { id: "all",       label: "All"       },
  { id: "new",       label: "New"       },
  { id: "renewal",   label: "Renewals"  },
  { id: "upgrade",   label: "Upgrades"  },
  { id: "downgrade", label: "Downgrades"},
  { id: "refund",    label: "Refunds"   },
];

export function TransactionsTable({ allTx }: { allTx: RecentTransaction[] }) {
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [localTx, setLocalTx] = useState<RecentTransaction[]>(allTx ?? []);

  // Fetch transactions on mount if none provided
  useEffect(() => {
    if (!allTx || allTx.length === 0) {
      clientHttpClient
        .get<RecentTransaction[]>("/admin/revenue/transactions", { params: { type: "all", page: "1", limit: "20" } })
        .then((res) => setLocalTx(res.data ?? []))
        .catch(console.error);
    }
  }, [allTx]);

  const data = allTx && allTx.length > 0 ? allTx : localTx;

  const filtered = useMemo(() => {
    let list = data;
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.userName.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q) ||
        t.stripeId.toLowerCase().includes(q) ||
        t.plan.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, search, typeFilter]);

  const totalRevenue = filtered
    .filter((t) => t.status === "paid")
    .reduce((s, t) => s + t.amount, 0);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/25 to-transparent" />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border/60 bg-card/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, plan…"
              className="h-8 border-zinc-800 bg-card/60 pl-8 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <span className="font-semibold text-emerald-400">
              ${totalRevenue.toLocaleString()}
            </span>
            collected in filtered results
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="flex flex-wrap gap-0.5 rounded-lg border border-border/80 bg-card/40 p-0.5 w-fit">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
                typeFilter === tab.id
                  ? "bg-zinc-800 text-foreground/90"
                  : "text-muted-foreground/60 hover:text-muted-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div className="hidden grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 border-b border-border/60 bg-card/60 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 sm:grid">
        <div className="w-7" />
        <span>Customer</span>
        <span>Plan</span>
        <span>Type</span>
        <span className="text-right">Amount</span>
        <span>Status</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/40">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 py-12 text-center"
            >
              <RefreshCw size={26} className="text-zinc-800" />
              <p className="text-sm text-muted-foreground/60">No transactions match your filters.</p>
            </motion.div>
          ) : filtered.map((tx, i) => {
            const typeCfg   = TYPE_CONFIG[tx.type];
            const statusCfg = STATUS_CONFIG[tx.status];
            const grad      = AVATAR_GRADS[i % AVATAR_GRADS.length];
            const initials  = tx.userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

            return (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group grid items-center gap-4 px-4 py-3 transition-colors hover:bg-card/40 sm:grid-cols-[auto_1fr_auto_auto_auto_auto]"
              >
                {/* Avatar */}
                <Avatar className="h-7 w-7 shrink-0 rounded-lg">
                  <AvatarFallback className={cn("rounded-lg bg-linear-to-br text-[9px] font-bold text-white", grad)}>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Customer info */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground/90">{tx.userName}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                    <span className="truncate">{tx.userEmail}</span>
                    <span className="shrink-0">·</span>
                    <span className="shrink-0">{fmtDate(tx.date)}</span>
                    <span className="shrink-0 font-mono opacity-60">{tx.stripeId}</span>
                  </div>
                </div>

                {/* Plan */}
                <Badge className="hidden shrink-0 border-zinc-700/60 bg-muted/40 px-2 text-[10px] text-muted-foreground sm:inline-flex">
                  {tx.plan}
                </Badge>

                {/* Type */}
                <Badge className={cn("hidden shrink-0 gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline-flex", typeCfg.classes)}>
                  {typeCfg.icon}{typeCfg.label}
                </Badge>

                {/* Amount */}
                <span className={cn(
                  "hidden text-right text-sm font-black tabular-nums sm:block",
                  tx.status === "refunded" ? "text-red-400 line-through" :
                  tx.amount === 0          ? "text-muted-foreground/60" :
                                             "text-foreground/90",
                )}>
                  {tx.amount > 0 ? `$${tx.amount}` : "—"}
                </span>

                {/* Status */}
                <Badge className={cn("hidden shrink-0 gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold sm:inline-flex", statusCfg.classes)}>
                  {statusCfg.icon}{statusCfg.label}
                </Badge>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/60 bg-card/30 px-4 py-2.5">
        <p className="text-[11px] text-muted-foreground/40">
          Showing {filtered.length} of {data.length} transactions
        </p>
        <p className="text-[10px] text-muted-foreground/40">
          Data from <span className="text-muted-foreground/80">Payment</span> model · Stripe source of truth
        </p>
      </div>
    </Card>
  );
}