"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, User, Share2,
  ArrowRight, Copy, CheckCircle2, ChevronUp,
} from "lucide-react";

import { Input }   from "@/src/components/ui/input";
import { Button }  from "@/src/components/ui/button";
import { cn }      from "@/src/lib/utils";

interface RankResult {
  position:      number;
  referralCount: number;
  referralUrl:   string;
  totalInQueue:  number;
}

async function lookupRank(_slug: string, email: string): Promise<RankResult | null> {
  /**
   * Real:
   * const res = await fetch(`/api/public/waitlist/${slug}/position?email=${email}`);
   * if (!res.ok) return null;
   * return res.json();
   */
  await new Promise((r) => setTimeout(r, 700));
  if (!email.includes("@")) return null;
  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  return {
    position:      Math.floor(Math.random() * 200) + 10,
    referralCount: Math.floor(Math.random() * 8),
    referralUrl:   `https://launchforge.app/ref/${code}`,
    totalInQueue:  12_430,
  };
}

interface FindMyRankWidgetProps {
  slug: string;
}

export function FindMyRankWidget({ slug }: FindMyRankWidgetProps) {
  const [email,     setEmail]     = useState("");
  const [result,    setResult]    = useState<RankResult | null>(null);
  const [notFound,  setNotFound]  = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [isPending, startTx]      = useTransition();

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setNotFound(false);
    setResult(null);
    startTx(async () => {
      const r = await lookupRank(slug, email);
      if (r) setResult(r);
      else setNotFound(true);
    });
  };

  const copyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/30 p-5">
      <div className="flex items-center gap-2">
        <User size={14} className="text-indigo-400" />
        <div>
          <p className="text-sm font-semibold text-foreground/90">Find your rank</p>
          <p className="text-[11px] text-muted-foreground/60">Enter your email to see your position</p>
        </div>
      </div>

      <form onSubmit={handleLookup} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={isPending}
          className="h-9 flex-1 border-zinc-800 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-indigo-500/40 focus-visible:ring-1 focus-visible:ring-indigo-500/20"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !email.includes("@")}
          className="h-9 gap-1.5 bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          {isPending ? "…" : "Look up"}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {/* Position + refs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5 rounded-xl border border-indigo-500/20 bg-indigo-500/8 px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground/60">Your position</p>
                <p className="text-xl font-black tabular-nums text-indigo-300">#{result.position.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground/60">of {result.totalInQueue.toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground/60">Your referrals</p>
                <p className="text-xl font-black tabular-nums text-foreground/90">{result.referralCount}</p>
                <p className="text-[10px] text-muted-foreground/60">
                  {result.referralCount === 0 ? "share to earn" : "people referred"}
                </p>
              </div>
            </div>

            {/* Move up nudge */}
            {result.referralCount === 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/6 px-3 py-2.5">
                <ChevronUp size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                <p className="text-xs text-emerald-300">
                  Share your referral link to start moving up the queue.
                </p>
              </div>
            )}

            {/* Referral link */}
            <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-border/80 bg-card/60 px-3 py-2">
              <Share2 size={11} className="shrink-0 text-muted-foreground/40" />
              <code className="flex-1 truncate text-[11px] text-muted-foreground/80">{result.referralUrl}</code>
              <Button
                size="sm"
                onClick={copyLink}
                className={cn(
                  "shrink-0 gap-1 px-2.5 py-1 text-[11px]",
                  copied ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-500",
                )}
              >
                {copied ? <><CheckCircle2 size={11} />Copied</> : <><Copy size={11} />Copy</>}
              </Button>
            </div>
          </motion.div>
        )}

        {notFound && (
          <motion.p
            key="not-found"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground/80"
          >
            No account found for that email.{" "}
            <a href={`/w/${slug}`} className="text-indigo-400 hover:underline">
              Join the waitlist →
            </a>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}