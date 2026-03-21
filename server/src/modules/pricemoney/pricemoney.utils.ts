import {
  PrizeRow,
  PublicPrizeRow,
  UpdatePrizePayload,
} from "./pricemoney.interface";

/* ─────────────────────────────────────────────────────────────────
   Rank label
   Produces a human-readable label for the rank range.
   rankFrom === rankTo  → "#1"
   rankFrom !== rankTo  → "#1–#3"
   ──────────────────────────────────────────────────────────────── */

export function buildRankLabel(rankFrom: number, rankTo: number): string {
  if (rankFrom === rankTo) return `#${rankFrom}`;
  return `#${rankFrom}–#${rankTo}`;
}

/* ─────────────────────────────────────────────────────────────────
   Map a full PrizeRow to a PublicPrizeRow
   Strips internal fields (status, waitlistId, timestamps except expiresAt).
   ──────────────────────────────────────────────────────────────── */

export function toPublicPrizeRow(prize: PrizeRow): PublicPrizeRow {
  return {
    id:          prize.id,
    title:       prize.title,
    description: prize.description,
    prizeType:   prize.prizeType,
    value:       prize.value,
    currency:    prize.currency,
    rankFrom:    prize.rankFrom,
    rankTo:      prize.rankTo,
    imageUrl:    prize.imageUrl,
    expiresAt:   prize.expiresAt,
    rankLabel:   buildRankLabel(prize.rankFrom, prize.rankTo),
  };
}

/* ─────────────────────────────────────────────────────────────────
   Rank-range overlap detection
   Two ranges [a, b] and [c, d] overlap if a ≤ d AND c ≤ b.
   We exclude the prize being updated (excludeId) from the check.
   ──────────────────────────────────────────────────────────────── */

export function hasRankOverlap(
  existing: Array<{ id: string; rankFrom: number; rankTo: number }>,
  newFrom:  number,
  newTo:    number,
  excludeId?: string,
): boolean {
  return existing
    .filter((p) => p.id !== excludeId)
    .some(
      (p) => newFrom <= p.rankTo && p.rankFrom <= newTo,
    );
}

/* ─────────────────────────────────────────────────────────────────
   Build the Prisma data object for PATCH — true partial update.
   Only keys explicitly present in the payload are included.
   null values ARE written to clear the column.
   ──────────────────────────────────────────────────────────────── */

export function buildPrizeUpdateData(
  payload: Omit<
    UpdatePrizePayload,
    "prizeId" | "waitlistId" | "workspaceId" | "requestingUserId"
  >,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  if (payload.title       !== undefined) data.title       = payload.title;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.prizeType   !== undefined) data.prizeType   = payload.prizeType;
  if (payload.value       !== undefined) data.value       = payload.value;
  if (payload.currency    !== undefined) data.currency    = payload.currency;
  if (payload.rankFrom    !== undefined) data.rankFrom    = payload.rankFrom;
  if (payload.rankTo      !== undefined) data.rankTo      = payload.rankTo;
  if (payload.imageUrl    !== undefined) data.imageUrl    = payload.imageUrl;
  if (payload.expiresAt   !== undefined) data.expiresAt   = payload.expiresAt;
  if (payload.status      !== undefined) data.status      = payload.status;

  return data;
}

/* ─────────────────────────────────────────────────────────────────
   Sort prizes by rankFrom ascending — prizes are displayed
   in ascending rank order on the public page.
   ──────────────────────────────────────────────────────────────── */

export function sortPrizesByRank<T extends { rankFrom: number; rankTo: number }>(
  prizes: T[],
): T[] {
  return [...prizes].sort((a, b) =>
    a.rankFrom !== b.rankFrom
      ? a.rankFrom - b.rankFrom
      : a.rankTo - b.rankTo,
  );
}