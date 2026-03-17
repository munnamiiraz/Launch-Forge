"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, icon, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="group flex flex-col gap-1.5">
        <label
          htmlFor={props.id ?? props.name}
          className="text-xs font-medium tracking-wide text-zinc-400 uppercase"
        >
          {label}
        </label>

        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={props.id ?? props.name}
            type={resolvedType}
            className={cn(
              "w-full rounded-lg border bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-100",
              "placeholder:text-zinc-600",
              "transition-all duration-200 outline-none",
              "border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50",
              error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/20",
              icon && "pl-9",
              isPassword && "pr-10",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1 text-xs text-red-400">
            <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
