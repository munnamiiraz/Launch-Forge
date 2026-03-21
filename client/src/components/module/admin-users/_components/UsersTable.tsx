"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  MoreHorizontal, CheckCircle2, Ban, XCircle,
  ShieldAlert, UserX, Trash2, Crown,
  Users, Globe, Layers, UserCheck,
  ChevronLeft, ChevronRight, UserPlus,
} from "lucide-react";

import { Card }   from "@/src/components/ui/card";
import { Input }  from "@/src/components/ui/input";
import { Badge }  from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Separator }  from "@/src/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn }  from "@/src/lib/utils";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { InviteUserModal }  from "./InviteUserModal";
import { bulkSuspendAction, bulkDeleteAction } from "@/src/services/admin-users/users.actions";
import type { AdminUser } from "@/src/components/module/admin/_types";
import type { SortField, SortDir, StatusFilter, PlanFilter } from "@/src/components/module/admin-users/_lib/users-data";

const PAGE_SIZE = 10;

const PLAN_BADGE: Record<string, string> = {
  FREE:   "border-zinc-700/60 bg-zinc-800/40 text-zinc-500",
  PRO:    "border-indigo-500/30 bg-indigo-500/12 text-indigo-400",
  GROWTH: "border-violet-500/30 bg-violet-500/12 text-violet-400",
};
const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  SUSPENDED: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  DELETED:   "border-red-500/25 bg-red-500/10 text-red-400",
};
const AVATAR_GRADS = [
  "from-indigo-500 to-violet-600", "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",     "from-violet-500 to-purple-600",
  "from-zinc-500 to-zinc-600",     "from-orange-600 to-red-600",
];

const STATUS_TABS: { id: StatusFilter; label: string; icon: React.ReactNode }[] = [
  { id: "ALL",       label: "All",       icon: <Layers      size={12} /> },
  { id: "ACTIVE",    label: "Active",    icon: <UserCheck   size={12} /> },
  { id: "SUSPENDED", label: "Suspended", icon: <Ban         size={12} /> },
  { id: "DELETED",   label: "Deleted",   icon: <XCircle     size={12} /> },
];

function SortIcon({ field, active, dir }: { field: SortField; active: SortField; dir: SortDir }) {
  if (field !== active) return <ArrowUpDown size={11} className="text-zinc-700" />;
  return dir === "asc"
    ? <ArrowUp   size={11} className="text-red-400" />
    : <ArrowDown size={11} className="text-red-400" />;
}

