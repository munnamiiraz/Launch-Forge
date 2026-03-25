/**
 * A wrapper around native fetch() that automatically attaches
 * auth cookies (accessToken, refreshToken, better-auth.session_token)
 * to every request via a custom `x-auth-cookies` header.
 *
 * Use this in "use client" components instead of raw fetch().
 *
 * Usage:
 *   import { authFetch } from "@/src/lib/axios/authFetch";
 *   const res = await authFetch(`${BASE_URL}/my-endpoint`);
 */
import { getAuthCookieHeader } from "./getAuthCookies";

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const cookieHeader = getAuthCookieHeader();

  const headers = new Headers(init?.headers);
  if (cookieHeader) {
    headers.set("x-auth-cookies", cookieHeader);
  }

  return fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
}
