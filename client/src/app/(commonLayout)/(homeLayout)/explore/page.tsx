import { type Metadata } from "next";
import { Rocket, TrendingUp, Users, Trophy } from "lucide-react";
import { ExploreClient } from "@/src/components/module/explore/_components/ExploreClient";
import type { PublicProduct } from "@/src/components/module/explore/_lib/data";

export const metadata: Metadata = {
  title:       "Explore Products — LaunchForge",
  description: "Browse products launching on LaunchForge. Join waitlists, earn prizes, and be first in line.",
  openGraph: {
    title:       "Explore Products — LaunchForge",
    description: "Discover and join waitlists for the next generation of products.",
    type:        "website",
  },
};

/* ── Quick platform stats for the hero strip ────────────────────── */
function getHeroStats(products: PublicProduct[]) {
  const total      = products.length;
  const open       = products.filter((p) => p.isOpen).length;
  const totalSubs  = products.reduce((s, p) => s + (p.totalSubscribers ?? 0), 0);
  const withPrizes = products.filter((p) => p.prizes.length > 0).length;
  return { total, open, totalSubs, withPrizes };
}

type ExploreWaitlistCard = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  totalSubscribers: number;
  recentJoins: number;
  referralCount: number;
  viralScore: number;
  createdAt: string;
  expiresAt: string | null;
  workspace: { slug: string };
  prizes: Array<{
    id: string;
    rankLabel: string;
    title: string;
    value: number | null;
    currency: string | null;
    emoji: string;
  }>;
  topReferrers: Array<{
    maskedName: string;
    referralCount: number;
    rank: number;
  }>;
};

type ApiResponse<T> = { success: boolean; message: string; data?: T; meta?: unknown };

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

function pickGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  return initials || "WL";
}

function formatPrizeValue(value: number | null, currency: string | null): string | null {
  if (value === null || value === undefined) return null;
  if (!currency || currency === "USD") return `$${value.toLocaleString("en-US")}`;
  return `${value.toLocaleString("en-US")} ${currency}`;
}

function mapExploreCardToProduct(card: ExploreWaitlistCard): PublicProduct {
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    tagline: card.tagline,
    description: card.description ?? "",
    logoUrl: card.logoUrl,
    logoInitials: getInitials(card.name),
    logoGradient: pickGradient(card.slug),
    category: "Other",
    tags: [],
    websiteUrl: null,
    isOpen: card.isOpen,
    totalSubscribers: card.totalSubscribers ?? 0,
    recentJoins: card.recentJoins ?? 0,
    referralCount: card.referralCount ?? 0,
    viralScore: card.viralScore ?? 0,
    createdAt: card.createdAt,
    expiresAt: card.expiresAt,
    ownerName: card.workspace?.slug ? `@${card.workspace.slug}` : "Founder",
    prizes: (card.prizes ?? []).map((p) => ({
      rank: p.rankLabel,
      title: p.title,
      emoji: p.emoji,
      value: formatPrizeValue(p.value, p.currency),
    })),
    topReferrers: card.topReferrers ?? [],
  };
}

async function fetchExploreProducts(opts: {
  search?: string;
  openOnly?: boolean;
  prizesOnly?: boolean;
}): Promise<PublicProduct[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

  const qs = new URLSearchParams({ page: "1", limit: "48" });
  if (opts.search?.trim()) qs.set("search", opts.search.trim());
  if (opts.openOnly) qs.set("openOnly", "true");
  if (opts.prizesOnly) qs.set("prizesOnly", "true");

  const res = await fetch(`${API_BASE}/explore/waitlists?${qs.toString()}`, {
    next: { revalidate: 30 },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as ApiResponse<ExploreWaitlistCard[]>;
  return (json.data ?? []).map(mapExploreCardToProduct);
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: { filter?: string; search?: string };
}) {
  const filter = searchParams?.filter;
  const initialShowPrizesOnly = filter === "prizes";
  const initialShowOpen = filter === "open";
  const initialSearch = typeof searchParams?.search === "string" ? searchParams.search : "";

  const products = await fetchExploreProducts({
    search: initialSearch,
    openOnly: initialShowOpen,
    prizesOnly: initialShowPrizesOnly,
  });
  const stats = getHeroStats(products);

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* ── Hero header ──────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">

        {/* Background texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]"
        />

        {/* Ambient blobs */}
        <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-indigo-500/8 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-violet-500/6 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">

            {/* Badge */}
            <div className="flex">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-3 py-1 text-[11px] font-semibold text-indigo-400">
                <Rocket size={11} />
                Product discovery
              </span>
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-3 max-w-2xl">
              <h1 className="text-4xl font-black tracking-tight text-zinc-100 sm:text-5xl">
                Be first in line for{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  what's next
                </span>
              </h1>
              <p className="text-lg text-zinc-500 leading-relaxed">
                Discover products launching on LaunchForge. Join waitlists, refer friends to move
                up the queue, and win prizes from builders who reward early believers.
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: <Rocket     size={14} className="text-indigo-400"  />, value: `${stats.total} products`,                    label: "listed"          },
                { icon: <TrendingUp size={14} className="text-emerald-400" />, value: `${stats.open} open`,                          label: "accepting joins" },
                { icon: <Users      size={14} className="text-violet-400"  />, value: `${(stats.totalSubs / 1000).toFixed(0)}k+ people`, label: "already in"  },
                { icon: <Trophy     size={14} className="text-amber-400"   />, value: `${stats.withPrizes} with prizes`,             label: "up for grabs"   },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-sm font-bold text-zinc-200">{s.value}</span>
                  <span className="text-sm text-zinc-600">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <ExploreClient
          products={products}
          initialSearch={initialSearch}
          initialShowOpen={initialShowOpen}
          initialShowPrizesOnly={initialShowPrizesOnly}
        />
      </div>
    </div>
  );
}
