"use server";

import { z } from "zod";
import { ForgotPasswordActionResult, ResendLinkActionResult } from "../_types";

/* ── Send reset link ─────────────────────────────────────────────── */
export async function forgotPasswordAction(
  formData: FormData
): Promise<ForgotPasswordActionResult> {
  const email = (formData.get("email") as string)?.trim();

  const parsed = z
    .string()
    .email("Please enter a valid email address")
    .safeParse(email);

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
     * NOTE: Always return { success: true } regardless of whether the email
     * exists — this prevents email-enumeration attacks.
     */

    await new Promise((r) => setTimeout(r, 750));
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/* ── Resend reset link ───────────────────────────────────────────── */
export async function resendForgotLinkAction(
  email: string
): Promise<ResendLinkActionResult> {
  if (!email) return { success: false, error: "Email address is required." };

  try {
    /**
     * import { auth } from "@/lib/auth";
     *
     * await auth.api.forgetPassword({
     *   body: {
     *     email,
     *     redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
     *   },
     * });
     */

    await new Promise((r) => setTimeout(r, 600));
    return { success: true };
  } catch {
    return { success: false, error: "Could not resend. Please try again." };
  }
}
