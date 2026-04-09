/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { fromNodeHeaders } from "better-auth/node";
import { Role, UserStatus } from "../constraint/index";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // ── Path 1: Better Auth session token ─────────────────────────
        const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
        let sessionResolved = false;

        if (sessionToken) {
            console.log("[AuthDebug] Better Auth token found:", sessionToken.slice(0, 10) + "...");
            
            try {
                const sessionExists = await auth.api.getSession({
                    headers: fromNodeHeaders(req.headers)
                });

                if (sessionExists && sessionExists.user) {
                    const user = sessionExists.user;
                    console.log("[AuthDebug] Session validated for user:", user.email);

                    // Reject suspended / inactive / deleted users
                    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.INACTIVE) {
                        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is not active.");
                    }
                    if (user.isDeleted) {
                        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is deleted.");
                    }

                    // Role gate
                    if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
                        throw new AppError(status.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
                    }

                    req.user = {
                        id:    user.id,
                        role:  user.role as Role,
                        email: user.email,
                    };

                    sessionResolved = true;
                    return next();
                }
            } catch (sessionError: any) {
                // If it's our own AppError (status/role block), re-throw immediately
                if (sessionError instanceof AppError) throw sessionError;
                // Otherwise, Better Auth session lookup failed — fall through to JWT
                console.warn("[AuthDebug] Better Auth session lookup failed, falling through to JWT:", sessionError.message);
            }

            if (!sessionResolved) {
                console.log("[AuthDebug] Better Auth session invalid/expired — trying JWT fallback.");
            }
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