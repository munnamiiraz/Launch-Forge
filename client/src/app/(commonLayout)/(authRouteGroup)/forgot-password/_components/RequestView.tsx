"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle, Mail, KeyRound } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Card, CardContent } from "@/src/components/ui/card";

import { requestPasswordResetAction } from "../_actions/forgot-password.action";
import { cn } from "@/src/lib/utils";

import { fadeUp } from "@/src/lib/motion";

interface RequestViewProps {
  onSuccess: (email: string) => void;
}

export function RequestView({ onSuccess }: RequestViewProps) {
  const mutation = useMutation({
    mutationFn: (email: string) => requestPasswordResetAction(email),
    onSuccess: (result, email) => {
      if (result.success) onSuccess(email);
    },
  });

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value.email);
    },
  });

  const serverError = mutation.data && !mutation.data.success
    ? mutation.data.error
    : undefined;

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
          <motion.div
            initial={{ scale: 1, opacity: 0.25 }}
            animate={{ scale: 1.55, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            className="absolute inset-0 rounded-xl bg-indigo-500/30"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Forgot your password?</h1>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            Enter your email and we'll send you a 6-digit OTP to reset it.
          </p>
        </div>
      </motion.div>

      {/* What happens next */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <Card className="border-zinc-800/70 bg-zinc-900/40">
          <CardContent className="px-4 py-3">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              What happens next
            </p>
            <ol className="flex flex-col gap-2">
              {[
                "We'll email you a 6-digit OTP code",
                "Enter the OTP — it's valid for 10 minutes",
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Email address
          </Label>
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "Email is required"
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                  ? "Please enter a valid email address"
                  : undefined,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <div className="relative">
                  <Mail size={14} className="pointer-events-none absolute inset-y-0 left-3 my-auto text-zinc-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ada@example.com"
                    autoComplete="email"
                    autoFocus
                    disabled={mutation.isPending}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={cn(
                      "border-zinc-800 bg-zinc-900/60 pl-9 text-zinc-100 placeholder:text-zinc-600",
                      "focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/50 transition-all duration-200",
                      field.state.meta.errors.length > 0 &&
                        "border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                    )}
                  />
                </div>
                <AnimatePresence>
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs text-red-400"
                    >
                      <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                      {field.state.meta.errors[0]}
                    </motion.p>
                  )}
                  {mutation.data && !mutation.data.success && mutation.data.fieldError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs text-red-400"
                    >
                      <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                      {mutation.data.fieldError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </form.Field>
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

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className={cn(
              "group relative w-full overflow-hidden",
              "bg-indigo-600 text-sm font-medium text-white",
              "hover:bg-indigo-500 transition-all duration-200",
              "disabled:pointer-events-none disabled:opacity-60"
            )}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            {mutation.isPending ? (
              <><Loader2 size={14} className="animate-spin" />Sending OTP…</>
            ) : (
              <>Send OTP<ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" /></>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
