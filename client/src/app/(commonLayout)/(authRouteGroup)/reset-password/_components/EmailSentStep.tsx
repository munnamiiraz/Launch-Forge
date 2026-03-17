"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MailOpen, RefreshCw, ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { resendResetLinkAction } from "../_actions/resend-reset.action";
import { cn } from "@/src/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface EmailSentStepProps {
  email: string;
  onBack: () => void;
}

export function EmailSentStep({ email, onBack }: EmailSentStepProps) {
  const [resending, setResending] = useState(false);
  const [justResent, setJustResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const maskedEmail = email.replace(
    /(.{2})(.*)(@.*)/,
    (_, a, b, c) => a + "*".repeat(Math.max(2, b.length)) + c
  );

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    await resendResetLinkAction(email);
    setResending(false);
    setJustResent(true);
    setCooldown(60);

    // countdown
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);

    setTimeout(() => setJustResent(false), 2500);
  };

  const hints = [
    "Check your spam or junk folder",
    "The link expires in 30 minutes",
    "Only the latest link will work",
  ];

  return (
    <motion.div
      key="sent"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col"
    >
      {/* Icon */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-5 flex"
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10">
          <MailOpen size={22} className="text-indigo-400" />
          {/* pulse ring */}
          <motion.div
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-xl bg-indigo-500/20"
          />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-2"
      >
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Check your inbox
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          We sent a reset link to
        </p>
      </motion.div>

      {/* Email badge */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <Badge
          variant="outline"
          className="gap-1.5 border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5 text-xs font-normal text-zinc-300"
        >
          <MailOpen size={11} className="text-indigo-400" />
          {maskedEmail}
        </Badge>
      </motion.div>

      {/* Hints */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-6 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4"
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-600">
          Helpful tips
        </p>
        <ul className="flex flex-col gap-2">
          {hints.map((hint, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="h-1 w-1 shrink-0 rounded-full bg-indigo-500/60" />
              {hint}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Resend + back */}
      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-3"
      >
        <Separator className="bg-zinc-800" />

        <p className="text-xs text-zinc-600">Didn't get it?</p>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className={cn(
            "h-auto gap-1.5 px-3 py-1.5 text-xs font-medium",
            "text-zinc-500 hover:bg-transparent hover:text-zinc-300",
            "disabled:pointer-events-none disabled:opacity-50 transition-all duration-200"
          )}
        >
          {resending ? (
            <><Loader2 size={12} className="animate-spin" /> Sending…</>
          ) : justResent ? (
            <><MailCheck size={12} className="text-emerald-400" /><span className="text-emerald-400">Sent!</span></>
          ) : cooldown > 0 ? (
            <><RefreshCw size={12} />Resend in <span className="tabular-nums text-zinc-400">{String(Math.floor(cooldown / 60)).padStart(2,"0")}:{String(cooldown % 60).padStart(2,"0")}</span></>
          ) : (
            <><RefreshCw size={12} />Resend reset link</>
          )}
        </Button>
      </motion.div>

      {/* Back link */}
      <motion.div
        custom={5}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-4 flex justify-center"
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          <ArrowLeft size={12} />
          Use a different email
        </button>
      </motion.div>
    </motion.div>
  );
}
