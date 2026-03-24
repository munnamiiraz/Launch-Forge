import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { multerUpload } from "../../config/multer.config";

/**
 * User Profile Routes
 * 
 * Mount in app.ts:
 * 
 *   import { userRouter } from "./modules/user/user.route";
 *   app.use("/api/user", userRouter);
 * 
 * Resulting routes:
 * 
 *   GET    /api/user/profile    → get current user's profile
 *   PATCH  /api/user/profile    → update current user's profile
 *   POST   /api/user/avatar    → upload avatar image
 */

const router = Router();

/* ── Profile Routes ──────────────────────────────────────────────── */
router
  .route("/profile")
  .get(checkAuth(), userController.getProfile)
  .patch(checkAuth(), userController.updateProfile);

/* ── Avatar Upload ───────────────────────────────────────────────── */
router
  .route("/avatar")
  .post(
    checkAuth(),
    multerUpload.single("image"),
    userController.uploadAvatar
  );

export const userRouter = router;
