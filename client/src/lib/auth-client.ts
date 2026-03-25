import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ?? "http://localhost:5000",
  plugins: [
    emailOTPClient()
  ]
});

export const { signIn, signUp, useSession } = authClient;
