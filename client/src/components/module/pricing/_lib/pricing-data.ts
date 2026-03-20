import type { PricingPlan, ComparisonFeature } from "../_types";

export const PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for exploring the product.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    featured: false,
    cta: "Get started free",
    ctaHref: "/register",
    features: [
      { label: "1 waitlist",                  included: true  },
      { label: "Up to 500 subscribers",       included: true  },
      { label: "Basic referral links",        included: true  },
      { label: "LaunchForge branding",        included: true  },
      { label: "Limited analytics (7 days)",  included: true  },
      { label: "Viral referral system",       included: false },
      { label: "Referral leaderboards",       included: false },
      { label: "Feedback board",              included: false },
      { label: "Email support",               included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For founders serious about launch day.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    badge: "Most Popular",
    featured: true,
    cta: "Start free trial",
    ctaHref: "/register?plan=pro",
    features: [
      { label: "Unlimited waitlists",               included: true },
      { label: "Unlimited subscribers",             included: true },
      { label: "Viral referral system",             included: true },
      { label: "Referral leaderboards",             included: true },
      { label: "Full analytics (90 days)",          included: true },
      { label: "Custom domain",                     included: true },
      { label: "Remove LaunchForge branding",       included: true },
      { label: "Basic feedback board",              included: true },
      { label: "Email support",                     included: true },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Full power for ambitious launches.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    featured: false,
    cta: "Upgrade now",
    ctaHref: "/register?plan=growth",
    features: [
      { label: "Everything in Pro",                 included: true },
      { label: "Unlimited analytics history",       included: true },
      { label: "Public roadmap",                    included: true },
      { label: "Advanced feedback board",           included: true },
      { label: "Webhooks & API access",             included: true },
      { label: "Priority support",                  included: true },
      { label: "Team members (up to 5)",            included: true },
      { label: "White-label embeds",                included: true },
    ],
  },
];

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  // Waitlists
  { category: "Waitlists",    label: "Waitlists",             starter: "1",              pro: "Unlimited",    growth: "Unlimited"        },
  { category: "Waitlists",    label: "Subscribers",           starter: "500",            pro: "Unlimited",    growth: "Unlimited"        },
  { category: "Waitlists",    label: "Custom domain",         starter: false,            pro: true,           growth: true               },
  { category: "Waitlists",    label: "Remove branding",       starter: false,            pro: true,           growth: true               },
  // Referrals
  { category: "Referrals",    label: "Basic referral links",  starter: true,             pro: true,           growth: true               },
  { category: "Referrals",    label: "Viral referral system", starter: false,            pro: true,           growth: true               },
  { category: "Referrals",    label: "Referral leaderboards", starter: false,            pro: true,           growth: true               },
  { category: "Referrals",    label: "White-label embeds",    starter: false,            pro: false,          growth: true               },
  // Analytics
  { category: "Analytics",    label: "Analytics history",     starter: "7 days",         pro: "90 days",      growth: "Unlimited"        },
  { category: "Analytics",    label: "Channel attribution",   starter: false,            pro: true,           growth: true               },
  { category: "Analytics",    label: "Geo breakdown",         starter: false,            pro: true,           growth: true               },
  { category: "Analytics",    label: "Referral chain tracing",starter: false,            pro: false,          growth: true               },
  // Engagement
  { category: "Engagement",   label: "Feedback board",        starter: false,            pro: "Basic",        growth: "Advanced"         },
  { category: "Engagement",   label: "Public roadmap",        starter: false,            pro: false,          growth: true               },
  { category: "Engagement",   label: "Milestone emails",      starter: false,            pro: true,           growth: true               },
  // Platform
  { category: "Platform",     label: "API access",            starter: false,            pro: false,          growth: true               },
  { category: "Platform",     label: "Webhooks",              starter: false,            pro: false,          growth: true               },
  { category: "Platform",     label: "Team members",          starter: "1",              pro: "1",            growth: "5"                },
  // Support
  { category: "Support",      label: "Email support",         starter: false,            pro: true,           growth: true               },
  { category: "Support",      label: "Priority support",      starter: false,            pro: false,          growth: true               },
  { category: "Support",      label: "Onboarding call",       starter: false,            pro: false,          growth: true               },
];

export const YEARLY_DISCOUNT = 20; // percent
