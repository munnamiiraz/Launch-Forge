"use server";

import { z } from "zod";
import { ForgotPasswordActionResult, ResendOtpActionResult, ResetPasswordActionResult } from "../_types";

const BASE_API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

async function sendPasswordResetOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BASE_API}/auth/forget-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    return { success: false, error: json?.message ?? "Something went wrong. Please try again." };
  }

  return { success: true };
}

export async function requestPasswordResetAction(
  email: string
): Promise<ForgotPasswordActionResult> {
  const parsed = z.string().email("Please enter a valid email address").safeParse(email.trim());
  if (!parsed.success) {
    return { success: false, fieldError: parsed.error.issues[0].message };
  }

  try {
    const result = await sendPasswordResetOtp(parsed.data.toLowerCase());
    if (!result.success) return { success: false, error: result.error };
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function resendPasswordResetOtpAction(
  email: string
): Promise<ResendOtpActionResult> {
  try {
    const result = await sendPasswordResetOtp(email.toLowerCase());
    if (!result.success) return { success: false, error: result.error };
    return { success: true };
  } catch {
    return { success: false, error: "Could not resend OTP. Please try again." };
  }
}

export async function resetPasswordWithOtpAction(
  email: string,
  otp: string,
  password: string,
  confirmPassword: string
): Promise<ResetPasswordActionResult> {
  if (password.length < 8) {
    return { success: false, fieldErrors: { password: "Password must be at least 8 characters" } };
  }
  if (!/[A-Z]/.test(password)) {
    return { success: false, fieldErrors: { password: "Must contain at least one uppercase letter" } };
  }
  if (!/[0-9]/.test(password)) {
    return { success: false, fieldErrors: { password: "Must contain at least one number" } };
  }
  if (password !== confirmPassword) {
    return { success: false, fieldErrors: { confirmPassword: "Passwords do not match" } };
  }
  if (otp.length !== 6) {
    return { success: false, fieldErrors: { otp: "OTP must be 6 digits" } };
  }

  try {
    const res = await fetch(`${BASE_API}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase(), otp, newPassword: password }),
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
