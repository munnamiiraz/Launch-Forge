import type { StatItem, Testimonial } from "../_types";

export const STATS: StatItem[] = [
  {
    value: "2,847",
    label: "Founders waiting",
    sublabel: "across 42 countries",
    trend: "+143 today",
    trendPositive: true,
    accent: "indigo",
  },
  {
    value: "3.2×",
    label: "Avg. viral coefficient",
    sublabel: "per waitlist launched",
    trend: "+14% vs industry",
    trendPositive: true,
    accent: "violet",
  },
  {
    value: "68%",
    label: "Conversion rate",
    sublabel: "referral → signup",
    trend: "2× the benchmark",
    trendPositive: true,
    accent: "emerald",
  },
  {
    value: "4.9 / 5",
    label: "Satisfaction score",
    sublabel: "from 214 reviews",
    trend: "★★★★★",
    trendPositive: true,
    accent: "amber",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "LaunchForge turned our stagnant waitlist into a self-growing engine. Within 72 hours of switching, our signups tripled — entirely through referrals. I've never seen anything like it.",
    name: "Sarah Kim",
    role: "Founder & CEO",
    company: "Vesper AI",
    avatarInitials: "SK",
    avatarGradient: "from-indigo-500 to-violet-600",
    rating: 5,
    source: "producthunt",
    featured: true,
  },
  {
    id: "t2",
    quote:
      "The analytics alone are worth it. I finally know exactly which channels are driving growth and which referral chains are converting. Replaced three separate tools.",
    name: "Marcus Torres",
    role: "Indie Hacker",
    company: "BuildFast.dev",
    avatarInitials: "MT",
    avatarGradient: "from-violet-500 to-purple-600",
    rating: 5,
    source: "twitter",
    handle: "@marcust",
  },
  {
    id: "t3",
    quote:
      "Set up in 8 minutes. Had 300 signups by end of day. The referral leaderboard created this insane competitive energy in our early community.",
    name: "Priya Mehta",
    role: "Product Lead",
    company: "Loopback Studio",
    avatarInitials: "PM",
    avatarGradient: "from-emerald-500 to-teal-600",
    rating: 5,
    source: "linkedin",
  },
  {
    id: "t4",
    quote:
      "We hit 1,000 signups before writing a single line of product code. The public roadmap and feedback board kept early adopters engaged for months.",
    name: "James Okafor",
    role: "Technical Co-Founder",
    company: "Fluxr",
    avatarInitials: "JO",
    avatarGradient: "from-cyan-500 to-blue-600",
    rating: 5,
    source: "direct",
  },
  {
    id: "t5",
    quote:
      "The competitor we were benchmarking against uses LaunchForge. That told us everything. Switched immediately — best decision of our pre-launch.",
    name: "Anika Larsen",
    role: "Growth Designer",
    company: "Nomad Stack",
    avatarInitials: "AL",
    avatarGradient: "from-amber-500 to-orange-500",
    rating: 5,
    source: "twitter",
    handle: "@anikal_builds",
  },
];

export const LOGO_COMPANIES = [
  "Vesper AI",
  "BuildFast",
  "Loopback",
  "Fluxr",
  "Nomad Stack",
  "Arctiq",
  "Sundial",
  "Crestwave",
];
