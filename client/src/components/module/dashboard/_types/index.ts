export interface DashboardUser {
  id:             string;
  name:           string;
  email:          string;
  avatarInitials: string;
  avatarColor:    string;
  plan:           "free" | "pro" | "team" | "enterprise";
}

export interface DashboardWaitlist {
  id:          string;
  name:        string;
  slug:        string;
  isOpen:      boolean;
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
