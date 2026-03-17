"use server";

import { z } from "zod";
import { setTokenInCookies } from "@/src/lib/tokenUtils";
import { LoginActionResult } from "../_types";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: LoginActionResult["fieldErrors"] = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path[0] as keyof typeof fieldErrors;
      if (field) fieldErrors[field] = err.message;
    });
    return { success: false, fieldErrors };
  }

  try {
    const res = await fetch(`${BASE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json?.message ?? "Invalid email or password." };
    }

    const { accessToken, refreshToken, sessionToken } = json.data;

    if (accessToken) await setTokenInCookies("accessToken", accessToken);
    if (refreshToken) await setTokenInCookies("refreshToken", refreshToken);
    if (sessionToken) await setTokenInCookies("better-auth.session_token", sessionToken, 24 * 60 * 60);

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
