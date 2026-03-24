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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border/80 bg-card/30 p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/25 bg-indigo-500/10">
          <Mail size={14} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Stay in the loop
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/80">
            Product updates, growth tips, and launch stories. No spam, ever.
          </p>
        </div>
      </div>

      {/* Form / success */}
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3"
          >
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <p className="text-xs text-emerald-400">
              You're subscribed! Check your inbox for a welcome email.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-2">
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isPending}
                className={cn(
                  "h-9 flex-1 border-zinc-800 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/60",
                  "focus-visible:border-indigo-500/60 focus-visible:ring-1 focus-visible:ring-indigo-500/20",
                  "transition-all duration-200"
                )}
              />
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className={cn(
                  "group relative h-9 shrink-0 overflow-hidden px-3.5",
                  "bg-indigo-600 text-xs font-medium text-white",
                  "hover:bg-indigo-500 transition-all duration-200",
                  "disabled:pointer-events-none disabled:opacity-60"
                )}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                {isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight size={12} className="ml-1 transition-transform duration-150 group-hover:translate-x-0.5" />
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
                  className="text-xs text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <p className="text-[10px] text-muted-foreground/40">
              By subscribing you agree to our{" "}
              <a href="/privacy" className="text-muted-foreground/60 underline-offset-2 hover:underline">
                Privacy Policy
              </a>
              . Unsubscribe anytime.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
