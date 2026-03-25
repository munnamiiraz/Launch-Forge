"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Zap, CheckCircle2, Clock, CreditCard, AlertTriangle,
  ArrowRight, Loader2, RefreshCw, XCircle, Download,
  FileText, ChevronDown, Check, X, Star, Shield,
  TrendingUp, Users, Globe, BarChart3, MessageCircle,
  Sparkles, ArrowUpRight, Infinity, Trophy
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  createCheckoutAction,
  createPortalAction,
} from "@/src/services/billing/_lib/billing.actions";
import { PLANS } from "@/src/components/module/billing/_lib/data";
import type {
  ActiveSubscription, Invoice, UsageItem,
  PlanTier, BillingMode, SubStatus,
} from "@/src/components/module/billing/_types";

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & TYPES
   ═══════════════════════════════════════════════════════════════════ */

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { 
      delay: i * 0.06, 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number] 
    },
  }),
};

const STATUS_CFG: Record<SubStatus, { label: string; dot: string; text: string; badge: string }> = {
  active:    { label: "Active",    dot: "bg-emerald-400",  text: "text-emerald-400", badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" },
  trialing:  { label: "Trialing", dot: "bg-indigo-400",   text: "text-indigo-400",  badge: "border-indigo-500/25 bg-indigo-500/10 text-indigo-400"   },
  past_due:  { label: "Past due", dot: "bg-red-400",      text: "text-red-400",     badge: "border-red-500/25 bg-red-500/10 text-red-400"             },
  cancelled: { label: "Cancelled",dot: "bg-zinc-600",     text: "text-zinc-500",    badge: "border-zinc-700/60 bg-zinc-800/40 text-zinc-500"          },
  none:      { label: "Free",     dot: "bg-zinc-700",     text: "text-zinc-600",    badge: "border-zinc-700/60 bg-zinc-800/40 text-zinc-500"          },
};

const PLAN_STYLE: Record<PlanTier, { accent: string; border: string; glow: string; ring: string; icon: string; cta: string }> = {
  FREE:   { accent: "text-zinc-400",   border: "border-zinc-700/60",    glow: "",                        ring: "ring-zinc-700/40",    icon: "border-zinc-700/60 bg-zinc-800/40 text-zinc-500",       cta: "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" },
  PRO:    { accent: "text-indigo-300", border: "border-indigo-500/40",  glow: "bg-indigo-500/6",         ring: "ring-indigo-500/30",  icon: "border-indigo-500/30 bg-indigo-500/12 text-indigo-400", cta: "bg-indigo-600 text-white hover:bg-indigo-500" },
  GROWTH: { accent: "text-violet-300", border: "border-violet-500/40",  glow: "bg-violet-500/6",         ring: "ring-violet-500/30",  icon: "border-violet-500/30 bg-violet-500/12 text-violet-400", cta: "bg-violet-600 text-white hover:bg-violet-500" },
};

const INVOICE_STATUS: Record<string, { label: string; classes: string }> = {
  paid:   { label: "Paid",   classes: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" },
  open:   { label: "Open",   classes: "border-amber-500/25 bg-amber-500/10 text-amber-400"       },
  failed: { label: "Failed", classes: "border-red-500/25 bg-red-500/10 text-red-400"             },
  void:   { label: "Void",   classes: "border-zinc-700/60 bg-zinc-800/40 text-zinc-500"          },
};

const FAQ = [
  { q: "Can I switch plans at any time?",                    a: "Yes — upgrade or downgrade anytime via the billing portal. Upgrades take effect immediately with prorated charges. Downgrades apply at the end of your billing period." },
  { q: "What happens to my data if I downgrade?",           a: "All existing waitlists and subscribers are preserved. You won't be able to create new ones beyond your plan limit. Features like analytics and prize management are hidden until you upgrade again." },
  { q: "Do you offer refunds?",                             a: "We offer a 14-day money-back guarantee on your first payment. For recurring charges, reach out within 7 days and we'll review your case." },
  { q: "What payment methods are accepted?",                a: "All major credit and debit cards (Visa, Mastercard, Amex) via Stripe. Annual Growth subscribers can request invoices." },
  { q: "How does the yearly discount work?",                a: "Yearly billing gives you 20% off vs monthly. Pro goes from $19/mo to $15/mo. Growth from $49/mo to $39/mo — billed as a single annual charge." },
  { q: "Is my payment information secure?",                 a: "All payment processing is handled by Stripe, PCI-DSS Level 1 certified. LaunchForge never stores your card details." },
];

const PLAN_FEATURES_ICONS: Record<string, React.ReactNode> = {
  "Waitlists":           <Globe   size={11} />,
  "Subscribers":         <Users   size={11} />,
  "Analytics":           <BarChart3 size={11} />,
  "Team members":        <Users   size={11} />,
  "Prize announcements": <Star    size={11} />,
  "API access":          <Zap     size={11} />,
  "Priority support":    <Shield  size={11} />,
  "Feedback board":      <MessageCircle size={11} />,
  "Roadmap":             <TrendingUp size={11} />,
  "Referral tracking":   <ArrowUpRight size={11} />,
  "Public leaderboard":  <Trophy size={11} />,
  "Custom domain":       <Globe size={11} />
};

/* ═══════════════════════════════════════════════════════════════════
   HERO — Current Plan
   ═══════════════════════════════════════════════════════════════════ */

function PlanHero({ subscription }: { subscription: ActiveSubscription | null }) {
  const [isPending, startTx] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const plan: PlanTier = subscription?.planTier ?? "FREE";
  const planDef = PLANS.find((p) => p.tier === plan) ?? PLANS[0];
  const style   = PLAN_STYLE[plan];
  const status  = STATUS_CFG[subscription?.status ?? "none"];
  const price   = subscription?.billingMode === "YEARLY" ? planDef.yearlyPrice : planDef.monthlyPrice;

  const nextDate = subscription?.nextBillingAt
    ? new Date(subscription.nextBillingAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const startDate = subscription?.startedAt
    ? new Date(subscription.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const openPortal = () => {
    setErr(null);
    startTx(async () => {
      const res = await createPortalAction();
      if (res.success && res.url) window.location.href = res.url;
      else setErr(res.message ?? "Unable to open portal.");
    });
  };

  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible"
      className={cn(
        "relative overflow-hidden rounded-2xl border",
        style.border,
      )}
    >
      {plan !== "FREE" && (
        <div className={cn("pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl opacity-60", style.glow)} />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

      <div className="relative flex flex-col gap-0 sm:flex-row">
        <div className="flex flex-1 flex-col gap-6 p-7">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", style.icon)}>
                <Zap size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-zinc-100">
                    {planDef.name}
                  </h2>
                  <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", status.badge)}>
                    <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500">{planDef.tagline}</p>
              </div>
            </div>
          </div>

          <div>
            {plan === "FREE" ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black tracking-tighter text-zinc-400">Free</span>
                <span className="text-sm text-zinc-600">forever</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black tracking-tighter text-zinc-100">${price}</span>
                <span className="text-sm text-zinc-500">/mo</span>
                {subscription?.billingMode === "YEARLY" && (
                  <Badge className="ml-2 border-emerald-500/25 bg-emerald-500/10 text-[10px] font-semibold text-emerald-400">
                    Yearly · Save 20%
                  </Badge>
                )}
              </div>
            )}
          </div>

          {subscription && (
            <div className="flex flex-wrap gap-4 text-[11px] text-zinc-600">
              {startDate && (
                <span>
                  Member since <span className="font-semibold text-zinc-400">{startDate}</span>
                </span>
              )}
              {nextDate && !subscription.cancelAt && (
                <span>
                  Next billing <span className="font-semibold text-zinc-400">{nextDate}</span>
                </span>
              )}
              {subscription.billingMode && (
                <span className="capitalize">
                  {subscription.billingMode.toLowerCase()} billing
                </span>
              )}
            </div>
          )}
        </div>

        <div className="hidden w-px bg-zinc-800/60 sm:block" />
        <div className="block h-px bg-zinc-800/60 sm:hidden" />

        <div className="flex w-full flex-col justify-center gap-3 p-7 sm:w-56">
          {plan !== "FREE" ? (
            <>
              <Button
                onClick={openPortal}
                disabled={isPending}
                className="w-full gap-2 bg-zinc-800 text-sm font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                {isPending
                  ? <><Loader2 size={14} className="animate-spin" />Opening…</>
                  : <><CreditCard size={14} />Manage plan</>
                }
              </Button>
              <Button
                onClick={openPortal}
                disabled={isPending}
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-xs text-zinc-600 hover:bg-zinc-800/40 hover:text-zinc-400"
              >
                <RefreshCw size={11} />Switch or cancel
              </Button>
            </>
          ) : (
            <Button
              asChild
              className="w-full gap-2 bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <a href="#plans">
                <Sparkles size={14} />
                Upgrade now
                <ArrowRight size={13} className="ml-auto" />
              </a>
            </Button>
          )}
          {err && <p className="text-center text-[11px] text-red-400">{err}</p>}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-700">
            <Shield size={10} />
            Secured by Stripe
          </div>
        </div>
      </div>

      {subscription?.cancelAt && (
        <div className="relative border-t border-zinc-800/60 bg-amber-500/5 px-7 py-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={13} className="shrink-0 text-amber-400" />
            <p className="text-xs text-amber-300/80">
              Subscription cancels on{" "}
              <span className="font-semibold text-amber-300">
                {new Date(subscription.cancelAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </span>
              . You'll retain access until then.
            </p>
            <Button onClick={openPortal} size="sm" variant="ghost" className="ml-auto shrink-0 text-[11px] text-amber-400 hover:bg-amber-500/10">
              Resume
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   USAGE METERS
   ═══════════════════════════════════════════════════════════════════ */

function UsageStrip({ usage }: { usage: UsageItem[] }) {
  return (
    <motion.div
      variants={fadeUp} custom={1} initial="hidden" animate="visible"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {usage.map((item, i) => {
        const p = item.limit && item.limit > 0 ? Math.min(100, Math.round((item.used / item.limit) * 100)) : 0;
        const isUnlim = item.limit === null;
        const isHigh  = !isUnlim && p >= 90;
        const isWarn  = !isUnlim && p >= 70;

        return (
          <motion.div
            key={item.label}
            custom={i}
            variants={fadeUp}
            className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500">{item.label}</span>
              {isUnlim
                ? <Infinity size={12} className="text-emerald-400" />
                : <span className={cn("text-[10px] tabular-nums", isHigh ? "text-red-400" : isWarn ? "text-amber-400" : "text-zinc-600")}>{p}%</span>
              }
            </div>

            <div>
              <span className={cn("text-xl font-black tabular-nums tracking-tight", isHigh ? "text-red-300" : isWarn ? "text-amber-300" : "text-zinc-200")}>
                {item.used.toLocaleString()}
              </span>
              {!isUnlim && item.limit && (
                <span className="ml-1 text-[11px] text-zinc-600">/ {item.limit.toLocaleString()}</span>
              )}
              {isUnlim && (
                <span className="ml-1 text-[11px] text-emerald-500">unlimited</span>
              )}
            </div>

            {!isUnlim && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p}%` }}
                  transition={{ delay: i * 0.05 + 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className={cn("h-full rounded-full", isHigh ? "bg-red-500" : isWarn ? "bg-amber-500" : "bg-indigo-500")}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PLAN CARDS
   ═══════════════════════════════════════════════════════════════════ */

function PlanGrid({ currentPlan }: { currentPlan: PlanTier }) {
  const [yearly, setYearly]       = useState(false);
  const [loadingTier, setLoading] = useState<PlanTier | null>(null);
  const [isPending, startTx]      = useTransition();
  const mode: BillingMode = yearly ? "YEARLY" : "MONTHLY";

  const handleSelect = (tier: PlanTier) => {
    if (tier === "FREE" || tier === currentPlan) return;
    setLoading(tier);
    startTx(async () => {
      const res = await createCheckoutAction(tier, mode);
      if (res.success && res.url) window.location.href = res.url;
      else setLoading(null);
    });
  };

  return (
    <div id="plans" className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Choose a plan</h3>
          <p className="text-xs text-zinc-600">Switch at any time. Cancel anytime.</p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-1">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              !yearly ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-600 hover:text-zinc-400",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              yearly ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-600 hover:text-zinc-400",
            )}
          >
            Yearly
            <AnimatePresence>
              {yearly && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0 text-[10px] font-bold text-emerald-400"
                >
                  −20%
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const style     = PLAN_STYLE[plan.tier];
          const isCurrent = plan.tier === currentPlan;
          const isPro     = plan.tier === "PRO";
          const isGrowth  = plan.tier === "GROWTH";
          const isLoading = loadingTier === plan.tier && isPending;
          const price     = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const canSelect = !isCurrent && plan.tier !== "FREE";

          return (
            <motion.div
              key={plan.tier}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={cn("relative flex flex-col rounded-2xl border p-6 transition-all duration-300", style.border,
                isCurrent       ? "bg-zinc-900/60 ring-1 " + style.ring :
                canSelect       ? "bg-zinc-900/30 hover:bg-zinc-900/50 hover:ring-1 " + style.ring + " cursor-pointer" :
                                  "bg-zinc-900/20 opacity-60",
              )}
              onClick={() => canSelect && handleSelect(plan.tier)}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/20 px-3 py-0.5 text-[10px] font-bold text-indigo-300">
                    <Star size={9} fill="currentColor" />Most popular
                  </span>
                </div>
              )}

              <div className={cn(
                "absolute inset-x-0 top-0 h-px rounded-t-2xl",
                isPro    ? "bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" :
                isGrowth ? "bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" :
                           "bg-linear-to-r from-transparent via-zinc-700/40 to-transparent",
              )} />

              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className={cn("text-sm font-bold", style.accent)}>{plan.name}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-600">{plan.tagline}</p>
                </div>
                {isCurrent && (
                  <Badge className={cn("rounded-full px-2.5 text-[9px] font-bold", style.border, "border bg-zinc-900/60", style.accent)}>
                    Current
                  </Badge>
                )}
              </div>

              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${plan.tier}-${yearly}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-baseline gap-1"
                  >
                    {price === 0
                      ? <span className="text-4xl font-black tracking-tight text-zinc-400">Free</span>
                      : <>
                          <span className={cn("text-4xl font-black tracking-tight", style.accent)}>${price}</span>
                          <span className="text-xs text-zinc-600">/mo{yearly && <> · billed yearly</>}</span>
                        </>
                    }
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mb-6 flex flex-1 flex-col gap-2.5">
                {plan.features.map((f) => {
                  const included = f.included !== false;
                  const featureIcon = PLAN_FEATURES_ICONS[f.label] || <Check size={11} strokeWidth={3} />;
                  return (
                    <div key={f.label} className={cn("flex items-start gap-2.5 text-xs", included ? "text-zinc-400" : "text-zinc-700")}>
                      <div className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm",
                        included
                          ? f.highlight
                            ? isPro ? "text-indigo-400" : isGrowth ? "text-violet-400" : "text-emerald-400"
                            : "text-emerald-500"
                          : "text-zinc-800",
                      )}>
                        {included ? featureIcon : <X size={9} strokeWidth={3} />}
                      </div>
                      <span className={cn("leading-tight", f.highlight && included ? "font-semibold text-zinc-300" : "")}>
                        {typeof f.included === "string" ? f.included : f.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!canSelect || isLoading}
                onClick={(e) => { e.stopPropagation(); canSelect && handleSelect(plan.tier); }}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                  isCurrent
                    ? "cursor-default border border-zinc-800 text-zinc-600"
                    : plan.tier === "FREE"
                      ? "cursor-default border border-zinc-800 text-zinc-600"
                      : isPro
                        ? "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98]"
                        : "bg-violet-600 text-white hover:bg-violet-500 active:scale-[0.98]",
                )}
              >
                {isLoading
                  ? <><Loader2 size={14} className="animate-spin" />Redirecting…</>
                  : isCurrent ? "Current plan"
                  : plan.tier === "FREE" ? "Free forever"
                  : <>{currentPlan === "FREE" ? "Upgrade" : "Switch"} to {plan.name}<ArrowRight size={13} /></>
                }
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INVOICE TABLE
   ═══════════════════════════════════════════════════════════════════ */

function Invoices({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <motion.div
        variants={fadeUp} custom={3} initial="hidden" animate="visible"
        className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 py-14 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60">
          <FileText size={20} className="text-zinc-700" />
        </div>
        <p className="text-sm font-medium text-zinc-500">No invoices yet</p>
        <p className="text-xs text-zinc-700">Your billing history will appear here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeUp} custom={3} initial="hidden" animate="visible"
      className="overflow-hidden rounded-2xl border border-zinc-800/80"
    >
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-zinc-800/60 bg-zinc-900/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        <span>Description</span>
        <span>Date</span>
        <span>Amount</span>
        <span>Status</span>
      </div>

      <div className="divide-y divide-zinc-800/40 bg-zinc-900/20">
        {invoices.map((inv, i) => {
          const cfg  = INVOICE_STATUS[inv.status] ?? INVOICE_STATUS.void;
          const date = new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

          return (
            <motion.div
              key={inv.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="group grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-zinc-900/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60">
                  <FileText size={13} className="text-zinc-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-300">{inv.description}</p>
                  <p className="font-mono text-[10px] text-zinc-700">#{inv.id.slice(0, 16)}</p>
                </div>
              </div>

              <span className="text-xs text-zinc-500">{date}</span>

              <span className="text-sm font-bold tabular-nums text-zinc-200">
                ${inv.amount.toFixed(2)}
              </span>

              <div className="flex items-center gap-2">
                <Badge className={cn("rounded-full px-2.5 py-0.5 text-[9px] font-semibold", cfg.classes)}>
                  {cfg.label}
                </Badge>
                {inv.pdfUrl && (
                  <a
                    href={inv.pdfUrl}
                    download
                    className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800/60 hover:text-zinc-300"
                  >
                    <Download size={11} />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════════════════ */

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <motion.div
      variants={fadeUp} custom={4} initial="hidden" animate="visible"
      className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/20"
    >
      {FAQ.map((item, i) => (
        <div key={i} className={cn(i > 0 && "border-t border-zinc-800/60")}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-6 px-6 py-4 text-left transition-colors hover:bg-zinc-900/40"
          >
            <span className="text-sm font-medium text-zinc-300">{item.q}</span>
            <ChevronDown
              size={14}
              className={cn("shrink-0 text-zinc-600 transition-transform duration-200", open === i && "rotate-180")}
            />
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="overflow-hidden"
              >
                <p className="border-t border-zinc-800/40 bg-zinc-900/10 px-6 py-4 text-xs leading-relaxed text-zinc-500">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION DIVIDER
   ═══════════════════════════════════════════════════════════════════ */

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-zinc-800/60" />
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-700">
        {label}
      </span>
      <div className="h-px flex-1 bg-zinc-800/60" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT EXPORT
   ═══════════════════════════════════════════════════════════════════ */

interface BillingClientProps {
  subscription: ActiveSubscription | null;
  invoices:     Invoice[];
  usage:        UsageItem[];
}

export function BillingClient({ subscription, invoices, usage }: BillingClientProps) {
  const currentPlan = subscription?.planTier ?? "FREE";

  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto w-full">
      <PlanHero subscription={subscription} />

      {usage.length > 0 && (
        <>
          <Divider label="Usage this period" />
          <UsageStrip usage={usage} />
        </>
      )}

      <Divider label="Plans" />
      <PlanGrid currentPlan={currentPlan} />

      <Divider label="Billing history" />
      <Invoices invoices={invoices} />

      <Divider label="FAQ" />
      <FaqAccordion />

      <motion.div
        variants={fadeUp} custom={5} initial="hidden" animate="visible"
        className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-800/40 bg-zinc-900/20 py-8 text-center"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/60">
          <MessageCircle size={16} className="text-zinc-600" />
        </div>
        <p className="text-sm font-medium text-zinc-400">Questions about your bill?</p>
        <p className="text-xs text-zinc-600">
          We're here to help with invoices, refunds, or plan changes.
        </p>
        <a
          href="mailto:support@launchforge.app"
          className="mt-2 flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-4 py-2 text-xs text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200"
        >
          <MessageCircle size={12} />
          support@launchforge.app
        </a>
      </motion.div>
    </div>
  );
}