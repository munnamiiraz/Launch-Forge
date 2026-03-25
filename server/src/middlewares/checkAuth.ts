/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role, UserStatus } from "../constraint/index";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // ── Path 1: Better Auth session token ─────────────────────────
        const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");

        if (sessionToken) {
            console.log("[AuthDebug] Better Auth token found:", sessionToken.slice(0, 10) + "...");
            const sessionExists = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: { gt: new Date() },
                },
                include: { user: true },
            });

            if (sessionExists && sessionExists.user) {
                const user = sessionExists.user;
                console.log("[AuthDebug] Session validated for user:", user.email);

                // War if session is expiring soon
                const now        = new Date();
                const expiresAt  = new Date(sessionExists.expiresAt);
                const createdAt  = new Date(sessionExists.createdAt);
                const lifetime   = expiresAt.getTime() - createdAt.getTime();
                const remaining  = expiresAt.getTime() - now.getTime();
                const pctLeft    = (remaining / lifetime) * 100;

                if (pctLeft < 20) {
                    res.setHeader("X-Session-Refresh",    "true");
                    res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
                    res.setHeader("X-Time-Remaining",     remaining.toString());
                }

                // Reject suspended / inactive / deleted users
                if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.INACTIVE) {
                    console.log("[AuthDebug] User status blocked:", user.status);
                    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is not active.");
                }
                if (user.isDeleted) {
                    console.log("[AuthDebug] User is deleted");
                    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is deleted.");
                }

                // Role gate
                if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
                    console.log("[AuthDebug] Role mismatch. User:", user.role, "Required:", authRoles);
                    throw new AppError(status.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
                }

                req.user = {
                    id:    user.id,
                    role:  user.role as Role,
                    email: user.email,
                };

                return next();
            }

            // Session token present but invalid / expired
            console.log("[AuthDebug] Session token present but not found in DB or expired.");
            throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Session is invalid or expired.");
        }

        // ── Path 2: fallback to JWT access token ──────────────────────
        const accessToken = CookieUtils.getCookie(req, "accessToken");

        if (!accessToken) {
            console.log("[AuthDebug] No auth tokens found in cookies or headers.");
            throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No session or access token provided.");
        }

        console.log("[AuthDebug] JWT access token found.");
        const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

        if (!verifiedToken.success) {
            console.log("[AuthDebug] JWT verification failed:", verifiedToken.message);
            throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
        }

        if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data!.role as Role)) {
            console.log("[AuthDebug] Role mismatch (JWT). User:", verifiedToken.data!.role, "Required:", authRoles);
            throw new AppError(status.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
        }

        req.user = {
            id:    verifiedToken.data!.userId || verifiedToken.data!.id,
            role:  verifiedToken.data!.role as Role,
            email: verifiedToken.data!.email,
        } as any;

        console.log("[AuthDebug] JWT validated for user:", req.user.email);
        next();
    } catch (error: any) {
        console.error("[AuthDebug] Final Catch Error:", error.message);
        next(error);
    }
};