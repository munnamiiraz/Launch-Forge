import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { newsletterController } from "./newsletter.controller";
import { subscribeNewsletterSchema } from "./newsletter.validation";

const router = Router();

router
  .route("/subscribe")
  .post(
    validateRequest(subscribeNewsletterSchema),
    newsletterController.subscribe,
  );

export const newsletterRouter = router;

