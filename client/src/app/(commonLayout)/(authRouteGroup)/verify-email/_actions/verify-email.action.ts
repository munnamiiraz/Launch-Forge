"use server";

import { VerifyEmailActionResult, ResendOtpActionResult } from "../_types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ?? "http://localhost:5000";

export async function verifyEmailAction(
  otp: string,
  email: string
): Promise<VerifyEmailActionResult> {
  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { success: false, error: "Please enter a valid 6-digit code." };
  }

  try {
    const res = await fetch(`${BASE}/api/auth/email-otp/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      if (res.status === 400) {
        return { success: false, error: json?.message ?? "Invalid or expired code. Please try again." };
      }
      return { success: false, error: json?.message ?? "Verification failed." };
    }

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
    const res = await fetch(`${BASE}/api/auth/email-otp/send-verification-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "email-verification" }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      if (res.status === 429) {
        return { success: false, error: "Too many requests. Please wait before retrying.", cooldownSeconds: 60 };
      }
      return { success: false, error: json?.message ?? "Could not resend code." };
    }

    return { success: true, cooldownSeconds: 60 };
  } catch {
    return { success: false, error: "Could not resend code. Please try again." };
  }
}
