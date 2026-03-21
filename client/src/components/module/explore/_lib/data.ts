export type ProductCategory =
  | "AI & ML"
  | "Developer Tools"
  | "SaaS"
  | "Mobile"
  | "Design"
  | "Fintech"
  | "Health"
  | "Education"
  | "Gaming"
  | "Other";

export type SortOption = "trending" | "newest" | "most-joined" | "closing-soon";

export interface PublicProduct {
  id:              string;
  slug:            string;
  name:            string;
  tagline:         string;
  description:     string;
  logoUrl:         string | null;
  logoInitials:    string;
  logoGradient:    string;
  category:        ProductCategory;
  tags:            string[];
  websiteUrl:      string | null;
  isOpen:          boolean;
  totalSubscribers: number;
  recentJoins:     number;   // joined in last 24h — "trending" signal
  referralCount:   number;
  viralScore:      number;   // referrals / subscribers
  createdAt:       string;
  expiresAt:       string | null;
  ownerName:       string;
  ownerMessage?:    string | null;   // personal note from the owner
  ownerAvatarInitials?: string;
  prizes:          PublicPrizeSummary[];
  topReferrers:    PublicReferrer[];
  leaderboard?:     LeaderboardEntry[];
}

export interface PublicPrizeSummary {
  rank:    string;  // "#1" or "#1–#3"
  title:   string;
  emoji:   string;
  value:   string | null;
}

export interface PublicReferrer {
  maskedName:    string;
  referralCount: number;
  rank:          number;
}

export interface LeaderboardEntry {
  rank:          number;
  maskedName:    string;
  referralCount: number;
  prizeWon?:     string | null;
  isTop3:        boolean;
}

export interface JoinWaitlistForm {
  name:  string;
  email: string;
}

export interface JoinResult {
  position:      number;
  referralCode:  string;
  referralUrl:   string;
  totalInQueue:  number;
  alreadyJoined: boolean;
}

/* ─────────────────────────────────────────────────────────────────
   Mock data — replace with:
   GET /api/explore/waitlists?category=&sort=&search=&page=
   which queries public Waitlist records with subscriber counts
   ──────────────────────────────────────────────────────────────── */

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-red-500 to-orange-600",
  "from-sky-500 to-indigo-600",
  "from-teal-500 to-cyan-600",
  "from-fuchsia-500 to-pink-600",
];

