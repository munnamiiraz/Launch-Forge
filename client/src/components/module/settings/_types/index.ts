/* ── Profile ─────────────────────────────────────────────────────── */
export interface ProfileForm {
  name:     string;
  email:    string;
  bio:      string;
  website:  string;
  timezone: string;
  image?:   string;
}

/* ── Workspace ───────────────────────────────────────────────────── */
export interface WorkspaceForm {
  name:        string;
  slug:        string;
  logo:        string;
  description: string;
}

/* ── Notification preferences ────────────────────────────────────── */
export interface NotificationPrefs {
  // Subscriber events
  newSubscriber:       boolean;
  subscriberConfirmed: boolean;
  referralMade:        boolean;
  // Leaderboard
  leaderboardChanged:  boolean;
  prizeAwarded:        boolean;
  // Product
  feedbackSubmitted:   boolean;
  roadmapVote:         boolean;
  // Billing
  invoiceReady:        boolean;
  paymentFailed:       boolean;
  planChanged:         boolean;
  // System
  securityAlert:       boolean;
  productUpdates:      boolean;
  weeklyDigest:        boolean;
}

/* ── Session ─────────────────────────────────────────────────────── */
export interface ActiveSession {
  id:        string;
  device:    string;
  browser:   string;
  os:        string;
  location:  string;
  ip:        string;
  lastActive: string;
  isCurrent: boolean;
}

/* ── API Key ─────────────────────────────────────────────────────── */
export interface ApiKey {
  id:        string;
  name:      string;
  prefix:    string;
  scopes:    string[];
  createdAt: string;
  lastUsedAt: string | null;
}

/* ── Settings page data ──────────────────────────────────────────── */
export interface SettingsPageData {
  profile:       ProfileForm;
  workspace:     WorkspaceForm;
  notifications: NotificationPrefs;
  sessions:      ActiveSession[];
  apiKeys:       ApiKey[];
  hasTwoFactor:  boolean;
}

export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
] as const;

export type Timezone = (typeof TIMEZONES)[number];