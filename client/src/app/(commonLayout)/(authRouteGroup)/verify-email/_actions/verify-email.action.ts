"use server";

import { VerifyEmailActionResult, ResendOtpActionResult } from "../_types";

export async function verifyEmailAction(
  otp: string,
  email: string
): Promise<VerifyEmailActionResult> {
  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { success: false, error: "Please enter a valid 6-digit code." };
  }

  try {
    /**
     * Better-Auth OTP verification.
     *
     * import { auth } from "@/lib/auth";
     *
     * const result = await auth.api.verifyEmailOtp({
     *   body: { email, otp },
     * });
     *
     * if (result.error) {
     *   if (result.error.status === 400) {
     *     return { success: false, error: "Invalid or expired code. Please try again." };
     *   }
     *   return { success: false, error: result.error.message ?? "Verification failed." };
     * }
     */

    // ↑ Uncomment once better-auth is wired up.
    await new Promise((r) => setTimeout(r, 800));

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function resendOtpAction(
  email: string
): Promise<ResendOtpActionResult> {
  if (!email) {
    return { success: false, error: "Email address is required." };
  }

  try {
    /**
     * Better-Auth resend OTP.
     *
     * import { auth } from "@/lib/auth";
     *
     * const result = await auth.api.sendVerificationEmail({
     *   body: { email },
     * });
     *
     * if (result.error) {
     *   if (result.error.status === 429) {
     *     return { success: false, error: "Too many requests.", cooldownSeconds: 60 };
     *   }
     *   return { success: false, error: result.error.message ?? "Could not resend code." };
     * }
     */

    // ↑ Uncomment once better-auth is wired up.
    await new Promise((r) => setTimeout(r, 600));

    return { success: true, cooldownSeconds: 60 };
  } catch {
    return { success: false, error: "Could not resend code. Please try again." };
  }
}
