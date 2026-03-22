import { GrowthRange, GROWTH_RANGE_DAYS } from "./admin-overview.constants";

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

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfThisWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setDate(d.getDate() + diff);
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

/* ── Relative time ───────────────────────────────────────────────── */

export function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffM  = Math.floor(diffMs / 60_000);
  if (diffM < 1)  return "just now";
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

/* ── Name masking ────────────────────────────────────────────────── */

export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/* ── Days-in-range builder ───────────────────────────────────────── */

export function buildDateRange(range: GrowthRange): Date[] {
  const days   = GROWTH_RANGE_DAYS[range];
  const result: Date[] = [];
  for (let i = days; i >= 0; i--) {
    result.push(daysAgo(i));
  }
  return result;
}

/* ── Math helpers ────────────────────────────────────────────────── */

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}