"use client";

import { motion } from "framer-motion";
import { Badge } from "@/src/components/ui/badge";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  titleHighlight?: string; // portion of title to render in gradient
  subtitle: string;
}

export function SectionHeader({
  eyebrow,
  title,
  titleHighlight,
  subtitle,
}: SectionHeaderProps) {
  // Split title around the highlight portion if provided
  const parts = titleHighlight ? title.split(titleHighlight) : [title];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-5 text-center"
    >
      {/* Eyebrow badge */}
      <Badge
        variant="outline"
        className="gap-2 border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-xs font-medium text-indigo-300"
      >
        <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
        {eyebrow}
      </Badge>

      {/* Headline */}
      <h2 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {parts[0]}
        {titleHighlight && (
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
            {titleHighlight}
          </span>
        )}
        {parts[1]}
      </h2>

      {/* Subtitle */}
      <p className="max-w-xl text-base leading-relaxed text-muted-foreground/80">
        {subtitle}
      </p>
    </motion.div>
  );
}
