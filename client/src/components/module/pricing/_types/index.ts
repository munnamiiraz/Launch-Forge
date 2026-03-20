export type BillingCycle = "monthly" | "yearly";

export type PlanId = "starter" | "pro" | "growth";

export interface PricingFeature {
  label: string;
  included: boolean;
  /** Optional extra detail shown as tooltip or footnote */
  note?: string;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  featured: boolean;
  features: PricingFeature[];
  cta: string;
  ctaHref: string;
}

export interface ComparisonFeature {
  category: string;
  label: string;
  starter:  boolean | string;
  pro:      boolean | string;
  growth:   boolean | string;
}
