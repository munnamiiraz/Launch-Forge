"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowLeft } from "lucide-react";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";

import { RequestView } from "./RequestView";
import { VerifyView } from "./VerifyView";
import { DoneView } from "./DoneView";
import { ForgotPasswordView } from "../_types";

const STEP_LABELS: Record<ForgotPasswordView, { pill: string; pillColor: string }> = {
  request: { pill: "Step 1 of 2", pillColor: "border-indigo-500/25 bg-indigo-500/10 text-indigo-400" },
  verify:  { pill: "Step 2 of 2", pillColor: "border-amber-500/25 bg-amber-500/10 text-amber-400" },
  done:    { pill: "Complete ✓",  pillColor: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" },
};

export function ForgotPasswordForm() {
  const [view, setView] = useState<ForgotPasswordView>("request");
  const [email, setEmail] = useState("");

  const { pill, pillColor } = STEP_LABELS[view];

  return (
    <div className="relative w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative rounded-2xl border border-border/80 bg-background/90",
          "p-8 shadow-2xl shadow-black/60 backdrop-blur-xl",
          "before:absolute before:inset-0 before:-z-10 before:rounded-2xl",
          "before:bg-gradient-to-b before:from-zinc-800/10 before:to-transparent"
        )}
      >
        {/* Logo + step pill */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/15">
              <Zap size={15} className="text-indigo-400" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">LaunchForge</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide", pillColor)}
            >
              {pill}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {view === "request" && (
            <RequestView
              key="request"
              onSuccess={(submittedEmail) => {
                setEmail(submittedEmail);
                setView("verify");
              }}
            />
          )}
          {view === "verify" && (
            <VerifyView
              key="verify"
              email={email}
              onBack={() => setView("request")}
              onSuccess={() => setView("done")}
            />
          )}
          {view === "done" && <DoneView key="done" />}
        </AnimatePresence>

        {/* Bottom nav — hide on done */}
        {view !== "done" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-6 flex flex-col gap-4"
          >
            <Separator className="bg-muted/60" />
            <div className="flex items-center justify-between">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                <ArrowLeft size={12} />
                Back to sign in
              </Link>
              <Link href="/register" className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground">
                Create an account
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
