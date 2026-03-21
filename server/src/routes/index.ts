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

const router = Router();

router.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.originalUrl}`);
  next();
});

router.use("/auth", AuthRoutes);
router.use("/waitlists", waitlistRouter);
router.use("/subscribers", SubscriberRoutes);
router.use("/feedback", FeedbackRoutes);
router.use("/roadmap", RoadmapRoutes);
router.use("/workspaces/:workspaceId/waitlists/:id/leaderboard", LeaderboardRoutes);
router.use("/workspaces", workspaceRouter);
router.use("/payment", PaymentRoutes);
router.use("/invites", inviteRouter);
router.use("/public/waitlist", publicWaitlistRouter);
router.use("/prizes", prizeRouter);
router.use("/explore", exploreRouter);

export const IndexRoutes = router;
