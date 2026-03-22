import type { DashboardWaitlist } from "@/src/components/module/waitlists/_types";

export type ViewMode = "grid" | "list";
export type FilterTab = "all" | "open" | "closed";

export interface WaitlistPageStats {
  total:       number;
  open:        number;
  closed:      number;
  subscribers: number;
  referrals:   number;
}

export type { DashboardWaitlist };