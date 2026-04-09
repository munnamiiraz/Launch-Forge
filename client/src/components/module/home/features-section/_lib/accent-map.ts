import type { FeatureAccent } from "../_types";

export const ACCENT_MAP: Record<
  FeatureAccent,
  {
    icon:        string; // icon bubble
    border:      string; // card hover border
    topLine:     string; // top gradient line
    glow:        string; // hover corner glow bg
    tag:         string; // tag pill
    bullet:      string; // bullet dot
    metricValue: string; // metric number colour
    ringPing:    string; // live ping ring (hero only)
  }
> = {
  indigo: {
    icon:        "border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/12 text-indigo-700 dark:text-indigo-400",
    border:      "hover:border-indigo-500/35",
    topLine:     "via-indigo-500/50",
    glow:        "bg-indigo-500/10",
    tag:         "border-indigo-500/20 dark:border-indigo-500/25 bg-indigo-500/8 text-indigo-700 dark:text-indigo-400",
    bullet:      "bg-indigo-500",
    metricValue: "text-indigo-600 dark:text-indigo-300",
    ringPing:    "bg-indigo-500 dark:bg-indigo-400",
  },
  violet: {
    icon:        "border-violet-500/20 dark:border-violet-500/30 bg-violet-500/10 dark:bg-violet-500/12 text-violet-700 dark:text-violet-400",
    border:      "hover:border-violet-500/35",
    topLine:     "via-violet-500/50",
    glow:        "bg-violet-500/10",
    tag:         "border-violet-500/20 dark:border-violet-500/25 bg-violet-500/8 text-violet-700 dark:text-violet-400",
    bullet:      "bg-violet-500",
    metricValue: "text-violet-600 dark:text-violet-300",
    ringPing:    "bg-violet-500 dark:bg-violet-400",
  },
  cyan: {
    icon:        "border-cyan-500/20 dark:border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-500/12 text-cyan-700 dark:text-cyan-400",
    border:      "hover:border-cyan-500/35",
    topLine:     "via-cyan-500/50",
    glow:        "bg-cyan-500/10",
    tag:         "border-cyan-500/20 dark:border-cyan-500/25 bg-cyan-500/8 text-cyan-700 dark:text-cyan-400",
    bullet:      "bg-cyan-500",
    metricValue: "text-cyan-600 dark:text-cyan-300",
    ringPing:    "bg-cyan-500 dark:bg-cyan-400",
  },
  emerald: {
    icon:        "border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    border:      "hover:border-emerald-500/35",
    topLine:     "via-emerald-500/50",
    glow:        "bg-emerald-500/10",
    tag:         "border-emerald-500/20 dark:border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400",
    bullet:      "bg-emerald-500",
    metricValue: "text-emerald-600 dark:text-emerald-300",
    ringPing:    "bg-emerald-500 dark:bg-emerald-400",
  },
  amber: {
    icon:        "border-amber-500/20 dark:border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400",
    border:      "hover:border-amber-500/35",
    topLine:     "via-amber-500/50",
    glow:        "bg-amber-500/10",
    tag:         "border-amber-500/20 dark:border-amber-500/25 bg-amber-500/8 text-amber-700 dark:text-amber-400",
    bullet:      "bg-amber-500",
    metricValue: "text-amber-600 dark:text-amber-300",
    ringPing:    "bg-amber-500 dark:bg-amber-400",
  },
  rose: {
    icon:        "border-rose-500/20 dark:border-rose-500/30 bg-rose-500/10 dark:bg-rose-500/12 text-rose-700 dark:text-rose-400",
    border:      "hover:border-rose-500/35",
    topLine:     "via-rose-500/50",
    glow:        "bg-rose-500/10",
    tag:         "border-rose-500/20 dark:border-rose-500/25 bg-rose-500/8 text-rose-700 dark:text-rose-400",
    bullet:      "bg-rose-500",
    metricValue: "text-rose-600 dark:text-rose-300",
    ringPing:    "bg-rose-500 dark:bg-rose-400",
  },
};
