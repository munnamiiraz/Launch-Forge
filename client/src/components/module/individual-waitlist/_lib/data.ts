/* ─────────────────────────────────────────────────────────────────
   All types for the public-facing /w/[slug] waitlist page
   ──────────────────────────────────────────────────────────────── */

export interface PublicWaitlistData {
  /* Identity */
  id:              string;
  slug:            string;
  name:            string;
  tagline:         string;
  description:     string;
  ownerMessage:    string | null;   // personal note from the owner
  logoUrl:         string | null;
  logoInitials:    string;
  logoGradient:    string;
  websiteUrl:      string | null;
  category:        string;
  tags:            string[];

  /* Status */
  isOpen:          boolean;
  totalSubscribers: number;
  recentJoins:     number;          // last 24h
  referralCount:   number;
  viralScore:      number;
  expiresAt:       string | null;

  /* Owner */
  ownerName:       string;
  ownerAvatarInitials: string;

  /* Prizes */
  prizes:          PublicPrize[];

  /* Leaderboard (top 25, masked names) */
  leaderboard:     LeaderboardEntry[];
}

export interface PublicPrize {
  id:          string;
  rankFrom:    number;
  rankTo:      number;
  rankLabel:   string;   // "#1" or "#2–#3"
  title:       string;
  description: string | null;
  prizeType:   "CASH" | "GIFT_CARD" | "PRODUCT" | "LIFETIME_ACCESS" | "DISCOUNT" | "CUSTOM";
  value:       number | null;
  currency:    string | null;
  emoji:       string;
  expiresAt:   string | null;
}

export interface LeaderboardEntry {
  rank:          number;
  maskedName:    string;   // "Sarah K."
  referralCount: number;
  isTop3:        boolean;
}

export interface JoinResult {
  position:      number;
  referralCode:  string;
  referralUrl:   string;
  totalInQueue:  number;
  alreadyJoined: boolean;
}

/* ─────────────────────────────────────────────────────────────────
   Mock data generator
   In production, replace getWaitlistBySlug() with:
     GET /api/public/waitlist/:slug          → waitlist info + top 5 referrers
     GET /api/prizes/public/:waitlistId      → active public prizes
     GET /api/workspaces/:wid/waitlists/:id/leaderboard/full?limit=25  (no auth)
   ──────────────────────────────────────────────────────────────── */

const PRIZE_EMOJI: Record<string, string> = {
  CASH:           "💵",
  GIFT_CARD:      "🎁",
  PRODUCT:        "📦",
  LIFETIME_ACCESS:"♾️",
  DISCOUNT:       "🏷️",
  CUSTOM:         "✨",
};

