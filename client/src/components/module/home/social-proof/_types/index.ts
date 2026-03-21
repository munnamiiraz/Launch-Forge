export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  avatarInitials: string;
  avatarGradient: string;
  /** star rating out of 5 */
  rating: number;
  /** platform the review came from */
  source?: "twitter" | "producthunt" | "linkedin" | "direct";
  /** optional handle */
  handle?: string;
  /** whether this is the featured/large card */
  featured?: boolean;
}

export interface StatItem {
  value: string;
  label: string;
  sublabel?: string;
  trend?: string;
  trendPositive?: boolean;
  accent: "indigo" | "violet" | "emerald" | "amber" | "cyan";
}
