"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/src/components/ui/badge";
import type { FooterLinkGroup } from "../_types";
import { cn } from "@/src/lib/utils";

interface FooterLinkColumnProps {
  group: FooterLinkGroup;
  delay?: number;
}

export function FooterLinkColumn({ group, delay = 0 }: FooterLinkColumnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4"
    >
      {/* Column heading */}
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
        {group.title}
      </h3>

      {/* Links */}
      <ul className="flex flex-col gap-2.5">
        {group.links.map((link, i) => (
          <li key={i}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={cn(
                "group inline-flex items-center gap-1.5",
                "text-sm text-muted-foreground/80 transition-colors duration-150 hover:text-foreground/90"
              )}
            >
              <span className="relative">
                {link.label}
                {/* Underline on hover */}
                <span className="absolute -bottom-px left-0 h-px w-0 bg-zinc-400 transition-all duration-200 group-hover:w-full" />
              </span>

              {link.external && (
                <ExternalLink
                  size={10}
                  className="text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/80"
                />
              )}

              {link.isNew && (
                <Badge className="h-4 rounded-full border-emerald-500/30 bg-emerald-500/12 px-1.5 py-0 text-[9px] font-semibold text-emerald-400">
                  New
                </Badge>
              )}

              {link.badge && !link.isNew && (
                <Badge className="h-4 rounded-full border-amber-500/30 bg-amber-500/12 px-1.5 py-0 text-[9px] font-semibold text-amber-400">
                  {link.badge}
                </Badge>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
