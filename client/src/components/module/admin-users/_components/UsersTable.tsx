"use client";

import { useState, useMemo, useCallback, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  MoreHorizontal, CheckCircle2, Ban, XCircle,
  ShieldAlert, UserX, Trash2, Crown,
  Users, Globe, Layers, UserCheck,
  ChevronLeft, ChevronRight, UserPlus,
  Loader2,
} from "lucide-react";

import { Card }   from "@/src/components/ui/card";
import { Input }  from "@/src/components/ui/input";
import { Badge }  from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
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
import { 
  bulkSuspendAction, bulkDeleteAction, 
  suspendUserAction, reactivateUserAction,
  promoteToAdminAction, demoteFromAdminAction, deleteUserAction
} from "@/src/services/admin-users/users.actions";
import type { AdminUser } from "@/src/components/module/admin/_types";
import type { SortField, SortDir, StatusFilter, PlanFilter } from "@/src/components/module/admin-users/_lib/users-data";

const PLAN_BADGE: Record<string, string> = {
  FREE:   "border-zinc-700/60 bg-muted/40 text-muted-foreground/80",
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
  if (field !== active) return <ArrowUpDown size={11} className="text-muted-foreground/40" />;
  return dir === "asc"
    ? <ArrowUp   size={11} className="text-red-400" />
    : <ArrowDown size={11} className="text-red-400" />;
}

interface UsersTableProps {
  users: AdminUser[];
  meta: {
    total:           number;
    page:            number;
    limit:           number;
    totalPages:      number;
    hasNextPage:     boolean;
    hasPreviousPage: boolean;
  };
  currentQuery: {
    page:      number;
    limit:     number;
    search:    string;
    status:    StatusFilter;
    plan:      PlanFilter;
    sortBy:    SortField;
    sortOrder: SortDir;
  };
}

