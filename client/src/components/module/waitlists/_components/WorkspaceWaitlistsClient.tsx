"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, RefreshCw, Trash2, Globe, Lock, Calendar, MoreHorizontal, Archive, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { cn } from "@/src/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface ApiWaitlist {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  logoUrl:     string | null;
  isOpen:      boolean;
  archivedAt?: string | null;
  createdAt:   string;
  updatedAt:   string;
  _count:      { subscribers: number };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export function WorkspaceWaitlistsClient() {
  const { activeWorkspace } = useWorkspace();
  const router = useRouter();

  const [waitlists, setWaitlists]     = useState<ApiWaitlist[]>([]);
  const [loading,   setLoading]       = useState(false);
  const [error,     setError]         = useState<string | null>(null);
  const [deleteId,  setDeleteId]      = useState<string | null>(null);
  const [deleting,  setDeleting]      = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  const fetchWaitlists = useCallback(async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const url = includeArchived
        ? `${BASE_URL}/waitlists/${activeWorkspace.id}?includeArchived=true`
        : `${BASE_URL}/waitlists/${activeWorkspace.id}`;

      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch waitlists");
      setWaitlists(json.data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace, includeArchived]);

  useEffect(() => {
    fetchWaitlists();
  }, [fetchWaitlists]);

  const patchStatus = async (waitlistId: string, isOpen: boolean) => {
    if (!activeWorkspace) return;
    const res = await fetch(`${BASE_URL}/waitlists/${activeWorkspace.id}/${waitlistId}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update status");
    const data = json.data as { id: string; isOpen: boolean; archivedAt: string | null };
    setWaitlists((prev) => prev.map((w) => (w.id === data.id ? { ...w, isOpen: data.isOpen, archivedAt: data.archivedAt } : w)));
  };

  const patchArchive = async (waitlistId: string, archived: boolean) => {
    if (!activeWorkspace) return;
    const res = await fetch(`${BASE_URL}/waitlists/${activeWorkspace.id}/${waitlistId}/archive`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update archive");
    const data = json.data as { id: string; isOpen: boolean; archivedAt: string | null };

    setWaitlists((prev) => {
      // If we're not including archived, an archive action should immediately hide it.
      if (!includeArchived && archived) return prev.filter((w) => w.id !== data.id);
      return prev.map((w) => (w.id === data.id ? { ...w, isOpen: data.isOpen, archivedAt: data.archivedAt } : w));
    });
  };

  const handleDelete = async () => {
    if (!deleteId || !activeWorkspace) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/waitlists/${activeWorkspace.id}/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to delete");
      }
      setWaitlists((prev) => prev.filter((w) => w.id !== deleteId));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  /* ── No workspace selected ─────────────────────────────────────── */
  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
        <p className="text-sm font-medium text-muted-foreground">No workspace selected</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Select or create a workspace from the sidebar to see your waitlists.
        </p>
      </div>
    );
  }

  /* ── Loading ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground/80">
        <Loader2 size={20} className="animate-spin mr-2" />
        <span className="text-sm">Loading waitlists…</span>
      </div>
    );
  }

  /* ── Error ─────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-16 text-center">
        <p className="text-sm font-medium text-red-400">{error}</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={fetchWaitlists}
          className="mt-4 gap-2 text-muted-foreground/80 hover:text-foreground/80"
        >
          <RefreshCw size={13} /> Retry
        </Button>
      </div>
    );
  }

  /* ── Empty ─────────────────────────────────────────────────────── */
  if (waitlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-20 text-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10">
          <Plus size={22} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground/80">No waitlists yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Create your first waitlist under <span className="text-indigo-400">{activeWorkspace.name}</span>.
          </p>
        </div>
        <Link href="/dashboard/waitlists/new">
          <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-500 gap-2">
            <Plus size={13} /> Create waitlist
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Grid ──────────────────────────────────────────────────────── */
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            checked={includeArchived}
            onCheckedChange={(v) => setIncludeArchived(Boolean(v))}
          />
          <span className="text-xs text-muted-foreground/70">Show archived</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchWaitlists}
          className="gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground"
        >
          <RefreshCw size={11} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {waitlists
            .slice()
            .sort((a, b) => Number(Boolean(a.archivedAt)) - Number(Boolean(b.archivedAt)))
            .map((wl, i) => (
            <motion.div
              key={wl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="group relative flex flex-col gap-3 rounded-xl border border-border/80 bg-card/40 p-5 hover:border-zinc-700/80 hover:bg-card/60 transition-all duration-200 cursor-pointer"
              onClick={() => router.push(`/dashboard/waitlists/${wl.slug}`)}
            >
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                    wl.archivedAt
                      ? "border-zinc-700/60 bg-muted/40 text-muted-foreground/60"
                      : wl.isOpen
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700/60 bg-muted/40 text-muted-foreground/60"
                  )}
                >
                  {wl.archivedAt ? <Archive size={9} /> : wl.isOpen ? <Globe size={9} /> : <Lock size={9} />}
                  {wl.archivedAt ? "Archived" : wl.isOpen ? "Open" : "Closed"}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 w-7 rounded-md text-muted-foreground/60 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted/60 hover:text-foreground/80"
                    >
                      <MoreHorizontal size={13} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 border-zinc-800 bg-background/95 backdrop-blur-xl"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/waitlists/${wl.id}`);
                      }}
                      className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60"
                    >
                      View details
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-muted/60" />

                    <DropdownMenuItem
                      disabled={Boolean(wl.archivedAt)}
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await patchStatus(wl.id, !wl.isOpen);
                        } catch (err: any) {
                          alert(err.message || "Failed to update status");
                        }
                      }}
                      className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60"
                    >
                      {wl.isOpen ? "Mark as closed" : "Mark as open"}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await patchArchive(wl.id, !wl.archivedAt);
                        } catch (err: any) {
                          alert(err.message || "Failed to update archive");
                        }
                      }}
                      className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60"
                    >
                      {wl.archivedAt ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-muted/60" />

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(wl.id);
                      }}
                      className="cursor-pointer gap-2 text-xs text-red-400 hover:bg-red-500/8 hover:text-red-400 focus:bg-red-500/8"
                    >
                      <Trash2 size={12} /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Name + description */}
              <div>
                <h3 className="truncate text-sm font-semibold text-foreground/90 group-hover:text-foreground">
                  {wl.name}
                </h3>
                {wl.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground/60">{wl.description}</p>
                )}
              </div>

              {/* Slug */}
              <p className="truncate text-[10px] font-mono text-muted-foreground/40">
                launchforge.app/<span className="text-muted-foreground/80">{wl.slug}</span>
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4 border-t border-border/60 pt-3">
                <div className="flex flex-col">
                  <span className="text-sm font-bold tabular-nums text-foreground/90">
                    {wl._count.subscribers.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">subscribers</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40 ml-auto">
                  <Calendar size={9} />
                  {new Date(wl.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-zinc-800 bg-background/98 text-foreground backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete waitlist?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/80">
              This action cannot be undone. The waitlist and all its configuration will be permanently removed.
              Note: waitlists with active subscribers cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 bg-transparent text-muted-foreground hover:bg-zinc-800 hover:text-foreground/90">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {deleting ? <><Loader2 size={13} className="animate-spin" /> Deleting…</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
