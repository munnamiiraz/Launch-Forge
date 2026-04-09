"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import type { Testimonial } from "../_types";
import { cn } from "@/src/lib/utils";

/* ── Source icons (inline SVG — no extra dep) ─────────────────── */
const SourceIcon = ({ source }: { source: Testimonial["source"] }) => {
  if (source === "twitter") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-muted-foreground/80">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (source === "producthunt") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-[#DA552F]/60">
        <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 0 0 0-3.6M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m1.604 14.4H10.2V18H7.8V6h5.804a4.2 4.2 0 0 1 0 8.4" />
      </svg>
    );
  }
  if (source === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-[#0077B5]/60">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  return null;
};

const SOURCE_LABELS: Record<NonNullable<Testimonial["source"]>, string> = {
  twitter: "X / Twitter",
  producthunt: "Product Hunt",
  linkedin: "LinkedIn",
  direct: "Direct review",
};

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

export function TestimonialCard({ testimonial: t, index }: TestimonialCardProps) {
  if (t.featured) {
    return <FeaturedCard testimonial={t} index={index} />;
  }
  return <StandardCard testimonial={t} index={index} />;
}

/* ── Featured (large) card ──────────────────────────────────────── */
function FeaturedCard({ testimonial: t, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="md:col-span-2"
    >
      <Card className="group relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-500/8 via-card/60 to-card/40 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/35 hover:shadow-xl hover:shadow-indigo-500/10 h-full">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
        {/* Corner glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <CardContent className="relative flex flex-col gap-6 p-8">
          {/* Top row: quote icon + source badge */}
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/10">
              <Quote size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            {t.source && (
              <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
                <SourceIcon source={t.source} />
                <span className="text-[10px] text-muted-foreground/60">{SOURCE_LABELS[t.source]}</span>
              </div>
            )}
          </div>

          {/* Quote */}
          <blockquote className="text-base leading-relaxed text-foreground/80 md:text-lg">
            "{t.quote}"
          </blockquote>

          {/* Stars */}
          <div className="flex gap-0.5">
            {Array.from({ length: t.rating }).map((_, i) => (
              <motion.svg
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 300 }}
                className="h-4 w-4 fill-amber-400"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </motion.svg>
            ))}
          </div>

          {/* Author */}
          <div className="flex items-center gap-3 border-t border-border/60 pt-5">
            <Avatar className="h-10 w-10 rounded-xl">
              <AvatarImage src={t.avatar} alt={t.name} className="object-cover" />
              <AvatarFallback className={cn("rounded-xl bg-gradient-to-br text-sm font-bold text-white", t.avatarGradient)}>
                {t.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground/80">{t.role} · {t.company}</p>
            </div>
            {t.handle && (
              <span className="ml-auto text-xs text-muted-foreground/40">{t.handle}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Standard card ──────────────────────────────────────────────── */
function StandardCard({ testimonial: t, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Card className="group relative h-full overflow-hidden border-border/80 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-card/60 hover:shadow-xl hover:shadow-indigo-500/5">
        {/* Top line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent transition-all duration-300 group-hover:via-indigo-500/30" />
        {/* Corner glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-500/6 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardContent className="relative flex h-full flex-col gap-5 p-6">
          {/* Top row: quote mark + source */}
          <div className="flex items-center justify-between">
            <Quote size={16} className="text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60" />
            {t.source && (
              <div className="flex items-center gap-1 opacity-60">
                <SourceIcon source={t.source} />
              </div>
            )}
          </div>

          {/* Quote */}
          <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
            "{t.quote}"
          </blockquote>

          {/* Stars */}
          <div className="flex gap-0.5">
            {Array.from({ length: t.rating }).map((_, i) => (
              <svg key={i} className="h-3 w-3 fill-amber-400/80" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2.5 border-t border-border/60 pt-4">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={t.avatar} alt={t.name} className="object-cover" />
              <AvatarFallback className={cn("rounded-lg bg-gradient-to-br text-[11px] font-bold text-white", t.avatarGradient)}>
                {t.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground/90">{t.name}</p>
              <p className="truncate text-[10px] text-muted-foreground/60">
                {t.role}
                {t.company && <span className="text-muted-foreground/40"> · {t.company}</span>}
              </p>
            </div>
            {t.handle && (
              <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/40">{t.handle}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
