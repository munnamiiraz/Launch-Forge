"use client";

import { motion } from "framer-motion";
import { LOGO_COMPANIES } from "../_lib/social-proof-data";

/** Renders a single logo pill with company logo image */
function LogoPill({ company }: { company: { name: string; logo: string } }) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-4 py-2.5">
      {/* Company logo */}
      <img
        src={company.logo}
        alt={company.name}
        className="h-5 w-5 shrink-0 rounded object-cover"
      />
      <span className="text-xs font-medium text-muted-foreground/60">{company.name}</span>
    </div>
  );
}

export function LogoStrip() {
  // Triple-duplicate for seamless infinite loop
  const items = [...LOGO_COMPANIES, ...LOGO_COMPANIES, ...LOGO_COMPANIES];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="relative w-full overflow-hidden"
    >
      {/* Label */}
      <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        Trusted by founders building at
      </p>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-zinc-950 to-transparent" />

      {/* Scrolling track — uses the same ticker animation from hero */}
      <div
        className="flex animate-[ticker_30s_linear_infinite] gap-3 will-change-transform"
        style={{ width: "max-content" }}
      >
        {items.map((company, i) => (
          <LogoPill key={`${company.name}-${i}`} company={company} />
        ))}
      </div>
    </motion.div>
  );
}
