"use server";

import { z } from "zod";
import { ForgotPasswordActionResult, ResetPasswordActionResult } from "../_types";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function forgotPasswordAction(
  formData: FormData
): Promise<ForgotPasswordActionResult> {
  const email = (formData.get("email") as string)?.trim();

  const parsed = z.string().email("Please enter a valid email address").safeParse(email);
  if (!parsed.success) {
    return { success: false, fieldError: parsed.error.issues[0].message };
  }

  try {
    const res = await fetch(`${BASE_API_URL}/auth/forget-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json?.message ?? "Something went wrong. Please try again." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

const resetSchema = z
  .object({
    email: z.string().email("Invalid email"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(
  formData: FormData
): Promise<ResetPasswordActionResult> {
  const raw = {
    email: formData.get("email") as string,
    otp: formData.get("otp") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ResetPasswordActionResult["fieldErrors"] = {};
    parsed.error.issues.forEach((e: any) => {
      const field = e.path[0] as keyof typeof fieldErrors;
      if (field) fieldErrors[field] = e.message;
    });
    return { success: false, fieldErrors };
  }

  try {
    const res = await fetch(`${BASE_API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsed.data.email,
        otp: parsed.data.otp,
        newPassword: parsed.data.password,
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      if (res.status === 400) {
        return { success: false, error: json?.message ?? "Invalid or expired OTP." };
      }
      return { success: false, error: json?.message ?? "Reset failed. Please try again." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
