"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MailOpen,
  RefreshCw,
  Loader2,
  MailCheck,
  ArrowUpRight,
  CircleAlert,
  Clock,
  ShieldCheck,
  Pencil,
} from "lucide-react";

// shadcn
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

import { resendForgotLinkAction } from "../_actions/forgot-password.action";
import { cn } from "@/src/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* Email provider deep-links */
const EMAIL_PROVIDERS = [
  {
    name: "Gmail",
    url: "https://mail.google.com",
    bg: "bg-[#EA4335]/10 border-[#EA4335]/20 text-[#EA4335]/80 hover:bg-[#EA4335]/15 hover:text-[#EA4335]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </svg>
    ),
  },
  {
    name: "Outlook",
    url: "https://outlook.live.com",
    bg: "bg-[#0078D4]/10 border-[#0078D4]/20 text-[#0078D4]/80 hover:bg-[#0078D4]/15 hover:text-[#0078D4]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.11V2.62q0-.46.33-.8.33-.32.8-.32h12.84q.46 0 .8.33.32.33.32.8V12z" />
      </svg>
    ),
  },
  {
    name: "Yahoo",
    url: "https://mail.yahoo.com",
    bg: "bg-[#6001D2]/10 border-[#6001D2]/20 text-[#6001D2]/80 hover:bg-[#6001D2]/15 hover:text-[#6001D2]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M0 0l6.645 14.001L0 28h4.5l3.69-7.777L11.903 28H24l-6.657-14.001L24 0h-4.5l-3.69 7.777L11.597 0z" />
      </svg>
    ),
  },
];

interface SentViewProps {
  email: string;
  onChangeEmail: () => void;
}

export function SentView({ email, onChangeEmail }: SentViewProps) {
  const [resending, setResending] = useState(false);
  const [justResent, setJustResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(intervalRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    setResendError(null);
    const res = await resendForgotLinkAction(email);
    setResending(false);

    if (res.success) {
      setJustResent(true);
      setCooldown(60);
      intervalRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) { clearInterval(intervalRef.current!); return 0; }
          return c - 1;
        });
      }, 1000);
      setTimeout(() => setJustResent(false), 2800);
    } else {
      setResendError(res.error ?? "Could not resend.");
    }
  };

  const maskedEmail = email.replace(
    /(.{2})(.*)(@.*)/,
    (_, a, b, c) => a + "*".repeat(Math.max(2, b.length)) + c
  );

  const mm = String(Math.floor(cooldown / 60)).padStart(2, "0");
  const ss = String(cooldown % 60).padStart(2, "0");

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        key="sent"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 18 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-5"
      >
        {/* Icon row */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4"
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10">
            <MailOpen size={22} className="text-indigo-400" />
            <motion.div
              initial={{ scale: 1, opacity: 0.2 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-xl bg-indigo-500/30"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
              Check your inbox
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              We sent a reset link to
            </p>
          </div>
        </motion.div>

        {/* Destination email badge */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2"
        >
          <Badge
            variant="outline"
            className="gap-1.5 border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5 text-xs font-normal text-zinc-300"
          >
            <MailOpen size={11} className="text-indigo-400" />
            {maskedEmail}
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onChangeEmail}
                className="flex items-center gap-1 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
              >
                <Pencil size={11} />
                Change
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="border-zinc-800 bg-zinc-900 text-xs text-zinc-300"
            >
              Go back and use a different email
            </TooltipContent>
          </Tooltip>
        </motion.div>

        {/* Open mail provider shortcuts */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Open your inbox
          </p>
          <div className="grid grid-cols-3 gap-2">
            {EMAIL_PROVIDERS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5",
                  "text-xs font-medium transition-all duration-150",
                  p.bg
                )}
              >
                {p.icon}
                {p.name}
                <ArrowUpRight size={10} className="opacity-60" />
              </a>
            ))}
          </div>
        </motion.div>

        <Separator className="bg-zinc-800" />

        {/* Tips accordion — shadcn Accordion */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Accordion type="single" collapsible defaultValue="tips">
            <AccordionItem value="tips" className="border-zinc-800">
              <AccordionTrigger className="py-2.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:no-underline [&[data-state=open]]:text-zinc-300">
                Didn't get the email? Some tips
              </AccordionTrigger>
              <AccordionContent className="pb-3 pt-0">
                <Card className="border-zinc-800/60 bg-zinc-900/30">
                  <CardContent className="px-4 py-3">
                    <ul className="flex flex-col gap-2.5">
                      {[
                        {
                          icon: <CircleAlert size={12} className="text-amber-400/70" />,
                          text: "Check your spam or junk folder",
                        },
                        {
                          icon: <Clock size={12} className="text-zinc-500" />,
                          text: "The link expires in 30 minutes",
                        },
                        {
                          icon: <ShieldCheck size={12} className="text-zinc-500" />,
                          text: "Only the most recent link will work",
                        },
                        {
                          icon: <MailCheck size={12} className="text-zinc-500" />,
                          text: "Make sure you're checking the right inbox",
                        },
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs text-zinc-500"
                        >
                          <span className="mt-0.5 shrink-0">{item.icon}</span>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>

        {/* Resend */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-1.5"
        >
          <AnimatePresence>
            {resendError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-400"
              >
                {resendError}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className={cn(
              "h-auto gap-1.5 px-3 py-1.5 text-xs font-medium",
              "text-zinc-500 hover:bg-transparent hover:text-zinc-300",
              "disabled:pointer-events-none disabled:opacity-50 transition-all duration-200"
            )}
          >
            {resending ? (
              <><Loader2 size={12} className="animate-spin" />Sending…</>
            ) : justResent ? (
              <><MailCheck size={12} className="text-emerald-400" /><span className="text-emerald-400">Link sent again!</span></>
            ) : cooldown > 0 ? (
              <><RefreshCw size={12} />Resend in <span className="tabular-nums text-zinc-400">{mm}:{ss}</span></>
            ) : (
              <><RefreshCw size={12} />Resend reset link</>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
