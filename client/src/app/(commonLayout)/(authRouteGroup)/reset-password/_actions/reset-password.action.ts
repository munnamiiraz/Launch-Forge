"use server";

import { z } from "zod";
import {
  ForgotPasswordActionResult,
  ResetPasswordActionResult,
} from "../_types";

/* ── Step 1 — request a reset link ───────────────────────────────── */
export async function forgotPasswordAction(
  formData: FormData
): Promise<ForgotPasswordActionResult> {
  const email = (formData.get("email") as string)?.trim();

  const parsed = z.string().email("Please enter a valid email address").safeParse(email);
  if (!parsed.success) {
    return { success: false, fieldError: parsed.error.errors[0].message };
  }

  try {
    /**
     * Better-Auth forgot password.
     *
     * import { auth } from "@/lib/auth";
     *
     * await auth.api.forgetPassword({
     *   body: {
     *     email: parsed.data,
     *     redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
     *   },
     * });
     *
     * Always return success to avoid email enumeration attacks.
     */

    await new Promise((r) => setTimeout(r, 700));
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/* ── Step 2 — set the new password (token from URL) ──────────────── */
const resetSchema = z
  .object({
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
  formData: FormData,
  token: string
): Promise<ResetPasswordActionResult> {
  const raw = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ResetPasswordActionResult["fieldErrors"] = {};
    parsed.error.errors.forEach((e) => {
      const field = e.path[0] as keyof typeof fieldErrors;
      if (field) fieldErrors[field] = e.message;
    });
    return { success: false, fieldErrors };
  }

  if (!token) {
    return { success: false, error: "Reset token is missing or invalid." };
  }

  try {
    /**
     * Better-Auth reset password.
     *
     * import { auth } from "@/lib/auth";
     *
     * const result = await auth.api.resetPassword({
     *   body: {
     *     token,
     *     newPassword: parsed.data.password,
     *   },
     * });
     *
     * if (result.error) {
     *   if (result.error.status === 400) {
     *     return { success: false, error: "This reset link has expired or already been used." };
     *   }
     *   return { success: false, error: result.error.message ?? "Reset failed." };
     * }
     */

    await new Promise((r) => setTimeout(r, 800));
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
