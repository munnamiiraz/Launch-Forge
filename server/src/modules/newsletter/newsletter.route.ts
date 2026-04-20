import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { newsletterController } from "./newsletter.controller";
import { Role } from "../../constraint/index";
import { checkAuth } from "../../middlewares/checkAuth";
import { broadcastNewsletterSchema, subscribeNewsletterSchema } from "./newsletter.validation";

const router = Router();

router
  .route("/subscribe")
  .post(
    validateRequest(subscribeNewsletterSchema),
    newsletterController.subscribe,
  );

router
  .route("/broadcast")
  .post(
    checkAuth(Role.ADMIN),
    validateRequest(broadcastNewsletterSchema),
    newsletterController.broadcast,
  );

export const newsletterRouter = router;

