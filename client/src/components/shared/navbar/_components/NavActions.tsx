import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { UserMenu } from "./UserMenu";
import type { NavUser } from "../_types";

interface NavActionsProps {
  isAuthenticated: boolean;
  user: NavUser | null;
}

export function NavActions({ isAuthenticated, user }: NavActionsProps) {
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        {/* Go to dashboard */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground/90 sm:flex"
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>

        <Separator orientation="vertical" className="hidden h-4 bg-zinc-800 sm:block" />

        {/* User avatar dropdown */}
        <UserMenu user={user} />
      </div>
    );
  }

  // Guest state
  return (
    <div className="flex items-center gap-2">
      {/* GitHub star — desktop only */}
      <a
        href="https://github.com/launchforge"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground/80 transition-all duration-150 hover:bg-zinc-800/50 hover:text-foreground/80 md:flex"
        aria-label="Star LaunchForge on GitHub"
      >
        <Github size={14} />
        <span className="text-xs">Star us</span>
      </a>

      <Separator orientation="vertical" className="hidden h-4 bg-zinc-800 md:block" />

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:bg-muted/60 hover:text-foreground/90"
      >
        <Link href="/login">Sign in</Link>
      </Button>

      <Button
        asChild
        size="sm"
        className="group relative overflow-hidden bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-all duration-200"
      >
        <Link href="/register">
          {/* shimmer */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          Get started free
        </Link>
      </Button>
    </div>
  );
}
