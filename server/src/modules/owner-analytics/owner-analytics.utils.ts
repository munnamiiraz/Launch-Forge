import { TimeRange, TIME_RANGE_DAYS, CHAIN_MAX_DEPTH } from "./owner-analytics.constants";

/* ── Date range helpers ──────────────────────────────────────────── */

export function rangeStart(range: TimeRange): Date {
  const d = new Date();
  d.setDate(d.getDate() - TIME_RANGE_DAYS[range]);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Prior period start/end — same duration shifted back by one period */
export function priorRangeStart(range: TimeRange): { start: Date; end: Date } {
  const days  = TIME_RANGE_DAYS[range];
  const end   = rangeStart(range);
  const start = new Date(end.getTime() - days * 86_400_000);
  return { start, end };
}

/** Return an array of Date objects, one per day, from start to today */
export function daysInRange(start: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  while (cur <= now) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/** Milliseconds in one week */
const MS_WEEK = 7 * 86_400_000;

export function weeksInRange(start: Date): Date[] {
  const weeks: Date[] = [];
  const cur = new Date(start);
  while (cur <= new Date()) {
    weeks.push(new Date(cur));
    cur.setTime(cur.getTime() + MS_WEEK);
  }
  return weeks;
}

/* ── Label formatters ────────────────────────────────────────────── */

export function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtMonth(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/** Returns "Jan W1", "Jan W3" etc. for bi-weekly cohort labels */
export function fmtCohortLabel(d: Date): string {
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const dayOfMonth = d.getDate();
  const weekNum  = dayOfMonth <= 14 ? "W1" : "W3";
  return `${month} ${weekNum}`;
}

/* ── Grouping helpers ────────────────────────────────────────────── */

/** Round a date down to the start of its week (Monday) */
export function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day  = copy.getDay();               // 0=Sun, 1=Mon …
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Round a date down to the start of its month */
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/* ── Referral chain counter (same algorithm as leaderboard) ─────── */

export function countChain(
  rootId:      string,
  childrenMap: Map<string, string[]>,
  depth:       number = 0,
): number {
  if (depth >= CHAIN_MAX_DEPTH) return 0;
  const children = childrenMap.get(rootId) ?? [];
  let total = children.length;
  for (const childId of children) {
    total += countChain(childId, childrenMap, depth + 1);
  }
  return total;
}

export function buildChildrenMap(
  rows: { id: string; referredById: string | null }[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of rows) {
    if (row.referredById) {
      const existing = map.get(row.referredById) ?? [];
      existing.push(row.id);
      map.set(row.referredById, existing);
    }
  }
  return map;
}

/* ── Math helpers ────────────────────────────────────────────────── */

export function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/* ── Plan label + colour ─────────────────────────────────────────── */

export const PLAN_META: Record<string, { label: string; fill: string }> = {
  FREE:          { label: "Free",          fill: "hsl(240 4% 35%)"  },
  PRO_MONTHLY:   { label: "Pro Monthly",   fill: "hsl(var(--chart-1))" },
  PRO_YEARLY:    { label: "Pro Yearly",    fill: "hsl(var(--chart-2))" },
  GROWTH_MONTHLY:{ label: "Growth Monthly",fill: "hsl(var(--chart-3))" },
  GROWTH_YEARLY: { label: "Growth Yearly", fill: "hsl(var(--chart-4))" },
};