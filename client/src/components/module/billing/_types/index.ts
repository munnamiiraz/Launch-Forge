export type PlanTier    = "FREE" | "PRO" | "GROWTH";
export type BillingMode = "MONTHLY" | "YEARLY";
export type SubStatus   = "active" | "trialing" | "past_due" | "cancelled" | "none";

/* ── Active subscription record ─────────────────────────────────── */
export interface ActiveSubscription {
  planTier:      PlanTier;
  billingMode:   BillingMode;
  status:        SubStatus;
  amount:        number;
  currency:      string;
  nextBillingAt: string | null;  // ISO date
  cancelAt:      string | null;  // ISO date — set when cancellation scheduled
  trialEndsAt:   string | null;
  transactionId: string;
  startedAt:     string;
}

/* ── Invoice ─────────────────────────────────────────────────────── */
export interface Invoice {
  id:          string;
  date:        string;
  amount:      number;
  currency:    string;
  status:      "paid" | "open" | "void" | "failed";
  description: string;
  pdfUrl:      string | null;
}

/* ── Usage item ──────────────────────────────────────────────────── */
export interface UsageItem {
  label:   string;
  used:    number;
  limit:   number | null;   // null = unlimited
  unit:    string;
}

/* ── Plan definition ─────────────────────────────────────────────── */
export interface PlanDefinition {
  tier:         PlanTier;
  name:         string;
  tagline:      string;
  monthlyPrice: number;   // USD
  yearlyPrice:  number;   // USD billed annually per month
  accent:       string;
  features:     PlanFeature[];
  limits: {
    waitlists:   number | null;
    subscribers: number | null;
    teamMembers: number | null;
    prizeBoards: number | null;
  };
}

export interface PlanFeature {
  label:       string;
  included:    boolean | string;  // true/false or a value string like "5 waitlists"
  highlight?:  boolean;
}

/* ── Billing page data ───────────────────────────────────────────── */
export interface BillingPageData {
  subscription: ActiveSubscription | null;
  invoices:     Invoice[];
  usage:        UsageItem[];
}