"use server";

import { cookies } from "next/headers";

const AUTH_COOKIE_NAMES = [
  "accessToken",
  "refreshToken",
  // better-auth token naming varies across implementations; clear both to be safe
  "better-auth.session_token",
  "better-auth.session-token",
] as const;

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  for (const name of AUTH_COOKIE_NAMES) {
    // Ensure deletion even for cookies set with strict options.
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

