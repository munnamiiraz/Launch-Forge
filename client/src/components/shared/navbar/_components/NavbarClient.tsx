"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

interface NavbarClientProps {
  children: React.ReactNode;
}

export function NavbarClient({ children }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-zinc-800/70 bg-background/90 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-b border-border/40 bg-background"
      )}
    >
      {children}
    </motion.header>
  );
}
