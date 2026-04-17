import { Request, Response } from "express";
import status from "http-status";
import ms, { StringValue } from "ms";
import { fromNodeHeaders } from "better-auth/node";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponce";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";
import { CookieUtils } from "../../utils/cookie";

const registerUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        const result = await AuthService.registerUser(payload);
        const { accessToken, refreshToken, session, token, ...rest } = result as any;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        
        const betterSessionToken = session?.token || token;
        if (betterSessionToken) {
            tokenUtils.setBetterAuthSessionCookie(res, betterSessionToken);
        }

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Patient registered successfully",
            data: {
                sessionToken: betterSessionToken,
                accessToken,
                refreshToken,
                ...rest,
            }
        })
    }
)

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.loginUser(payload);
        const { accessToken, refreshToken, session, token, ...rest } = result as any;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        
        const betterSessionToken = session?.token || token;
        if (betterSessionToken) {
            tokenUtils.setBetterAuthSessionCookie(res, betterSessionToken);
        }

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                sessionToken: betterSessionToken,
                accessToken,
                refreshToken,
                ...rest,
            },
        })
    }
)

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        console.log({user});
        const result = await AuthService.getMe(user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User profile fetched successfully",
            data: result,
        })
    }
)

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = CookieUtils.getCookie(req, "refreshToken");
        const betterAuthSessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
        if (!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
        }
        const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken as string);

        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New tokens generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken,
            },
        });
    }
)

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const betterAuthSessionToken = CookieUtils.getCookie(req, "better-auth.session_token");

        const result = await AuthService.changePassword(payload, betterAuthSessionToken as string);

        const { accessToken, refreshToken, session, token } = result as any;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        
        const sessionToken = session?.token || token;
        if (sessionToken) {
            tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
        }

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully",
            data: {
                ...result,
                sessionToken,
            },
        });
    }
)

const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const headers = fromNodeHeaders(req.headers);
        const betterAuthToken = CookieUtils.getCookie(req, "better-auth.session_token") as string;
        const result = await AuthService.logoutUser(headers, req.user?.id, betterAuthToken);
        tokenUtils.clearAuthCookies(res);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: result,
        });
    }
)

const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        const result = await AuthService.verifyEmail(email, otp);

        const { accessToken, refreshToken, session } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        if (session?.token) {
            tokenUtils.setBetterAuthSessionCookie(res, session.token);
        }

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Email verified successfully",
            data: result,
        });
    }
)

const forgetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        await AuthService.forgetPassword(email);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset OTP sent to email successfully",
        });
    }
)

const resetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp, newPassword } = req.body;
        await AuthService.resetPassword(email, otp, newPassword);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset successfully",
        });
    }
)

// /api/v1/auth/login/google?redirect=/profile
const googleLogin = catchAsync((req: Request, res: Response) => {
    const redirectPath = req.query.redirect || "/dashboard";

    const encodedRedirectPath = encodeURIComponent(redirectPath as string);

    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

    res.render("googleRedirect", {
        callbackURL : callbackURL,
        betterAuthUrl : envVars.BETTER_AUTH_URL,
    })
})

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";

    const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");

    if(!sessionToken){
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    })

    if (!session) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
    }


    if(session && !session.user){
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
    }

    const result = await AuthService.googleLoginSuccess(session);

    const {accessToken, refreshToken} = result;

    // Cookies set on the backend domain can't be read by the frontend (different domains).
    // Pass tokens to the frontend via a dedicated callback route that sets them on the
    // Vercel domain, then redirects to the final destination.
    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    const callbackParams = new URLSearchParams({
        accessToken,
        refreshToken,
        redirect: finalRedirectPath,
    });

    res.redirect(`${envVars.FRONTEND_URL}/api/auth/google/callback?${callbackParams.toString()}`);
})

const handleOAuthError = catchAsync((req: Request, res: Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
})

export const AuthController = {
    registerUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError,
};
