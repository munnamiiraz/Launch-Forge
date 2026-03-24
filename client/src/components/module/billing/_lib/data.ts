import type {
  PlanDefinition, BillingPageData, ActiveSubscription,
  Invoice, UsageItem,
} from "../_types";
import { getPaymentStatusAction, getInvoicesAction } from "@/src/services/billing/_lib/billing.actions";

/* ─────────────────────────────────────────────────────────────────
   Plan definitions — single source of truth
   ──────────────────────────────────────────────────────────────── */

export const PLANS: PlanDefinition[] = [
  {
    tier:         "FREE",
    name:         "Free",
    tagline:      "Get started, no card needed",
    monthlyPrice: 0,
    yearlyPrice:  0,
    accent:       "border-zinc-700/60",
    limits: {
      waitlists:   1,
      subscribers: 500,
      teamMembers: 1,
      prizeBoards: 0,
    },
    features: [
      { label: "Waitlists",            included: "1 waitlist"           },
      { label: "Subscribers",          included: "Up to 500"            },
      { label: "Referral tracking",    included: true                   },
      { label: "Public leaderboard",   included: true                   },
      { label: "Feedback board",       included: false                  },
      { label: "Roadmap",              included: false                  },
      { label: "Prize announcements",  included: false                  },
      { label: "Analytics",            included: false                  },
      { label: "Team members",         included: "Owner only"           },
      { label: "Custom domain",        included: false                  },
      { label: "API access",           included: false                  },
      { label: "Priority support",     included: false                  },
    ],
  },
  {
    tier:         "PRO",
    name:         "Pro",
    tagline:      "For growing products",
    monthlyPrice: 19,
    yearlyPrice:  15,   // per month billed annually
    accent:       "border-indigo-500/50",
    limits: {
      waitlists:   null,   // unlimited
      subscribers: 10_000,
      teamMembers: 5,
      prizeBoards: 10,
    },
    features: [
      { label: "Waitlists",            included: "Unlimited",  highlight: true },
      { label: "Subscribers",          included: "Up to 10,000"               },
      { label: "Referral tracking",    included: true                          },
      { label: "Public leaderboard",   included: true                          },
      { label: "Feedback board",       included: true,         highlight: true },
      { label: "Roadmap",              included: true,         highlight: true },
      { label: "Prize announcements",  included: "10 per list",highlight: true },
      { label: "Analytics",            included: true,         highlight: true },
      { label: "Team members",         included: "Up to 5"                    },
      { label: "Custom domain",        included: false                         },
      { label: "API access",           included: false                         },
      { label: "Priority support",     included: false                         },
    ],
  },
  {
    tier:         "GROWTH",
    name:         "Growth",
    tagline:      "For serious launches",
    monthlyPrice: 49,
    yearlyPrice:  39,
    accent:       "border-violet-500/50",
    limits: {
      waitlists:   null,
      subscribers: null,  // unlimited
      teamMembers: null,
      prizeBoards: null,
    },
    features: [
      { label: "Waitlists",            included: "Unlimited",  highlight: true },
      { label: "Subscribers",          included: "Unlimited",  highlight: true },
      { label: "Referral tracking",    included: true                          },
      { label: "Public leaderboard",   included: true                          },
      { label: "Feedback board",       included: true                          },
      { label: "Roadmap",              included: true                          },
      { label: "Prize announcements",  included: "Unlimited",  highlight: true },
      { label: "Analytics",            included: "Advanced",   highlight: true },
      { label: "Team members",         included: "Unlimited",  highlight: true },
      { label: "Custom domain",        included: true,         highlight: true },
      { label: "API access",           included: true,         highlight: true },
      { label: "Priority support",     included: true,         highlight: true },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   Mock billing data — replace each fn with real API call
   ──────────────────────────────────────────────────────────────── */

export async function getBillingData(): Promise<BillingPageData> {
  const [statusRes, invoicesRes] = await Promise.all([
    getPaymentStatusAction(),
    getInvoicesAction(),
  ]);

  const subscription: ActiveSubscription | null = statusRes.data?.subscription ?? null;

  const invoices: Invoice[] = invoicesRes.data ?? [];

  // TODO: Add real usage data when implemented in backend
  const usage: UsageItem[] = [
    { label: "Waitlists",        used: 0,     limit: null,   unit: "waitlists"   },
    { label: "Subscribers",      used: 0,     limit: 10_000, unit: "subscribers" },
    { label: "Team members",     used: 0,     limit: 5,      unit: "members"     },
    { label: "Active prizes",    used: 0,     limit: 10,     unit: "prizes"      },
    { label: "Feedback boards",  used: 0,     limit: null,   unit: "boards"      },
    { label: "API calls (30d)",  used: 0,     limit: null,   unit: "calls"       },
  ];

  return { subscription, invoices, usage };

}