import { ExploreSortOption } from "./explore.constant";

/* ── Query inputs ────────────────────────────────────────────────── */

export interface ExploreQuery {
  page?:        number;
  limit?:       number;
  search?:      string;
  sort?:        ExploreSortOption;
  /** Filter to open waitlists only */
  openOnly?:    boolean;
  /** Filter to waitlists that have at least one prize */
  prizesOnly?:  boolean;
}

/* ── Service payload ─────────────────────────────────────────────── */

export interface GetExploreWaitlistsPayload {
  query: ExploreQuery;
}

export interface GetExploreWaitlistBySlugPayload {
  slug: string;
}

/* ── Card shape — what a single card in the explore grid returns ─── */

export interface ExploreWaitlistCard {
  /** waitlist.id — needed by the join flow */
  id:               string;
  slug:             string;
  name:             string;
  /** Short marketing tagline (pulled from description first line) */
  tagline:          string;
  description:      string | null;
  logoUrl:          string | null;
  isOpen:           boolean;

  /* Stats */
  totalSubscribers: number;
  /** Signups in the last 24 hours — drives the "trending" sort */
  recentJoins:      number;
  referralCount:    number;
  /** referralCount / totalSubscribers — viral coefficient proxy */
  viralScore:       number;

  /* Dates */
  createdAt:        string;   // ISO string — safe for JSON serialisation
  expiresAt:        string | null;

  /* Workspace / owner context (public-safe) */
  workspace: {
    slug: string;
  };

  /* Prizes (up to EXPLORE_CARD.TOP_PRIZES) */
  prizes:           ExplorePrizeSummary[];

  /* Masked top referrers (up to EXPLORE_CARD.TOP_REFERRERS) */
  topReferrers:     ExploreReferrer[];
}

export interface ExplorePrizeSummary {
  id:         string;
  rankLabel:  string;   // "#1" or "#2–#3"
  title:      string;
  prizeType:  string;
  value:      number | null;
  currency:   string | null;
  emoji:      string;
}

export interface ExploreReferrer {
  maskedName:    string;
  referralCount: number;
  rank:          number;
}

/* ── Paginated response wrapper ──────────────────────────────────── */

export interface PaginatedExploreWaitlists {
  data: ExploreWaitlistCard[];
  meta: ExplorePaginationMeta;
}

export interface ExplorePaginationMeta {
  total:           number;
  page:            number;
  limit:           number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}