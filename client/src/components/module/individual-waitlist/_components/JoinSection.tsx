"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Loader2, CheckCircle2, Copy,
  Users, Link2, AlertCircle,
  ChevronUp,
} from "lucide-react";

import { Button }   from "@/src/components/ui/button";
import { Input }    from "@/src/components/ui/input";
import { Label }    from "@/src/components/ui/label";
import { cn }       from "@/src/lib/utils";
import { useSearchParams } from "next/navigation";
import { joinWaitlistAction } from "@/src/services/public-waitlist/public-waitlist.services";
import type { JoinResult, PublicWaitlistData } from "../_lib/data";

type SubmitJoinResult =
  | (JoinResult & { success: true })
  | { success: false; message?: string };

async function submitJoin(
  slug: string, 
  name: string, 
  email: string,
  referralCode?: string
): Promise<SubmitJoinResult> {
  const res = await joinWaitlistAction({ slug, name, email, referralCode });
  
  if (res.success) {
    return {
      ...(res.data as JoinResult),
      success: true,
    };
  } else {
    return {
      success: false,
      message: res.message,
    };
  }
}

interface JoinSectionProps {
  waitlist: PublicWaitlistData;
}

export function JoinSection({ waitlist }: JoinSectionProps) {
  const [name,       setName]    = useState("");
  const [email,      setEmail]   = useState("");
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [referralTouched, setReferralTouched] = useState(false);
  const [error,      setError]   = useState<string | null>(null);
  const [result,     setResult]  = useState<JoinResult | null>(null);
  const [copied,     setCopied]  = useState(false);
  const [isPending,  startTx]    = useTransition();
  const searchParams = useSearchParams();
  const referralFromQuery = searchParams.get("ref") || searchParams.get("p") || searchParams.get("referrer");

  const hasPrizes = waitlist.prizes.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim())                     { setError("Your name is required."); return; }
    if (!email.includes("@"))             { setError("Please enter a valid email address."); return; }
    const rawReferral = referralTouched ? referralCodeInput : (referralFromQuery || "");
    const normalizedReferralCode = rawReferral.trim().toUpperCase();
    const referralCode = normalizedReferralCode.length ? normalizedReferralCode : undefined;
    if (referralCode && (!/^[A-Z0-9]+$/.test(referralCode) || referralCode.length !== 8)) {
      setError("Referral code must be 8 characters (letters and numbers).");
      return;
    }
    startTx(async () => {
      const r = await submitJoin(waitlist.slug, name.trim(), email.trim(), referralCode);
      if (r.success) {
        setResult(r);
      } else {
        setError(r.message || "Failed to join waitlist.");
      }
    });
  };

  const copyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Closed state ────────────────────────────────────────────── */
  if (!waitlist.isOpen) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-card/30 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card/60">
          <Users size={20} className="text-muted-foreground/80" />
        </div>
        <div>
          <p className="text-base font-bold text-muted-foreground">Waitlist is closed</p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            {waitlist.name} is no longer accepting new signups.
          </p>
        </div>
      </div>
    );
  }

  /* ── Success state ───────────────────────────────────────────── */
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-4 sm:gap-5 w-full max-w-full overflow-hidden"
      >
        {/* Queue position hero */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-linear-to-br from-indigo-50 dark:from-indigo-950/60 via-background dark:via-zinc-900/60 to-muted dark:to-zinc-950 p-4 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-4 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.15 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/15"
            >
              <CheckCircle2 size={32} className="text-indigo-600 dark:text-indigo-400" />
            </motion.div>

            <div>
              <p className="text-2xl font-black tracking-tight text-foreground">You&apos;re in! 🎉</p>
              <p className="mt-1 text-sm text-muted-foreground/80">
                {result.alreadyJoined ? "You were already on the list." : "Welcome to the waitlist."}
              </p>
            </div>

            {/* Position */}
            <div className="flex w-full items-stretch gap-2 sm:gap-3">
              <div className="flex flex-1 min-w-0 flex-col items-center gap-1 rounded-2xl border border-border bg-background py-2 sm:py-3 dark:bg-card/40">
                <p className="text-2xl sm:text-3xl font-black tabular-nums text-indigo-600 dark:text-indigo-300 truncate w-full text-center px-1">
                  #{result.position.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground/70 dark:text-muted-foreground/60">your position</p>
              </div>
              <div className="flex flex-1 min-w-0 flex-col items-center gap-1 rounded-2xl border border-border bg-background py-2 sm:py-3 dark:bg-card/40">
                <p className="text-2xl sm:text-3xl font-black tabular-nums text-foreground/80 truncate w-full text-center px-1">
                  {result.totalInQueue.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground/70 dark:text-muted-foreground/60">total in queue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Move up callout */}
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/6 px-4 py-3.5">
          <ChevronUp size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Refer friends to move up</p>
            <p className="mt-0.5 text-xs text-muted-foreground/70 dark:text-muted-foreground/80">
              Every person who joins using your link moves you one spot higher.
              {hasPrizes && " Top referrers win prizes — see the prize pool below."}
            </p>
          </div>
        </div>

        {/* Referral link */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Your referral link
          </p>
          <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-border/80 bg-card/60 px-3 py-2.5">
            <Link2 size={13} className="shrink-0 text-muted-foreground/40" />
            <code className="flex-1 min-w-0 truncate text-xs text-muted-foreground">{result.referralUrl}</code>
            <Button
              size="sm"
              onClick={copyLink}
              className={cn(
                "shrink-0 gap-1.5 px-3 py-1 text-xs transition-all",
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-500",
              )}
            >
              {copied
                ? <><CheckCircle2 size={12} />Copied!</>
                : <><Copy size={12} />Copy</>}
            </Button>
          </div>
        </div>

      </motion.div>
    );
  }

  /* ── Join form ───────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-5">
      {/* Activity pulse */}
      {waitlist.recentJoins > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/10 dark:bg-emerald-500/6 px-4 py-2.5"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            <span className="font-bold">{waitlist.recentJoins.toLocaleString()}</span> people joined in the last 24 hours
          </p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="join-name" className="text-xs font-medium text-muted-foreground">
            Full name <span className="text-indigo-500">*</span>
          </Label>
          <Input
            id="join-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={isPending}
            autoFocus
            className="h-11 border-border bg-card/40 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
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
            placeholder="you@example.com"
            disabled={isPending}
            className="h-11 border-border bg-card/40 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="join-referral" className="text-xs font-medium text-muted-foreground">
            Referral code <span className="text-muted-foreground/60">(optional)</span>
          </Label>
          <Input
            id="join-referral"
            value={referralTouched ? referralCodeInput : (referralFromQuery?.trim().toUpperCase() || "")}
            onChange={(e) => { setReferralTouched(true); setReferralCodeInput(e.target.value); }}
            placeholder="E.g. 8-character code"
            disabled={isPending}
            inputMode="text"
            autoCapitalize="characters"
            className="h-11 border-border bg-card/40 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
          />
          <p className="text-[11px] text-muted-foreground/60">
            Have a referral code? Enter it to help your referrer move up the queue.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/6 px-3 py-2.5 text-xs text-red-400"
            >
              <AlertCircle size={13} className="shrink-0" />{error}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={isPending}
          className="group relative h-12 overflow-hidden bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          {isPending
            ? <><Loader2 size={16} className="animate-spin" />Joining waitlist…</>
            : <><ArrowRight size={16} />Join the waitlist</>
          }
        </Button>
      </form>

      {/* Social proof counter */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
        <Users size={12} />
        <span>
          <span className="font-semibold text-muted-foreground">{waitlist.totalSubscribers.toLocaleString()}</span>{" "}
          people already in queue
        </span>
      </div>

      <p className="text-center text-[10px] text-muted-foreground/40">
        No spam. We&apos;ll only email you about {waitlist.name}. Unsubscribe anytime.
      </p>
    </div>
  );
}
