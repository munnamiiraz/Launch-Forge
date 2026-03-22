import { Router } from "express";
import { inviteController }  from "./invite.controller";
import { validateRequest }   from "../../middlewares/validateRequest";
import { validateParams }    from "../../middlewares/validateParams";
import {
  inviteCodeParamSchema,
  createInviteSchema,
  joinViaInviteSchema,
} from "./invite.validation";

const router = Router();

router
  .route("/")
  .post(
    validateRequest(createInviteSchema),
    inviteController.createInvite,
  );

router
  .route("/:inviteCode")
  .get(
    validateParams(inviteCodeParamSchema),
    inviteController.getInvite,
  );

router
  .route("/:inviteCode/join")
  .post(
    validateParams(inviteCodeParamSchema),
    validateRequest(joinViaInviteSchema),
    inviteController.joinViaInvite,
  );

export const inviteRouter = router;
