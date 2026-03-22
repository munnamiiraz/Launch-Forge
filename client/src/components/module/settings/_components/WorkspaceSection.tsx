"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Globe, Image as ImageIcon, FileText,
  Loader2, CheckCircle2, AlertCircle, AlertTriangle, Trash2,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button }    from "@/src/components/ui/button";
import { Input }     from "@/src/components/ui/input";
import { Label }     from "@/src/components/ui/label";
import { Textarea }  from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Badge }     from "@/src/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { cn } from "@/src/lib/utils";
import { updateWorkspaceAction, deleteWorkspaceAction } from "@/src/services/settings/settings.actions";
import type { WorkspaceForm } from "@/src/components/module/settings/_types";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

interface WorkspaceSectionProps {
  workspace: WorkspaceForm;
}

export function WorkspaceSection({ workspace }: WorkspaceSectionProps) {
  const [form,      setForm]    = useState<WorkspaceForm>(workspace);
  const [dirty,     setDirty]   = useState(false);
  const [success,   setSuccess] = useState(false);
  const [error,     setError]   = useState<string | null>(null);
  const [isPending, startTx]    = useTransition();
  const [slugEdited, setSlugEdited] = useState(false);

  // Danger zone
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [deleteText,   setDeleteText]   = useState("");
  const [deleteLoading, startDeleteTx] = useTransition();
  const [deleteError,   setDeleteError] = useState<string | null>(null);

  const set = (k: keyof WorkspaceForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true); setSuccess(false);
  };

  const handleNameChange = (v: string) => {
    set("name", v);
    if (!slugEdited) set("slug", slugify(v));
  };

  const handleSave = () => {
    setError(null);
    startTx(async () => {
      const r = await updateWorkspaceAction(form);
      if (r.success) { setSuccess(true); setDirty(false); setTimeout(() => setSuccess(false), 3000); }
      else setError(r.message);
    });
  };

  const handleDelete = () => {
    setDeleteError(null);
    startDeleteTx(async () => {
      const r = await deleteWorkspaceAction(deleteText);
      if (!r.success) setDeleteError(r.message);
      // On success, redirect to logout / landing
    });
  };

  return (
    <div className="flex flex-col gap-6" id="workspace">

      {/* ── Workspace info ───────────────────────────────────── */}
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-200">Workspace</p>
          <p className="text-[11px] text-zinc-600">
            Your workspace is shared with all team members.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 p-5">

          {/* Name + slug */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ws-name" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                <Building2 size={12} className="text-zinc-600" />Workspace name
              </Label>
              <Input
                id="ws-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Acme Corp"
                className="border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ws-slug" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                <Globe size={12} className="text-zinc-600" />Subdomain slug
              </Label>
              <div className="flex overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60 focus-within:border-zinc-600">
                <span className="shrink-0 border-r border-zinc-800 px-2.5 py-2 text-[11px] text-zinc-600">
                  launchforge.app/
                </span>
                <input
                  id="ws-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    set("slug", slugify(e.target.value));
                  }}
                  className="flex-1 bg-transparent px-2.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
                  placeholder="acme-corp"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ws-desc" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <FileText size={12} className="text-zinc-600" />Description
              <span className="text-zinc-700">(optional)</span>
            </Label>
            <Textarea
              id="ws-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What does your workspace do?"
              rows={2}
              className="resize-none border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
            />
          </div>

          {/* Logo URL */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ws-logo" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <ImageIcon size={12} className="text-zinc-600" />Logo URL
              <span className="text-zinc-700">(optional)</span>
            </Label>
            <Input
              id="ws-logo"
              value={form.logo}
              onChange={(e) => set("logo", e.target.value)}
              placeholder="https://example.com/logo.png"
              className="border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/40"
            />
          </div>

          {/* Save row */}
          {(dirty || success || error) && (
            <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4">
              {success && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 size={13} />Saved.
                </span>
              )}
              {error && (
                <span className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle size={13} />{error}
                </span>
              )}
              {!success && !error && <span />}
              <div className="flex gap-2">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => { setForm(workspace); setDirty(false); }}
                  className="text-xs text-zinc-600 hover:bg-zinc-800/60"
                >
                  Reset
                </Button>
                <Button
                  size="sm" onClick={handleSave} disabled={isPending}
                  className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {isPending ? <><Loader2 size={12} className="animate-spin" />Saving…</> : "Save workspace"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Danger zone ──────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-red-500/20 bg-zinc-900/40">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
        <CardHeader className="border-b border-red-500/15 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            <p className="text-sm font-semibold text-red-400">Danger zone</p>
          </div>
          <p className="text-[11px] text-zinc-600">
            These actions are permanent and cannot be undone.
          </p>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center justify-between rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-zinc-200">Delete workspace</p>
              <p className="text-xs text-zinc-600">
                Permanently deletes all waitlists, subscribers, prizes, and analytics data.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="gap-1.5 bg-red-600/80 text-xs text-white hover:bg-red-600"
            >
              <Trash2 size={12} />Delete workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirm delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-zinc-100">
              <AlertTriangle size={16} className="text-red-400" />
              Delete workspace "{workspace.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              This will permanently delete all waitlists, subscribers, leaderboards, prizes,
              feedback boards, and analytics data. This action is immediate and irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2 py-2">
            <Label className="text-xs font-medium text-zinc-400">
              Type <span className="font-mono text-zinc-300">delete my workspace</span> to confirm
            </Label>
            <Input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="delete my workspace"
              className="border-zinc-800 bg-zinc-900/60 text-sm text-zinc-100 focus-visible:border-red-500/50 focus-visible:ring-red-500/20"
            />
            {deleteError && (
              <p className="text-xs text-red-400">{deleteError}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-800/60">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteText !== "delete my workspace" || deleteLoading}
              className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-40"
            >
              {deleteLoading ? "Deleting…" : "Permanently delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}