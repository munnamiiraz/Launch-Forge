import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "../config/env";
import { CookieUtils } from "./cookie";
import { jwtUtils } from "./jwt";

const isHttpsUrl = (url: string | undefined) =>
    typeof url === "string" && url.startsWith("https://");

const getCookieAttributes = () => {
    // `SameSite=None` requires `Secure`, which breaks localhost over http.
    const cookieSecure =
        envVars.NODE_ENV === "production" ||
        isHttpsUrl(envVars.FRONTEND_URL) ||
        isHttpsUrl(envVars.BETTER_AUTH_URL);

    const sameSite = cookieSecure ? "none" : "lax";

    return {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: sameSite as "none" | "lax",
        path: "/",
    };
};

//Creating access token
const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload,
        envVars.ACCESS_TOKEN_SECRET,
        { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions
    );

    return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload,
        envVars.REFRESH_TOKEN_SECRET,
        { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions
    );
    return refreshToken;
}


const setAccessTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'accessToken', token, {
        ...getCookieAttributes(),
        //1 day
        maxAge: 60 * 60 * 24 * 1000,
    });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'refreshToken', token, {
        ...getCookieAttributes(),
        //7d
        maxAge: 60 * 60 * 24 * 1000 * 7,
    });
}

const setBetterAuthSessionCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, "better-auth.session_token", token, {
        ...getCookieAttributes(),
        //1 day
        maxAge: 60 * 60 * 24 * 1000,
    });
}

const clearAuthCookies = (res: Response) => {
    const attributes = getCookieAttributes();
    CookieUtils.clearCookie(res, "accessToken", attributes);
    CookieUtils.clearCookie(res, "refreshToken", attributes);
    CookieUtils.clearCookie(res, "better-auth.session_token", attributes);
};


export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie,
    clearAuthCookies,
}
