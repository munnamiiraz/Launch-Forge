"use client";

import { useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle, Mail } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

import { forgotPasswordAction } from "../_actions/reset-password.action";
import { ForgotPasswordActionResult } from "../_types";
import { cn } from "@/src/lib/utils";

import { fadeUp } from "@/src/lib/motion";

interface ForgotPasswordStepProps {
  result: ForgotPasswordActionResult | null;
  setResult: (r: ForgotPasswordActionResult | null) => void;
  onSuccess: (email: string) => void;
}

export function ForgotPasswordStep({
  result,
  setResult,
  onSuccess,
}: ForgotPasswordStepProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await forgotPasswordAction(formData);
      setResult(res);
      if (res.success) {
        onSuccess((formData.get("email") as string) ?? "");
      }
    });
  };

  return (
    <motion.div
      key="forgot"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Heading */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your email and we'll send you a secure reset link.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-1.5"
        >
          <Label
            htmlFor="email"
            className="text-xs font-medium uppercase tracking-wide text-zinc-400"
          >
            Email address
          </Label>
          <div className="relative">
            <Mail
              size={14}
              className="pointer-events-none absolute inset-y-0 left-3 my-auto text-zinc-600"
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ada@example.com"
              autoComplete="email"
              autoFocus
              disabled={isPending}
              className={cn(
                "border-zinc-800 bg-zinc-900/60 pl-9 text-zinc-100 placeholder:text-zinc-600",
                "focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/50",
                "transition-all duration-200",
                result?.fieldError &&
                  "border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/20"
              )}
            />
          </div>
          {result?.fieldError && (
            <p className="flex items-center gap-1 text-xs text-red-400">
              <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
              {result.fieldError}
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
                Sending link…
              </>
            ) : (
              <>
                Send reset link
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
  );
}
