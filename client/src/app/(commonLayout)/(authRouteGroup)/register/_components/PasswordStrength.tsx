"use client";

import { useMemo } from "react";
import { cn } from "@/src/lib/utils";

interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

function getStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: "", color: "bg-zinc-800" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  const map: Record<1 | 2 | 3 | 4, Omit<StrengthResult, "score">> = {
    1: { label: "Weak", color: "bg-red-500" },
    2: { label: "Fair", color: "bg-orange-400" },
    3: { label: "Good", color: "bg-yellow-400" },
    4: { label: "Strong", color: "bg-emerald-500" },
  };

  return {
    score: clamped,
    ...(clamped > 0 ? map[clamped] : { label: "", color: "bg-zinc-800" }),
  };
}

export function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-0.5 flex-1 rounded-full transition-all duration-300",
              i <= score ? color : "bg-zinc-800"
            )}
          />
        ))}
      </div>
      {label && (
        <p
          className={cn(
            "text-xs",
            score === 1 && "text-red-400",
            score === 2 && "text-orange-400",
            score === 3 && "text-yellow-400",
            score === 4 && "text-emerald-400"
          )}
        >
          {label} password
        </p>
      )}
    </div>
  );
}
