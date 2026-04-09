import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { UserMenu } from "./UserMenu";
import type { NavUser } from "../_types";
import { cn } from "@/src/lib/utils";
import { ThemeToggle } from "../../theme-toggle";

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
          className={cn(
            "hidden h-9 items-center gap-2 rounded-xl border border-transparent px-3 text-sm font-medium transition-all duration-150 sm:flex",
            "text-muted-foreground/80 hover:border-border/80 hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>

        <div className="hidden h-5 w-px bg-border sm:block self-center opacity-70" />

        {/* User avatar dropdown */}
        <UserMenu user={user} />
      </div>
    );
  }

  // Guest state
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle variant="outline" size="icon" className="h-8 w-8 rounded-full bg-transparent border-none sm:border-solid" />

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
          <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          Get started free
        </Link>
      </Button>
    </div>
  );
}