export function UsersTable({ users: initialUsers, meta, currentQuery }: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [bulkPending, startBulkTx] = useTransition();

  // URL State helpers
  const updateUrl = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    });
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  // Sync state when props change
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Handle pagination/sorting/filtering
  const handlePageChange = (p: number) => updateUrl({ page: p });
  const handleSearch = (s: string) => updateUrl({ search: s, page: 1 });
  const handleStatus = (s: StatusFilter) => updateUrl({ status: s, page: 1 });
  const handlePlan = (p: PlanFilter) => updateUrl({ plan: p, page: 1 });
  const handleSort = (field: SortField) => {
    const order = (field === currentQuery.sortBy && currentQuery.sortOrder === "desc") ? "asc" : "desc";
    updateUrl({ sortBy: field, sortOrder: order, page: 1 });
  };

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allPageSelected = users.length > 0 && users.every((u) => selected.has(u.id));
  
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) users.forEach((u) => next.delete(u.id));
      else users.forEach((u) => next.add(u.id));
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

  // Drawer
  const [drawerUser,  setDrawerUser]  = useState<AdminUser | null>(null);
  const [drawerIndex, setDrawerIndex] = useState(0);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);

  const openDrawer = useCallback((user: AdminUser, idx: number) => {
    setDrawerUser(user);
    setDrawerIndex(idx);
    setDrawerOpen(true);
  }, []);

  /* ── Callbacks from drawer ──────────────────────────────────── */
  const handleUserUpdated = (updated: AdminUser) => {
    setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
    setDrawerUser(updated);
  };
  const handleUserDeleted = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  /* ── Single Actions ─────────────────────────────────────────── */
  const onSuspend = async (user: AdminUser) => {
    const r = await suspendUserAction(user.id);
    if (r.success) handleUserUpdated({ ...user, status: "SUSPENDED" });
  };
  const onReactivate = async (user: AdminUser) => {
    const r = await reactivateUserAction(user.id);
    if (r.success) handleUserUpdated({ ...user, status: "ACTIVE" });
  };
  const onPromote = async (user: AdminUser) => {
    const r = await promoteToAdminAction(user.id);
    if (r.success) handleUserUpdated({ ...user, role: "ADMIN" });
  };
  const onDemote = async (user: AdminUser) => {
    const r = await demoteFromAdminAction(user.id);
    if (r.success) handleUserUpdated({ ...user, role: "USER" });
  };
  const onDelete = async (user: AdminUser) => {
    const r = await deleteUserAction(user.id);
    if (r.success) handleUserDeleted(user.id);
  };

  /* ── Bulk actions ───────────────────────────────────────────── */
  const handleBulkSuspend = () => {
    const ids = [...selected];
    startBulkTx(async () => {
      const r = await bulkSuspendAction(ids);
      if (r.success) {
        setUsers((prev) => prev.map((u) => ids.includes(u.id) ? { ...u, status: "SUSPENDED" as const } : u));
        setSelected(new Set());
      }
    });
  };
  const handleBulkDelete = () => {
    const ids = [...selected];
    startBulkTx(async () => {
      const r = await bulkDeleteAction(ids);
      if (r.success) {
        setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
        setSelected(new Set());
      }
    });
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col gap-4">

        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status tabs */}
            <div className="flex items-center gap-0.5 rounded-lg border border-border/80 bg-card/40 p-0.5">
              {STATUS_TABS.map((tab) => {
                const active = currentQuery.status === tab.id;
                return (
                  <button
                    key={tab.id}
                    disabled={isPending}
                    onClick={() => handleStatus(tab.id)}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 disabled:opacity-50",
                      active ? "text-foreground" : "text-muted-foreground/80 hover:text-foreground/80",
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
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Invite button */}
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => setInviteOpen(true)}
              className="group relative overflow-hidden bg-red-600 text-xs font-semibold text-white hover:bg-red-500 transition-all"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <UserPlus size={13} />
              Invite user
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                defaultValue={currentQuery.search}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(e.currentTarget.value);
                }}
                disabled={isPending}
                placeholder="Search and press Enter…"
                className="h-9 border-zinc-800 bg-card/60 pl-8 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-0"
              />
              {isPending && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                   <Loader2 size={12} className="animate-spin text-muted-foreground/60" />
                </div>
              )}
            </div>

            {/* Plan filter */}
            <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card/40 p-1">
              {(["ALL", "FREE", "PRO", "GROWTH"] as PlanFilter[]).map((p) => (
                <button
                  key={p}
                  disabled={isPending}
                  onClick={() => handlePlan(p)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-50",
                    currentQuery.plan === p ? "bg-zinc-800 text-foreground/90" : "text-muted-foreground/60 hover:text-muted-foreground",
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
              className="flex items-center justify-between rounded-xl border border-zinc-700/60 bg-card/60 px-4 py-2.5"
            >
              <span className="text-xs font-semibold text-foreground/80">
                {selected.size} user{selected.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm" variant="outline" disabled={bulkPending}
                  onClick={handleBulkSuspend}
                  className="gap-1.5 border-amber-500/20 bg-transparent text-xs text-amber-400 hover:bg-amber-500/8"
                >
                  {bulkPending ? <Loader2 size={11} className="animate-spin" /> : <Ban size={11} />}
                  Suspend all
                </Button>
                <Button
                  size="sm" variant="outline" disabled={bulkPending}
                  onClick={handleBulkDelete}
                  className="gap-1.5 border-red-500/20 bg-transparent text-xs text-red-400 hover:bg-red-500/8"
                >
                  {bulkPending ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                  Delete all
                </Button>
                <Button
                  size="sm" variant="ghost" disabled={bulkPending}
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-muted-foreground/60 hover:bg-muted/60"
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table ────────────────────────────────────────── */}
        <Card className="relative overflow-hidden border-border/80 bg-card/40">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

          {/* Column headers */}
          <div className="hidden grid-cols-[32px_24px_1fr_auto_auto_auto_auto_auto_32px] gap-3 border-b border-border/60 bg-card/60 px-4 py-2.5 sm:grid">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={toggleAll}
                className="h-3.5 w-3.5 rounded border-zinc-700 accent-red-500 cursor-pointer"
              />
            </div>
            <div />
            <button disabled={isPending} onClick={() => handleSort("name")} className="flex items-center gap-1 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground disabled:opacity-50">
              User <SortIcon field="name" active={currentQuery.sortBy} dir={currentQuery.sortOrder} />
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 text-right">Plan</span>
            <button disabled={isPending} onClick={() => handleSort("waitlists")} className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground tabular-nums disabled:opacity-50">
              Waitlists <SortIcon field="waitlists" active={currentQuery.sortBy} dir={currentQuery.sortOrder} />
            </button>
            <button disabled={isPending} onClick={() => handleSort("subscribers")} className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground tabular-nums disabled:opacity-50">
              Subscribers <SortIcon field="subscribers" active={currentQuery.sortBy} dir={currentQuery.sortOrder} />
            </button>
            <button disabled={isPending} onClick={() => handleSort("createdAt")} className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground disabled:opacity-50">
              Joined <SortIcon field="createdAt" active={currentQuery.sortBy} dir={currentQuery.sortOrder} />
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 text-center">Status</span>
            <div />
          </div>

          <div className="divide-y divide-border/40 min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {users.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 py-32 text-center"
                >
                  <Users size={32} className="text-zinc-800" />
                  <p className="text-sm text-muted-foreground/60">No users found matching your criteria.</p>
                </motion.div>
              ) : users.map((user, i) => {
                const globalIdx = (currentQuery.page - 1) * currentQuery.limit + i;
                const isSelected = selected.has(user.id);
                const grad = AVATAR_GRADS[globalIdx % AVATAR_GRADS.length];
                const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.02, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "group grid items-center gap-3 px-4 py-3 transition-colors",
                      "grid-cols-[32px_24px_1fr] sm:grid-cols-[32px_24px_1fr_auto_auto_auto_auto_auto_32px]",
                      isSelected ? "bg-red-500/5" : "hover:bg-card/40",
                      isPending && "opacity-60 grayscale-[0.5]"
                    )}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(user.id)}
                        className="h-3.5 w-3.5 rounded border-zinc-700 accent-red-500 cursor-pointer"
                      />
                    </div>

                    <Avatar className="h-7 w-7 shrink-0 rounded-lg">
                      {user.image && <AvatarImage src={user.image} alt={user.name} className="object-cover" />}
                      <AvatarFallback className={cn("rounded-lg bg-gradient-to-br text-[9px] font-bold text-white", grad)}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      onClick={() => openDrawer(user, globalIdx)}
                      className="flex min-w-0 flex-col items-start text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                          {user.name}
                        </span>
                        {user.role === "ADMIN" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ShieldAlert size={11} className="shrink-0 text-red-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80">
                              Admin
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <span className="truncate text-[11px] text-muted-foreground/60">{user.email}</span>
                    </div>

                    <Badge variant="outline" className={cn("hidden shrink-0 w-20 justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline-flex", PLAN_BADGE[user.plan])}>
                      {user.plan}{user.planMode ? ` · ${user.planMode === "MONTHLY" ? "Mo" : "Yr"}` : ""}
                    </Badge>

                    <div className="hidden items-center justify-end sm:flex">
                      <span className="w-20 text-right text-xs font-medium tabular-nums text-muted-foreground">
                        {user.waitlists}
                      </span>
                    </div>

                    <div className="hidden items-center justify-end sm:flex">
                      <span className="w-20 text-right text-xs tabular-nums text-muted-foreground/80">
                        {user.subscribers.toLocaleString()}
                      </span>
                    </div>

                    <span className="hidden w-20 justify-end text-right text-xs tabular-nums text-muted-foreground/60 sm:flex">
                      {fmtDate(user.createdAt)}
                    </span>

                    <Badge variant="outline" className={cn("hidden shrink-0 w-20 justify-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold sm:inline-flex", STATUS_BADGE[user.status])}>
                      {user.status === "ACTIVE"    && <CheckCircle2 size={9} />}
                      {user.status === "SUSPENDED" && <Ban          size={9} />}
                      {user.status === "DELETED"   && <XCircle      size={9} />}
                      {user.status}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="hidden h-6 w-6 rounded-md text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted/60 hover:text-foreground/80 sm:flex"
                        >
                          <MoreHorizontal size={12} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 border-zinc-800 bg-background/95 backdrop-blur-xl">
                        <DropdownMenuItem
                          onClick={() => openDrawer(user, globalIdx)}
                          className="gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60 cursor-pointer"
                        >
                          <Users size={12} />View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted/60" />
                        {user.status === "ACTIVE" ? (
                          <DropdownMenuItem
                            onClick={() => onSuspend(user)}
                            className="gap-2 text-xs text-amber-400 hover:bg-amber-500/8 focus:bg-amber-500/8 cursor-pointer"
                          >
                            <UserX size={12} />Suspend
                          </DropdownMenuItem>
                        ) : user.status === "SUSPENDED" ? (
                          <DropdownMenuItem
                            onClick={() => onReactivate(user)}
                            className="gap-2 text-xs text-emerald-400 hover:bg-emerald-500/8 focus:bg-emerald-500/8 cursor-pointer"
                          >
                            <CheckCircle2 size={12} />Reactivate
                          </DropdownMenuItem>
                        ) : null}
                        {user.role === "USER" ? (
                          <DropdownMenuItem onClick={() => onPromote(user)} className="gap-2 text-xs text-muted-foreground hover:bg-muted/60 focus:bg-muted/60 cursor-pointer">
                            <Crown size={12} />Promote to admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onDemote(user)} className="gap-2 text-xs text-muted-foreground hover:bg-muted/60 focus:bg-muted/60 cursor-pointer">
                            <ShieldAlert size={12} />Remove admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-muted/60" />
                        <DropdownMenuItem onClick={() => onDelete(user)} className="gap-2 text-xs text-red-400 hover:bg-red-500/8 focus:bg-red-500/8 focus:text-red-400 cursor-pointer">
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
          <div className="flex items-center justify-between border-t border-border/60 bg-card/30 px-4 py-3">
            <p className="text-[11px] text-muted-foreground/60">
              Showing <span className="font-semibold text-muted-foreground">{Math.min((meta.page - 1) * meta.limit + 1, meta.total)}–{Math.min(meta.page * meta.limit, meta.total)}</span>{" "}
              of <span className="font-semibold text-muted-foreground">{meta.total}</span> users
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon" disabled={!meta.hasPreviousPage || isPending}
                onClick={() => handlePageChange(meta.page - 1)}
                className="h-7 w-7 rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 disabled:opacity-30"
              >
                <ChevronLeft size={13} />
              </Button>

              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                const p = meta.totalPages <= 5 ? i + 1
                  : meta.page <= 3 ? i + 1
                  : meta.page >= meta.totalPages - 2 ? meta.totalPages - 4 + i
                  : meta.page - 2 + i;
                return (
                  <Button
                    key={p}
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => handlePageChange(p)}
                    className={cn(
                      "h-7 w-7 rounded-md text-xs font-medium",
                      p === meta.page
                        ? "bg-red-600 text-white hover:bg-red-500"
                        : "text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground/80",
                    )}
                  >
                    {p}
                  </Button>
                );
              })}

              <Button
                variant="ghost" size="icon" disabled={!meta.hasNextPage || isPending}
                onClick={() => handlePageChange(meta.page + 1)}
                className="h-7 w-7 rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 disabled:opacity-30"
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