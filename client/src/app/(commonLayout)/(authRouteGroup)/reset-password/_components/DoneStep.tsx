"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function DoneStep() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(iv); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-5 py-2 text-center"
    >
      {/* Animated ring + icon */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative flex h-16 w-16 items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-emerald-500/20"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10"
        >
          <CheckCircle2 size={28} className="text-emerald-400" />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-1.5"
      >
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          Password updated!
        </h2>
        <p className="text-sm text-zinc-500">
          Your password has been reset successfully.
          <br />
          You can now sign in with your new password.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        <Button
          asChild
          className={cn(
            "group relative w-full overflow-hidden",
            "bg-indigo-600 text-sm font-medium text-white",
            "hover:bg-indigo-500 transition-all duration-200"
          )}
        >
          <Link href="/login">
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            Sign in to your account
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </Button>
      </motion.div>

      {/* Auto-redirect hint */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-1.5 text-xs text-zinc-600"
      >
        {countdown > 0 ? (
          <>
            <Loader2 size={11} className="animate-spin" />
            Auto-redirecting in {countdown}s…
          </>
        ) : (
          <Link href="/login" className="hover:text-zinc-400 transition-colors">
            Click here if you weren&apos;t redirected
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
