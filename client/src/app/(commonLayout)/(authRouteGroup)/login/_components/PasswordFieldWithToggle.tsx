"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface PasswordFieldWithToggleProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function PasswordFieldWithToggle({
  hasError,
  className,
  ...props
}: PasswordFieldWithToggleProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? "text" : "password"}
        className={cn(
          "border-zinc-800 bg-zinc-900/60 pr-10 text-zinc-100 placeholder:text-zinc-600",
          "focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/50",
          "transition-all duration-200",
          hasError &&
            "border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/20",
          className
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-0 h-full w-9 rounded-l-none text-zinc-500 hover:bg-transparent hover:text-zinc-300"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </Button>
    </div>
  );
}
