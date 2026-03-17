"use server";

export async function resendResetLinkAction(email: string): Promise<void> {
  /**
   * Better-Auth resend reset link.
   *
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
}
