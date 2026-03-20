import { Separator } from "@/src/components/ui/separator";

import { FooterLogo } from "./_components/FooterLogo";
import { FooterLinkColumn } from "./_components/FooterLinkColumn";
import { FooterNewsletter } from "./_components/FooterNewsletter";
import { FooterStatusBadge } from "./_components/FooterStatusBadge";
import { FooterBottom } from "./_components/FooterBottom";
import { FooterCTA } from "./_components/FooterCTA";
import { FOOTER_LINK_GROUPS } from "./_lib/footer-data";

/**
 * Footer — fully autonomous Server Component.
 *
 * Drop into any layout:
 *
 *   import { Footer } from "@/app/modules/footer/Footer";
 *   <Footer showCTA />
 *
 * `showCTA` renders the pre-footer "Ready to launch?" band.
 * Omit it on pages that already have a CTA (e.g. pricing, register).
 */
interface FooterProps {
  /** Render the pre-footer CTA band. Default: true */
  showCTA?: boolean;
}

export function Footer({ showCTA = true }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden border-t border-zinc-800/60 bg-zinc-950">
      {/* ── Ambient background ─────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-64 bottom-0 h-[400px] w-[600px] rounded-full bg-indigo-900/8 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 top-0 h-[300px] w-[400px] rounded-full bg-violet-900/6 blur-[100px]"
      />

      {/* Subtle grid — same as hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:72px_72px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Pre-footer CTA band ───────────────────────────── */}
        {showCTA && (
          <div className="py-16">
            <FooterCTA />
          </div>
        )}

        {!showCTA && <div className="pt-16" />}

        <Separator className="bg-zinc-800/50" />

        {/* ── Main footer grid ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-14 md:grid-cols-3 lg:grid-cols-[240px_repeat(5,_1fr)]">

          {/* Brand column — spans full width on mobile */}
          <div className="col-span-2 flex flex-col gap-8 md:col-span-3 lg:col-span-1">
            <FooterLogo delay={0} />

            {/* Status badge */}
            <FooterStatusBadge status="operational" />
          </div>

          {/* Link columns */}
          {FOOTER_LINK_GROUPS.map((group, i) => (
            <FooterLinkColumn
              key={group.title}
              group={group}
              delay={0.08 + i * 0.06}
            />
          ))}
        </div>

        {/* Newsletter section - centered, 70% width below links on all screens */}
        <div className="flex justify-center pb-14">
          <div className="w-full max-w-[70%]">
            <FooterNewsletter />
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <FooterBottom year={year} />
      </div>
    </footer>
  );
}
