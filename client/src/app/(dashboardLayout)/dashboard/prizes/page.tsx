import { type Metadata } from "next";
import { Trophy } from "lucide-react";

import { DashboardHeader } from "@/src/components/module/dashboard/_components/DashboardHeader";
import { PrizesClient }    from "@/src/components/module/prizes/_components/PrizesClient";
import type { Prize, PrizeWaitlist } from "@/src/components/module/prizes/_types";

export const metadata: Metadata = {
  title:       "Prizes — LaunchForge",
  description: "Announce prize pools for your waitlist leaderboards.",
};

/* ─────────────────────────────────────────────────────────────────
   Server data fetch
   Replace with real API calls:
   GET /api/workspaces/:workspaceId/waitlists
   GET /api/prizes/waitlist/:waitlistId  (for each waitlist)
   ──────────────────────────────────────────────────────────────── */

async function getWaitlistsWithPrizes(): Promise<{
  waitlists:     PrizeWaitlist[];
  initialPrizes: Record<string, Prize[]>;
}> {
  const waitlists: PrizeWaitlist[] = [
    { id: "wl_1", name: "Product Alpha",     slug: "product-alpha",     isOpen: true,  subscribers: 1243, activePrizes: 3, totalPrizePool: 1500 },
    { id: "wl_2", name: "Beta Access",       slug: "beta-access",       isOpen: true,  subscribers: 891,  activePrizes: 1, totalPrizePool: 0    },
    { id: "wl_3", name: "Mobile App Launch", slug: "mobile-app-launch", isOpen: false, subscribers: 533,  activePrizes: 0, totalPrizePool: 0    },
    { id: "wl_4", name: "Enterprise Early",  slug: "enterprise-early",  isOpen: true,  subscribers: 180,  activePrizes: 2, totalPrizePool: 2500 },
  ];

  const now = new Date().toISOString();
  const future = new Date(Date.now() + 30 * 86_400_000).toISOString();

  const initialPrizes: Record<string, Prize[]> = {
    wl_1: [
      {
        id: "p_1", waitlistId: "wl_1",
        title: "💵 $1,000 Cash Prize",
        description: "The top referrer takes home $1,000 USD via bank transfer or PayPal.",
        prizeType: "CASH", value: 1000, currency: "USD",
        rankFrom: 1, rankTo: 1,
        imageUrl: null, status: "ACTIVE",
        expiresAt: future, createdAt: now, updatedAt: now,
      },
      {
        id: "p_2", waitlistId: "wl_1",
        title: "🎁 $300 Amazon Gift Card",
        description: "Ranks 2nd and 3rd each receive a $300 Amazon gift card.",
        prizeType: "GIFT_CARD", value: 300, currency: "USD",
        rankFrom: 2, rankTo: 3,
        imageUrl: null, status: "ACTIVE",
        expiresAt: future, createdAt: now, updatedAt: now,
      },
      {
        id: "p_3", waitlistId: "wl_1",
        title: "♾️ Lifetime Access",
        description: "Ranks 4–10 receive lifetime access to Product Alpha at no cost.",
        prizeType: "LIFETIME_ACCESS", value: null, currency: null,
        rankFrom: 4, rankTo: 10,
        imageUrl: null, status: "ACTIVE",
        expiresAt: null, createdAt: now, updatedAt: now,
      },
    ],
    wl_2: [
      {
        id: "p_4", waitlistId: "wl_2",
        title: "✨ Early Beta Founder Badge",
        description: "The top referrer gets a permanent Founder badge and early beta access.",
        prizeType: "CUSTOM", value: null, currency: null,
        rankFrom: 1, rankTo: 1,
        imageUrl: null, status: "ACTIVE",
        expiresAt: null, createdAt: now, updatedAt: now,
      },
    ],
    wl_3: [],
    wl_4: [
      {
        id: "p_5", waitlistId: "wl_4",
        title: "💵 $2,000 Cash Reward",
        description: "Exclusive enterprise referral bounty — $2,000 for the top referrer.",
        prizeType: "CASH", value: 2000, currency: "USD",
        rankFrom: 1, rankTo: 1,
        imageUrl: null, status: "ACTIVE",
        expiresAt: future, createdAt: now, updatedAt: now,
      },
      {
        id: "p_6", waitlistId: "wl_4",
        title: "🏷️ 50% Discount — 1 Year",
        description: "Ranks 2–5 receive 50% off their first year of the Enterprise plan.",
        prizeType: "DISCOUNT", value: 50, currency: null,
        rankFrom: 2, rankTo: 5,
        imageUrl: null, status: "ACTIVE",
        expiresAt: null, createdAt: now, updatedAt: now,
      },
    ],
  };

  return { waitlists, initialPrizes };
}

export default async function PrizesPage() {
  const { waitlists, initialPrizes } = await getWaitlistsWithPrizes();

  const totalActivePrizes = waitlists.reduce((s, w) => s + w.activePrizes, 0);
  const totalPool         = waitlists.reduce((s, w) => s + w.totalPrizePool, 0);

  return (
    <div className="flex flex-col">

      {/* ── Sticky header ────────────────────────────────────── */}
      <DashboardHeader
        title="Prizes"
        subtitle={`${totalActivePrizes} active prize${totalActivePrizes !== 1 ? "s" : ""} · $${totalPool.toLocaleString()} total pool`}
      />

      <div className="flex flex-col gap-6 p-6">

        {/* Page identity band */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-zinc-900/30 px-6 py-5">
          <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-500/8 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-32 w-64 rounded-full bg-indigo-500/5 blur-3xl" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/12">
              <Trophy size={20} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-base font-bold text-zinc-100">Prize pool management</h1>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
                Announce monetary rewards, gift cards, lifetime access, or custom prizes for top
                referrers on each waitlist. Prizes appear on the public leaderboard to motivate
                sharing — the more you offer, the more your subscribers will recruit.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { emoji: "💵", label: "Cash rewards"        },
                  { emoji: "🎁", label: "Gift cards"           },
                  { emoji: "♾️", label: "Lifetime access"      },
                  { emoji: "🏷️", label: "Discount codes"       },
                  { emoji: "✨", label: "Custom prizes"        },
                ].map((f) => (
                  <span
                    key={f.label}
                    className="rounded-full border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1 text-[10px] text-zinc-500"
                  >
                    {f.emoji} {f.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main client component */}
        <PrizesClient
          waitlists={waitlists}
          initialPrizes={initialPrizes}
        />
      </div>
    </div>
  );
}