interface UsersTableProps {
  users: AdminUser[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users,     setUsers]     = useState<AdminUser[]>(initialUsers);
  const [search,    setSearch]    = useState("");
  const [statusTab, setStatusTab] = useState<StatusFilter>("ALL");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("ALL");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir,   setSortDir]   = useState<SortDir>("desc");
  const [page,      setPage]      = useState(1);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Drawer
  const [drawerUser,  setDrawerUser]  = useState<AdminUser | null>(null);
  const [drawerIndex, setDrawerIndex] = useState(0);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);

  // Bulk actions
  const [bulkPending, startBulkTx] = useTransition();

  /* ── Derived ─────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = [...users];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q),
      );
    }

    // Status tab
    if (statusTab !== "ALL") list = list.filter((u) => u.status === statusTab);

    // Plan
    if (planFilter !== "ALL") list = list.filter((u) => u.plan === planFilter);

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name")         cmp = a.name.localeCompare(b.name);
      if (sortField === "createdAt")    cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortField === "lastActiveAt") {
        const ta = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        const tb = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        cmp = ta - tb;
      }
      if (sortField === "subscribers")  cmp = a.subscribers  - b.subscribers;
      if (sortField === "waitlists")    cmp = a.waitlists    - b.waitlists;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [users, search, statusTab, planFilter, sortField, sortDir]);

  // Status tab counts
  const tabCounts = useMemo(() => ({
    ALL:       users.length,
    ACTIVE:    users.filter((u) => u.status === "ACTIVE").length,
    SUSPENDED: users.filter((u) => u.status === "SUSPENDED").length,
    DELETED:   users.filter((u) => u.status === "DELETED").length,
  }), [users]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
    setPage(1);
  };

  const openDrawer = useCallback((user: AdminUser, idx: number) => {
    setDrawerUser(user);
    setDrawerIndex(idx);
    setDrawerOpen(true);
  }, []);

  /* ── Selection ─────────────────────────────────────────────── */
  const allPageSelected = paginated.length > 0 && paginated.every((u) => selected.has(u.id));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) paginated.forEach((u) => next.delete(u.id));
      else paginated.forEach((u) => next.add(u.id));
      return next;
    });
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── Callbacks from drawer ──────────────────────────────────── */
  const handleUserUpdated = (updated: AdminUser) => {
    setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
    setDrawerUser(updated);
  };
  const handleUserDeleted = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "DELETED" as const, isDeleted: true } : u));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  /* ── Bulk actions ───────────────────────────────────────────── */
  const handleBulkSuspend = () => {
    const ids = [...selected];
    startBulkTx(async () => {
      await bulkSuspendAction(ids);
      setUsers((prev) => prev.map((u) => ids.includes(u.id) ? { ...u, status: "SUSPENDED" as const } : u));
      setSelected(new Set());
    });
  };
  const handleBulkDelete = () => {
    const ids = [...selected];
    startBulkTx(async () => {
      await bulkDeleteAction(ids);
      setUsers((prev) => prev.map((u) => ids.includes(u.id) ? { ...u, status: "DELETED" as const, isDeleted: true } : u));
      setSelected(new Set());
    });
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col gap-4">

        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* Row 1: status tabs + invite */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status tabs */}
            <div className="flex items-center gap-0.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-0.5">
              {STATUS_TABS.map((tab) => {
                const active = statusTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setStatusTab(tab.id); setPage(1); setSelected(new Set()); }}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                      active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="users-status-tab"
                        className="absolute inset-0 rounded-md bg-zinc-800"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      {tab.icon}
                      {tab.label}
                      <span className={cn(
                        "rounded-full px-1.5 py-0 text-[9px] font-bold tabular-nums",
                        active ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800/60 text-zinc-600",
                      )}>
                        {tabCounts[tab.id]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Invite button */}
            <Button
              size="sm"
              onClick={() => setInviteOpen(true)}
              className="group relative overflow-hidden bg-red-600 text-xs font-semibold text-white hover:bg-red-500 transition-all"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <UserPlus size={13} />
              Invite user
            </Button>
          </div>

          {/* Row 2: search + plan filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email or ID…"
                className="h-9 border-zinc-800 bg-zinc-900/60 pl-8 text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-0"
              />
            </div>

            {/* Plan filter */}
            <div className="flex items-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-1">
              {(["ALL", "FREE", "PRO", "GROWTH"] as PlanFilter[]).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPlanFilter(p); setPage(1); }}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                    planFilter === p ? "bg-zinc-800 text-zinc-200" : "text-zinc-600 hover:text-zinc-400",
                  )}
                >
                  {p === "ALL" ? "All plans" : p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bulk action bar ──────────────────────────────── */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2.5"
            >
              <span className="text-xs font-semibold text-zinc-300">
                {selected.size} user{selected.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm" variant="outline" disabled={bulkPending}
                  onClick={handleBulkSuspend}
                  className="gap-1.5 border-amber-500/20 bg-transparent text-xs text-amber-400 hover:bg-amber-500/8"
                >
                  <Ban size={11} />Suspend all
                </Button>
                <Button
                  size="sm" variant="outline" disabled={bulkPending}
                  onClick={handleBulkDelete}
                  className="gap-1.5 border-red-500/20 bg-transparent text-xs text-red-400 hover:bg-red-500/8"
                >
                  <Trash2 size={11} />Delete all
                </Button>
                <Button
                  size="sm" variant="ghost" disabled={bulkPending}
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-zinc-600 hover:bg-zinc-800/60"
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table ────────────────────────────────────────── */}
        <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

          {/* Column headers */}
          <div className="hidden grid-cols-[32px_24px_1fr_auto_auto_auto_auto_auto_32px] gap-3 border-b border-zinc-800/60 bg-zinc-900/60 px-4 py-2.5 sm:grid">
            {/* Select all */}
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={toggleAll}
                className="h-3.5 w-3.5 rounded border-zinc-700 accent-red-500 cursor-pointer"
              />
            </div>
            <div />
            {/* Sortable: Name */}
            <button onClick={() => handleSort("name")} className="flex items-center gap-1 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-600 hover:text-zinc-400">
              User <SortIcon field="name" active={sortField} dir={sortDir} />
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Plan</span>
            {/* Sortable: Waitlists */}
            <button onClick={() => handleSort("waitlists")} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 hover:text-zinc-400 tabular-nums">
              Waitlists <SortIcon field="waitlists" active={sortField} dir={sortDir} />
            </button>
            {/* Sortable: Subscribers */}
            <button onClick={() => handleSort("subscribers")} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 hover:text-zinc-400 tabular-nums">
              Subscribers <SortIcon field="subscribers" active={sortField} dir={sortDir} />
            </button>
            {/* Sortable: Joined */}
            <button onClick={() => handleSort("createdAt")} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 hover:text-zinc-400">
              Joined <SortIcon field="createdAt" active={sortField} dir={sortDir} />
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Status</span>
            <div />
          </div>

          {/* Rows */}
          <div className="divide-y divide-zinc-800/40">
            <AnimatePresence mode="popLayout">
              {paginated.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 py-16 text-center"
                >
                  <Users size={32} className="text-zinc-800" />
                  <p className="text-sm text-zinc-600">No users match your filters.</p>
                </motion.div>
              ) : paginated.map((user, i) => {
                const globalIdx  = (page - 1) * PAGE_SIZE + i;
                const isSelected = selected.has(user.id);
                const grad       = AVATAR_GRADS[globalIdx % AVATAR_GRADS.length];
                const initials   = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.03, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "group grid items-center gap-3 px-4 py-3 transition-colors",
                      "grid-cols-[32px_24px_1fr] sm:grid-cols-[32px_24px_1fr_auto_auto_auto_auto_auto_32px]",
                      isSelected ? "bg-red-500/5" : "hover:bg-zinc-900/40",
                    )}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(user.id)}
                        className="h-3.5 w-3.5 rounded border-zinc-700 accent-red-500 cursor-pointer"
                      />
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-7 w-7 shrink-0 rounded-lg">
                      <AvatarFallback className={cn("rounded-lg bg-gradient-to-br text-[9px] font-bold text-white", grad)}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name + email */}
                    <button
                      onClick={() => openDrawer(user, globalIdx)}
                      className="flex min-w-0 flex-col items-start text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                          {user.name}
                        </span>
                        {user.role === "ADMIN" && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ShieldAlert size={11} className="shrink-0 text-red-400" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
                              Admin
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <span className="truncate text-[11px] text-zinc-600">{user.email}</span>
                    </button>

                    {/* Plan */}
                    <Badge variant="outline" className={cn("hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline-flex", PLAN_BADGE[user.plan])}>
                      {user.plan}{user.planMode ? ` · ${user.planMode === "MONTHLY" ? "Mo" : "Yr"}` : ""}
                    </Badge>

                    {/* Waitlists */}
                    <div className="hidden items-center justify-end sm:flex">
                      <span className="w-16 text-right text-xs font-medium tabular-nums text-zinc-400">
                        {user.waitlists}
                      </span>
                    </div>

                    {/* Subscribers */}
                    <div className="hidden items-center justify-end sm:flex">
                      <span className="w-24 text-right text-xs tabular-nums text-zinc-500">
                        {user.subscribers.toLocaleString()}
                      </span>
                    </div>

                    {/* Joined */}
                    <span className="hidden text-xs tabular-nums text-zinc-600 sm:block">
                      {fmtDate(user.createdAt)}
                    </span>

                    {/* Status */}
                    <Badge variant="outline" className={cn("hidden shrink-0 gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold sm:inline-flex", STATUS_BADGE[user.status])}>
                      {user.status === "ACTIVE"    && <CheckCircle2 size={9} />}
                      {user.status === "SUSPENDED" && <Ban          size={9} />}
                      {user.status === "DELETED"   && <XCircle      size={9} />}
                      {user.status}
                    </Badge>

                    {/* Row actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="hidden h-6 w-6 rounded-md text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800/60 hover:text-zinc-300 sm:flex"
                        >
                          <MoreHorizontal size={12} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
                        <DropdownMenuItem
                          onClick={() => openDrawer(user, globalIdx)}
                          className="gap-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60"
                        >
                          <Users size={12} />View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800/60" />
                        {user.status === "ACTIVE" ? (
                          <DropdownMenuItem
                            onClick={() => {
                              const updated = { ...user, status: "SUSPENDED" as const };
                              setUsers((prev) => prev.map((u) => u.id === user.id ? updated : u));
                            }}
                            className="gap-2 text-xs text-amber-400 hover:bg-amber-500/8 focus:bg-amber-500/8"
                          >
                            <UserX size={12} />Suspend
                          </DropdownMenuItem>
                        ) : user.status === "SUSPENDED" ? (
                          <DropdownMenuItem
                            onClick={() => {
                              const updated = { ...user, status: "ACTIVE" as const };
                              setUsers((prev) => prev.map((u) => u.id === user.id ? updated : u));
                            }}
                            className="gap-2 text-xs text-emerald-400 hover:bg-emerald-500/8 focus:bg-emerald-500/8"
                          >
                            <CheckCircle2 size={12} />Reactivate
                          </DropdownMenuItem>
                        ) : null}
                        {user.role === "USER" ? (
                          <DropdownMenuItem className="gap-2 text-xs text-zinc-400 hover:bg-zinc-800/60 focus:bg-zinc-800/60">
                            <Crown size={12} />Promote to admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="gap-2 text-xs text-zinc-400 hover:bg-zinc-800/60 focus:bg-zinc-800/60">
                            <ShieldAlert size={12} />Remove admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-zinc-800/60" />
                        <DropdownMenuItem className="gap-2 text-xs text-red-400 hover:bg-red-500/8 focus:bg-red-500/8 focus:text-red-400">
                          <Trash2 size={12} />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Pagination ────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-zinc-800/60 bg-zinc-900/30 px-4 py-3">
            <p className="text-[11px] text-zinc-600">
              Showing <span className="font-semibold text-zinc-400">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</span>{" "}
              of <span className="font-semibold text-zinc-400">{filtered.length}</span> users
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon" disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 w-7 rounded-md text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300 disabled:opacity-30"
              >
                <ChevronLeft size={13} />
              </Button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1
                  : page <= 3 ? i + 1
                  : page >= totalPages - 2 ? totalPages - 4 + i
                  : page - 2 + i;
                return (
                  <Button
                    key={p}
                    variant="ghost"
                    size="icon"
                    onClick={() => setPage(p)}
                    className={cn(
                      "h-7 w-7 rounded-md text-xs font-medium",
                      p === page
                        ? "bg-red-600 text-white hover:bg-red-500"
                        : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300",
                    )}
                  >
                    {p}
                  </Button>
                );
              })}

              <Button
                variant="ghost" size="icon" disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 w-7 rounded-md text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300 disabled:opacity-30"
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        </Card>

        {/* ── Drawer + modal ────────────────────────────── */}
        <UserDetailDrawer
          user={drawerUser}
          index={drawerIndex}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onUpdated={handleUserUpdated}
          onDeleted={handleUserDeleted}
        />
        <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      </div>
    </TooltipProvider>
  );
}