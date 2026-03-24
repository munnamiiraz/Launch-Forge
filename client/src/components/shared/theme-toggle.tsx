"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/src/lib/utils";

interface ThemeToggleProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ThemeToggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-primary text-primary-foreground shadow hover:bg-primary/90",
          variant === "outline" && "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
          size === "default" && "h-9 px-4 py-2",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-10 rounded-md px-8",
          size === "icon" && "h-9 w-9",
          className
        )}
        {...props}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        variant === "outline" && "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        size === "default" && "h-9 px-4 py-2",
        size === "sm" && "h-8 rounded-md px-3 text-xs",
        size === "lg" && "h-10 rounded-md px-8",
        size === "icon" && "h-9 w-9",
        className
      )}
      {...props}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
