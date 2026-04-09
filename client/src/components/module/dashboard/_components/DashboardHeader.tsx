"use client";

import { ThemeToggle } from "@/src/components/shared/theme-toggle";

interface DashboardHeaderProps {
  title:    string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/85 px-6 backdrop-blur-xl">
      {/* Page title */}
      <div className="flex flex-col">
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground/60">{subtitle}</p>
        )}
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {children}

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
