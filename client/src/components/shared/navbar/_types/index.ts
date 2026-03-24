export interface NavUser {
  name: string;
  email: string;
  avatar?: string; // avatar image URL
  avatarInitials: string;
  avatarColor: string; // tailwind gradient string
  plan: "free" | "pro" | "growth";
}

export interface NavLink {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}
