import { type Metadata } from "next";
import { PricingSection } from "@/src/components/module/pricing/_components/PricingSection";

export const metadata: Metadata = {
  title: "Pricing — LaunchForge",
  description:
    "Simple, transparent pricing. Start free. Upgrade to Pro for $19/month or Growth for $49/month. Save 20% with yearly billing.",
};

/**
 * /pricing  →  src/app/modules/pricing/page.tsx
 *
 * Server Component shell — all billing-cycle interactivity lives in
 * <PricingSection /> (use client).
 *
 * To embed inside another layout:
 *
 *   import { PricingSection } from
 *     "@/app/modules/pricing/_components/PricingSection";
 *   <PricingSection />
 */
export default function PricingPage() {
  return <PricingSection />;
}
