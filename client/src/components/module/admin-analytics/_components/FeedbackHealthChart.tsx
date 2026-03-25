"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }  from "@/src/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { MessageSquare, ThumbsUp, MessageCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  FeedbackStatusBreakdown, FeedbackCategoryPoint, FeedbackStats,
  RoadmapProgressItem, RoadmapStats,
} from "../_lib/analytics-data";

/* ── Feedback status donut ────────────────────────────────────────── */
const feedbackConfig  = { value: { label: "Requests" } };
const feedbackConfig2 = {
  requests: { label: "New requests", color: "hsl(var(--chart-1))" },
  votes:    { label: "Votes cast",   color: "hsl(var(--chart-3))" },
  comments: { label: "Comments",     color: "hsl(var(--chart-4))" },
};

export function FeedbackHealthChart({
  breakdown = [],
  timeline = [],
  stats,
}: {
  breakdown?: FeedbackStatusBreakdown[];
  timeline?:  FeedbackCategoryPoint[];
  stats?:     FeedbackStats;
}) {
  const safeStats = stats || { totalBoards: 0, totalRequests: 0, totalVotes: 0, totalComments: 0, avgVotesPerRequest: 0, completedPct: 0, underReviewPct: 0 };

  return (
    <Card className="flex h-44 items-center justify-center border-border/80 bg-card/40 text-sm text-muted-foreground italic">
      This feature is not updated.
    </Card>
  );
}

/* ── Roadmap progress chart ──────────────────────────────────────── */
const roadmapConfig = { count: { label: "Items" } };

export function RoadmapProgressChart({
  data = [],
  stats,
}: {
  data?: RoadmapProgressItem[];
  stats?: RoadmapStats;
}) {
  const safeStats = stats || { totalRoadmaps: 0, totalItems: 0, completedPct: 0, inProgressPct: 0, plannedPct: 0 };

  return (
    <Card className="flex h-32 items-center justify-center border-border/80 bg-card/40 text-sm text-muted-foreground italic">
      This feature is not updated.
    </Card>
  );
}