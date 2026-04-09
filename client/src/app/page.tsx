import { Navbar } from "@/src/components/shared/navbar/Navbar";
import { Footer } from "@/src/components/shared/footer";
import { HeroSection } from "../components/module/home/hero-section/_components/HeroSection";
import { HowItWorksSection } from "../components/module/home/how-it-works/_components/HowItWorksSection";
import { FeaturesSection } from "../components/module/home/features-section/_components/FeaturesSection";
import { SocialProofSection } from "../components/module/home/social-proof/_components/SocialProofSection";
import type { WaitlistStats, RecentSignup } from "../components/module/home/hero-section/_types";

async function getWaitlistStats(): Promise<WaitlistStats> {
  return {
    totalSignups: 2_847,
    signupsLast24h: 143,
    signupsLastWeek: 891,
    averageReferrals: 3.2,
    topCountry: "United States",
    isLive: true,
  };
}

async function getRecentSignups(): Promise<RecentSignup[]> {
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
}

import { NewsletterSection } from "../components/shared/NewsletterSection";

export default async function HomePage() {
  const [initialStats, initialRecent] = await Promise.all([
    getWaitlistStats(),
    getRecentSignups(),
  ]);

  return (
    <>
      <Navbar showBanner />
      <HeroSection initialStats={initialStats} initialRecent={initialRecent} />
      <HowItWorksSection />
      <FeaturesSection />
      <SocialProofSection />
      <NewsletterSection />
      <Footer />
    </>
  );
}
