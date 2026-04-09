import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the cross-domain Google OAuth token handoff.
 *
 * After the backend completes OAuth, it can't set cookies on the frontend
 * domain directly. Instead it redirects here with tokens in query params.
 * This handler sets the cookies on the Vercel domain and redirects the user
 * to their final destination.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const redirectParam = searchParams.get("redirect") || "/dashboard";

    if (!accessToken || !refreshToken) {
        return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
    }

    // Validate redirect to prevent open-redirect attacks
    const isValidRedirect = redirectParam.startsWith("/") && !redirectParam.startsWith("//");
    const finalRedirect = isValidRedirect ? redirectParam : "/dashboard";

    const response = NextResponse.redirect(new URL(finalRedirect, origin));

    const cookieBase = {
        httpOnly: false,
        secure: true,
        sameSite: "lax" as const,
        path: "/",
    };

    response.cookies.set("accessToken", accessToken, {
        ...cookieBase,
        maxAge: 60 * 60 * 24, // 1 day
    });

    response.cookies.set("refreshToken", refreshToken, {
        ...cookieBase,
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
}
