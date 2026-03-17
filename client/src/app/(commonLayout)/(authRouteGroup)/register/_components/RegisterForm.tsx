"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Zap, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";

import { registerAction } from "../_actions/register.action";
import { FormField } from "./FormField";
import { SocialAuth } from "./SocialAuth";
import { PasswordStrength } from "./PasswordStrength";
import { cn } from "@/src/lib/utils";

import { fadeUp } from "@/src/lib/motion";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGlobalError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setGlobalError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await registerAction(formData);

      if (!result.success) {
        const msg =
          result.error ??
          (result.fieldErrors ? Object.values(result.fieldErrors)[0] : null) ??
          "Failed to create account. Please try again.";
        setGlobalError(msg);
        toast.error(msg);
        return;
      }

      setSuccess(true);
      toast.success("Account created successfully!");

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 1500);
    });
  };

  const handleSocialAuth = async (provider: "github" | "google") => {
    try {
      const BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ?? "http://localhost:5000";
      window.location.href = `${BASE}/api/auth/sign-in/social?provider=${provider}&callbackURL=/dashboard`;
    } catch (err) {
      console.error(err);
      toast.error(`Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Decorative background glow behind the card */}
      <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent blur-2xl transition-opacity animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950/80",
          "p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl px-6 sm:px-10",
        )}
      >
        {/* Progress bar (top) */}
        <div className="absolute top-0 left-0 h-[2px] w-full bg-zinc-900">
          {isPending && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "linear" }}
              className="h-full bg-indigo-500" 
            />
          )}
        </div>

        {/* Logo mark */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10 flex items-center justify-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
            <Zap size={18} className="text-indigo-400 fill-indigo-400/20" />
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-100 uppercase">
            LaunchForge
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Create your account
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Join the elite builders crafting the next generation of viral waitlists.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 py-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
                <Mail size={28} className="text-emerald-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white tracking-tight">Check your email</p>
                <p className="text-sm text-zinc-400 leading-relaxed px-4">
                  We've sent a verification link to your email. Please verify your account to continue.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                Redirecting to verification page...
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="flex flex-col gap-6">
              {/* Social auth */}
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <SocialAuth
                  onGithub={() => handleSocialAuth("github")}
                  onGoogle={() => handleSocialAuth("google")}
                />
              </motion.div>

              {/* Divider */}
              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-4"
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">or use email</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
                  <FormField
                    name="name"
                    label="Full name"
                    placeholder="Ada Lovelace"
                    autoComplete="name"
                    required
                    disabled={isPending}
                  />
                </motion.div>

                <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
                  <FormField
                    name="email"
                    type="email"
                    label="Email address"
                    placeholder="ada@example.com"
                    autoComplete="email"
                    required
                    disabled={isPending}
                  />
                </motion.div>

                <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
                  <FormField
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={isPending}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <PasswordStrength password={password} />
                </motion.div>

                <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
                  <FormField
                    name="confirmPassword"
                    type="password"
                    label="Confirm password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={isPending}
                  />
                </motion.div>

                {/* Global error */}
                <AnimatePresence>
                  {globalError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3"
                    >
                      <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
                      <p className="text-xs font-medium text-red-400/90 leading-tight">{globalError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-xl h-11",
                      "bg-indigo-600 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/20",
                      "transition-all duration-300 hover:bg-indigo-500 hover:shadow-indigo-500/30 hover:-translate-y-0.5",
                      "active:translate-y-0 active:scale-[0.98]",
                      "disabled:pointer-events-none disabled:opacity-60",
                      "flex items-center justify-center gap-2"
                    )}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Initializing account...
                      </>
                    ) : (
                      <>
                        Create professional account
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </motion.div>

                <motion.div
                  custom={9}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center justify-center gap-4 text-[11px] text-zinc-600"
                >
                  <div className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-zinc-500" />
                    Secure encryption
                  </div>
                  <div className="h-1 w-1 rounded-full bg-zinc-800" />
                  <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sign-in link */}
      {!success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-6 text-center text-sm text-zinc-500"
        >
          Already part of the forge?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300 underline-offset-4 hover:underline"
          >
            Sign in here
          </Link>
        </motion.p>
      )}
    </div>
  );
}
