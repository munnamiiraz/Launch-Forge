import { CookieOptions, Request, Response } from "express";

const setCookie = (res: Response, key: string, value: string, options: CookieOptions) => {
    res.cookie(key, value, options);
}

const getCookie = (req: Request, key: string) => {
    // cookie-parser populates req.cookies. Some routes may run before it,
    // so fall back to parsing the raw Cookie header.
    const anyReq = req as unknown as { cookies?: Record<string, string> };
    if (anyReq.cookies && typeof anyReq.cookies === "object") {
        return anyReq.cookies[key];
    }

    const header = req.headers?.cookie;
    if (!header) return undefined;

    const parts = header.split(";");
    for (const p of parts) {
        const [k, ...rest] = p.trim().split("=");
        if (k === key) return decodeURIComponent(rest.join("="));
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
