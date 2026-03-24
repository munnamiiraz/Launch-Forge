"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/src/components/ui/input-otp";
import { cn } from "@/src/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function OtpInput({ value, onChange, disabled, hasError }: OtpInputProps) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      disabled={disabled}
      containerClassName="group flex items-center justify-center gap-2"
    >
      <InputOTPGroup className="gap-2">
        {[0, 1, 2].map((i) => (
          <InputOTPSlot
            key={i}
            index={i}
            className={cn(
              // base
              "relative h-12 w-11 rounded-xl border text-base font-semibold",
              "bg-card/60 text-foreground transition-all duration-200",
              // idle
              "border-zinc-800",
              // focused slot — via group / data attrs
              "data-[active=true]:border-indigo-500 data-[active=true]:ring-2 data-[active=true]:ring-indigo-500/20",
              // filled
              "data-[filled=true]:border-zinc-600 data-[filled=true]:bg-zinc-900",
              // error
              hasError &&
                "border-red-500/50 data-[active=true]:border-red-500 data-[active=true]:ring-red-500/20"
            )}
          />
        ))}
      </InputOTPGroup>

      <InputOTPSeparator className="text-muted-foreground/40">
        <span className="mx-0.5 block h-px w-3 rounded-full bg-zinc-700" />
      </InputOTPSeparator>

      <InputOTPGroup className="gap-2">
        {[3, 4, 5].map((i) => (
          <InputOTPSlot
            key={i}
            index={i}
            className={cn(
              "relative h-12 w-11 rounded-xl border text-base font-semibold",
              "bg-card/60 text-foreground transition-all duration-200",
              "border-zinc-800",
              "data-[active=true]:border-indigo-500 data-[active=true]:ring-2 data-[active=true]:ring-indigo-500/20",
              "data-[filled=true]:border-zinc-600 data-[filled=true]:bg-zinc-900",
              hasError &&
                "border-red-500/50 data-[active=true]:border-red-500 data-[active=true]:ring-red-500/20"
            )}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
