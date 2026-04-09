import { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Welcome Back — LaunchForge",
  description: "Sign in to your professional account and continue building your legacy.",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* ── Dynamic background architecture ───────────────────────────── */}

      {/* Primary accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-0 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen animate-pulse"
      />

      {/* Secondary depth glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[100px] mix-blend-screen"
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
        <LoginForm />
      </div>

      {/* ── Footer decoration ─────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-30">
        <div className="h-px w-32 bg-linear-to-r from-transparent via-zinc-500 to-transparent" />
      </div>
    </main>
  );
}
