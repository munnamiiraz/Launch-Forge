import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { VerifyEmailForm } from "./_components/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify your Forge account — LaunchForge",
  description: "Secure your account with the verification code sent to your inbox.",
};

export default function VerifyEmailPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* ── Dynamic background architecture ───────────────────────────── */}

      {/* Centred top glow — email icon energy */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[140px] mix-blend-screen animate-pulse"
      />

      {/* Bottom accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[400px] w-[500px] -translate-x-1/2 rounded-full bg-violet-700/5 blur-[120px] mix-blend-screen"
      />

      {/* Interactive grid mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20 mask-[radial-gradient(ellipse_at_center,black,transparent_80%)]"
        style={{
          backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
        }}
      />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="z-10 w-full flex flex-col items-center justify-center">
        <Suspense fallback={
          <div className="flex h-[400px] w-full max-w-md items-center justify-center rounded-2xl border border-zinc-800/50 bg-zinc-950/80 backdrop-blur-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500/50" />
          </div>
        }>
          <VerifyEmailForm />
        </Suspense>
      </div>

      {/* ── Footer decoration ─────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-30">
        <div className="h-px w-32 bg-linear-to-r from-transparent via-zinc-500 to-transparent" />
      </div>
    </main>
  );
}
