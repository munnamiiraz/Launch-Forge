"use client";

import { cn } from "@/src/lib/utils";

interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <div className={cn("relative flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-linear-to-br from-indigo-500/20 to-indigo-500/5 transition-all duration-300 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110"
      >
        <path
          d="M7 4V17C7 18.1046 7.89543 19 9 19H19"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 6L7 11L2 6"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        />
        <circle cx="19" cy="19" r="1.5" fill="currentColor" className="animate-pulse" />
      </svg>
      
      {/* Glossy overlay */}
      <div className="absolute inset-0 rounded-lg bg-linear-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
