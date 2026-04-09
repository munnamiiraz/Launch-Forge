import { CookieOptions, Request, Response } from "express";

const setCookie = (res: Response, key: string, value: string, options: CookieOptions) => {
    res.cookie(key, value, options);
}

const getCookie = (req: Request, key: string) => {
    // In production, better-auth prefixes cookie names with __Secure- when
    // useSecureCookies is enabled. Check both the prefixed and plain names.
    const securePrefixedKey = `__Secure-${key}`;
    const keysToTry = [securePrefixedKey, key];

    // cookie-parser populates req.cookies. Some routes may run before it,
    // so fall back to parsing the raw Cookie header.
    const anyReq = req as unknown as { cookies?: Record<string, string> };
    if (anyReq.cookies && typeof anyReq.cookies === "object") {
        for (const k of keysToTry) {
            if (anyReq.cookies[k]) return anyReq.cookies[k];
        }
    }

    // For cross-origin requests where browser doesn't send cookies,
    // the frontend sends tokens via a custom x-auth-cookies header.
    const header = req.headers?.cookie || req.headers?.["x-auth-cookies"] as string | undefined;
    if (!header) return undefined;

    const parts = header.split(";");
    for (const tryKey of keysToTry) {
        for (const p of parts) {
            const [k, ...rest] = p.trim().split("=");
            if (k === tryKey) return decodeURIComponent(rest.join("="));
        }
    }

    return undefined;
}

const clearCookie = (res: Response, key: string, options: CookieOptions) => {
    res.clearCookie(key, options);
}

export const CookieUtils = {
    setCookie,
    getCookie,
    clearCookie,
}
