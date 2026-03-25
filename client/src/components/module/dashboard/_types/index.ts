export interface DashboardUser {
  id:             string;
  name:           string;
  email:          string;
  avatar?:        string;
  avatarInitials: string;
  avatarColor:    string;
  plan:           "free" | "pro" | "team" | "enterprise";
}

export interface DashboardWaitlist {
  id:          string;
  name:        string;
  slug:        string;
  logoUrl:     string | null;
  isOpen:      boolean;
  archivedAt?: string | null;
  subscribers: number;
  referrals:   number;
  createdAt:   string;
}

export interface DashboardStats {
  totalSubscribers: number;
  totalWaitlists:   number;
  totalReferrals:   number;
  conversionRate:   number;
}
