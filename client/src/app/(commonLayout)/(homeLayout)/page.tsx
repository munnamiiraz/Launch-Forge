import { Metadata } from "next";
import { HeroSection } from "../../../components/module/home/hero-section/_components/HeroSection";
import type { WaitlistStats, RecentSignup } from "../../../components/module/home/hero-section/_types";
import { HowItWorksSection } from "../../../components/module/home/how-it-works/_components/HowItWorksSection";
import { FeaturesSection } from "@/src/components/module/home/features-section/_components/FeaturesSection";
import { SocialProofSection } from "@/src/components/module/home/social-proof/_components/SocialProofSection";

export const metadata: Metadata = {
  title: "LaunchForge — Build Waitlists That Go Viral",
  description:
    "LaunchForge turns signups into a growth engine. Viral referral loops, real-time leaderboards, and AI-powered insights. Launch with momentum.",
  openGraph: {
    title: "LaunchForge — Build Waitlists That Go Viral",
    description:
      "Viral referral loops, real-time leaderboards, and AI-powered insights for your next launch.",
    type: "website",
  },
};

/* ── Server-side data fetching ─────────────────────────────────────
   Data is fetched on the server (SSR / ISR) and passed to the client
   component as `initialData`. TanStack Query on the client will use
   this as the seed and refetch in the background transparently.
─────────────────────────────────────────────────────────────────── */

async function getWaitlistStats(): Promise<WaitlistStats> {
  try {
    /**
     * In production, call your DB directly here — skip the HTTP round-trip:
     *
     * import { db } from "@/lib/db";
     * const total = await db.waitlistEntry.count();
     * ...
     * return { totalSignups: total, ... };
     *
     * Or call the API route (useful for edge deployments):
     *
     * const res = await fetch(
     *   `${process.env.NEXT_PUBLIC_APP_URL}/api/waitlist/stats`,
     *   { next: { revalidate: 60 } }
     * );
     * return res.json();
     */

    // Fallback mock — replace with real query
    return {
      totalSignups: 2_847,
      signupsLast24h: 143,
      signupsLastWeek: 891,
      averageReferrals: 3.2,
      topCountry: "United States",
      isLive: true,
    };
  } catch {
    return {
      totalSignups: 0,
      signupsLast24h: 0,
      signupsLastWeek: 0,
      averageReferrals: 0,
      topCountry: "",
      isLive: false,
    };
  }
}

async function getRecentSignups(): Promise<RecentSignup[]> {
  try {
    /**
     * In production:
     *
     * const entries = await db.waitlistEntry.findMany({
     *   orderBy: { createdAt: "desc" },
     *   take: 8,
     * });
     * return entries.map(e => ({ ... }));
     */

    return [
      { initials: "AM", name: "Alex M.", location: "San Francisco", timeAgo: "2m ago" },
      { initials: "PK", name: "Priya K.", location: "Bangalore", timeAgo: "7m ago" },
      { initials: "JL", name: "James L.", location: "London", timeAgo: "15m ago" },
      { initials: "SR", name: "Sofia R.", location: "Madrid", timeAgo: "23m ago" },
      { initials: "CW", name: "Chen W.", location: "Singapore", timeAgo: "31m ago" },
      { initials: "AO", name: "Amara O.", location: "Lagos", timeAgo: "44m ago" },
      { initials: "LF", name: "Lucas F.", location: "São Paulo", timeAgo: "58m ago" },
      { initials: "NT", name: "Nina T.", location: "Berlin", timeAgo: "1h ago" },
    ];
  } catch {
    return [];
  }
}

export default async function HeroPage() {
  // Parallel server-side fetch — both resolve before the page streams
  const [initialStats, initialRecent] = await Promise.all([
    getWaitlistStats(),
    getRecentSignups(),
  ]);

  return (
    <>
      <HeroSection
        initialStats={initialStats}
        initialRecent={initialRecent}
      />
      <HowItWorksSection />
      <FeaturesSection />
      <SocialProofSection />
    </>
  );
}
