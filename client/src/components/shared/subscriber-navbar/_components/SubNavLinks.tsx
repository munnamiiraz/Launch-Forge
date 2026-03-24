"use client";

import Link      from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/src/components/ui/badge";
import { cn }    from "@/src/lib/utils";
import type { SubscriberNavLink } from "../_types";

/**
 * Links shown in the subscriber-facing navbar.
 * These are scoped to the public-facing product experience —
 * not the owner/dashboard experience.
 */
const SUB_NAV_LINKS: SubscriberNavLink[] = [
  { label: "Browse",      href: "/explore"       },
  { label: "How to earn", href: "/how-to-earn"   },
  { label: "Leaderboard", href: "/leaderboard"   },
  { label: "Prizes",      href: "/prizes", badge: "🏆" },
];

export function SubNavLinks() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden items-center gap-1 md:flex"
      aria-label="Subscriber navigation"
    >
      {SUB_NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href ||
          pathname.startsWith(link.href + "/");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all duration-150",
              isActive
                ? "text-zinc-100"
                : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300",
            )}
          >
            {/* Active indicator */}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-px rounded-full bg-gradient-to-r from-indigo-500/60 via-indigo-400 to-indigo-500/60" />
            )}

            {link.label}

            {link.badge && (
              <Badge className="h-4 rounded-full border-amber-500/30 bg-amber-500/12 px-1.5 py-0 text-[9px] font-semibold text-amber-400">
                {link.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}