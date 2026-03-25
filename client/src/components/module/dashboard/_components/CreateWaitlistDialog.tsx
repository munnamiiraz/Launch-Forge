"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Loader2, CheckCircle2, AlertCircle,
  Globe, Lock, Zap, ArrowRight,
} from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";
import { authFetch } from "@/src/lib/axios/authFetch";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";

function slugify(str: string): string {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CreateWaitlistDialogProps {
  trigger?: React.ReactNode;
}

export function CreateWaitlistDialog({ trigger }: CreateWaitlistDialogProps) {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const [open, setOpen]           = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Form state
  const [name,        setName]        = useState("");
  const [slug,        setSlug]        = useState("");
  const [description, setDescription] = useState("");
  const [isOpen,      setIsOpenFlag]  = useState(true);
  const [slugEdited,  setSlugEdited]  = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugEdited) setSlug(slugify(val));
  };

  const handleSlugChange = (val: string) => {
    setSlug(slugify(val));
    setSlugEdited(true);
  };

  const reset = () => {
    setName(""); setSlug(""); setDescription("");
    setIsOpenFlag(true); setSlugEdited(false);
    setSuccess(false); setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) {
      setError("No workspace selected.");
      return;
    }
    setError(null);

    if (!name.trim()) { setError("Waitlist name is required."); return; }
    if (!slug.trim())  { setError("Slug is required."); return; }

    setIsPending(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await authFetch(`${baseUrl}/waitlists/${activeWorkspace.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, isOpen }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create waitlist");

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        reset();
        router.push("/dashboard/waitlists");
        router.refresh();
      }, 1400);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>

      <DialogContent className="border-border/80 bg-background/98 p-0 shadow-2xl shadow-black/60 backdrop-blur-xl sm:max-w-lg">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-lg bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15">
              <Zap size={16} className="text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Create a waitlist
              </DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground/80">
                Go live in under 2 minutes.
              </p>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 px-6 py-10 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10"
              >
                <CheckCircle2 size={26} className="text-emerald-400" />
              </motion.div>
              <div>
                <p className="text-base font-semibold text-foreground">Waitlist created!</p>
                <p className="mt-1 text-sm text-muted-foreground/80">Redirecting to your waitlist…</p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 px-6 py-5"
            >
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wl-name" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Waitlist name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="wl-name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Product Alpha"
                  disabled={isPending}
                  className="border-zinc-800 bg-card/60 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/50"
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wl-slug" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  URL slug <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center overflow-hidden rounded-lg border border-zinc-800 bg-card/60 focus-within:border-zinc-600">
                  <span className="border-r border-zinc-800 px-3 py-2 text-xs text-muted-foreground/60 shrink-0">
                    launchforge.app/
                  </span>
                  <input
                    id="wl-slug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="product-alpha"
                    disabled={isPending}
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wl-desc" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description <span className="text-muted-foreground/40">(optional)</span>
                </Label>
                <Textarea
                  id="wl-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you building? Tell people why they should join."
                  rows={3}
                  disabled={isPending}
                  className="resize-none border-zinc-800 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/50"
                />
              </div>

              <Separator className="bg-muted/60" />

              {/* Open / Closed toggle */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/30 p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border",
                    isOpen
                      ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-400"
                      : "border-zinc-700/60 bg-muted/40 text-muted-foreground/60"
                  )}>
                    {isOpen ? <Globe size={14} /> : <Lock size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground/80">
                      {isOpen ? "Open for signups" : "Signups closed"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {isOpen
                        ? "Anyone can join via your public link"
                        : "Signups are paused — toggle to enable"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isOpen}
                  onCheckedChange={setIsOpenFlag}
                  disabled={isPending}
                  className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-zinc-700"
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 py-2.5">
                      <AlertCircle size={14} className="text-red-400" />
                      <AlertDescription className="text-xs text-red-400">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground/80"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="group relative flex-[2] overflow-hidden bg-indigo-600 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  {isPending ? (
                    <><Loader2 size={14} className="animate-spin" />Creating…</>
                  ) : (
                    <>Create waitlist <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
