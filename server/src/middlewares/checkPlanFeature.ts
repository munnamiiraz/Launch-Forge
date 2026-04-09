/**
 * ── Plan-based Feature Guard ──────────────────────────────────────
 *
 * Central source of truth for plan limits and feature availability.
 * Used by both middleware and service-level checks.
 *
 * Free:   1 waitlist, 1 workspace, public leaderboard, referral tracking
 * Pro:    Unlimited waitlists/workspaces, analytics, prizes, feedback, roadmap
 * Growth: Everything in Pro + API access, priority support, custom domain
 * ───────────────────────────────────────────────────────────────── */

import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { prisma } from "../lib/prisma";
import AppError from "../errorHelpers/AppError";

/* ── Feature keys ────────────────────────────────────────────────── */

export type FeatureKey =
  | "analytics"
  | "prizeAnnouncements"
  | "feedbackBoard"
  | "roadmap"
  | "apiAccess"
  | "prioritySupport"
  | "aiInsights";

export type PlanTier = "FREE" | "STARTER" | "PRO" | "GROWTH";

/* ── Feature access matrix ───────────────────────────────────────── */

const PLAN_FEATURES: Record<PlanTier, Set<FeatureKey>> = {
  FREE: new Set([
    // Only: referral tracking, public leaderboard (no feature key needed — always open)
  ]),
  STARTER: new Set([
    // Same as FREE for now
  ]),
  PRO: new Set([
    "analytics",
    "prizeAnnouncements",
    "feedbackBoard",
    "roadmap",
    "aiInsights",
  ]),
  GROWTH: new Set([
    "analytics",
    "prizeAnnouncements",
    "feedbackBoard",
    "roadmap",
    "apiAccess",
    "prioritySupport",
    "aiInsights",
  ]),
};

/* ── Numeric resource limits ─────────────────────────────────────── */

export const PLAN_RESOURCE_LIMITS = {
  waitlists: { FREE: 1, STARTER: 1, PRO: Infinity, GROWTH: Infinity },
  workspaces: { FREE: 1, STARTER: 1, PRO: Infinity, GROWTH: Infinity },
  subscribers: { FREE: 500, STARTER: 500, PRO: 10_000, GROWTH: Infinity },
  teamMembers: { FREE: 1, STARTER: 1, PRO: 5, GROWTH: Infinity },
  prizeBoards: { FREE: 0, STARTER: 0, PRO: 10, GROWTH: Infinity },
} as const;

/* ── Pure utility functions ──────────────────────────────────────── */

export function isFeatureAllowed(plan: PlanTier, feature: FeatureKey): boolean {
  return PLAN_FEATURES[plan]?.has(feature) ?? false;
}

export function getResourceLimit(
  plan: PlanTier,
  resource: keyof typeof PLAN_RESOURCE_LIMITS,
): number {
  return PLAN_RESOURCE_LIMITS[resource][plan] ?? 1;
}

/* ── Shared helper: resolve workspace plan from workspaceId ──────── */

export async function getWorkspacePlan(workspaceId: string): Promise<PlanTier> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId, deletedAt: null },
    select: { plan: true },
  });
  return (workspace?.plan as PlanTier) ?? "FREE";
}

/* ── Express Middleware ───────────────────────────────────────────── */

/**
 * Middleware that checks if the workspace's plan allows a specific feature.
 *
 * Expects `req.params.workspaceId` or `req.body.workspaceId` to be present.
 * Must be placed AFTER `checkAuth` middleware.
 *
 * Usage in route:
 *   router.get("/analytics/summary", auth, checkPlanFeature("analytics"), controller.getSummary);
 */
export function checkPlanFeature(feature: FeatureKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const workspaceId =
        req.params.workspaceId || req.body?.workspaceId || req.query?.workspaceId;

      if (!workspaceId || workspaceId === "undefined") {
        throw new AppError(
          status.BAD_REQUEST,
          "Workspace ID is required to check feature access.",
        );
      }

      const plan = await getWorkspacePlan(workspaceId as string);

      if (!isFeatureAllowed(plan, feature)) {
        throw new AppError(
          status.PAYMENT_REQUIRED,
          `The "${feature}" feature requires a ${feature === "apiAccess" || feature === "prioritySupport" ? "Growth" : "Pro"} plan or higher. Please upgrade to access this feature.`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Service-level plan check (for use inside service functions).
 * Throws 402 Payment Required if the feature is not available.
 */
export async function assertPlanFeature(
  workspaceId: string,
  feature: FeatureKey,
): Promise<void> {
  const plan = await getWorkspacePlan(workspaceId);

  if (!isFeatureAllowed(plan, feature)) {
    throw new AppError(
      status.PAYMENT_REQUIRED,
      `The "${feature}" feature requires a ${feature === "apiAccess" || feature === "prioritySupport" ? "Growth" : "Pro"} plan or higher. Please upgrade to access this feature.`,
    );
  }
}
