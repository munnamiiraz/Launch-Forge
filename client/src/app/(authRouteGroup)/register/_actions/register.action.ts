"use server";

import { z } from "zod";
import { setTokenInCookies } from "@/src/lib/tokenUtils";
import { RegisterActionResult } from "../_types";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function registerAction(
  formData: FormData
): Promise<RegisterActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: RegisterActionResult["fieldErrors"] = {};
    parsed.error.issues.forEach((err) => {
      const field = err.path[0] as keyof typeof fieldErrors;
      if (field) fieldErrors[field] = err.message;
    });
    return { success: false, fieldErrors };
  }

  try {
    const res = await fetch(`${BASE_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 422 || json?.message?.toLowerCase().includes("already")) {
        return { success: false, error: "An account with this email already exists." };
      }
      return { success: false, error: json?.message ?? "Registration failed. Please try again." };
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
