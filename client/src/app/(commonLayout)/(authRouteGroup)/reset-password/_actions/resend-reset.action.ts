"use server";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function resendResetLinkAction(email: string): Promise<void> {
  await fetch(`${BASE_API_URL}/auth/forget-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}
