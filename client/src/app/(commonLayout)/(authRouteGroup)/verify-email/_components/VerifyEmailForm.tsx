"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

import { OtpInput } from "../_components/OtpInput";
import { ResendButton } from "../_components/ResendButton";
import { verifyEmailAction } from "../_actions/verify-email.action";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

/* ── animation variants (identical system to Register / Login) ────── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── slot shake animation for wrong code ─────────────────────────── */
const shakeVariants: any = {
  idle: { x: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.45, ease: "easeInOut" },
  },
};

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // email passed as ?email=... query param from the register flow
  const email = searchParams.get("email") ?? "";
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(2, b.length)) + c)
    : "your email";

  const [otp, setOtp] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const isComplete = otp.length === 6;

  const runVerify = (otpValue: string) => {
    setError(null);
    startTransition(async () => {
      const result = await verifyEmailAction(otpValue, email);
      if (result.success) {
        setSuccess(true);
        toast.success("Email verified successfully!");
        setTimeout(() => router.push("/"), 1300);
      } else {
        const message = result.error ?? "Verification failed. Please try again.";
        setError(message);
        toast.error(message);
        setOtp("");
        setShakeKey((k) => k + 1);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isPending) return;
    runVerify(otp);
  };

  // Auto-submit when all 6 digits are entered
  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
    if (value.length === 6) runVerify(value);
  };

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
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8 flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/15">
            <Zap size={15} className="text-indigo-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            LaunchForge
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            /* ── Success state ──────────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-4 py-4 text-center"
            >
              {/* Animated checkmark ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex h-16 w-16 items-center justify-center"
              >
                {/* Outer pulse ring */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-emerald-500/20"
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
              </motion.div>

              <div className="space-y-1">
                <p className="text-base font-semibold text-zinc-100">
                  Email verified!
                </p>
                <p className="text-sm text-zinc-500">
                  Your account is ready. Taking you to your dashboard…
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <Loader2 size={11} className="animate-spin" />
                Redirecting
              </div>
            </motion.div>
          ) : (
            /* ── Verify form ────────────────────────────────────── */
            <motion.div key="form" className="flex flex-col">
              {/* Heading */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-2"
              >
                <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
                  Check your email
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  We sent a 6-digit verification code to
                </p>
              </motion.div>

              {/* Email badge */}
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-7"
              >
                <Badge
                  variant="outline"
                  className="gap-1.5 border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5 text-xs font-normal text-zinc-300"
                >
                  <Mail size={11} className="text-indigo-400" />
                  {maskedEmail}
                </Badge>
              </motion.div>

              {/* OTP input */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div
                    key={shakeKey}
                    variants={shakeVariants}
                    initial="idle"
                    animate={error ? "shake" : "idle"}
                    className="w-full"
                  >
                    <OtpInput
                      value={otp}
                      onChange={handleOtpChange}
                      disabled={isPending}
                      hasError={!!error}
                    />
                  </motion.div>

                  {/* Inline loading indicator while auto-submitting */}
                  <AnimatePresence>
                    {isPending && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-xs text-zinc-500"
                      >
                        <Loader2 size={11} className="animate-spin" />
                        Verifying…
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Error alert */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Alert
                        variant="destructive"
                        className="border-red-500/20 bg-red-500/5 py-2.5"
                      >
                        <AlertCircle size={14} className="text-red-400" />
                        <AlertDescription className="text-xs text-red-400">
                          {error}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button — only shown when 6 digits typed (auto-submit handles it,
                    but keep as fallback for accessibility / paste flows) */}
                <motion.div
                  custom={4}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <Button
                    type="submit"
                    disabled={!isComplete || isPending}
                    className={cn(
                      "group relative w-full overflow-hidden",
                      "bg-indigo-600 text-sm font-medium text-white",
                      "hover:bg-indigo-500 transition-all duration-200",
                      "disabled:pointer-events-none disabled:opacity-50"
                    )}
                  >
                    {/* shimmer sweep */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

                    {isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify email
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Separator + resend */}
                <motion.div
                  custom={5}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col items-center gap-3"
                >
                  <Separator className="bg-zinc-800" />

                  <div className="flex flex-col items-center gap-0.5">
                    <p className="text-xs text-zinc-600">Didn't receive the email?</p>
                    <ResendButton email={email} />
                  </div>
                </motion.div>

                {/* Security note */}
                <motion.div
                  custom={6}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-start gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3 py-2.5">
                    <ShieldCheck size={13} className="mt-0.5 shrink-0 text-zinc-600" />
                    <p className="text-xs leading-relaxed text-zinc-600">
                      For security, this code expires in{" "}
                      <span className="text-zinc-500">10 minutes</span>. Never share
                      this code with anyone.
                    </p>
                  </div>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Back to login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
    </div>
  );
}