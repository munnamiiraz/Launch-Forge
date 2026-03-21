export type FeatureAccent =
  | "indigo"
  | "violet"
  | "cyan"
  | "emerald"
  | "amber"
  | "rose";

export type FeatureSize = "hero" | "wide" | "default";

export interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: FeatureAccent;
  size: FeatureSize;
  tag?: string;
  /** Bullet highlights shown on hero / wide cards only */
  bullets?: string[];
  /** Mini metric shown on hero card */
  metric?: { value: string; label: string };
}
