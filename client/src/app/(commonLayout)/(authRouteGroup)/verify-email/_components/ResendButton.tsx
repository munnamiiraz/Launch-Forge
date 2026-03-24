"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { authClient } from "@/src/lib/auth-client";
import { cn } from "@/src/lib/utils";

interface ResendButtonProps {
  email: string;
  /** Initial cooldown in seconds (default 60) */
  initialCooldown?: number;
}

export function ResendButton({ email, initialCooldown = 60 }: ResendButtonProps) {
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [isPending, startTransition] = useTransition();
  const [justSent, setJustSent] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown tick
  useEffect(() => {
    if (cooldown <= 0) return;

    intervalRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [cooldown]);

  const handleResend = () => {
    startTransition(async () => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (!error) {
        setJustSent(true);
        setCooldown(60); // Default cooldown if not provided by API
        setTimeout(() => setJustSent(false), 2500);
      }
    });
  };

  const isDisabled = cooldown > 0 || isPending;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleResend}
        disabled={isDisabled}
        className={cn(
          "h-auto gap-1.5 px-3 py-1.5 text-xs font-medium",
          "text-muted-foreground/80 hover:bg-transparent hover:text-foreground/80",
          "disabled:pointer-events-none disabled:opacity-50",
          "transition-all duration-200"
        )}
      >
        {isPending ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            Sending…
          </>
        ) : justSent ? (
          <>
            <MailCheck size={12} className="text-emerald-400" />
            <span className="text-emerald-400">Code sent!</span>
          </>
        ) : cooldown > 0 ? (
          <>
            <RefreshCw size={12} />
            Resend in{" "}
            <span className="tabular-nums text-muted-foreground">
              {String(Math.floor(cooldown / 60)).padStart(2, "0")}:
              {String(cooldown % 60).padStart(2, "0")}
            </span>
          </>
        ) : (
          <>
            <RefreshCw size={12} />
            Resend code
          </>
        )}
      </Button>
    </div>
  );
}
