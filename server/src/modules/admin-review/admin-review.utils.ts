import {
  TransactionsPaginationMeta,
  TransactionsQuery,
  RecentTransaction,
} from "./admin-review.interface";
import { TX_PAGINATION, PLAN_MRR, PLAN_LABELS } from "./admin-review.constants";

/* ── Date helpers ────────────────────────────────────────────────── */

export function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfThisMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(d: Date): Date {
  const end = new Date(d);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function fmtMonth(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function fmtCohortLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/* ── Pagination ──────────────────────────────────────────────────── */

export function normaliseTxPagination(query: TransactionsQuery): {
  page:  number;
  limit: number;
  skip:  number;
} {
  const page  = Math.max(1, query.page  ?? TX_PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    TX_PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? TX_PAGINATION.DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function buildTxMeta(
  total: number,
  page:  number,
  limit: number,
): TransactionsPaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage:     page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/* ── Plan key builder ────────────────────────────────────────────── */

export function planKey(planType: string, planMode: string): string {
  return `${planType}_${planMode}`;
}

export function planLabel(planType: string, planMode: string): string {
  const meta = PLAN_LABELS[planKey(planType, planMode)];
  if (!meta) return `${planType} ${planMode}`;
  return `${meta.plan} ${meta.mode}`;
}

/* ── MRR for a payment ───────────────────────────────────────────── */

export function paymentMrr(planType: string, planMode: string): number {
  return PLAN_MRR[planKey(planType, planMode)] ?? 0;
}

/* ── Math helpers ────────────────────────────────────────────────── */

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ── Derive transaction type from payment context ────────────────── */

/**
 * The schema doesn't store a "transaction type" field — we derive it:
 *   - status = PAID + this is the first payment for user  → "new"
 *   - status = PAID + payment exists before               → "renewal"
 *   - status = UNPAID + updated this month                → "cancel"
 *   - No clean way to detect upgrade/downgrade without history
 *
 * We store a best-effort type. For real upgrade tracking, add a
 * PaymentEvent table with an event_type enum.
 */
export function deriveTransactionType(
  isFirstPayment: boolean,
  paymentStatus:  string,
): RecentTransaction["type"] {
  if (paymentStatus === "UNPAID") return "cancel";
  if (isFirstPayment)             return "new";
  return "renewal";
}

export function deriveTransactionStatus(
  paymentStatus: string,
): RecentTransaction["status"] {
  if (paymentStatus === "PAID")   return "paid";
  if (paymentStatus === "UNPAID") return "failed";
  return "pending";
}