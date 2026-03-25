export type UserRole = "ADMIN" | "OWNER" | "USER";

export const authRoutes = [ "/login", "/register", "/forgot-password", "/reset-password", "/verify-email" ];

export const isAuthRoute = (pathname : string) => {
    return authRoutes.some((router : string) => router === pathname);
}

export type RouteConfig = {
    exact : string[],
    pattern : RegExp[]
}

export const commonProtectedRoutes : RouteConfig = {
    exact : ["/my-profile", "/change-password"],
    pattern : []
}

export const adminProtectedRoutes : RouteConfig = {
    pattern: [/^\/admin/ ], // Matches any path that starts with /admin
    exact : []
}

export const ownerProtectedRoutes : RouteConfig = {
    pattern: [/^\/dashboard/ ], // Matches any path that starts with /dashboard
    exact : [ "/payment/success", "/payment/cancel"]
};

export const isRouteMatches = (pathname : string, routes : RouteConfig) => {
    if(routes.exact.includes(pathname)) {
        return true;
    }
    return routes.pattern.some((pattern : RegExp) => pattern.test(pathname));
}

export const getRouteOwner = (pathname : string) : "ADMIN" | "OWNER" | "USER" | "COMMON" | null => {
    if(isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN";
    }
    
    if(isRouteMatches(pathname, ownerProtectedRoutes)) {
        return "OWNER";
    }

    if(isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON";
    }

    return null; // public route
}

export const getDefaultDashboardRoute = (role : UserRole) => {
    if(role === "ADMIN") {
        return "/admin/dashboard";
    }
    if(role === "OWNER" || role === "USER") {
        return "/dashboard";
    }

    return "/";
}

export const isValidRedirectForRole = (redirectPath : string, role : UserRole) => {
    const routeOwner = getRouteOwner(redirectPath);

    if(routeOwner === null || routeOwner === "COMMON"){
        return true;
    }

    if(routeOwner === role){
        return true;
    }

    // Owner and User share the dashboard in this project
    if(role === "OWNER" && routeOwner === "OWNER") return true;
    if(role === "USER" && routeOwner === "OWNER") return true;

    return false;
}