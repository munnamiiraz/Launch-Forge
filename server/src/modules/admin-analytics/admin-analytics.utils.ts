import { EngagementRange, ENGAGEMENT_RANGE_DAYS } from "./admin-analytics.constants";

/* ── Date helpers ────────────────────────────────────────────────── */

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(d: Date): Date {
  const e = new Date(d);
  e.setMonth(e.getMonth() + 1);
  e.setDate(0);
  e.setHours(23, 59, 59, 999);
  return e;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfThisWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfThisMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ── Label formatters ────────────────────────────────────────────── */

export function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtMonth(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/* ── Build array of days from n days ago to today ────────────────── */

export function buildDays(range: EngagementRange): Date[] {
  const n = ENGAGEMENT_RANGE_DAYS[range];
  return Array.from({ length: n + 1 }, (_, i) => daysAgo(n - i));
}

/* ── Build array of month start dates ───────────────────────────── */

export function buildMonths(count: number): Date[] {
  return Array.from({ length: count }, (_, i) => monthsAgo(count - 1 - i));
}

/* ── Math helpers ────────────────────────────────────────────────── */

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function pct(num: number, denom: number): number {
  if (denom === 0) return 0;
  return round1((num / denom) * 100);
}

export function median(sortedArr: number[]): number {
  if (sortedArr.length === 0) return 0;
  const mid = Math.floor(sortedArr.length / 2);
  return sortedArr.length % 2 !== 0
    ? sortedArr[mid]
    : Math.round((sortedArr[mid - 1] + sortedArr[mid]) / 2);
}

export function percentile(sortedArr: number[], p: number): number {
  if (sortedArr.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
  return sortedArr[Math.min(idx, sortedArr.length - 1)];
}

/* ── Day-of-week label ───────────────────────────────────────────── */

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * Convert JS getDay() (0=Sun) → 0-based Mon-indexed (0=Mon, 6=Sun)
 */
export function dayOfWeekLabel(date: Date): string {
  const jsDay = date.getDay();
  const monIdx = jsDay === 0 ? 6 : jsDay - 1;
  return DAY_LABELS[monIdx];
}