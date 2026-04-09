"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import type { NavLink } from "../_types";

const OWNER_LINKS: NavLink[] = [
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
];

const SUBSCRIBER_LINKS: NavLink[] = [
  { label: "Explore", href: "/explore" },
  { label: "How to Earn", href: "/how-to-earn" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
      {/* Owner Section - Product & Pricing */}
      {OWNER_LINKS.map((link) => {
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
                ? "text-foreground"
                : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-[1.5px] rounded-full bg-indigo-600 dark:bg-indigo-400" />
            )}

            {link.label}

            {link.external && (
              <ExternalLink size={11} className="text-muted-foreground/60" />
            )}

            {link.badge && (
              <Badge className="h-4 rounded-full border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/15 px-1.5 py-0 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 leading-none">
                {link.badge}
              </Badge>
            )}
          </Link>
        );
      })}

      {/* Subtle vertical divider */}
      <div className="mx-2 flex items-center">
        <div className="h-4 w-px bg-border" />
        <div className="mx-1.5 h-1.5 w-px rounded-full bg-border/60" />
        <div className="h-4 w-px bg-border" />
      </div>

      {/* Subscriber Section - Explore & How to Earn */}
      {SUBSCRIBER_LINKS.map((link) => {
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
                ? "text-foreground"
                : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-[1.5px] rounded-full bg-indigo-600 dark:bg-indigo-400" />
            )}

            {link.label}

            {link.external && (
              <ExternalLink size={11} className="text-muted-foreground/60" />
            )}

            {link.badge && (
              <Badge className="h-4 rounded-full border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/15 px-1.5 py-0 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 leading-none">
                {link.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
