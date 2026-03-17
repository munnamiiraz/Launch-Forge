"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowLeft } from "lucide-react";
import { Separator } from "@/src/components/ui/separator";

import { RequestView } from "./RequestView";
import { SentView } from "./SentView";
import { ForgotPasswordActionResult, ForgotPasswordView } from "../_types";
import { cn } from "@/src/lib/utils";

export function ForgotPasswordForm() {
  const [view, setView] = useState<ForgotPasswordView>("request");
  const [sentEmail, setSentEmail] = useState("");
  const [requestResult, setRequestResult] =
    useState<ForgotPasswordActionResult | null>(null);

  return (
    <div className="relative w-full max-w-md">
      {/* ── Card ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative rounded-2xl border border-zinc-800/80 bg-zinc-950/90",
          "p-8 shadow-2xl shadow-black/60 backdrop-blur-xl",
          "before:absolute before:inset-0 before:-z-10 before:rounded-2xl",
          "before:bg-gradient-to-b before:from-zinc-800/10 before:to-transparent"
        )}
      >
        {/* Logo */}
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
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              LaunchForge
            </span>
          </div>

          {/* Step pill */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide",
                view === "request"
                  ? "border-indigo-500/25 bg-indigo-500/10 text-indigo-400"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
              )}
            >
              {view === "request" ? "Step 1 of 2" : "Step 1 complete ✓"}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── View content ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {view === "request" ? (
            <RequestView
              key="request"
              result={requestResult}
              setResult={setRequestResult}
              onSuccess={(email) => {
                setSentEmail(email);
                setView("sent");
              }}
            />
          ) : (
            <SentView
              key="sent"
              email={sentEmail}
              onChangeEmail={() => {
                setRequestResult(null);
                setView("request");
              }}
            />
          )}
        </AnimatePresence>

        {/* Separator + bottom nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="mt-6 flex flex-col gap-4"
        >
          <Separator className="bg-zinc-800/60" />

          <div className="flex items-center justify-between">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              <ArrowLeft size={12} />
              Back to sign in
            </Link>

            <Link
              href="/register"
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              Create an account
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
