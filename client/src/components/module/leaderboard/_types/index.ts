export type LeaderboardTier = "champion" | "top10" | "top25" | "rising";

export interface TopReferrer {
  rank:           number;
  tier:           LeaderboardTier;
  name:           string;
  email:          string;
  directReferrals: number;
  chainReferrals: number;
  sharePercent:   number;
  isConfirmed:    boolean;
  joinedAt:       string;
}

export interface WaitlistLeaderboardCard {
  waitlistId:       string;
  waitlistName:     string;
  waitlistSlug:     string;
  isOpen:           boolean;
  totalSubscribers: number;
  totalReferrals:   number;
  activeReferrers:  number;
  avgReferrals:     number;
  topReferralCount: number;
  topReferrers:     TopReferrer[];
}

export interface LeaderboardPageStats {
  totalWaitlists:  number;
  totalReferrals:  number;
  totalReferrers:  number;
  topViralScore:   number;
}