"use client";

import { useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle, Mail, KeyRound } from "lucide-react";

// shadcn
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Card, CardContent } from "@/src/components/ui/card";

import { forgotPasswordAction } from "../_actions/forgot-password.action";
import { ForgotPasswordActionResult } from "../_types";
import { cn } from "@/src/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface RequestViewProps {
  result: ForgotPasswordActionResult | null;
  setResult: (r: ForgotPasswordActionResult | null) => void;
  onSuccess: (email: string) => void;
}

export function RequestView({ result, setResult, onSuccess }: RequestViewProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await forgotPasswordAction(fd);
      setResult(res);
      if (res.success) onSuccess((fd.get("email") as string) ?? "");
    });
  };

  return (
    <motion.div
      key="request"
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Icon + Heading */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-6 flex items-start gap-4"
      >
        <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10">
          <KeyRound size={18} className="text-indigo-400" />
          {/* subtle pulse */}
          <motion.div
            initial={{ scale: 1, opacity: 0.25 }}
            animate={{ scale: 1.55, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            className="absolute inset-0 rounded-xl bg-indigo-500/30"
          />
        </div>

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Forgot your password?
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            No worries — enter your email and we'll send
            you a secure link to reset it.
          </p>
        </div>
      </motion.div>

      {/* What happens next — shadcn Card used as an info block */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <Card className="border-zinc-800/70 bg-zinc-900/40">
          <CardContent className="px-4 py-3">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              What happens next
            </p>
            <ol className="flex flex-col gap-2">
              {[
                "We'll email you a secure reset link",
                "Click the link — it's valid for 30 minutes",
                "Choose a new password and sign back in",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-500">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-800/60 text-[10px] font-semibold text-zinc-400">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email field */}
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
          <AnimatePresence>
            {result?.fieldError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-xs text-red-400"
              >
                <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                {result.fieldError}
              </motion.p>
            )}
          </AnimatePresence>
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
