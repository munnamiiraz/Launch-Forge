import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { waitlistRouter } from "../modules/waitlist/waitlist.route";
import { subscriberRouter as SubscriberRoutes } from "../modules/subscriber/subscriber.routes";
import { feedbackRouter as FeedbackRoutes } from "../modules/feedback/feedback.routes";
import { roadmapRouter as RoadmapRoutes } from "../modules/roadmap/roadmap.route";
import { leaderboardRouter as LeaderboardRoutes } from "../modules/leaderboard/leaderboard.route";
import { paymentRouter as PaymentRoutes } from "../modules/payment/payment.route";
import { workspaceRouter } from "../modules/workspace/workspace.route";
import { inviteRouter } from "../modules/invite/invite.route";
import { publicWaitlistRouter } from "../modules/public-waitlist/public-waitlist.route";
import { prizeRouter } from "../modules/pricemoney/pricemoney.route";
import { exploreRouter } from "../modules/explore/explore.route";
import { newsletterRouter } from "../modules/newsletter/newsletter.route";
import { analyticsRouter } from "../modules/owner-analytics/owner-analytics.route";
import { adminOverviewRouter } from "../modules/admin-overview/admin-overview.routes";
import { adminUsersRouter } from "../modules/admin-user/admin-user.routes";
import { adminRevenueRouter } from "../modules/admin-review/admin-review.routes";

const router = Router();

router.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.originalUrl}`);
  next();
});

if (process.env.NODE_ENV !== "production") {
  router.get("/__debug/routes", (req, res) => {
    const stack = (router as unknown as { stack?: any[] }).stack ?? [];

    const routes = stack
      .map((layer) => {
        if (layer?.route?.path) {
          const methods = Object.keys(layer.route.methods ?? {})
            .map((m) => m.toUpperCase())
            .sort();
          return { type: "route", path: layer.route.path, methods };
        }

        if (layer?.name === "router" && layer?.regexp) {
          return { type: "mount", path: String(layer.regexp) };
        }

        if (layer?.regexp) return { type: "layer", path: String(layer.regexp) };
        return null;
      })
      .filter(Boolean);

    res.status(200).json({ success: true, data: routes });
  });
}

router.use("/auth", AuthRoutes);
router.use("/waitlists", waitlistRouter);
router.use("/subscribers", SubscriberRoutes);
router.use("/feedback", FeedbackRoutes);
router.use("/roadmap", RoadmapRoutes);
router.use("/workspaces/:workspaceId/waitlists/:id/leaderboard", LeaderboardRoutes);
router.use("/workspaces/:workspaceId/analytics", analyticsRouter);
router.use("/workspaces", workspaceRouter);
router.use("/payment", PaymentRoutes);
router.use("/invites", inviteRouter);
router.use("/public/waitlist", publicWaitlistRouter);
router.use("/prizes", prizeRouter);
router.use("/explore", exploreRouter);
router.use("/leaderboard", LeaderboardRoutes);
router.use("/newsletter", newsletterRouter);
router.use("/admin/overview", adminOverviewRouter);
router.use("/admin/users", adminUsersRouter);
router.use("/admin/revenue", adminRevenueRouter);

export const IndexRoutes = router;
