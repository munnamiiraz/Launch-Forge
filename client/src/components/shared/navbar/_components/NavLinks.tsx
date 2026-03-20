"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import type { NavLink } from "../_types";

const NAV_LINKS: NavLink[] = [
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Explore", href: "/explore" },
  { label: "How to Earn", href: "/how-to-earn" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

        return (
          <Link
            key={link.href}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className={cn(
              "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all duration-150",
              isActive
                ? "text-zinc-100"
                : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
            )}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-px rounded-full bg-gradient-to-r from-indigo-500/60 via-indigo-400 to-indigo-500/60" />
            )}

            {link.label}

            {link.external && (
              <ExternalLink size={11} className="text-zinc-600" />
            )}

            {link.badge && (
              <Badge className="h-4 rounded-full border-indigo-500/30 bg-indigo-500/15 px-1.5 py-0 text-[9px] font-semibold text-indigo-400">
                {link.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
