"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Loader2, CheckCircle2, Copy,
  Users, Link2, Twitter, Mail, AlertCircle,
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

  const shareOnTwitter = () => {
    if (!result) return;
    const text = `I just joined the waitlist for ${waitlist.name}! Join me and let's both move up the queue 🚀`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(result.referralUrl)}`,
      "_blank",
    );
  };

  /* ── Closed state ────────────────────────────────────────────── */
  if (!waitlist.isOpen) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-zinc-800/60 bg-zinc-900/30 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <Users size={20} className="text-zinc-600" />
        </div>
        <div>
          <p className="text-base font-bold text-zinc-400">Waitlist is closed</p>
          <p className="mt-1 text-sm text-zinc-600">
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
        className="flex flex-col gap-5"
      >
        {/* Queue position hero */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-linear-to-br from-indigo-950/60 via-zinc-900/60 to-zinc-950 p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-4 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.15 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15"
            >
              <CheckCircle2 size={32} className="text-indigo-400" />
            </motion.div>

            <div>
              <p className="text-2xl font-black tracking-tight text-zinc-100">You&apos;re in! 🎉</p>
              <p className="mt-1 text-sm text-zinc-500">
                {result.alreadyJoined ? "You were already on the list." : "Welcome to the waitlist."}
              </p>
            </div>

            {/* Position */}
            <div className="flex w-full items-stretch gap-3">
              <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 py-3">
                <p className="text-3xl font-black tabular-nums text-indigo-300">
                  #{result.position.toLocaleString()}
                </p>
                <p className="text-[11px] text-zinc-600">your position</p>
              </div>
              <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 py-3">
                <p className="text-3xl font-black tabular-nums text-zinc-300">
                  {result.totalInQueue.toLocaleString()}
                </p>
                <p className="text-[11px] text-zinc-600">total in queue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Move up callout */}
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/6 px-4 py-3.5">
          <ChevronUp size={16} className="mt-0.5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">Refer friends to move up</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Every person who joins using your link moves you one spot higher.
              {hasPrizes && " Top referrers win prizes — see the prize pool below."}
            </p>
          </div>
        </div>

        {/* Referral link */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Your referral link
          </p>
          <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2.5">
            <Link2 size={13} className="shrink-0 text-zinc-700" />
            <code className="flex-1 truncate text-xs text-zinc-400">{result.referralUrl}</code>
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

        {/* Share buttons */}
        <div className="flex gap-2">
          <Button
            onClick={shareOnTwitter}
            variant="outline"
            className="flex-1 gap-2 border-zinc-800/80 bg-transparent text-xs text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40 hover:text-zinc-200"
          >
            <Twitter size={13} />
            Share on X
          </Button>
          <Button
            onClick={() => {
              const subject = `You should join ${waitlist.name}`;
              const body = `Hey! I just joined the waitlist for ${waitlist.name}. You should too — use my link to join and we'll both move up the queue: ${result.referralUrl}`;
              window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }}
            variant="outline"
            className="flex-1 gap-2 border-zinc-800/80 bg-transparent text-xs text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40 hover:text-zinc-200"
          >
            <Mail size={13} />
            Share via email
          </Button>
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
          className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/6 px-4 py-2.5"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <p className="text-xs text-emerald-300">
            <span className="font-bold">{waitlist.recentJoins.toLocaleString()}</span> people joined in the last 24 hours
          </p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="join-name" className="text-xs font-medium text-zinc-400">
            Full name <span className="text-indigo-500">*</span>
          </Label>
          <Input
            id="join-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={isPending}
            autoFocus
            className="h-11 border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="join-email" className="text-xs font-medium text-zinc-400">
            Email address <span className="text-indigo-500">*</span>
          </Label>
          <Input
            id="join-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isPending}
            className="h-11 border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="join-referral" className="text-xs font-medium text-zinc-400">
            Referral code <span className="text-zinc-600">(optional)</span>
          </Label>
          <Input
            id="join-referral"
            value={referralTouched ? referralCodeInput : (referralFromQuery?.trim().toUpperCase() || "")}
            onChange={(e) => { setReferralTouched(true); setReferralCodeInput(e.target.value); }}
            placeholder="E.g. 8-character code"
            disabled={isPending}
            inputMode="text"
            autoCapitalize="characters"
            className="h-11 border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
          />
          <p className="text-[11px] text-zinc-600">
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
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
        <Users size={12} />
        <span>
          <span className="font-semibold text-zinc-400">{waitlist.totalSubscribers.toLocaleString()}</span>{" "}
          people already in queue
        </span>
      </div>

      <p className="text-center text-[10px] text-zinc-700">
        No spam. We&apos;ll only email you about {waitlist.name}. Unsubscribe anytime.
      </p>
    </div>
  );
}
