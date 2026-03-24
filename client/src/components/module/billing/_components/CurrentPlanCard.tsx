"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Zap, CheckCircle2, Clock, CreditCard, ExternalLink,
  AlertTriangle, ArrowUpRight, Loader2, RefreshCw, XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { Badge }   from "@/src/components/ui/badge";
import { Button }  from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { cn }      from "@/src/lib/utils";
import { createPortalAction } from "@/src/services/billing/_lib/billing.actions";
import { PLANS }   from "@/src/components/module/billing/_lib/data";
import type { ActiveSubscription } from "@/src/components/module/billing/_types";

const STATUS_CONFIG = {
  active:    { label: "Active",    classes: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 size={10} />, dot: "bg-emerald-400" },
  trialing:  { label: "Trial",     classes: "border-indigo-500/25 bg-indigo-500/10 text-indigo-400",   icon: <Clock        size={10} />, dot: "bg-indigo-400"  },
  past_due:  { label: "Past due",  classes: "border-red-500/25 bg-red-500/10 text-red-400",            icon: <AlertTriangle size={10}/>,dot: "bg-red-400"     },
  cancelled: { label: "Cancelled", classes: "border-zinc-700/60 bg-muted/40 text-muted-foreground/80",         icon: <XCircle      size={10} />, dot: "bg-zinc-600"    },
  none:      { label: "No plan",   classes: "border-zinc-700/60 bg-muted/40 text-muted-foreground/80",         icon: <XCircle      size={10} />, dot: "bg-zinc-600"    },
};

const PLAN_ACCENT = {
  FREE:   { bg: "from-zinc-800/80 to-zinc-900/60",             border: "border-zinc-700/60",         value: "text-foreground/80",   badge: "border-zinc-700 bg-zinc-800 text-muted-foreground" },
  PRO:    { bg: "from-indigo-950/80 via-zinc-900/80 to-zinc-950", border: "border-indigo-500/30",    value: "text-indigo-300", badge: "border-indigo-500/40 bg-indigo-500/15 text-indigo-300" },
  GROWTH: { bg: "from-violet-950/80 via-zinc-900/80 to-zinc-950", border: "border-violet-500/30",   value: "text-violet-300", badge: "border-violet-500/40 bg-violet-500/15 text-violet-300" },
};

interface CurrentPlanCardProps {
  subscription: ActiveSubscription | null;
}

