"use client";

import { useState, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  PartyPopper,
  Users,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

import { joinWaitlistAction } from "../../../../../services/hero-section/waitlist.action";
import type { HeroWaitlistJoinResult } from "../_types";
import { cn } from "@/src/lib/utils";

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className }: WaitlistFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<HeroWaitlistJoinResult | null>(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await joinWaitlistAction(fd);
      setResult(res);
    });
  };

  const copyReferral = () => {
    if (!result?.referralCode) return;
    const url = `${window.location.origin}?ref=${result.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("w-full", className)}>
        <AnimatePresence mode="wait">
          {result?.success ? (
            /* ── Success state ──────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center"
            >
              {/* Confetti-ish icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 16 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10"
              >
                <PartyPopper size={26} className="text-emerald-400" />
              </motion.div>

              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  You're on the list! 🎉
                </p>
                <p className="text-sm text-muted-foreground/80">
                  You're{" "}
                  <span className="font-semibold text-foreground/80">
                    #{result.position?.toLocaleString()}
                  </span>{" "}
                  in line. Move up by referring friends.
                </p>
              </div>

              {/* Referral link */}
              <div className="w-full space-y-2">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
                  Your referral link
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-card/60 p-1.5 pl-3.5">
                  <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                    {`${typeof window !== "undefined" ? window.location.origin : "https://launchforge.app"}?ref=${result.referralCode}`}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        onClick={copyReferral}
                        className={cn(
                          "h-7 shrink-0 gap-1.5 rounded-lg px-3 text-xs transition-all duration-200",
                          copied
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-zinc-800 hover:bg-zinc-700 text-foreground/80"
                        )}
                      >
                        {copied ? (
                          <><Check size={11} />Copied!</>
                        ) : (
                          <><Copy size={11} />Copy</>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80">
                      Copy your unique referral link
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Referral perks */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <Users size={12} />
                <span>Each referral moves you up <span className="text-muted-foreground">5 spots</span></span>
              </div>
            </motion.div>
          ) : (
            /* ── Input form ─────────────────────────────────── */
            <motion.form
              key="form"
              ref={formRef}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-3"
            >
              {/* Name + Email row on md+ */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-col gap-1.5 sm:flex-1">
                  <Label
                    htmlFor="hero-name"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80"
                  >
                    Your name
                  </Label>
                  <Input
                    id="hero-name"
                    name="name"
                    placeholder="Ada Lovelace"
                    autoComplete="name"
                    disabled={isPending}
                    className={cn(
                      "border-zinc-800 bg-card/60 text-foreground placeholder:text-muted-foreground/60",
                      "focus-visible:border-indigo-500/60 focus-visible:ring-1 focus-visible:ring-indigo-500/20",
                      "h-11 transition-all duration-200"
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:flex-1">
                  <Label
                    htmlFor="hero-email"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80"
                  >
                    Email address
                  </Label>
                  <Input
                    id="hero-email"
                    name="email"
                    type="email"
                    placeholder="ada@example.com"
                    autoComplete="email"
                    disabled={isPending}
                    className={cn(
                      "border-zinc-800 bg-card/60 text-foreground placeholder:text-muted-foreground/60",
                      "focus-visible:border-indigo-500/60 focus-visible:ring-1 focus-visible:ring-indigo-500/20",
                      "h-11 transition-all duration-200",
                      result?.fieldError &&
                        "border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                    )}
                  />
                </div>
              </div>

              {/* Field error */}
              <AnimatePresence>
                {result?.fieldError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs text-red-400"
                  >
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    {result.fieldError}
                  </motion.p>
                )}
                {result?.error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs text-red-400"
                  >
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    {result.error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* CTA button */}
              <Button
                type="submit"
                disabled={isPending}
                className={cn(
                  "group relative h-11 w-full overflow-hidden rounded-xl",
                  "bg-indigo-600 text-sm font-semibold text-white",
                  "hover:bg-indigo-500 transition-all duration-200",
                  "disabled:pointer-events-none disabled:opacity-60"
                )}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                {isPending ? (
                  <><Loader2 size={15} className="animate-spin" />Reserving your spot…</>
                ) : (
                  <>
                    Join the waitlist — it's free
                    <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                {[
                  "No credit card required",
                  "Early-access pricing",
                  "Cancel anytime",
                ].map((text) => (
                  <span
                    key={text}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground/60"
                  >
                    <CheckCircle2 size={10} className="text-muted-foreground/40" />
                    {text}
                  </span>
                ))}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
