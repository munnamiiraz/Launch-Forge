"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Separator } from "@/src/components/ui/separator";
import { FOOTER_BOTTOM_LINKS } from "../_lib/footer-data";

interface FooterBottomProps {
  year: number;
}

export function FooterBottom({ year }: FooterBottomProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Separator className="bg-muted/60" />

      <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        {/* Copyright */}
        <p className="text-xs text-muted-foreground/60">
          © {year}{" "}
          <Link
            href="#"
            className="text-muted-foreground/80 transition-colors hover:text-foreground/80"
          >
            LaunchForge, Inc.
          </Link>{" "}
          All rights reserved.
        </p>

        {/* Bottom nav links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {FOOTER_BOTTOM_LINKS.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Made with tag */}
        <p className="text-xs text-muted-foreground/40">
          Built with{" "}
          <span className="text-red-500/70">♥</span>{" "}
          for founders
        </p>
      </div>
    </motion.div>
  );
}
