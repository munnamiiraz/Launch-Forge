"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, RefreshCw, Trash2, ArrowRight, Globe, Lock, Calendar } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
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

interface ApiWaitlist {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  logoUrl:     string | null;
  isOpen:      boolean;
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

  const fetchWaitlists = useCallback(async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/waitlists/${activeWorkspace.id}`, {
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
  }, [activeWorkspace]);

  useEffect(() => {
    fetchWaitlists();
  }, [fetchWaitlists]);

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
        <p className="text-sm font-medium text-zinc-400">No workspace selected</p>
        <p className="mt-1 text-xs text-zinc-600">
          Select or create a workspace from the sidebar to see your waitlists.
        </p>
      </div>
    );
  }

  /* ── Loading ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
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
          className="mt-4 gap-2 text-zinc-500 hover:text-zinc-300"
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
          <p className="text-sm font-semibold text-zinc-300">No waitlists yet</p>
          <p className="mt-1 text-xs text-zinc-600">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {waitlists.map((wl, i) => (
            <motion.div
              key={wl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="group relative flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all duration-200 cursor-pointer"
              onClick={() => router.push(`/explore/${wl.slug}`)}
            >
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                    wl.isOpen
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700/60 bg-zinc-800/40 text-zinc-600"
                  )}
                >
                  {wl.isOpen ? <Globe size={9} /> : <Lock size={9} />}
                  {wl.isOpen ? "Open" : "Closed"}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(wl.id);
                  }}
                  className="rounded-md p-1.5 text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                  title="Delete waitlist"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Name + description */}
              <div>
                <h3 className="truncate text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">
                  {wl.name}
                </h3>
                {wl.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600">{wl.description}</p>
                )}
              </div>

              {/* Slug */}
              <p className="truncate text-[10px] font-mono text-zinc-700">
                launchforge.app/<span className="text-zinc-500">{wl.slug}</span>
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4 border-t border-zinc-800/60 pt-3">
                <div className="flex flex-col">
                  <span className="text-sm font-bold tabular-nums text-zinc-200">
                    {wl._count.subscribers.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-600">subscribers</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-700 ml-auto">
                  <Calendar size={9} />
                  {new Date(wl.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Refresh button */}
      <div className="mt-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchWaitlists}
          className="gap-2 text-xs text-zinc-600 hover:text-zinc-400"
        >
          <RefreshCw size={11} /> Refresh
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950/98 text-zinc-100 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete waitlist?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              This action cannot be undone. The waitlist and all its configuration will be permanently removed.
              Note: waitlists with active subscribers cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
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