export function getWaitlistBySlug(slug: string): PublicWaitlistData | null {
  const waitlists: Record<string, PublicWaitlistData> = {
    "product-alpha": {
      id: "wl_1", slug: "product-alpha",
      name: "Product Alpha",
      tagline: "The AI-powered workspace for modern teams",
      description:
        "Product Alpha reimagines team collaboration with AI at its core. Real-time document editing, smart task automation, and an AI assistant that actually understands your workflow. Built for teams who ship fast and hate pointless meetings.",
      ownerMessage:
        "Hey — I'm Sarah, the founder. We've been building Product Alpha for 18 months and we're finally ready to open the doors. Every person on this list gets early access before the public launch, and the top referrers are going to walk away with some serious rewards. Share your link, climb the board, and let's build something great together. 🚀",
      logoUrl:       null,
      logoInitials: "PA",
      logoGradient: "from-indigo-500 to-violet-600",
      websiteUrl:   "https://productalpha.io",
      category:     "AI & ML",
      tags:         ["AI", "Productivity", "Collaboration", "Workspace"],
      isOpen:       true,
      totalSubscribers: 12_430,
      recentJoins:  247,
      referralCount: 3_120,
      viralScore:   3.2,
      expiresAt:    "2025-04-30",
      ownerName:    "Sarah Kim",
      ownerAvatarInitials: "SK",
      prizes: [
        {
          id: "p1", rankFrom: 1, rankTo: 1, rankLabel: "#1",
          title: "$1,000 Cash Prize", description: "Direct bank transfer or PayPal. No strings attached.",
          prizeType: "CASH", value: 1000, currency: "USD",
          emoji: PRIZE_EMOJI.CASH, expiresAt: "2025-04-30",
        },
        {
          id: "p2", rankFrom: 2, rankTo: 3, rankLabel: "#2 – #3",
          title: "$300 Amazon Gift Card", description: "Delivered digitally within 48h of launch.",
          prizeType: "GIFT_CARD", value: 300, currency: "USD",
          emoji: PRIZE_EMOJI.GIFT_CARD, expiresAt: "2025-04-30",
        },
        {
          id: "p3", rankFrom: 4, rankTo: 10, rankLabel: "#4 – #10",
          title: "Lifetime Access", description: "Free lifetime access to Product Alpha — Pro plan forever.",
          prizeType: "LIFETIME_ACCESS", value: null, currency: null,
          emoji: PRIZE_EMOJI.LIFETIME_ACCESS, expiresAt: null,
        },
        {
          id: "p4", rankFrom: 11, rankTo: 25, rankLabel: "#11 – #25",
          title: "50% Off — First Year", description: "Half-price on any plan for your first 12 months.",
          prizeType: "DISCOUNT", value: 50, currency: null,
          emoji: PRIZE_EMOJI.DISCOUNT, expiresAt: null,
        },
      ],
      leaderboard: [
        { rank: 1,  maskedName: "Sarah K.",    referralCount: 47, isTop3: true  },
        { rank: 2,  maskedName: "Marcus T.",   referralCount: 34, isTop3: true  },
        { rank: 3,  maskedName: "Priya M.",    referralCount: 28, isTop3: true  },
        { rank: 4,  maskedName: "James L.",    referralCount: 21, isTop3: false },
        { rank: 5,  maskedName: "Sofia R.",    referralCount: 17, isTop3: false },
        { rank: 6,  maskedName: "Chen W.",     referralCount: 15, isTop3: false },
        { rank: 7,  maskedName: "Amara O.",    referralCount: 13, isTop3: false },
        { rank: 8,  maskedName: "Luca B.",     referralCount: 11, isTop3: false },
        { rank: 9,  maskedName: "Nadia H.",    referralCount: 9,  isTop3: false },
        { rank: 10, maskedName: "Ryan P.",     referralCount: 8,  isTop3: false },
        { rank: 11, maskedName: "Yuki T.",     referralCount: 7,  isTop3: false },
        { rank: 12, maskedName: "Isabel C.",   referralCount: 7,  isTop3: false },
        { rank: 13, maskedName: "Omar F.",     referralCount: 6,  isTop3: false },
        { rank: 14, maskedName: "Mei L.",      referralCount: 6,  isTop3: false },
        { rank: 15, maskedName: "Diego R.",    referralCount: 5,  isTop3: false },
        { rank: 16, maskedName: "Anna S.",     referralCount: 5,  isTop3: false },
        { rank: 17, maskedName: "Ben O.",      referralCount: 4,  isTop3: false },
        { rank: 18, maskedName: "Clara M.",    referralCount: 4,  isTop3: false },
        { rank: 19, maskedName: "Tom N.",      referralCount: 3,  isTop3: false },
        { rank: 20, maskedName: "Fatima A.",   referralCount: 3,  isTop3: false },
      ],
    },
    "abc": {
      id: "wl_abc", slug: "abc",
      name: "ABC Product",
      tagline: "The simplest way to learn your ABCs",
      description: "ABC Product is a revolutionary platform for early childhood education. Interactive lessons, playful animations, and a progress tracker that parents love.",
      ownerMessage: "Hi, I'm John! We're building the future of learning.",
      logoUrl:       null,
      logoInitials: "AB",
      logoGradient: "from-violet-500 to-purple-600",
      websiteUrl:   "https://abc.edu",
      category:     "Education",
      tags:         ["Education", "Learning", "Children"],
      isOpen:       true,
      totalSubscribers: 500,
      recentJoins:  25,
      referralCount: 120,
      viralScore:   0.24,
      expiresAt:    null,
      ownerName:    "John Doe",
      ownerAvatarInitials: "JD",
      prizes: [
        {
          id: "p1", rankFrom: 1, rankTo: 1, rankLabel: "#1",
          title: "$100 Gift Card", description: "Amazon Gift Card.",
          prizeType: "GIFT_CARD", value: 100, currency: "USD",
          emoji: "🎁", expiresAt: null,
        },
      ],
      leaderboard: [
        { rank: 1,  maskedName: "Jane D.",    referralCount: 10, isTop3: true  },
      ],
    },
  };

  return waitlists[slug] ?? null;
}