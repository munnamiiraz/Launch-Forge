export interface SubscriberNavUser {
  name:          string;
  email:         string;
  /** Masked for display: "Sarah K." */
  maskedName:    string;
  avatarInitials: string;
  avatarColor:   string;   // tailwind gradient string
  /** The subscriber's referral code */
  referralCode:  string;
  /** Full shareable invite URL */
  inviteUrl:     string;
  /** Queue position (1-based) */
  position:      number;
  /** Number of referrals this subscriber has made */
  referralCount: number;
  /** Waitlist they belong to */
  waitlist: {
    id:   string;
    name: string;
    slug: string;
  };
}

export interface SubscriberNavLink {
  label:    string;
  href:     string;
  badge?:   string;
  external?: boolean;
}