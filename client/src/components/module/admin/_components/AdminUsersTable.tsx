"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search, MoreHorizontal, CheckCircle2, XCircle,
  UserX, ShieldAlert, Users, ExternalLink,
  Ban, Globe, MinusCircle,
} from "lucide-react";

import { Card } from "@/src/components/ui/card";
import { Input }  from "@/src/components/ui/input";
import { Badge }  from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import type { AdminUser } from "../_types";

const PLAN_BADGE: Record<string, string> = {
  FREE:   "border-zinc-700/60 bg-zinc-800/40 text-zinc-500",
  PRO:    "border-indigo-500/30 bg-indigo-500/12 text-indigo-400",
  GROWTH: "border-violet-500/30 bg-violet-500/12 text-violet-400",
};
const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  SUSPENDED: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  DELETED:   "border-red-500/25 bg-red-500/10 text-red-400",
  INACTIVE:  "border-zinc-700/60 bg-zinc-800/40 text-zinc-500",
};
const AVATAR_GRADS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
];

interface AdminUsersTableProps {
  users: AdminUser[];
}

export function AdminUsersTable({ users: initialUsers }: AdminUsersTableProps) {
  const [users,     setUsers]     = useState(initialUsers);
  const [search,    setSearch]    = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (planFilter !== "all") list = list.filter((u) => u.plan === planFilter);
    return list;
  }, [users, search, planFilter]);

  const toggleStatus = (id: string) => {
    setUsers((prev) => prev.map((u) =>
      u.id === id
        ? { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
        : u
    ));
  };

  return (
    <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900/40">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-zinc-800/60 bg-zinc-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="h-8 border-zinc-800 bg-zinc-900/60 pl-8 text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-0"
          />
        </div>

        {/* Plan filter */}
        <div className="flex items-center gap-1">
          {["all", "FREE", "PRO", "GROWTH"].map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                planFilter === p
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-600 hover:text-zinc-400",
              )}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="hidden grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 border-b border-zinc-800/60 bg-zinc-900/60 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 sm:grid">
        <div className="w-8" />
        <span>User</span>
        <span>Plan</span>
        <span className="w-20 text-right">Waitlists</span>
        <span className="w-24 text-right">Subscribers</span>
        <span>Status</span>
        <div className="w-8" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-800/40">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Users size={28} className="text-zinc-800" />
            <p className="text-sm text-zinc-600">No users match your search.</p>
          </div>
        ) : filtered.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.33, ease: [0.22, 1, 0.36, 1] }}
            className="group grid items-center gap-4 px-4 py-3 transition-colors hover:bg-zinc-900/40 sm:grid-cols-[auto_1fr_auto_auto_auto_auto_auto]"
          >
            {/* Avatar */}
            <Avatar className="h-8 w-8 shrink-0 rounded-lg">
              <AvatarFallback className={cn(
                "rounded-lg bg-linear-to-br text-[10px] font-bold text-white",
                AVATAR_GRADS[i % AVATAR_GRADS.length],
              )}>
                {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name + email */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium text-zinc-200">{user.name}</p>
                {user.role === "ADMIN" && (
                  <ShieldAlert size={11} className="shrink-0 text-red-400" />
                )}
                {user.role === "OWNER" && (
                  <Badge variant="outline" className="border-red-500/20 bg-red-500/10 px-1 py-0 text-[8px] font-bold text-red-400 uppercase">Owner</Badge>
                )}
              </div>
              <p className="truncate text-[11px] text-zinc-600">{user.email}</p>
            </div>

            {/* Plan */}
            <Badge variant="outline" className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", PLAN_BADGE[user.plan])}>
              {user.plan}
              {user.planMode && ` · ${user.planMode === "MONTHLY" ? "Mo" : "Yr"}`}
            </Badge>

            {/* Waitlists */}
            <div className="hidden items-center justify-end sm:flex">
              <span className="w-20 text-right text-xs font-medium tabular-nums text-zinc-400">{user.waitlists}</span>
            </div>

            {/* Subscribers */}
            <div className="hidden items-center justify-end sm:flex">
              <span className="w-24 text-right text-xs font-medium tabular-nums text-zinc-400">
                {user.subscribers.toLocaleString()}
              </span>
            </div>

            {/* Status */}
            <Badge variant="outline" className={cn("shrink-0 gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold", STATUS_BADGE[user.status])}>
              {user.status === "ACTIVE"    && <CheckCircle2 size={9} />}
              {user.status === "SUSPENDED" && <Ban          size={9} />}
              {user.status === "DELETED"   && <XCircle      size={9} />}
              {user.status === "INACTIVE"  && <MinusCircle  size={9} />}
              {user.status}
            </Badge>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="h-6 w-6 rounded-md text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800/60 hover:text-zinc-300"
                >
                  <MoreHorizontal size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
                <DropdownMenuItem className="gap-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60">
                  <ExternalLink size={12} />View profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60">
                  <Globe size={12} />View waitlists
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800/60" />
                <DropdownMenuItem
                  onClick={() => toggleStatus(user.id)}
                  className={cn(
                    "gap-2 text-xs",
                    user.status === "ACTIVE"
                      ? "text-amber-400 hover:bg-amber-500/8 focus:bg-amber-500/8"
                      : "text-emerald-400 hover:bg-emerald-500/8 focus:bg-emerald-500/8",
                  )}
                >
                  {user.status === "ACTIVE" ? <><UserX size={12} />Suspend user</> : <><CheckCircle2 size={12} />Reactivate user</>}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs text-red-400 hover:bg-red-500/8 focus:bg-red-500/8 focus:text-red-400">
                  <XCircle size={12} />Delete account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/60 bg-zinc-900/30 px-4 py-2.5">
        <p className="text-[11px] text-zinc-700">
          Showing {filtered.length} of {users.length} users
        </p>
      </div>
    </Card>
  );
}