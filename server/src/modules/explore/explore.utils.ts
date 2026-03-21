import {
  ExploreQuery,
  ExplorePaginationMeta,
  ExploreWaitlistCard,
  ExplorePrizeSummary,
  ExploreReferrer,
} from "./explore.interface";
import { EXPLORE_PAGINATION, TRENDING } from "./explore.constant";

/* ── Pagination ──────────────────────────────────────────────────── */

export function normaliseExploreQuery(query: ExploreQuery): {
  page:  number;
  limit: number;
  skip:  number;
} {
  const page  = Math.max(1, query.page  ?? EXPLORE_PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    EXPLORE_PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit ?? EXPLORE_PAGINATION.DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function buildExploreMeta(
  total: number,
  page:  number,
  limit: number,
): ExplorePaginationMeta {
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

/* ── Trending window ─────────────────────────────────────────────── */

/** Returns the Date that marks the start of the trending window. */
export function trendingCutoff(): Date {
  return new Date(Date.now() - TRENDING.WINDOW_HOURS * 60 * 60 * 1000);
}

/* ── Name masking ────────────────────────────────────────────────── */

export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/* ── Tagline extraction ──────────────────────────────────────────── */

/**
 * Pull the first non-empty sentence from the description as a tagline.
 * Falls back to the full description (truncated) or the waitlist name.
 */
export function extractTagline(description: string | null, name: string): string {
  if (!description) return name;
  const first = description.split(/[.\n]/)[0].trim();
  if (!first) return name;
  return first.length > 120 ? `${first.slice(0, 117)}…` : first;
}

/* ── Viral score ─────────────────────────────────────────────────── */

/**
 * viralScore = totalReferrals / totalSubscribers, capped at 1 decimal.
 * Represents how many additional signups each subscriber generates on average.
 */
export function calcViralScore(referrals: number, subscribers: number): number {
  if (subscribers === 0) return 0;
  return Math.round((referrals / subscribers) * 10) / 10;
}

/* ── Prize emoji map ─────────────────────────────────────────────── */

const PRIZE_EMOJI: Record<string, string> = {
  CASH:            "💵",
  GIFT_CARD:       "🎁",
  PRODUCT:         "📦",
  LIFETIME_ACCESS: "♾️",
  DISCOUNT:        "🏷️",
  CUSTOM:          "✨",
};

export function prizeEmoji(prizeType: string): string {
  return PRIZE_EMOJI[prizeType] ?? "🏆";
}

/* ── Prize rank label ────────────────────────────────────────────── */

export function buildRankLabel(rankFrom: number, rankTo: number): string {
  if (rankFrom === rankTo) return `#${rankFrom}`;
  return `#${rankFrom}–#${rankTo}`;
}

/* ── Waitlist → card shape ───────────────────────────────────────── */

/**
 * Map a raw DB row (from the Prisma select in service.ts) into the
 * clean ExploreWaitlistCard shape returned to the frontend.
 *
 * recentJoins is passed in separately because it requires an aggregation
 * over the last 24h that Prisma cannot do inline in a findMany select.
 */
export function toExploreCard(
  raw: {
    id:          string;
    slug:        string;
    name:        string;
    description: string | null;
    logoUrl:     string | null;
    isOpen:      boolean;
    createdAt:   Date;
    workspace: {
      slug: string;
    };
    _count: {
      subscribers: number;
    };
    subscribers: Array<{
      referralsCount: number;
      name:           string;
    }>;
    prizes: Array<{
      id:        string;
      rankFrom:  number;
      rankTo:    number;
      title:     string;
      prizeType: string;
      value:     number | null;
      currency:  string | null;
    }>;
  },
  recentJoins: number,
): ExploreWaitlistCard {
  const totalSubscribers = raw._count.subscribers;
  const referralCount    = raw.subscribers.reduce((s, sub) => s + sub.referralsCount, 0);

  /* Top referrers — already sorted by referralsCount DESC from the query */
  const topReferrers: ExploreReferrer[] = raw.subscribers
    .filter((s) => s.referralsCount > 0)
    .slice(0, 3)
    .map((s, i) => ({
      maskedName:    maskName(s.name),
      referralCount: s.referralsCount,
      rank:          i + 1,
    }));

  /* Prizes */
  const prizes: ExplorePrizeSummary[] = raw.prizes.map((p) => ({
    id:        p.id,
    rankLabel: buildRankLabel(p.rankFrom, p.rankTo),
    title:     p.title,
    prizeType: p.prizeType,
    value:     p.value,
    currency:  p.currency,
    emoji:     prizeEmoji(p.prizeType),
  }));

  return {
    id:               raw.id,
    slug:             raw.slug,
    name:             raw.name,
    tagline:          extractTagline(raw.description, raw.name),
    description:      raw.description,
    logoUrl:          raw.logoUrl,
    isOpen:           raw.isOpen,
    totalSubscribers,
    recentJoins,
    referralCount,
    viralScore:       calcViralScore(referralCount, totalSubscribers),
    createdAt:        raw.createdAt.toISOString(),
    expiresAt:        null,   // expiresAt not in schema — placeholder for future
    workspace:        { slug: raw.workspace.slug },
    prizes,
    topReferrers,
  };
}