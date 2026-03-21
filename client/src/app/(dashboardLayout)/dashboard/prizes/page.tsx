import { type Metadata } from "next";

import { PrizesPageClient } from "@/src/components/module/prizes/_components/PrizesPageClient";

export const metadata: Metadata = {
  title: "Prizes — LaunchForge",
  description: "Announce prize pools for your waitlist leaderboards.",
};

export default function PrizesPage() {
  return <PrizesPageClient />;
}

