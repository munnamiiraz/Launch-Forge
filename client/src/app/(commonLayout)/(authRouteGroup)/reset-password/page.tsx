import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "./_components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — LaunchForge",
  description: "Reset your LaunchForge account password.",
};

/**
 * Handles two URL shapes:
 *
 *   /reset-password             → "forgot password" entry (step 1)
 *   /reset-password?token=xxx   → "set new password" (step 2, arrived via email link)
 *
 * Better-Auth session check (uncomment once auth is wired up):
 *
 *   import { auth } from "@/lib/auth";
 *   import { headers } from "next/headers";
 *   import { redirect } from "next/navigation";
 *
 *   const session = await auth.api.getSession({ headers: await headers() });
 *   if (session) redirect("/dashboard");
 */
export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* ── Ambient background ─────────────────────────────────────── */}

      {/* Left-side glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 top-1/4 h-[440px] w-[440px] rounded-full bg-indigo-600/7 blur-[120px]"
      />

      {/* Right-side glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 bottom-1/4 h-[360px] w-[360px] rounded-full bg-violet-700/5 blur-[100px]"
      />

      {/* Grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]"
      />

      {/* Suspense required — ResetPasswordForm uses useSearchParams */}
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
