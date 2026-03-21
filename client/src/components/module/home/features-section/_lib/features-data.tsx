import {
  Zap,
  Trophy,
  MessageSquare,
  Map,
  BarChart3,
  Users2,
} from "lucide-react";
import type { Feature } from "../_types";

export const FEATURES: Feature[] = [
  {
    id: "viral-waitlist",
    icon: <Zap size={22} />,
    title: "Viral Waitlist System",
    description:
      "Every signup gets a unique referral link that automatically tracks and rewards invitations. Turn each user into a distribution channel — your waitlist grows itself.",
    accent: "indigo",
    size: "hero",
    tag: "Core feature",
    bullets: [
      "Auto-generated referral links per signup",
      "Customizable reward tiers & incentives",
      "Fraud detection built-in",
      "Works across any sharing channel",
    ],
    metric: { value: "3.2×", label: "avg. viral coefficient" },
  },
  {
    id: "leaderboards",
    icon: <Trophy size={20} />,
    title: "Referral Leaderboards",
    description:
      "Public or private leaderboards create urgency and healthy competition. Watching your rank climb is addictive — and drives more sharing.",
    accent: "amber",
    size: "wide",
    tag: "Engagement",
    bullets: [
      "Real-time rank updates",
      "Anonymous or named — your choice",
    ],
  },
  {
    id: "feedback-board",
    icon: <MessageSquare size={20} />,
    title: "Feedback Board",
    description:
      "Collect, upvote, and triage feature requests before launch. Ship exactly what your early audience wants — not what you guess.",
    accent: "cyan",
    size: "default",
    tag: "Insights",
  },
  {
    id: "public-roadmap",
    icon: <Map size={20} />,
    title: "Public Roadmap",
    description:
      "Show subscribers what's coming. A visible roadmap builds trust, reduces churn, and turns passive signups into invested advocates.",
    accent: "violet",
    size: "default",
    tag: "Transparency",
  },
  {
    id: "analytics",
    icon: <BarChart3 size={20} />,
    title: "Analytics Dashboard",
    description:
      "Real-time graphs for signups, referral chains, conversion rates, and geographic spread. Know exactly which channels are driving growth.",
    accent: "emerald",
    size: "default",
    tag: "Data",
  },
  {
    id: "subscriber-management",
    icon: <Users2 size={20} />,
    title: "Subscriber Management",
    description:
      "Segment, filter, export, and email your list in one place. CSV exports, webhooks, and native integrations with your existing stack.",
    accent: "rose",
    size: "default",
    tag: "Operations",
  },
];
