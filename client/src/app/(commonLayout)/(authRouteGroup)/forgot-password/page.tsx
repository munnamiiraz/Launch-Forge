import { Metadata } from "next";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — LaunchForge",
  description: "Reset your LaunchForge account password via email.",
};

/**
 * /forgot-password  →  src/app/modules/auth/forgot-password/page.tsx
 *
 * Standalone forgot-password page. Links to /reset-password?token=xxx
 * once the user clicks the email link (handled by better-auth).
 *
 * Better-Auth session guard (uncomment once auth is wired up):
 *
 *   import { auth } from "@/lib/auth";
 *   import { headers } from "next/headers";
 *   import { redirect } from "next/navigation";
 *
 *   const session = await auth.api.getSession({ headers: await headers() });
 *   if (session) redirect("/dashboard");
 */
export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* ── Ambient background ─────────────────────────────────────── */}

      {/* Top-centre glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -top-24 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/7 blur-[140px]"
      />

      {/* Bottom-right warm accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 h-[320px] w-[320px] rounded-full bg-violet-600/5 blur-[100px]"
      />

      {/* Bottom-left cool accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 h-[280px] w-[280px] rounded-full bg-indigo-900/10 blur-[90px]"
      />

      {/* Grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]"
      />

      {/* ── Form ──────────────────────────────────────────────────── */}
      <ForgotPasswordForm />
    </main>
  );
}
