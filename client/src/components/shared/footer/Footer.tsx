import { Separator } from "@/src/components/ui/separator";

import { FooterLogo } from "./_components/FooterLogo";
import { FooterLinkColumn } from "./_components/FooterLinkColumn";
import { FooterStatusBadge } from "./_components/FooterStatusBadge";
import { FooterBottom } from "./_components/FooterBottom";
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
    <footer className="relative w-full overflow-hidden border-t border-border/60 bg-background">
      {/* ── Ambient background ─────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-64 bottom-0 h-[400px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-900/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 top-0 h-[300px] w-[400px] rounded-full bg-violet-500/5 dark:bg-violet-900/8 blur-[100px]"
      />

      {/* Subtle grid — same as hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-size-[72px_72px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Main footer grid ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12 py-12">
          
          {/* Brand Column — 40% of row */}
          <div className="col-span-2 flex flex-col gap-6 lg:pr-12">
            <FooterLogo delay={0} />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Build waitlists that go viral. Turn signups into a compounding growth engine. Empowering makers to build and launch with ease.
            </p>
            {/* Status badge */}
            <div className="pt-2">
              <FooterStatusBadge status="operational" />
            </div>
          </div>

          {/* Link Columns — 20% each */}
          {FOOTER_LINK_GROUPS.map((group, i) => (
            <div key={group.title} className="flex flex-col">
              <FooterLinkColumn
                group={group}
                delay={0.08 + i * 0.06}
              />
            </div>
          ))}
        </div>

        <Separator className="bg-border/60" />

        {/* ── Bottom bar ────────────────────────────────────── */}
        <FooterBottom year={year} />
      </div>
    </footer>
  );
}
