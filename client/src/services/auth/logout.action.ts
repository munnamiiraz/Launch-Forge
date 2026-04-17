"use server";

import { cookies } from "next/headers";

const AUTH_COOKIE_NAMES = [
  "accessToken",
  "refreshToken",
  // better-auth token naming varies across implementations; clear both to be safe
  "better-auth.session_token",
  "better-auth.session-token",
] as const;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Build cookie header so the backend can identify the session to revoke
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  // ── Call the backend logout endpoint to clean up Redis / DB session ──
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
  } catch (err) {
    // Non-fatal: even if the backend call fails we still clear cookies locally
    console.error("[logoutAction] Backend logout failed:", err);
  }

  // ── Clear cookies on the Next.js side ──
  for (const name of AUTH_COOKIE_NAMES) {
    cookieStore.set(name, "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    cookieStore.delete(name);
  }
}