export const MOCK_PRODUCTS: PublicProduct[] = [
  {
    id: "p01", slug: "product-alpha", name: "Product Alpha",
    tagline: "The AI-powered workspace for modern teams",
    description: "Product Alpha reimagines team collaboration with AI at its core. Real-time document editing, smart task automation, and an AI assistant that actually understands your workflow. Built for teams who ship fast.",
    logoUrl: null, logoInitials: "PA", logoGradient: GRADIENTS[0],
    category: "AI & ML", tags: ["AI", "Productivity", "Collaboration"],
    websiteUrl: "https://productalpha.io", isOpen: true,
    totalSubscribers: 12_430, recentJoins: 247, referralCount: 3_120, viralScore: 3.2,
    createdAt: "2025-01-10", expiresAt: "2025-04-30",
    ownerName: "Sarah Kim",
    prizes: [
      { rank: "#1",   title: "💵 $1,000 Cash",        emoji: "💵", value: "$1,000" },
      { rank: "#2–#3",title: "🎁 $300 Gift Card",     emoji: "🎁", value: "$300"  },
      { rank: "#4–#10",title:"♾️ Lifetime Access",    emoji: "♾️", value: null    },
    ],
    topReferrers: [
      { maskedName: "Sarah K.",  referralCount: 47, rank: 1 },
      { maskedName: "Marcus T.", referralCount: 34, rank: 2 },
      { maskedName: "Priya M.",  referralCount: 28, rank: 3 },
    ],
  },
  {
    id: "p02", slug: "beta-access", name: "NeuralWrite",
    tagline: "Write 10× faster with AI that knows your voice",
    description: "NeuralWrite learns your writing style and produces long-form content, emails, and docs that sound exactly like you. No more editing AI slop — your voice, amplified.",
    logoUrl: null, logoInitials: "NW", logoGradient: GRADIENTS[1],
    category: "AI & ML", tags: ["Writing", "AI", "Copywriting"],
    websiteUrl: "https://neuralwrite.ai", isOpen: true,
    totalSubscribers: 9_810, recentJoins: 183, referralCount: 2_450, viralScore: 2.9,
    createdAt: "2025-01-22", expiresAt: null,
    ownerName: "Priya Mehta",
    prizes: [
      { rank: "#1",   title: "✨ Founder Badge + Free Year", emoji: "✨", value: null },
    ],
    topReferrers: [
      { maskedName: "Chen W.",  referralCount: 31, rank: 1 },
      { maskedName: "Amara O.", referralCount: 24, rank: 2 },
    ],
  },
  {
    id: "p03", slug: "mobile-app-launch", name: "Pocketly",
    tagline: "Your money, simplified. Finally.",
    description: "Pocketly is a personal finance app that actually makes you look forward to checking your balance. Smart categorisation, savings goals, and a brutally honest spending score that keeps you on track.",
    logoUrl: null, logoInitials: "PO", logoGradient: GRADIENTS[3],
    category: "Fintech", tags: ["Finance", "Mobile", "Savings"],
    websiteUrl: "https://pocketly.app", isOpen: false,
    totalSubscribers: 7_660, recentJoins: 0, referralCount: 1_980, viralScore: 2.7,
    createdAt: "2025-02-01", expiresAt: null,
    ownerName: "Ryo Tanaka",
    prizes: [],
    topReferrers: [
      { maskedName: "Yuki T.", referralCount: 18, rank: 1 },
    ],
  },
  {
    id: "p04", slug: "enterprise-early", name: "Axiom CRM",
    tagline: "The CRM that closes deals, not just tracks them",
    description: "Axiom is built for enterprise sales teams who are sick of bloated CRMs. Deal intelligence, pipeline forecasting, and one-click proposal generation. Your reps will actually want to use it.",
    logoUrl: null, logoInitials: "AX", logoGradient: GRADIENTS[7],
    category: "SaaS", tags: ["CRM", "Sales", "B2B", "Enterprise"],
    websiteUrl: "https://axiomcrm.io", isOpen: true,
    totalSubscribers: 5_320, recentJoins: 94, referralCount: 1_540, viralScore: 3.1,
    createdAt: "2025-02-14", expiresAt: "2025-05-01",
    ownerName: "Anna Schmidt",
    prizes: [
      { rank: "#1",   title: "💵 $2,000 Cash",     emoji: "💵", value: "$2,000" },
      { rank: "#2–#5",title: "🏷️ 50% Off — 1 Year",emoji: "🏷️", value: null    },
    ],
    topReferrers: [
      { maskedName: "Anna S.", referralCount: 22, rank: 1 },
      { maskedName: "Ben O.",  referralCount: 15, rank: 2 },
    ],
  },
  {
    id: "p05", slug: "devflow", name: "DevFlow",
    tagline: "Ship code reviews 5× faster",
    description: "DevFlow is the code review tool your team has been waiting for. AI-powered PR summaries, smart diff highlights, and async video comments that kill the need for sync review meetings.",
    logoUrl: null, logoInitials: "DF", logoGradient: GRADIENTS[2],
    category: "Developer Tools", tags: ["Dev Tools", "Code Review", "GitHub"],
    websiteUrl: "https://devflow.dev", isOpen: true,
    totalSubscribers: 4_100, recentJoins: 121, referralCount: 1_230, viralScore: 2.1,
    createdAt: "2025-02-20", expiresAt: null,
    ownerName: "Omar Farooq",
    prizes: [
      { rank: "#1–#5", title: "♾️ Lifetime Access", emoji: "♾️", value: null },
    ],
    topReferrers: [
      { maskedName: "Omar F.", referralCount: 31, rank: 1 },
    ],
  },
  {
    id: "p06", slug: "designkit", name: "DesignKit",
    tagline: "Figma components, done right",
    description: "A premium Figma component library with 2,000+ production-ready components, 30 themes, and full dark mode support. Used by teams at Stripe, Linear, and Vercel.",
    logoUrl: null, logoInitials: "DK", logoGradient: GRADIENTS[5],
    category: "Design", tags: ["Design", "Figma", "UI Kit", "Components"],
    websiteUrl: "https://designkit.io", isOpen: true,
    totalSubscribers: 3_200, recentJoins: 68, referralCount: 840, viralScore: 1.8,
    createdAt: "2025-03-01", expiresAt: null,
    ownerName: "Lena Andersen",
    prizes: [],
    topReferrers: [],
  },
  {
    id: "p07", slug: "studyai", name: "StudyAI",
    tagline: "Ace every exam with your personal AI tutor",
    description: "StudyAI creates personalised study plans, generates practice questions from any syllabus, and tracks your progress with spaced repetition. Used by 50k students in beta.",
    logoUrl: null, logoInitials: "SA", logoGradient: GRADIENTS[8],
    category: "Education", tags: ["EdTech", "AI", "Study", "Students"],
    websiteUrl: "https://studyai.app", isOpen: true,
    totalSubscribers: 2_840, recentJoins: 312, referralCount: 920, viralScore: 2.4,
    createdAt: "2025-03-05", expiresAt: "2025-06-01",
    ownerName: "Mei Ling",
    prizes: [
      { rank: "#1",   title: "🎓 Free Premium — 1 Year", emoji: "🎓", value: null },
      { rank: "#2–#3",title: "🎁 $50 Gift Card",          emoji: "🎁", value: "$50" },
    ],
    topReferrers: [
      { maskedName: "Mei L.",  referralCount: 42, rank: 1 },
      { maskedName: "Ryan P.", referralCount: 28, rank: 2 },
    ],
  },
  {
    id: "p08", slug: "pixelplay", name: "PixelPlay",
    tagline: "Create games without writing a line of code",
    description: "PixelPlay is a no-code game builder with a drag-and-drop canvas, built-in physics engine, and one-click publish to web, iOS, and Android. Launch your first game this weekend.",
    logoUrl: null, logoInitials: "PP", logoGradient: GRADIENTS[6],
    category: "Gaming", tags: ["No-Code", "Game Dev", "Mobile"],
    websiteUrl: "https://pixelplay.io", isOpen: true,
    totalSubscribers: 1_940, recentJoins: 89, referralCount: 560, viralScore: 1.9,
    createdAt: "2025-03-10", expiresAt: null,
    ownerName: "Diego Ruiz",
    prizes: [],
    topReferrers: [],
  },
  {
    id: "p09", slug: "healtrack", name: "HealTrack",
    tagline: "Your body, decoded",
    description: "HealTrack connects with your wearables and lab results to give you a single health dashboard that actually makes sense. Trends, insights, and GP-reviewed summaries in plain English.",
    logoUrl: null, logoInitials: "HT", logoGradient: GRADIENTS[4],
    category: "Health", tags: ["Health", "Wearables", "Wellness"],
    websiteUrl: "https://healtrack.health", isOpen: true,
    totalSubscribers: 1_480, recentJoins: 54, referralCount: 390, viralScore: 1.6,
    createdAt: "2025-03-12", expiresAt: null,
    ownerName: "Isabel Costa",
    prizes: [
      { rank: "#1–#3", title: "📦 Health Monitor Device", emoji: "📦", value: null },
    ],
    topReferrers: [
      { maskedName: "Isabel C.", referralCount: 19, rank: 1 },
    ],
  },
  {
    id: "p10", slug: "snippetly", name: "Snippetly",
    tagline: "Your second brain for code snippets",
    description: "Snippetly is a developer snippet manager with AI-powered search, team sharing, and IDE integrations for VS Code, Cursor, and JetBrains. Never search Stack Overflow twice.",
    logoUrl: null, logoInitials: "SN", logoGradient: GRADIENTS[9],
    category: "Developer Tools", tags: ["Dev Tools", "Productivity", "VS Code"],
    websiteUrl: "https://snippetly.dev", isOpen: true,
    totalSubscribers: 980, recentJoins: 42, referralCount: 280, viralScore: 1.7,
    createdAt: "2025-03-15", expiresAt: null,
    ownerName: "Tom Nguyen",
    prizes: [],
    topReferrers: [],
  },
  {
    id: "p11", slug: "codeflow-ai", name: "CodeFlow AI",
    tagline: "AI pair programming that stays out of your way",
    description: "CodeFlow AI is an IDE extension that suggests whole functions, writes tests, and explains legacy code — without the bloat. Supports 40 languages and runs fully locally.",
    logoUrl: null, logoInitials: "CF", logoGradient: GRADIENTS[2],
    category: "Developer Tools", tags: ["AI", "Coding", "IDE", "Local"],
    websiteUrl: "https://codeflow.ai", isOpen: true,
    totalSubscribers: 8_240, recentJoins: 196, referralCount: 2_190, viralScore: 2.6,
    createdAt: "2025-01-28", expiresAt: null,
    ownerName: "Lucas Oliveira",
    prizes: [
      { rank: "#1",    title: "💵 $500 Cash",       emoji: "💵", value: "$500" },
      { rank: "#2–#5", title: "♾️ Lifetime Pro",    emoji: "♾️", value: null   },
    ],
    topReferrers: [
      { maskedName: "Lucas O.", referralCount: 38, rank: 1 },
      { maskedName: "Chen W.",  referralCount: 27, rank: 2 },
    ],
  },
  {
    id: "p12", slug: "launchpilot", name: "LaunchPilot",
    tagline: "Go-to-market strategy, on autopilot",
    description: "LaunchPilot analyses your product and market, then generates a full GTM playbook — pricing, positioning, channels, and a 90-day launch calendar. Backed by data from 10,000 successful launches.",
    logoUrl: null, logoInitials: "LP", logoGradient: GRADIENTS[0],
    category: "SaaS", tags: ["GTM", "Marketing", "Strategy", "Startups"],
    websiteUrl: "https://launchpilot.io", isOpen: true,
    totalSubscribers: 3_890, recentJoins: 147, referralCount: 1_020, viralScore: 2.2,
    createdAt: "2025-02-08", expiresAt: "2025-05-15",
    ownerName: "Fatima Al-Amin",
    prizes: [
      { rank: "#1", title: "🎁 $200 Gift Card", emoji: "🎁", value: "$200" },
    ],
    topReferrers: [
      { maskedName: "Fatima A.", referralCount: 24, rank: 1 },
    ],
  },
  {
    id: "p13", slug: "abc", name: "ABC Product",
    tagline: "The simplest way to learn your ABCs",
    description: "ABC Product is a revolutionary platform for early childhood education. Interactive lessons, playful animations, and a progress tracker that parents love.",
    logoUrl: null, logoInitials: "AB", logoGradient: GRADIENTS[1],
    category: "Education", tags: ["Education", "Children", "Learning"],
    websiteUrl: "https://abc.edu", isOpen: true,
    totalSubscribers: 500, recentJoins: 25, referralCount: 120, viralScore: 0.24,
    createdAt: "2025-03-18", expiresAt: null,
    ownerName: "John Doe",
    prizes: [
      { rank: "#1", title: "🎁 $100 Gift Card", emoji: "🎁", value: "$100" },
    ],
    topReferrers: [
      { maskedName: "Jane D.", referralCount: 10, rank: 1 },
    ],
  },
];

export function getWaitlistBySlug(slug: string): PublicProduct | null {
  const normalized = slug ? slug.trim().toLowerCase() : "";
  console.log(`DEBUG: getWaitlistBySlug("${slug}") -> normalized: "${normalized}"`);
  console.log("DEBUG: Available slugs:", MOCK_PRODUCTS.map(p => p.slug));
  const result = MOCK_PRODUCTS.find((p) => p.slug.toLowerCase() === normalized) ?? null;
  console.log("DEBUG: Result found:", !!result);
  return result;
}

export const CATEGORIES: ProductCategory[] = [
  "AI & ML", "Developer Tools", "SaaS", "Mobile", "Design",
  "Fintech", "Health", "Education", "Gaming", "Other",
];