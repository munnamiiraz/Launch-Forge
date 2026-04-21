import express from "express";
import { auditLogController } from "./audit-log.controller";
import { checkAuth }         from "../../middlewares/checkAuth";
import { Role }              from "../../constraint/index";

const router = express.Router();

const admin = checkAuth(Role.ADMIN);

router.get(
  "/",
  admin,
  auditLogController.getLogs
);

export const auditLogRoutes = router;
