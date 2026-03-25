import { type Metadata } from "next";
import { cookies } from "next/headers";

import { PrizesPageClient } from "@/src/components/module/prizes/_components/PrizesPageClient";
import { UpgradeGate } from "@/src/components/shared/UpgradeGate";
import { isFeatureAvailable, type PlanTier } from "@/src/lib/plan-limits";

export const metadata: Metadata = {
  title: "Prizes — LaunchForge",
  description: "Announce prize pools for your waitlist leaderboards.",
};

export default async function PrizesPage() {
  const cookieStore = await cookies();
  const activePlan = (cookieStore.get("activeWorkspacePlan")?.value?.toUpperCase() || "FREE") as PlanTier;
  const hasPrizes = isFeatureAvailable(activePlan, "prizeAnnouncements");

  if (!hasPrizes) {
    return (
      <UpgradeGate
        featureName="Prize Announcements"
        requiredPlan="PRO"
        description="Announce monetary rewards, gift cards, lifetime access, or custom prizes for top referrers. Upgrade to the Pro plan to unlock prize management."
      />
    );
  }

  return <PrizesPageClient />;
}
