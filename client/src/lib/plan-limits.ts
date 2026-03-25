/**
 * Central plan limits & feature gating config.
 * Single source of truth shared across frontend components.
 */

export type PlanTier = "FREE" | "PRO" | "GROWTH";

export type FeatureKey =
  | "waitlists"
  | "workspaces"
  | "referralTracking"
  | "publicLeaderboard"
  | "feedbackBoard"
  | "roadmap"
  | "prizeAnnouncements"
  | "analytics"
  | "apiAccess"
  | "prioritySupport";

export interface PlanLimits {
  waitlists: number | null;   // null = unlimited
  workspaces: number | null;
  subscribers: number | null;
  teamMembers: number | null;
  prizeBoards: number | null;
}

export interface PlanConfig {
  limits: PlanLimits;
  features: Record<FeatureKey, boolean>;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  FREE: {
    limits: {
      waitlists:   1,
      workspaces:  1,
      subscribers: 500,
      teamMembers: 1,
      prizeBoards: 0,
    },
    features: {
      waitlists:          true,
      workspaces:         true,
      referralTracking:   true,
      publicLeaderboard:  true,
      feedbackBoard:      false,
      roadmap:            false,
      prizeAnnouncements: false,
      analytics:          false,
      apiAccess:          false,
      prioritySupport:    false,
    },
  },
  PRO: {
    limits: {
      waitlists:   null,
      workspaces:  null,
      subscribers: 10_000,
      teamMembers: 5,
      prizeBoards: 10,
    },
    features: {
      waitlists:          true,
      workspaces:         true,
      referralTracking:   true,
      publicLeaderboard:  true,
      feedbackBoard:      true,
      roadmap:            true,
      prizeAnnouncements: true,
      analytics:          true,
      apiAccess:          false,
      prioritySupport:    false,
    },
  },
  GROWTH: {
    limits: {
      waitlists:   null,
      workspaces:  null,
      subscribers: null,
      teamMembers: null,
      prizeBoards: null,
    },
    features: {
      waitlists:          true,
      workspaces:         true,
      referralTracking:   true,
      publicLeaderboard:  true,
      feedbackBoard:      true,
      roadmap:            true,
      prizeAnnouncements: true,
      analytics:          true,
      apiAccess:          true,
      prioritySupport:    true,
    },
  },
};

/**
 * Check if a feature is available on a given plan.
 */
export function isFeatureAvailable(plan: PlanTier, feature: FeatureKey): boolean {
  return PLAN_CONFIGS[plan]?.features[feature] ?? false;
}

/**
 * Check if a limit has been reached.
 * Returns true if under limit (or unlimited), false if at/over limit.
 */
export function isWithinLimit(
  plan: PlanTier,
  resource: keyof PlanLimits,
  currentCount: number,
): boolean {
  const limit = PLAN_CONFIGS[plan]?.limits[resource];
  if (limit === null || limit === undefined) return true; // unlimited
  return currentCount < limit;
}

/**
 * Human-readable labels for features (used in upgrade prompts).
 */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  waitlists:          "Waitlists",
  workspaces:         "Workspaces",
  referralTracking:   "Referral Tracking",
  publicLeaderboard:  "Public Leaderboard",
  feedbackBoard:      "Feedback Board",
  roadmap:            "Roadmap",
  prizeAnnouncements: "Prize Announcements",
  analytics:          "Analytics",
  apiAccess:          "API Access",
  prioritySupport:    "Priority Support",
};
