"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle2, Mail } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

async function subscribeToNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
  /**
   * Wire to your email marketing provider:
   *
   * await fetch("/api/newsletter/subscribe", {
   *   method: "POST",
   *   body: JSON.stringify({ email }),
   * });
   */
  await new Promise((r) => setTimeout(r, 700));
  return { success: true };
}

export function FooterNewsletter() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (new FormData(e.currentTarget).get("email") as string)?.trim();
    if (!email) return;
    setError(null);

    startTransition(async () => {
      const res = await subscribeToNewsletter(email);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <div className="w-full">
      {/* Form / success */}
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-6 py-5"
          >
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              You're subscribed! Check your inbox for a welcome email.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={isPending}
                className={cn(
                  "h-12 flex-1 border-border bg-background text-base text-foreground placeholder:text-muted-foreground/60 rounded-xl",
                  "focus-visible:border-indigo-500/60 focus-visible:ring-1 focus-visible:ring-indigo-500/20",
                  "transition-all duration-200"
                )}
              />
              <Button
                type="submit"
                disabled={isPending}
                className={cn(
                  "group relative h-12 shrink-0 overflow-hidden px-8 rounded-xl",
                  "bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20",
                  "hover:bg-indigo-500 transition-all duration-200",
                  "disabled:pointer-events-none disabled:opacity-60"
                )}
              >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                {isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight size={18} className="ml-2 transition-transform duration-150 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-400 text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <p className="text-[11px] text-muted-foreground/40 text-center">
              By subscribing you agree to our{" "}
              <a href="/privacy" className="text-muted-foreground/60 font-semibold underline-offset-4 hover:underline">
                Privacy Policy
              </a>
              . Unsubscribe anytime.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
