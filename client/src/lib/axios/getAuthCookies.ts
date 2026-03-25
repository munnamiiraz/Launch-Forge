/**
 * Extracts auth tokens from document.cookie (client-side only).
 * Returns a Cookie header string with accessToken, refreshToken,
 * and better-auth.session_token for cross-origin requests.
 */
export function getAuthCookieHeader(): string {
  if (typeof document === "undefined") return "";

  const cookies = document.cookie.split("; ").reduce<Record<string, string>>(
    (acc, pair) => {
      const idx = pair.indexOf("=");
      if (idx > 0) {
        acc[pair.slice(0, idx)] = pair.slice(idx + 1);
      }
      return acc;
    },
    {}
  );

  const tokenNames = ["accessToken", "refreshToken", "better-auth.session_token"];
  const parts = tokenNames
    .filter((name) => cookies[name])
    .map((name) => `${name}=${cookies[name]}`);

  return parts.join("; ");
}
