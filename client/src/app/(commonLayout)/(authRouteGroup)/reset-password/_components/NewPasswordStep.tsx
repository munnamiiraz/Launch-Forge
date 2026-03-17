"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

import { resetPasswordAction } from "../_actions/reset-password.action";
import { ResetPasswordActionResult } from "../_types";
import { PasswordFieldWithToggle } from "../../login/_components/PasswordFieldWithToggle";
import { PasswordStrength } from "../../../(authRouteGroup)/register/_components/PasswordStrength";
import { cn } from "@/src/lib/utils";

import { fadeUp } from "@/src/lib/motion";

interface NewPasswordStepProps {
  token: string;
  result: ResetPasswordActionResult | null;
  setResult: (r: ResetPasswordActionResult | null) => void;
  onSuccess: () => void;
}

export function NewPasswordStep({
  token,
  result,
  setResult,
  onSuccess,
}: NewPasswordStepProps) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await resetPasswordAction(formData);
      setResult(res);
      if (res.success) onSuccess();
    });
  };

  const fe = (k: keyof NonNullable<ResetPasswordActionResult["fieldErrors"]>) =>
    result?.fieldErrors?.[k];

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        key="newpass"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Icon + heading */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-5 flex items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10">
            <KeyRound size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Set new password
            </h1>
            <p className="text-sm text-zinc-500">
              Choose something strong and unique.
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Password */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wide text-zinc-400"
              >
                New password
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ShieldCheck
                    size={12}
                    className="cursor-help text-zinc-600 hover:text-zinc-400 transition-colors"
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="border-zinc-800 bg-zinc-900 text-xs text-zinc-300"
                >
                  Min. 8 chars, 1 uppercase, 1 number.
                </TooltipContent>
              </Tooltip>
            </div>
            <PasswordFieldWithToggle
              id="password"
              name="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              disabled={isPending}
              hasError={!!fe("password")}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrength password={password} />
            {fe("password") && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                {fe("password")}
              </p>
            )}
          </motion.div>

          {/* Confirm password */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-1.5"
          >
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Confirm password
            </Label>
            <PasswordFieldWithToggle
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Repeat your password"
              autoComplete="new-password"
              disabled={isPending}
              hasError={!!fe("confirmPassword")}
            />
            {fe("confirmPassword") && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                {fe("confirmPassword")}
              </p>
            )}
          </motion.div>

          {/* Global error */}
          <AnimatePresence>
            {result?.error && (
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
                    {result.error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "group relative w-full overflow-hidden",
                "bg-indigo-600 text-sm font-medium text-white",
                "hover:bg-indigo-500 transition-all duration-200",
                "disabled:pointer-events-none disabled:opacity-60"
              )}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Updating password…
                </>
              ) : (
                <>
                  Update password
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </TooltipProvider>
  );
}
