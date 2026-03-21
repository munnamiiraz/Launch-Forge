export interface HowItWorksStep {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string; // optional micro-label, e.g. "2 min setup"
  accentColor: StepAccent;
}

export type StepAccent = "indigo" | "violet" | "cyan" | "emerald";
