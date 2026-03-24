"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Github, Twitter, Linkedin, Youtube } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/launchforge",
    icon: <Github size={15} />,
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com/launchforge",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[15px] w-[15px]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/launchforge",
    icon: <Linkedin size={15} />,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@launchforge",
    icon: <Youtube size={15} />,
  },
];

interface FooterLogoProps {
  delay?: number;
}

export function FooterLogo({ delay = 0 }: FooterLogoProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-5"
      >
        {/* Brand mark */}
        <Link href="/" className="group flex items-center gap-2.5 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/15 transition-all duration-200 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/22 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]">
            <Zap
              size={15}
              className="text-indigo-400 transition-transform duration-200 group-hover:scale-110"
            />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-white">
            LaunchForge
          </span>
        </Link>

        {/* Tagline */}
        <p className="max-w-[240px] text-sm leading-relaxed text-muted-foreground/80">
          Build waitlists that go viral. Turn signups into a compounding growth engine.
        </p>

        {/* Social links */}
        <div className="flex items-center gap-1">
          {SOCIAL_LINKS.map((social) => (
            <Tooltip key={social.label}>
              <TooltipTrigger asChild>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    "border border-transparent text-muted-foreground/60",
                    "transition-all duration-150",
                    "hover:border-zinc-800 hover:bg-card/60 hover:text-foreground/80"
                  )}
                >
                  {social.icon}
                </a>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80"
              >
                {social.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
