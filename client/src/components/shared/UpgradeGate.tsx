"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface UpgradeGateProps {
  /** The feature that's locked */
  featureName: string;
  /** What plan is needed to unlock */
  requiredPlan?: "PRO" | "GROWTH";
  /** Optional description */
  description?: string;
  /** Optional children to show as a blurred preview behind the gate */
  children?: React.ReactNode;
}

/**
 * Full-page upgrade gate overlay.
 * Shows a premium lock screen prompting the user to upgrade.
 */
export function UpgradeGate({
  featureName,
  requiredPlan = "PRO",
  description,
  children,
}: UpgradeGateProps) {
  const planColor = requiredPlan === "GROWTH" ? "violet" : "indigo";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Blurred preview background */}
      {children && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="blur-md opacity-20 scale-105">
            {children}
          </div>
        </div>
      )}

      {/* Gate content */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md"
      >
        {/* Lock icon */}
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl border",
          planColor === "indigo"
            ? "border-indigo-500/30 bg-indigo-500/10"
            : "border-violet-500/30 bg-violet-500/10",
        )}>
          <Lock size={28} className={cn(
            planColor === "indigo" ? "text-indigo-400" : "text-violet-400"
          )} />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {featureName} is a {requiredPlan === "GROWTH" ? "Growth" : "Pro"} feature
          </h2>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            {description
              ?? `Upgrade to the ${requiredPlan === "GROWTH" ? "Growth" : "Pro"} plan to unlock ${featureName.toLowerCase()} and take your waitlists to the next level.`}
          </p>
        </div>

        {/* Plan highlight */}
        <div className={cn(
          "flex items-center gap-3 rounded-xl border px-5 py-3",
          planColor === "indigo"
            ? "border-indigo-500/25 bg-indigo-500/8"
            : "border-violet-500/25 bg-violet-500/8",
        )}>
          <Sparkles size={16} className={cn(
            planColor === "indigo" ? "text-indigo-400" : "text-violet-400"
          )} />
          <div className="flex flex-col text-left">
            <span className={cn(
              "text-xs font-bold",
              planColor === "indigo" ? "text-indigo-300" : "text-violet-300",
            )}>
              {requiredPlan === "GROWTH" ? "Growth Plan" : "Pro Plan"}
            </span>
            <span className="text-[11px] text-muted-foreground/60">
              {requiredPlan === "GROWTH" ? "$49/mo" : "$19/mo"} · Unlock everything
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link href="/dashboard/billing">
          <Button
            className={cn(
              "gap-2 px-6 font-semibold transition-all duration-200",
              planColor === "indigo"
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "bg-violet-600 text-white hover:bg-violet-500",
            )}
          >
            Upgrade Now
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>

        <p className="text-[11px] text-muted-foreground/40">
          No credit card needed to explore. Upgrade anytime from billing.
        </p>
      </motion.div>
    </div>
  );
}
