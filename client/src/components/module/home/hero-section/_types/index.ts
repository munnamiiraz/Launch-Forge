export interface WaitlistStats {
  totalSignups: number;
  signupsLast24h: number;
  signupsLastWeek: number;
  averageReferrals: number;
  topCountry: string;
  isLive: boolean;
}

export interface HeroWaitlistJoinResult {
  success: boolean;
  error?: string;
  fieldError?: string;
  position?: number;
  referralCode?: string;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  position: number;
  createdAt: Date;
}

export interface RecentSignup {
  initials: string;
  name: string;
  location: string;
  timeAgo: string;
}
