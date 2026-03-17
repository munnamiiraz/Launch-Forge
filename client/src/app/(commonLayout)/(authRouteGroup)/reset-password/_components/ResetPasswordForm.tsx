"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowLeft } from "lucide-react";
import { cn } from "@/src/lib/utils";

import { ForgotPasswordStep } from "./ForgotPasswordStep";
import { EmailSentStep } from "./EmailSentStep";
import { NewPasswordStep } from "./NewPasswordStep";
import { DoneStep } from "./DoneStep";
import { InvalidTokenView } from "./InvalidTokenView";
import { StepIndicator } from "./StepIndicator";
import {
  ForgotPasswordActionResult,
  ResetPasswordActionResult,
  ResetStep,
} from "../_types";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ?token=... is present when arriving via the reset email link
  const token = searchParams.get("token") ?? "";

  // Determine initial step: if a token is present in URL, jump straight to "reset"
  const [step, setStep] = useState<ResetStep>(token ? "reset" : "request");
  const [sentEmail, setSentEmail] = useState("");

  const [forgotResult, setForgotResult] =
    useState<ForgotPasswordActionResult | null>(null);
  const [resetResult, setResetResult] =
    useState<ResetPasswordActionResult | null>(null);

  // Show invalid-token view when arriving with a bad/missing token
  const showInvalidToken = step === "reset" && !token;

  // Which step number to highlight in the indicator
  const indicatorStep: 1 | 2 =
    step === "request" || step === "sent" ? 1 : 2;

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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/15">
            <Zap size={15} className="text-indigo-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            LaunchForge
          </span>
        </motion.div>

        {/* Step indicator — only show on request / reset steps, not done/sent */}
        <AnimatePresence>
          {(step === "request" || step === "reset") && !showInvalidToken && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StepIndicator currentStep={indicatorStep} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step content ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === "request" && (
            <ForgotPasswordStep
              key="request"
              result={forgotResult}
              setResult={setForgotResult}
              onSuccess={(email) => {
                setSentEmail(email);
                setStep("sent");
              }}
            />
          )}

          {step === "sent" && (
            <EmailSentStep
              key="sent"
              email={sentEmail}
              onBack={() => {
                setForgotResult(null);
                setStep("request");
              }}
            />
          )}

          {step === "reset" && !showInvalidToken && (
            <NewPasswordStep
              key="reset"
              token={token}
              result={resetResult}
              setResult={setResetResult}
              onSuccess={() => {
                setStep("done");
                // auto-redirect after 5s (handled inside DoneStep)
                setTimeout(() => router.push("/login"), 5000);
              }}
            />
          )}

          {step === "reset" && showInvalidToken && (
            <InvalidTokenView key="invalid" />
          )}

          {step === "done" && <DoneStep key="done" />}
        </AnimatePresence>
      </motion.div>

      {/* Back to sign-in — hide on done/sent (they have their own CTAs) */}
      <AnimatePresence>
        {step !== "done" && step !== "sent" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="mt-5 flex justify-center"
          >
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-400"
            >
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
