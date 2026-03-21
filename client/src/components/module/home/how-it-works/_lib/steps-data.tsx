import {
  LayoutTemplate,
  Share2,
  Users,
  Rocket,
} from "lucide-react";
import type { HowItWorksStep } from "../_types";

export const HOW_IT_WORKS_STEPS: Omit<HowItWorksStep, "icon">[] = [
  {
    step: 1,
    title: "Create your waitlist",
    description:
      "Set up a branded waitlist page in under 2 minutes. Customize copy, colors, and your referral rewards — no code needed.",
    tag: "2 min setup",
    accentColor: "indigo",
  },
  {
    step: 2,
    title: "Share your referral link",
    description:
      "Every signup gets a unique referral link automatically. One click to share across Twitter, email, or any channel.",
    tag: "Auto-generated",
    accentColor: "violet",
  },
  {
    step: 3,
    title: "Users invite others",
    description:
      "Referrals move people up the list. The leaderboard creates urgency — watch your waitlist grow itself exponentially.",
    tag: "Viral loop",
    accentColor: "cyan",
  },
  {
    step: 4,
    title: "Launch with momentum",
    description:
      "By launch day, you have a warm, engaged audience that already believes in your product. No cold start.",
    tag: "Day-1 traction",
    accentColor: "emerald",
  },
];

export const STEP_ICONS = [
  <LayoutTemplate key="1" size={20} />,
  <Share2       key="2" size={20} />,
  <Users        key="3" size={20} />,
  <Rocket       key="4" size={20} />,
];
