"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Loader2, AlertCircle, MailOpen,
  RefreshCw, MailCheck, ShieldCheck, Pencil,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/src/components/ui/tooltip";

import { OtpInput } from "../../verify-email/_components/OtpInput";
import { resetPasswordWithOtpAction, resendPasswordResetOtpAction } from "../_actions/forgot-password.action";
import { PasswordFieldWithToggle } from "../../login/_components/PasswordFieldWithToggle";
import { PasswordStrength } from "../../register/_components/PasswordStrength";
import { cn } from "@/src/lib/utils";

import { fadeUp, shakeVariants } from "@/src/lib/motion";

interface VerifyViewProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function VerifyView({ email, onBack, onSuccess }: VerifyViewProps) {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const [cooldown, setCooldown] = useState(60);
  const [justResent, setJustResent] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(intervalRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const resetMutation = useMutation({
    mutationFn: () => resetPasswordWithOtpAction(email, otp, password, confirmPassword),
    onSuccess: (result) => {
      if (result.success) {
        onSuccess();
      } else if (result.error?.toLowerCase().includes("otp") || result.fieldErrors?.otp) {
        setShakeKey((k) => k + 1);
        setOtp("");
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendPasswordResetOtpAction(email),
    onSuccess: (result) => {
      if (result.success) {
        setJustResent(true);
        setCooldown(60);
        intervalRef.current = setInterval(() => {
          setCooldown((c) => {
            if (c <= 1) { clearInterval(intervalRef.current!); return 0; }
            return c - 1;
          });
        }, 1000);
        setTimeout(() => setJustResent(false), 2800);
      }
    },
  });

  // Client-side validation
  const otpError = otpTouched && otp.length !== 6 ? "OTP must be 6 digits" : undefined;
  const passwordError = passwordTouched
    ? !password ? "Password is required"
    : password.length < 8 ? "At least 8 characters"
    : !/[A-Z]/.test(password) ? "At least one uppercase letter"
    : !/[0-9]/.test(password) ? "At least one number"
    : undefined
    : undefined;
  const confirmError = confirmTouched && password !== confirmPassword ? "Passwords do not match" : undefined;

  const serverError = resetMutation.data && !resetMutation.data.success ? resetMutation.data.error : undefined;
  const serverFieldErrors = resetMutation.data && !resetMutation.data.success ? resetMutation.data.fieldErrors : undefined;

  const canSubmit = otp.length === 6 && password.length >= 8 && password === confirmPassword && !resetMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);
    if (!canSubmit) return;
    resetMutation.mutate();
  };

  const maskedEmail = email.replace(
    /(.{2})(.*)(@.*)/,
    (_, a, b, c) => a + "*".repeat(Math.max(2, b.length)) + c
  );

  const mm = String(Math.floor(cooldown / 60)).padStart(2, "0");
  const ss = String(cooldown % 60).padStart(2, "0");

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        key="verify"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 18 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-5"
      >
        {/* Header */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10">
            <MailOpen size={22} className="text-indigo-400" />
            <motion.div
              initial={{ scale: 1, opacity: 0.2 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-xl bg-indigo-500/30"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Check your inbox</h2>
            <p className="mt-0.5 text-sm text-zinc-500">We sent a 6-digit OTP to</p>
          </div>
        </motion.div>

        {/* Email badge + change */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5 text-xs font-normal text-zinc-300">
            <MailOpen size={11} className="text-indigo-400" />
            {maskedEmail}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onBack} className="flex items-center gap-1 text-xs text-zinc-600 transition-colors hover:text-zinc-400">
                <Pencil size={11} />
                Change
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
              Go back and use a different email
            </TooltipContent>
          </Tooltip>
        </motion.div>

        <Separator className="bg-zinc-800/60" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* OTP */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col items-center gap-2">
            <Label className="w-full text-xs font-medium uppercase tracking-wide text-zinc-400">
              6-digit OTP
            </Label>
            <motion.div
              key={shakeKey}
              variants={shakeVariants}
              initial="idle"
              animate={serverFieldErrors?.otp || (otpTouched && otpError) ? "shake" : "idle"}
              className="w-full flex justify-center"
            >
              <OtpInput
                value={otp}
                onChange={(val) => { setOtp(val); setOtpTouched(true); }}
                disabled={resetMutation.isPending}
                hasError={!!(otpTouched && otpError) || !!serverFieldErrors?.otp}
              />
            </motion.div>
            <AnimatePresence>
              {otpTouched && otpError && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-xs text-red-400">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-400" />{otpError}
                </motion.p>
              )}
              {serverFieldErrors?.otp && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-xs text-red-400">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-400" />{serverFieldErrors.otp}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* New password */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                New password
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ShieldCheck size={12} className="cursor-help text-zinc-600 hover:text-zinc-400 transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
                  Min. 8 chars, 1 uppercase, 1 number.
                </TooltipContent>
              </Tooltip>
            </div>
            <PasswordFieldWithToggle
              id="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              disabled={resetMutation.isPending}
              hasError={!!(passwordTouched && passwordError) || !!serverFieldErrors?.password}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
              onBlur={() => setPasswordTouched(true)}
            />
            <PasswordStrength password={password} />
            <AnimatePresence>
              {passwordTouched && passwordError && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-xs text-red-400">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-400" />{passwordError}
                </motion.p>
              )}
              {serverFieldErrors?.password && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-xs text-red-400">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-400" />{serverFieldErrors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Confirm password */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Confirm password
            </Label>
            <PasswordFieldWithToggle
              id="confirmPassword"
              placeholder="Repeat your password"
              autoComplete="new-password"
              disabled={resetMutation.isPending}
              hasError={!!(confirmTouched && confirmError) || !!serverFieldErrors?.confirmPassword}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setConfirmTouched(true); }}
              onBlur={() => setConfirmTouched(true)}
            />
            <AnimatePresence>
              {confirmTouched && confirmError && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-xs text-red-400">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-400" />{confirmError}
                </motion.p>
              )}
              {serverFieldErrors?.confirmPassword && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-xs text-red-400">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-400" />{serverFieldErrors.confirmPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Server error */}
          <AnimatePresence>
            {serverError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 py-2.5">
                  <AlertCircle size={14} className="text-red-400" />
                  <AlertDescription className="text-xs text-red-400">{serverError}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security note */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-start gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3 py-2.5">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-zinc-600" />
              <p className="text-xs leading-relaxed text-zinc-600">
                This OTP expires in <span className="text-zinc-500">10 minutes</span>. Never share it with anyone.
              </p>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
            <Button
              type="submit"
              disabled={resetMutation.isPending}
              className={cn(
                "group relative w-full overflow-hidden",
                "bg-indigo-600 text-sm font-medium text-white",
                "hover:bg-indigo-500 transition-all duration-200",
                "disabled:pointer-events-none disabled:opacity-60"
              )}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              {resetMutation.isPending ? (
                <><Loader2 size={14} className="animate-spin" />Resetting password…</>
              ) : (
                <>Reset password<ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" /></>
              )}
            </Button>
          </motion.div>
        </form>

        {/* Resend OTP */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col items-center gap-1.5">
          <Separator className="bg-zinc-800/60" />
          <AnimatePresence>
            {resendMutation.data && !resendMutation.data.success && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-xs text-red-400">
                {resendMutation.data.error}
              </motion.p>
            )}
          </AnimatePresence>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending || cooldown > 0}
            className={cn(
              "h-auto gap-1.5 px-3 py-1.5 text-xs font-medium",
              "text-zinc-500 hover:bg-transparent hover:text-zinc-300",
              "disabled:pointer-events-none disabled:opacity-50 transition-all duration-200"
            )}
          >
            {resendMutation.isPending ? (
              <><Loader2 size={12} className="animate-spin" />Sending…</>
            ) : justResent ? (
              <><MailCheck size={12} className="text-emerald-400" /><span className="text-emerald-400">OTP sent again!</span></>
            ) : cooldown > 0 ? (
              <><RefreshCw size={12} />Resend in <span className="tabular-nums text-zinc-400">{mm}:{ss}</span></>
            ) : (
              <><RefreshCw size={12} />Resend OTP</>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
