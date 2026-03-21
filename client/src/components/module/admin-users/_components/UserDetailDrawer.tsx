"use client";

import { useTransition, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mail, Globe, Calendar, Clock, Shield,
  Users, Share2, MessageSquare, CreditCard,
  CheckCircle2, Ban, Trash2, Crown, UserMinus,
  Loader2, AlertCircle,
} from "lucide-react";

import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/src/components/ui/sheet";
import { Button }    from "@/src/components/ui/button";
import { Badge }     from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { cn } from "@/src/lib/utils";
import {
  suspendUserAction, reactivateUserAction, deleteUserAction,
  promoteToAdminAction, demoteFromAdminAction,
} from "@/src/services/admin-users/users.actions";
import type { AdminUser } from "@/src/components/module/admin/_types";

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
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

interface UserDetailDrawerProps {
  user:      AdminUser | null;
  index:     number;
  open:      boolean;
  onClose:   () => void;
  onUpdated: (updated: AdminUser) => void;
  onDeleted: (id: string) => void;
}

export function UserDetailDrawer({
  user, index, open, onClose, onUpdated, onDeleted,
}: UserDetailDrawerProps) {
  const [isPending,   startTx]         = useTransition();
  const [confirmDel,  setConfirmDel]   = useState(false);
  const [actionMsg,   setActionMsg]    = useState<{ type: "ok" | "err"; text: string } | null>(null);

  if (!user) return null;

  const gradient = AVATAR_GRADS[index % AVATAR_GRADS.length];
  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const act = async (fn: () => Promise<{ success: boolean; message: string }>, update: Partial<AdminUser>) => {
    setActionMsg(null);
    startTx(async () => {
      const r = await fn();
      if (r.success) {
        setActionMsg({ type: "ok", text: r.message });
        onUpdated({ ...user, ...update });
        setTimeout(() => setActionMsg(null), 2500);
      } else {
        setActionMsg({ type: "err", text: r.message });
      }
    });
  };

  const handleDelete = () => {
    startTx(async () => {
      const r = await deleteUserAction(user.id);
      if (r.success) { onDeleted(user.id); onClose(); }
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden border-zinc-800/80 bg-zinc-950 p-0 sm:max-w-[480px]"
        >
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          {/* Header */}
          <SheetHeader className="border-b border-zinc-800/60 px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 rounded-xl">
                  <AvatarFallback className={cn("rounded-xl bg-gradient-to-br text-sm font-black text-white", gradient)}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-base font-semibold text-zinc-100">
                      {user.name}
                    </SheetTitle>
                    {user.role === "ADMIN" && (
                      <Badge className="border-red-500/30 bg-red-500/12 px-1.5 py-0 text-[9px] text-red-400">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost" size="icon"
                onClick={onClose}
                className="h-7 w-7 shrink-0 rounded-lg text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300"
              >
                <X size={14} />
              </Button>
            </div>

            {/* Status + plan badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("gap-1 rounded-full px-2.5 text-[10px] font-semibold", STATUS_BADGE[user.status])}>
                {user.status === "ACTIVE"    && <CheckCircle2 size={9} />}
                {user.status === "SUSPENDED" && <Ban          size={9} />}
                {user.status}
              </Badge>
              <Badge variant="outline" className={cn("rounded-full px-2 text-[10px] font-semibold", PLAN_BADGE[user.plan])}>
                {user.plan}{user.planMode ? ` · ${user.planMode === "MONTHLY" ? "Monthly" : "Yearly"}` : ""}
              </Badge>
              <Badge className="border-zinc-700/60 bg-zinc-800/40 text-[10px] text-zinc-500">
                ID: {user.id}
              </Badge>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

            {/* Action message */}
            <AnimatePresence>
              {actionMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-3 text-xs",
                    actionMsg.type === "ok"
                      ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-300"
                      : "border-red-500/25 bg-red-500/8 text-red-300",
                  )}
                >
                  {actionMsg.type === "ok"
                    ? <CheckCircle2 size={13} />
                    : <AlertCircle  size={13} />
                  }
                  {actionMsg.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Account details */}
            <div className="flex flex-col gap-1">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Account details</p>
              {[
                { icon: <Mail     size={12} />, label: "Email",         value: user.email             },
                { icon: <Calendar size={12} />, label: "Joined",        value: fmtDate(user.createdAt) },
                { icon: <Clock    size={12} />, label: "Last active",   value: user.lastActiveAt ? fmtDate(user.lastActiveAt) : "Never" },
                { icon: <Shield   size={12} />, label: "Role",          value: user.role              },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-900/30 transition-colors">
                  <span className="text-zinc-700 shrink-0">{row.icon}</span>
                  <span className="w-28 shrink-0 text-xs text-zinc-600">{row.label}</span>
                  <span className="text-xs font-medium text-zinc-300">{row.value}</span>
                </div>
              ))}
            </div>

            <Separator className="bg-zinc-800/60" />

            {/* Usage stats */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Usage</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <Globe         size={13} className="text-cyan-400"    />, label: "Waitlists",   value: user.waitlists },
                  { icon: <Users         size={13} className="text-indigo-400"  />, label: "Subscribers", value: user.subscribers.toLocaleString() },
                  { icon: <Share2        size={13} className="text-violet-400"  />, label: "Referrals",   value: "—" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-1 rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-3 py-2.5">
                    <div className="flex items-center gap-1.5">{s.icon}</div>
                    <p className="text-sm font-black tabular-nums text-zinc-200">{s.value}</p>
                    <p className="text-[10px] text-zinc-600">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-zinc-800/60" />

            {/* Billing */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Billing</p>
              <div className="flex flex-col gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-3">
                {[
                  { label: "Plan",       value: user.plan },
                  { label: "Billing",    value: user.planMode ?? "—" },
                  { label: "MRR contrib",value: user.plan === "PRO" && user.planMode === "MONTHLY" ? "$19"
                                              : user.plan === "PRO" && user.planMode === "YEARLY"  ? "$15"
                                              : user.plan === "GROWTH" && user.planMode === "MONTHLY" ? "$49"
                                              : user.plan === "GROWTH" && user.planMode === "YEARLY"  ? "$39"
                                              : "$0" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-600">{r.label}</span>
                    <span className="font-semibold text-zinc-300">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-zinc-800/60" />

            {/* Actions */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Actions</p>
              <div className="flex flex-col gap-2">
                {/* Suspend / Reactivate */}
                {user.status !== "DELETED" && (
                  user.status === "ACTIVE" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => act(() => suspendUserAction(user.id), { status: "SUSPENDED" })}
                      className="justify-start gap-2 border-amber-500/20 bg-transparent text-xs text-amber-400 hover:bg-amber-500/8 hover:border-amber-500/40"
                    >
                      {isPending ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
                      Suspend account
                    </Button>
                  ) : user.status === "SUSPENDED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => act(() => reactivateUserAction(user.id), { status: "ACTIVE" })}
                      className="justify-start gap-2 border-emerald-500/20 bg-transparent text-xs text-emerald-400 hover:bg-emerald-500/8"
                    >
                      {isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      Reactivate account
                    </Button>
                  ) : null
                )}

                {/* Promote / Demote */}
                {user.status !== "DELETED" && (
                  user.role === "USER" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => act(() => promoteToAdminAction(user.id), { role: "ADMIN" })}
                      className="justify-start gap-2 border-zinc-700/60 bg-transparent text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    >
                      {isPending ? <Loader2 size={13} className="animate-spin" /> : <Crown size={13} />}
                      Promote to admin
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => act(() => demoteFromAdminAction(user.id), { role: "USER" })}
                      className="justify-start gap-2 border-zinc-700/60 bg-transparent text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    >
                      {isPending ? <Loader2 size={13} className="animate-spin" /> : <UserMinus size={13} />}
                      Remove admin role
                    </Button>
                  )
                )}

                {/* Delete */}
                {!user.isDeleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setConfirmDel(true)}
                    className="justify-start gap-2 border-red-500/20 bg-transparent text-xs text-red-400 hover:bg-red-500/8 hover:border-red-500/40"
                  >
                    <Trash2 size={13} />Delete account permanently
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Delete {user.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              This permanently deletes the account and all associated data — workspaces,
              waitlists, subscribers, and payments. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-800/60">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isPending ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}