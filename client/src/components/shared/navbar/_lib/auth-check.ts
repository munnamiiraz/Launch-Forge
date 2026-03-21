import { cookies } from "next/headers";
import type { NavUser } from "../_types";

/** Cookie names written by better-auth */
const AUTH_COOKIE_NAMES = [
  "accessToken",
  "better-auth.session_token",
  "better-auth.session-token",
  "refreshToken",
] as const;

/**
 * Deterministically picks an avatar gradient for a given email string
 * so the colour is stable across renders.
 */
function pickAvatarColor(email: string): string {
  const gradients = [
    "from-indigo-500 to-violet-600",
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-teal-500 to-cyan-600",
    "from-amber-500 to-orange-500",
    "from-pink-500 to-rose-600",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export interface AuthCheckResult {
  isAuthenticated: boolean;
  user: NavUser | null;
}

/**
 * Reads auth cookies server-side.
 * 
 * If any of the three better-auth tokens are present, the user is considered
 * authenticated. Then it fetches the user profile from the API.
 */
export async function getNavAuthState(): Promise<AuthCheckResult> {
  const cookieStore = await cookies();

  const hasAuthCookie = AUTH_COOKIE_NAMES.some(
    (name) => !!cookieStore.get(name)?.value
  );

  if (!hasAuthCookie) {
    return { isAuthenticated: false, user: null };
  }

  // Get the access token to make authenticated API call
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { isAuthenticated: false, user: null };
  }

  try {
    // Fetch user data from the API
    const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

    const response = await fetch(`${baseUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Cookie": allCookies,
      },
      cache: "no-store",
    });
    console.log(allCookies);

    if (!response.ok) {
      console.error("Failed to fetch user data:", response.status);
      return { isAuthenticated: false, user: null };
    }

    const data = await response.json();

    if (!data?.data) {
      return { isAuthenticated: false, user: null };
    }

    const userData = data.data;

    // Map the API response to NavUser
    const navUser: NavUser = {
      name: userData.name || "User",
      email: userData.email || "",
      avatarInitials: getInitials(userData.name || "User"),
      avatarColor: pickAvatarColor(userData.email || "user@example.com"),
      plan: "free", // Default plan, can be fetched from workspace if needed
    };

    return { isAuthenticated: true, user: navUser };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { isAuthenticated: false, user: null };
  }
}
