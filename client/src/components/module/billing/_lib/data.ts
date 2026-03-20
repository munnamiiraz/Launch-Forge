import type {
  PlanDefinition, BillingPageData, ActiveSubscription,
  Invoice, UsageItem,
} from "../_types";

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
  /**
   * Real:
   * const [paymentStatus, invoices] = await Promise.all([
   *   fetch(`${BACKEND}/api/payment/status`, { credentials: "include" }).then(r => r.json()),
   *   fetch(`${BACKEND}/api/payment/invoices`, { credentials: "include" }).then(r => r.json()),
   * ]);
   */

  const subscription: ActiveSubscription = {
    planTier:      "PRO",
    billingMode:   "MONTHLY",
    status:        "active",
    amount:        19,
    currency:      "USD",
    nextBillingAt: new Date(Date.now() + 18 * 86_400_000).toISOString(),
    cancelAt:      null,
    trialEndsAt:   null,
    transactionId: "sub_1QxBv3CkJ2eZvKYwXhNlPdqR",
    startedAt:     new Date(Date.now() - 47 * 86_400_000).toISOString(),
  };

  const invoices: Invoice[] = [
    {
      id: "inv_001", date: new Date(Date.now() - 0  * 86_400_000).toISOString(),
      amount: 19, currency: "USD", status: "paid",
      description: "LaunchForge Pro — Monthly", pdfUrl: "#",
    },
    {
      id: "inv_002", date: new Date(Date.now() - 31 * 86_400_000).toISOString(),
      amount: 19, currency: "USD", status: "paid",
      description: "LaunchForge Pro — Monthly", pdfUrl: "#",
    },
    {
      id: "inv_003", date: new Date(Date.now() - 62 * 86_400_000).toISOString(),
      amount: 19, currency: "USD", status: "paid",
      description: "LaunchForge Pro — Monthly", pdfUrl: "#",
    },
  ];

  const usage: UsageItem[] = [
    { label: "Waitlists",        used: 4,     limit: null,   unit: "waitlists"   },
    { label: "Subscribers",      used: 2_847, limit: 10_000, unit: "subscribers" },
    { label: "Team members",     used: 2,     limit: 5,      unit: "members"     },
    { label: "Active prizes",    used: 6,     limit: 10,     unit: "prizes"      },
    { label: "Feedback boards",  used: 1,     limit: null,   unit: "boards"      },
    { label: "API calls (30d)",  used: 12_480,limit: null,   unit: "calls"       },
  ];

  return { subscription, invoices, usage };
}