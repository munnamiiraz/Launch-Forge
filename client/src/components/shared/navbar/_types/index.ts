export interface NavUser {
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: string; // tailwind gradient string
  plan: "free" | "pro" | "team" | "enterprise";
}

export interface NavLink {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}
