"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, CheckCircle2, Copy, Share2,
  Users, Trophy, ArrowRight, AlertCircle,
} from "lucide-react";

import {
  Dialog, DialogContent,
} from "@/src/components/ui/dialog";
import { Button }   from "@/src/components/ui/button";
import { Input }    from "@/src/components/ui/input";
import { Label }    from "@/src/components/ui/label";
import { Badge }    from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { cn }       from "@/src/lib/utils";
import { joinWaitlistAction as joinPublicWaitlist } from "@/src/services/public-waitlist/public-waitlist.services";
import type { PublicProduct, JoinResult } from "../_lib/data";

/* ── Simulated join action ────────────────────────────────────────── */
interface JoinWaitlistModalProps {
  product:  PublicProduct | null;
  open:     boolean;
  onClose:  () => void;
}

export function JoinWaitlistModal({ product, open, onClose }: JoinWaitlistModalProps) {
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [error,      setError]      = useState<string | null>(null);
  const [result,     setResult]     = useState<JoinResult | null>(null);
  const [copied,     setCopied]     = useState(false);
  const [isPending,  startTx]       = useTransition();

  if (!product) return null;

  const reset = () => {
    setName(""); setEmail(""); setError(null); setResult(null); setCopied(false);
  };

  const handleClose = () => { onClose(); setTimeout(reset, 300); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim())  { setError("Your name is required."); return; }
    if (!email.trim() || !email.includes("@")) { setError("A valid email is required."); return; }
    startTx(async () => {
      const r = await joinPublicWaitlist({
        slug: product.slug,
        name: name.trim(),
        email: email.trim(),
      });

      if (!r.success) {
        setError(r.message || "Failed to join waitlist.");
        return;
      }

      if (!r.data) {
        setError("Malformed join response. Please try again.");
        return;
      }

      setResult(r.data as JoinResult);
    });
  };

  const copyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="overflow-hidden border-border/80 bg-[#0a0a0a] p-0 shadow-2xl shadow-black/80 sm:max-w-md">

        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        <AnimatePresence mode="wait">
          {result ? (
            /* ── Success state ──────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 px-6 py-8 text-center"
            >
              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 transition-colors"
              >
                <X size={14} />
              </button>

              {/* Confetti-like icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
                className="relative"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10">
                  <CheckCircle2 size={36} className="text-indigo-400" />
                </div>
                {/* Floating emoji decorations */}
                <span className="absolute -right-2 -top-2 text-2xl">🎉</span>
                <span className="absolute -left-2 bottom-0 text-xl">✨</span>
              </motion.div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  You're in!
                </h2>
                <p className="text-sm text-muted-foreground/80">
                  You joined <span className="font-semibold text-foreground/80">{product.name}</span>
                </p>
              </div>

              {/* Position card */}
              <div className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card/40 px-5 py-4">
                <div className="flex flex-col items-start gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Queue position</p>
                  <p className="text-3xl font-black tracking-tight tabular-nums text-indigo-300">
                    #{result.position.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60">
                    of {result.totalInQueue.toLocaleString()} people
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Move up by</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                    <Share2 size={14} />
                    Referring friends
                  </div>
                  <p className="text-[11px] text-muted-foreground/60">Each referral = +1 spot</p>
                </div>
              </div>

              {/* Prizes teaser */}
              {product.prizes.length > 0 && (
                <div className="w-full rounded-xl border border-amber-500/20 bg-amber-500/6 px-4 py-3 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <Trophy size={12} />
                    Prizes up for grabs
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {product.prizes.map((p) => (
                      <span key={p.rank} className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-[10px] text-amber-400">
                        {p.emoji} {p.rank} {p.value ?? p.title.split(" ").slice(0, 2).join(" ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Referral link */}
              <div className="w-full flex flex-col gap-2">
                <p className="text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Your referral link
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/60 px-3 py-2.5">
                  <code className="flex-1 truncate text-xs text-muted-foreground">
                    {result.referralUrl}
                  </code>
                  <Button
                    size="sm"
                    onClick={copyLink}
                    className={cn(
                      "shrink-0 gap-1.5 px-3 text-xs transition-all duration-200",
                      copied
                        ? "bg-emerald-600 text-white"
                        : "bg-indigo-600 text-white hover:bg-indigo-500",
                    )}
                  >
                    {copied ? <><CheckCircle2 size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/40">
                  Share this link. Every person who joins through you moves you up the queue.
                </p>
              </div>

              <Button
                onClick={handleClose}
                variant="ghost"
                className="text-xs text-muted-foreground/60 hover:bg-muted/40 hover:text-muted-foreground"
              >
                Done
              </Button>
            </motion.div>
          ) : (
            /* ── Form state ─────────────────────────────── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="relative border-b border-border/60 px-6 py-5">
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 transition-colors"
                >
                  <X size={14} />
                </button>

                <div className="flex items-center gap-3 pr-6">
                  <Avatar className="h-10 w-10 shrink-0 rounded-xl">
                    <AvatarFallback className={cn(
                      "rounded-xl bg-gradient-to-br text-sm font-black text-white",
                      product.logoGradient,
                    )}>
                      {product.logoInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground">{product.name}</h2>
                    <p className="truncate text-xs text-muted-foreground/80">{product.tagline}</p>
                  </div>
                </div>

                {/* Social proof */}
                <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground/60">
                  <span className="flex items-center gap-1">
                    <Users size={11} className="text-indigo-400" />
                    <span className="font-semibold text-muted-foreground">{product.totalSubscribers.toLocaleString()}</span> joined
                  </span>
                  {product.recentJoins > 0 && (
                    <>
                      <span className="h-3 w-px bg-zinc-800" />
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        <span className="font-semibold text-emerald-400">{product.recentJoins}</span> joined today
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="join-name" className="text-xs font-medium text-muted-foreground">
                    Full name <span className="text-indigo-500">*</span>
                  </Label>
                  <Input
                    id="join-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    disabled={isPending}
                    autoFocus
                    className="border-zinc-800 bg-card/60 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="join-email" className="text-xs font-medium text-muted-foreground">
                    Email address <span className="text-indigo-500">*</span>
                  </Label>
                  <Input
                    id="join-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ada@example.com"
                    disabled={isPending}
                    className="border-zinc-800 bg-card/60 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/6 px-3 py-2.5 text-xs text-red-400"
                    >
                      <AlertCircle size={13} />{error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Prizes teaser (compact) */}
                {product.prizes.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2">
                    <Trophy size={12} className="shrink-0 text-amber-400" />
                    <p className="text-[11px] text-amber-300/80">
                      {product.prizes[0].emoji} {product.prizes[0].title} awaits top referrers
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="group relative h-11 overflow-hidden bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  {isPending
                    ? <><Loader2 size={15} className="animate-spin" />Joining…</>
                    : <><ArrowRight size={15} />Join waitlist</>
                  }
                </Button>

                <p className="text-center text-[10px] text-muted-foreground/40">
                  By joining, you agree to receive updates about {product.name}.
                  No spam, unsubscribe anytime.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
