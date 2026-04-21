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
        // Log all cookie keys for debugging (without values for safety)
        const cookieKeys = Object.keys(req.cookies || {});
        console.log("[AuthDebug] Incoming Cookie Keys:", cookieKeys);

        // ── Path 1: Better Auth session token ─────────────────────────
        // We check for both underscore and hyphen versions for maximum compatibility
        const betterAuthToken = 
            CookieUtils.getCookie(req, "better-auth.session_token") || 
            CookieUtils.getCookie(req, "better-auth.session-token") ||
            CookieUtils.getCookie(req, "__Secure-better-auth.session-token");

        let sessionResolved = false;

        if (betterAuthToken) {
            console.log("[AuthDebug] Found session token. Length:", betterAuthToken.length);
            
            try {
                // We pass the full headers so Better Auth can resolve cookies/bearer tokens
                const headers = fromNodeHeaders(req.headers);
                const sessionExists = await auth.api.getSession({
                    headers
                });

                if (sessionExists && sessionExists.session) {
                    const user = sessionExists.user as any;
                    console.log("[AuthDebug] Better Auth session validated for user:", user.email);

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