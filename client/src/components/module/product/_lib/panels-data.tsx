import { TrendingUp, Share2, Zap, BarChart3, Users, Bell } from "lucide-react";
import type { PreviewPanel } from "../_types";

export const PREVIEW_PANELS: PreviewPanel[] = [
  {
    id: "analytics",
    eyebrow: "Real-time Analytics",
    title: "Every metric that",
    titleHighlight: " actually matters",
    description:
      "Stop guessing which channels are working. LaunchForge surfaces the exact referral chains, conversion rates, and geographic spread driving your growth — updated live.",
    textSide: "left",
    bullets: [
      {
        icon: <TrendingUp size={13} />,
        text: "Live signup velocity with 24h, 7d, and 30d trend lines",
      },
      {
        icon: <Share2 size={13} />,
        text: "Full referral chain tracing — see every hop from invite to join",
      },
      {
        icon: <BarChart3 size={13} />,
        text: "Channel attribution breakdown across social, email, and direct",
      },
    ],
  },
  {
    id: "waitlist",
    eyebrow: "Waitlist Management",
    title: "Your waitlist,",
    titleHighlight: " fully in control",
    description:
      "Segment subscribers, approve early access, manage positions, and trigger personalised email campaigns — all from one unified command center.",
    textSide: "right",
    bullets: [
      {
        icon: <Users size={13} />,
        text: "Drag-to-reorder positions and bulk-approve early access",
      },
      {
        icon: <Bell size={13} />,
        text: "Automated milestone emails when subscribers move up the list",
      },
      {
        icon: <Zap size={13} />,
        text: "One-click CSV export and native webhook integrations",
      },
    ],
  },
];
