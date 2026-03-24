import { cn } from "@/src/lib/utils";
import type { NavUser } from "../_types";

const PLAN_STYLES: Record<NavUser["plan"], string> = {
  free:       "border-zinc-700/60 bg-muted/60 text-muted-foreground",
  pro:        "border-indigo-500/30 bg-indigo-500/12 text-indigo-400",
  team:       "border-violet-500/30 bg-violet-500/12 text-violet-400",
  enterprise: "border-amber-500/30 bg-amber-500/12 text-amber-400",
};

const PLAN_LABELS: Record<NavUser["plan"], string> = {
  free:       "Free",
  pro:        "Pro",
  team:       "Team",
  enterprise: "Enterprise",
};

export function PlanBadge({ plan }: { plan: NavUser["plan"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest",
        PLAN_STYLES[plan]
      )}
    >
      {PLAN_LABELS[plan]}
    </span>
  );
}
