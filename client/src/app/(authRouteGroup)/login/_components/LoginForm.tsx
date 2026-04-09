"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Zap,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

// shadcn/ui primitives
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Separator } from "@/src/components/ui/separator";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

import { loginAction } from "../_actions/login.action";
import { LoginActionResult } from "../_types";
import { SocialAuth } from "../../register/_components/SocialAuth";
import { PasswordFieldWithToggle } from "./PasswordFieldWithToggle";
import { cn } from "@/src/lib/utils";

/* ─── animation variants (mirror Register) ─────────────────────────── */
import { fadeUp } from "@/src/lib/motion";

/* ─── component ─────────────────────────────────────────────────────── */
export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<LoginActionResult | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("rememberMe", String(rememberMe));

    startTransition(async () => {
      const res = await loginAction(formData);
      setResult(res);
      if (res.success) {
        setTimeout(() => router.push("/"), 1100);
      }
    });
  };

  const fe = (k: keyof NonNullable<LoginActionResult["fieldErrors"]>) =>
    result?.fieldErrors?.[k];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative w-full max-w-md">
        {/* ── Card ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative rounded-2xl border border-border/80 bg-background/90",
            "p-8 shadow-2xl shadow-black/60 backdrop-blur-xl",
            "before:absolute before:inset-0 before:-z-10 before:rounded-2xl",
            "before:bg-linear-to-b before:from-zinc-800/10 before:to-transparent"
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
            <span className="text-sm font-semibold tracking-tight text-foreground">
              LaunchForge
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground/80">
              Sign in to your LaunchForge workspace.
            </p>
          </motion.div>

          {/* Social Auth */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <SocialAuth />
          </motion.div>

          {/* Divider — shadcn Separator */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-5 flex items-center gap-3"
          >
            <Separator className="flex-1 bg-border dark:bg-zinc-800" />
            <span className="text-xs text-muted-foreground/60">or continue with email</span>
            <Separator className="flex-1 bg-border dark:bg-zinc-800" />
          </motion.div>

          {/* ── Form body ───────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {result?.success ? (
              /* Success state */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                  <CheckCircle2 size={22} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Signed in successfully!
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground/80">
                    Redirecting to your dashboard…
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {/* Email field */}
                <motion.div
                  custom={4}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-1.5"
                >
                  <Label
                    htmlFor="email"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ada@example.com"
                    autoComplete="email"
                    disabled={isPending}
                    className={cn(
                      "h-11 rounded-xl border-border/80 dark:border-zinc-800 bg-card/60 px-4 text-foreground placeholder:text-muted-foreground/60",
                      "focus-visible:border-ring/40 focus-visible:ring-1 focus-visible:ring-ring/20",
                      "transition-all duration-200",
                      fe("email") &&
                        "border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                    )}
                  />
                  {fe("email") && (
                    <p className="flex items-center gap-1 text-xs text-red-400">
                      <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                      {fe("email")}
                    </p>
                  )}
                </motion.div>

                {/* Password field */}
                <motion.div
                  custom={5}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground/80 transition-colors hover:text-foreground/80"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordFieldWithToggle
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isPending}
                    hasError={!!fe("password")}
                  />
                  {fe("password") && (
                    <p className="flex items-center gap-1 text-xs text-red-400">
                      <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                      {fe("password")}
                    </p>
                  )}
                </motion.div>

                {/* Remember me — shadcn Checkbox */}
                <motion.div
                  custom={6}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2.5"
                >
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(Boolean(v))}
                    disabled={isPending}
                    className="border-zinc-700 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-600"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="cursor-pointer select-none text-sm text-muted-foreground"
                  >
                    Keep me signed in
                  </label>

                  {/* Tooltip hint */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ShieldCheck
                        size={14}
                        className="cursor-help text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80"
                    >
                      Stays signed in for 30 days on this device.
                    </TooltipContent>
                  </Tooltip>
                </motion.div>

                {/* Global error — shadcn Alert */}
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

                {/* Submit — shadcn Button, extended with shimmer */}
                <motion.div
                  custom={7}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="w-full"
                >
                  <Button
                    type="submit"
                    size="xl"
                    disabled={isPending}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-xl",
                      "bg-indigo-600 font-semibold text-white",
                      "hover:bg-indigo-500 transition-all duration-200",
                      "disabled:pointer-events-none disabled:opacity-60"
                    )}
                  >
                    {/* shimmer sweep */}
                    <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

                    {isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sign-up link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-5 text-center text-sm text-muted-foreground/60"
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground/90 hover:underline"
          >
            Create one free
          </Link>
        </motion.p>
      </div>
    </TooltipProvider>
  );
}
