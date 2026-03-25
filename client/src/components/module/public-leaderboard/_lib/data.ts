import { getWaitlistBySlug, type PublicProduct } from "../../explore/_lib/data";
import type { PublicWaitlistData, PublicPrize } from "../../individual-waitlist/_lib/data";

/* ─────────────────────────────────────────────────────────────────
   Extended leaderboard entry — more fields than the compact widget
   ──────────────────────────────────────────────────────────────── */
export interface FullLeaderboardEntry {
  rank:          number;
  maskedName:    string;     // "Sarah K."
  referralCount: number;
  joinedAt:      string;     // relative "2 days ago"
  tier:          "champion" | "top10" | "top25" | "rising";
  sharePercent:  number;     // % of total referrals
  isConfirmed:   boolean;
}

export interface LeaderboardPageData {
  waitlist:    PublicWaitlistData;
  entries:     FullLeaderboardEntry[];
  totalEntries: number;    // total people with ≥1 referral
}

/* ─────────────────────────────────────────────────────────────────
   Tier assignment
   ──────────────────────────────────────────────────────────────── */
export function getTier(rank: number): FullLeaderboardEntry["tier"] {
  if (rank === 1) return "champion";
  if (rank <= 10) return "top10";
  if (rank <= 25) return "top25";
  return "rising";
}

export function getPrizeForRank(rank: number, prizes: PublicPrize[]): PublicPrize | null {
  return prizes.find((p) => rank >= p.rankFrom && rank <= p.rankTo) ?? null;
}

/* ─────────────────────────────────────────────────────────────────
   Mock data — 50 leaderboard entries
   Replace with: GET /api/public/waitlist/:slug/leaderboard?limit=50
   ──────────────────────────────────────────────────────────────── */

const NAMES = [
  "Sarah K.",   "Marcus T.",  "Priya M.",   "James L.",   "Sofia R.",
  "Chen W.",    "Amara O.",   "Luca B.",    "Nadia H.",   "Ryan P.",
  "Yuki T.",    "Isabel C.",  "Omar F.",    "Mei L.",     "Diego R.",
  "Anna S.",    "Ben O.",     "Clara M.",   "Tom N.",     "Fatima A.",
  "Alex J.",    "Sam R.",     "Jordan S.",  "Taylor B.",  "Morgan W.",
  "Casey D.",   "Riley N.",   "Quinn A.",   "Avery C.",   "Blake P.",
  "Skylar M.",  "Dakota L.",  "Reese H.",   "Finley T.",  "Harley G.",
  "Emery B.",   "River K.",   "Sage W.",    "Rowan C.",   "Lennox D.",
  "Marlowe S.", "Arlo P.",    "Indigo T.",  "Caden R.",   "Zara M.",
  "Kai L.",     "Nova B.",    "Eli W.",     "Jade C.",    "Phoenix A.",
];

const JOINS = [
  "2 days ago", "2 days ago", "3 days ago", "3 days ago", "4 days ago",
  "4 days ago", "5 days ago", "5 days ago", "6 days ago", "1 week ago",
  "1 week ago", "1 week ago", "1 week ago", "2 weeks ago","2 weeks ago",
  "2 weeks ago","2 weeks ago","2 weeks ago","2 weeks ago","2 weeks ago",
  "3 weeks ago","3 weeks ago","3 weeks ago","3 weeks ago","3 weeks ago",
  "3 weeks ago","3 weeks ago","3 weeks ago","3 weeks ago","3 weeks ago",
  "1 month ago","1 month ago","1 month ago","1 month ago","1 month ago",
  "1 month ago","1 month ago","1 month ago","1 month ago","1 month ago",
  "1 month ago","1 month ago","1 month ago","1 month ago","1 month ago",
  "1 month ago","1 month ago","1 month ago","1 month ago","1 month ago",
];

const REF_COUNTS = [
  47, 34, 28, 21, 17, 15, 13, 11, 9, 8,
  7,  7,  6,  6,  5,  5,  4,  4,  3,  3,
  3,  3,  2,  2,  2,  2,  2,  2,  2,  2,
  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,
];

const totalRefs = REF_COUNTS.reduce((s, v) => s + v, 0);

export function getLeaderboardPage(slug: string): LeaderboardPageData | null {
  // Use the explore data source
  const product = getWaitlistBySlug(slug);
  if (!product) return null;

  // Convert PublicProduct to PublicWaitlistData format
  const waitlist: PublicWaitlistData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    ownerMessage: product.ownerMessage || null,
    logoUrl: product.logoUrl || null,
    logoInitials: product.logoInitials,
    logoGradient: product.logoGradient,
    websiteUrl: product.websiteUrl,
    category: product.category,
    tags: product.tags,
    isOpen: product.isOpen,
    totalSubscribers: product.totalSubscribers,
    recentJoins: product.recentJoins,
    referralCount: product.referralCount,
    viralScore: product.viralScore,
    expiresAt: product.expiresAt,
    ownerName: product.ownerName,
    ownerAvatarInitials: product.ownerAvatarInitials || product.logoInitials,
    prizes: product.prizes.map((p, i) => ({
      id: String(i),
      rankFrom: i + 1,
      rankTo: i + 1,
      rankLabel: p.rank,
      title: p.title,
      description: null,
      prizeType: "CUSTOM" as const,
      value: null,
      currency: null,
      emoji: p.emoji,
      expiresAt: null,
    })),
    leaderboard: [],
  };

  const entries: FullLeaderboardEntry[] = NAMES.map((name, i) => ({
    rank:          i + 1,
    maskedName:    name,
    referralCount: REF_COUNTS[i] ?? 1,
    joinedAt:      JOINS[i] ?? "1 month ago",
    tier:          getTier(i + 1),
    sharePercent:  parseFloat(((REF_COUNTS[i] ?? 1) / totalRefs * 100).toFixed(1)),
    isConfirmed:   i % 4 !== 3,
  }));

  return { waitlist, entries, totalEntries: entries.length };
}