export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  const [isPending, startTx] = useTransition();
  const [portalError, setPortalError] = useState<string | null>(null);

  const plan       = subscription?.planTier ?? "FREE";
  const planDef    = PLANS.find((p) => p.tier === plan) ?? PLANS[0];
  const accent     = PLAN_ACCENT[plan];
  const statusCfg  = STATUS_CONFIG[subscription?.status ?? "none"] ?? STATUS_CONFIG.none;

  const monthlyEquiv = subscription?.billingMode === "YEARLY"
    ? planDef.yearlyPrice
    : planDef.monthlyPrice;

  const nextDate = subscription?.nextBillingAt
    ? new Date(subscription.nextBillingAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const startDate = subscription?.startedAt
    ? new Date(subscription.startedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const cancelDate = subscription?.cancelAt
    ? new Date(subscription.cancelAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;

  const openPortal = () => {
    setPortalError(null);
    startTx(async () => {
      const res = await createPortalAction();
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        setPortalError(res.message ?? "Unable to open billing portal.");
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className={cn(
        "relative overflow-hidden border",
        accent.border,
      )}>
        {/* Gradient background */}
        <div className={cn("absolute inset-0 bg-gradient-to-br", accent.bg)} />

        {/* Ambient glow for paid plans */}
        {plan !== "FREE" && (
          <div className={cn(
            "pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl",
            plan === "PRO" ? "bg-indigo-500/8" : "bg-violet-500/8",
          )} />
        )}

        <CardContent className="relative p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            {/* Left: plan identity */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                  plan === "FREE"   ? "border-zinc-700 bg-muted/60 text-muted-foreground" :
                  plan === "PRO"    ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-400" :
                                      "border-violet-500/30 bg-violet-500/15 text-violet-400",
                )}>
                  <Zap size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black tracking-tight text-foreground">
                      {planDef.name}
                    </h2>
                    <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", accent.badge)}>
                      {planDef.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/80">{planDef.tagline}</p>
                </div>
              </div>

              {/* Price display */}
              {subscription && plan !== "FREE" ? (
                <div className="flex items-baseline gap-1.5">
                  <span className={cn("text-4xl font-black tracking-tight tabular-nums", accent.value)}>
                    ${monthlyEquiv}
                  </span>
                  <span className="text-sm text-muted-foreground/60">/mo</span>
                  {subscription.billingMode === "YEARLY" && (
                    <Badge className="ml-1 border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-400">
                      Billed yearly · Save 20%
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight text-muted-foreground">Free</span>
                  <span className="text-sm text-muted-foreground/60">forever</span>
                </div>
              )}

              {/* Status badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn("gap-1 rounded-full px-2.5 text-[10px] font-semibold", statusCfg.classes)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                  {statusCfg.label}
                </Badge>
                {subscription?.billingMode && (
                  <Badge className="border-zinc-700/60 bg-muted/40 text-[10px] text-muted-foreground/80">
                    {subscription.billingMode === "MONTHLY" ? "Monthly billing" : "Annual billing"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Right: billing details + actions */}
            <div className="flex flex-col gap-3">
              {subscription && (
                <div className="flex flex-col gap-1.5 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-xs">
                  {startDate && (
                    <Row label="Member since"   value={startDate} />
                  )}
                  {nextDate && !cancelDate && (
                    <Row label="Next billing"   value={nextDate}  />
                  )}
                  {cancelDate && (
                    <Row
                      label="Cancels on"
                      value={cancelDate}
                      valueClass="text-amber-400"
                    />
                  )}
                  {subscription.transactionId && (
                    <Row
                      label="Subscription ID"
                      value={subscription.transactionId.slice(0, 20) + "…"}
                      mono
                    />
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {plan !== "FREE" ? (
                  <Button
                    onClick={openPortal}
                    disabled={isPending}
                    variant="outline"
                    className="gap-2 border-zinc-700/80 bg-transparent text-sm text-foreground/80 hover:border-zinc-600 hover:bg-muted/60 hover:text-foreground"
                  >
                    {isPending
                      ? <><Loader2 size={14} className="animate-spin" />Opening portal…</>
                      : <><CreditCard size={14} />Manage subscription<ExternalLink size={11} /></>
                    }
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="gap-2 bg-indigo-600 text-sm text-white hover:bg-indigo-500"
                  >
                    <a href="#plans">
                      <Zap size={14} />
                      Upgrade to Pro
                      <ArrowUpRight size={12} />
                    </a>
                  </Button>
                )}
                {plan !== "FREE" && (
                  <Button
                    onClick={openPortal}
                    disabled={isPending}
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground/60 hover:bg-muted/40 hover:text-muted-foreground"
                  >
                    <RefreshCw size={11} />
                    Switch plan or cancel
                  </Button>
                )}
              </div>

              {portalError && (
                <p className="text-xs text-red-400">{portalError}</p>
              )}
            </div>
          </div>

          {/* Cancellation warning */}
          {subscription?.cancelAt && (
            <>
              <Separator className="my-4 bg-muted/60" />
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                <p className="text-xs text-amber-300">
                  Your subscription is scheduled to cancel on{" "}
                  <span className="font-semibold">{cancelDate}</span>. You'll keep Pro
                  access until then. To resume, open the billing portal.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Row({
  label, value, valueClass, mono,
}: {
  label: string; value: string; valueClass?: string; mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground/60">{label}</span>
      <span className={cn(
        "font-medium text-foreground/80",
        mono && "font-mono text-[10px] text-muted-foreground/80",
        valueClass,
      )}>
        {value}
      </span>
    </div>
  );
}
