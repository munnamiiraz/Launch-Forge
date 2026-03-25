import { Router } from "express";
import { Role } from "../../constraint/index";
import { checkAuth } from "../../middlewares/checkAuth";
import { AuthController } from "./auth.controller";

const router = Router()

router.post("/register", AuthController.registerUser)
router.post("/login", AuthController.loginUser)
router.get("/me", checkAuth(Role.ADMIN, Role.OWNER), AuthController.getMe)
router.post("/refresh-token", AuthController.getNewToken)
router.post("/change-password", checkAuth(Role.ADMIN, Role.OWNER), AuthController.changePassword)
router.post("/logout", checkAuth(Role.ADMIN, Role.OWNER), AuthController.logoutUser)
router.post("/verify-email", AuthController.verifyEmail)
router.post("/forget-password", AuthController.forgetPassword)
router.post("/reset-password", AuthController.resetPassword)

router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRoutes = router;