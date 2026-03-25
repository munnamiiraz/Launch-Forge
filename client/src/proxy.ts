import { NextRequest, NextResponse } from "next/server";
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from "./lib/authUtils";
import { jwtUtils } from "./lib/jwtUtils";
// import { isTokenExpiringSoon } from "./lib/tokenUtils"; // Removed for edge compatibility if not ready
import { getNewTokensWithRefreshToken, getUserInfo } from "./services/auth/auth.services";

async function refreshTokenMiddleware (refreshToken : string) : Promise<boolean> {
    try {
        const refresh = await getNewTokensWithRefreshToken(refreshToken);
        return !!refresh;
    } catch (error) {
        console.error("Error refreshing token in middleware:", error);
        return false;   
    }
}


export async function proxy (request : NextRequest) {
   try {
       const { pathname } = request.nextUrl; 
       const pathWithQuery = `${pathname}${request.nextUrl.search}`;
       
       const accessToken = request.cookies.get("accessToken")?.value;
       const refreshToken = request.cookies.get("refreshToken")?.value;
       const betterSessionToken = request.cookies.get("better-auth.session_token")?.value;

       // Use jwtUtils only for DECODING in middleware as 'jsonwebtoken' verify might fail on Edge
       // unless jose is used. For now, we rely on getUserInfo() which is an API call.
       const decodedAccessToken = accessToken ? jwtUtils.decodedToken(accessToken) : null;
       const isValidAccessToken = !!accessToken; // Basic check, real validation in getUserInfo

       let userRole: UserRole | null = null;
       if(decodedAccessToken){
            userRole = (decodedAccessToken.role || decodedAccessToken.UserRole) as UserRole;
       }

       const routeOwner = getRouteOwner(pathname);
       const isAuth = isAuthRoute(pathname);

       // ── Rule 1: Logged-in users should not access auth pages ────────────────
       if(isAuth && (accessToken || betterSessionToken) && pathname !== "/reset-password"){
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole || "OWNER"), request.url));
       }

       // ── Rule 2: User trying to access reset password ────────────────────────
       if(pathname === "/reset-password"){
            const email = request.nextUrl.searchParams.get("email");
            if(email) return NextResponse.next();
            
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathWithQuery);
            return NextResponse.redirect(loginUrl);
       }

       // ── Rule 3: Public route -> Allow ───────────────────────────────────────
       if(routeOwner === null){
            return NextResponse.next();
       }

       // ── Rule 4: Not logged in trying to access protected route ───────────────
       if(!accessToken && !betterSessionToken){
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathWithQuery);
            return NextResponse.redirect(loginUrl);
       }

       // ── Rule 5: ENFORCE Session State (Profile Check) ────────────────────────
       // We fetch user info to check emailVerified and role
       const userInfo = await getUserInfo();

       if(userInfo){
            // Better Auth roles might be different, normalize
            const actualRole = (userInfo.role || userRole) as UserRole;

            // Scenario: common protected routes (/my-profile, etc)
            if(routeOwner === "COMMON"){
                return NextResponse.next();
            }

            // Scenario: role based mismatch
            if(routeOwner !== actualRole){
                 // Special case: OWNER and USER share the same dashboard space
                 if(actualRole === "OWNER" && routeOwner === "OWNER") return NextResponse.next();
                 if(actualRole === "USER" && routeOwner === "OWNER") return NextResponse.next();

                 return NextResponse.redirect(new URL(getDefaultDashboardRoute(actualRole), request.url));
            }
       } else {
            // Token exists but server says it's invalid
            const loginUrl = new URL("/", request.url);
            return NextResponse.redirect(loginUrl);
       }

       return NextResponse.next();

   } catch (error) {
         console.error("Error in middleware:", error);
         return NextResponse.next();
   }
}

export const config = {
    matcher : [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ]
}
